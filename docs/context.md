# BeaconU — Complete System Context (Final)

---

## 1. System Overview

Multi-tenant college admission platform. 4 apps sharing one PostgreSQL database:

- **BeaconU App (Launchpad)** — Student mobile/web app. Explore colleges, courses, financial aid, events, community, psychometric assessments, BeaconU Card, Refer & Earn.
- **Blink App** — Campus Ambassadors, Associate Agencies (Admin + Employees), Counsellors (Academic + MindCare). Referral tracking, commission, campus visits, counsellor sessions.
- **College Web Portal** — Per-college student portal. Apply, take assessments, book interviews, pay fees, hostel/commute, Student Hub (post-admission).
- **College Admin Portal** — Per-college admin panel. Manage applications, assessments, interviews, fees, documents, hostels, commute, marketing, student support.
- **Super Admin Panel** — Platform-level. Onboard universities/colleges, manage platform-wide content (news, articles, blogs), psychometric assessments, system config.

**Tech Stack:** Node.js, Express, TypeScript, PostgreSQL (Prisma), Redis, BullMQ. Turborepo monorepo + pnpm. OpenAPI spec generation.

---

## 2. Architecture

- **Pattern:** Modular Monolith. MVC + Service Layer + Split Data Access.
- **Write flow:** Controller → Service → Repository → DB
- **Read flow:** Controller → Query → DB
- **Repositories:** Writes + simple reads. No complex joins.
- **Queries:** Read-heavy. Joins, aggregations, UI-ready DTOs. No writes.
- **Module interaction:** Services only. Never import another module's Repository, Query, or Prisma models.

**Monorepo:**

```
apps/
  api/                  # Single Express backend
  web/                  # BeaconU Launchpad (Next.js)
  college-web/          # College Web Portal (Next.js)
  college-admin/        # College Admin Panel (Next.js)
packages/
  db/                   # Prisma schema, migrations, client
  types/                # Shared DTOs, enums, constants
  validation/           # Shared Zod schemas
  utils/                # Pure utility functions
```

Flutter app is a separate repo. OpenAPI spec auto-generated → clients generate typed SDKs.

---

## 3. Identity & Access

**5 separate identity tables (not one users table):**

| Table             | Who                                  | Auth                                                  |
| ----------------- | ------------------------------------ | ----------------------------------------------------- |
| `students`        | Students                             | Google OAuth (BeaconU App only) + OTP via third-party |
| `platform_admins` | Super Admins (2-5)                   | Email + Password                                      |
| `staff_members`   | College staff (scoped to college_id) | Email + Password                                      |
| `blink_users`     | Associates + Employees + Ambassadors | Email + Password                                      |
| `counsellors`     | Academic + MindCare                  | Email + Password                                      |

**Rules:**

- Student has only ONE role. If student becomes ambassador → separate `blink_users` row linked via `linked_student_id`.
- Students register once, access any college portal (filtered by college_id).
- `students.source`: 'beaconu_app', 'college_web', 'blink_referral'.
- Dynamic roles: `college_roles` + `college_role_permissions` (admin can create custom roles).
- `blink_roles`: global (associate_admin, associate_employee, campus_ambassador).
- JWT: `{ userId, userType, collegeId?, roleId?, permissions? }`. Access token 15 min + refresh token in `user_sessions`.
- Multi-device sessions allowed. No limit.
- Google account change → new student record. No merging.
- College admin credentials: Super Admin approves onboarding → registration link sent via email → `college_onboarding_invites`.

---

## 4. College Scoping

- Every college-scoped request includes `college_id` (sent by frontend from portal context).
- Every college-scoped query MUST include `WHERE college_id = ...`.
- Staff session carries `collegeId` from `staff_members.college_id`.
- Super Admin bypasses college scoping.

---

## 5. Admission Flow (19 Steps — Locked)

**Student side:**

1. Register (basic details)
2. Verify email + phone (third-party OTP)
3. Redirect to College Web Portal
4. Select Campus (if university group)
5. Select Admission Cycle
6. Indian or Non-Indian? → 6A: Indian → state of domicile, quotas shown. 6B: Non-Indian → country + passport, no quotas.
7. Select Programs + Quota Category (fee auto-calculated by program + quota + nationality)
8. Pay Application Fee (includes BeaconU service charge/commission)
9. Payment confirmed → receipt
10. Personal Details
11. Address
12. Parents / Guardian
13. Educational Qualification
14. Work Experience (optional — college admin can remove per course)
15. Entrance Exam Details (student enters scores)
16. Upload Documents (dynamic based on quota/nationality/course via `document_upload_configs`)
17. Declaration
18. Download Form PDF
19. Submit

**Admin side:**

- Document Verification → `under_review`
- Eligibility Check → `eligibility_check`
- Assessment (if required per course) → `assessment_pending` → `assessment_completed`
- Interview (if required per course) → `interview_pending` → `interview_completed`
- Shortlisting → `shortlisted`
- Scholarship Application (student applies after shortlisting)
- Offer Letter → `offer_issued`
- Token Payment → `token_paid`
- Enrollment → `enrolled` → creates `enrollments` record

**Configurable per course (on `admission_cycle_courses`):**

- `assessment_required` boolean
- `interview_required` boolean
- `work_experience_required` boolean
- `token_payment_stage`: 'before_assessment' | 'after_shortlisting'

---

## 6. Quotas

- **Back in the design.** Students select quota during application (Step 7).
- **Free-form:** Colleges define their own quota names. No enforced state vs category structure.
- Quotas depend on BOTH state of domicile AND category (e.g., "Karnataka - General", "Management Quota", "NRI").
- **Foreigners see NO quota options.**
- `course_quotas.tuition_fee_override` — different tuition per quota.
- Application fee varies by quota via `application_fee_configs`.
- Dynamic document uploads change based on quota via `document_upload_configs`.
- Quota-specific form fields (caste cert number, income) stored in `applications.quota_details` JSONB, configured via `admission_form_configs`.

---

## 7. Commission Structure (Two Types)

**Commission 1 — Platform Fee on Application Fee (→ BeaconU):**

- BeaconU takes a cut of every application fee as platform maintenance cost.
- Configured per course: `courses.app_fee_commission_type` (fixed/percentage) + `courses.app_fee_commission_value`.
- This is also called "service charge" in the client docs.
- Split via Razorpay marketplace: student pays → part to college, part stays with BeaconU.

**Commission 2 — Platform Fee on Tuition Fee (→ BeaconU → Blink Agency):**

- BeaconU takes a cut of tuition fee. Part of this is paid out to the Blink agency that referred the student.
- Configured per course: `courses.tuition_commission_type` (fixed/percentage) + `courses.tuition_commission_value`.
- Blink agency commission: `service_charge_configs` per college/course.
- Payout trigger: first instalment OR full payment (college configures).
- Commission goes to Associate Admin wallet only. Admin pays employees manually outside platform.

---

## 8. Assessments

- Question types as VARCHAR on `questions` table (no separate types table).
- Student answers stored as JSONB on `assessment_attempts` (not separate rows).
- `assessment_attempts.application_course_id` is NULLABLE (psychometric assessments not tied to applications).
- Two slot types: fixed (everyone starts together), window (anytime within range).
- **Anti-cheat (two rules):**
  - Tab switch: 10-sec re-entry → terminate (disqualified).
  - Disconnect: 2-min grace → auto-submit (graceful).
  - Configurable in `assessment_templates.settings` JSONB.
- Psychometric assessments configured by Super Admin only.
- Assessment link also sent via email notification.
- Max 1 reschedule per assessment.

---

## 9. Interviews & Offers

- Modes: zoom, telephonic, on_campus.
- Max 1 reschedule, ≥30 min before session.
- Token payment expiry → permanent closure. No re-issue. App status → `dropped_out`.
- Token amount from `fee_structures` per course.

---

## 10. Payments (Razorpay Marketplace)

- Razorpay linked accounts per college. Webhook-driven. Transfers API for fund splitting.
- `transactions` table: unified for ALL payment types. Has razorpay_order_id, razorpay_payment_id, razorpay_signature, transfer_status, razorpay_transfer_id, platform_commission, vendor_payout.
- Online payments (UPI, GPay, cards): auto-verified.
- Offline payments (DD, bank transfer): student uploads proof → financial team verifies.
- Payment methods configurable per college via `colleges.settings.payment_modes`.
- Refund policy: fixed platform-wide, not per college.
- Webhook idempotency: Redis key `payment-processed:{razorpayPaymentId}` (24h TTL).

---

## 11. Post-Admission

- **Enrollments table:** Created when `application_courses.status = 'enrolled'`. Post-admission source of truth.
- **Course Switch:** Students can request via `course_switch_requests`. Admission team approves → old enrollment marked `course_switched`, new enrollment created.
- **Scholarships:** Student applies AFTER shortlisting. Admin approves → discount applied to `student_fee_ledger` tuition entries.
- **Student Hub:** Inside College Web (not central platform). Hostel, commute, fees, documents, queries.

---

## 12. Content

- **Blogs:** Anyone can submit for approval. Platform admin publishes directly (skip approval). `author_type`: student, counsellor, staff_member, platform_admin.
- **Entrance exams (informational):** College-managed only (not Super Admin). Scoped to `college_id`. Separate from Assessment Module.
- **Events:** Free/paid, online/offline, seat limits, registrations, post-event recordings.
- **News/Articles:** Admin-published, no approval workflow.

---

## 13. Blink

- Referral codes generated by blink_users AND students (polymorphic referrer).
- Referral attribution: encrypted URL → localStorage + cookie (30-day) → tracked from landing → registration → application → commission.
- Campus visits: student requests → ambassador confirms/rejects, can reassign.
- Media kits: downloadable assets (posters, videos, brochures) — campus-wide or course-specific.
- Blink module simplification from gap doc: **SKIPPED for now.** Keeping original 8-table design.

---

## 14. Engagement

- Communities: create/join, posts, upvote/downvote, threaded comments.
- Squad Goals: group college finder — input location + friends' preferences → match colleges.
- BeaconU Card: digital student ID + wallet (Refer & Earn balance), withdrawals to linked bank accounts.
- Anti-ragging complaints: anonymous/named, investigation flow.

---

## 15. Communication

- Notifications: polymorphic, multi-channel (push/SMS/email/in_app), categorized, entity-linked.
- Broadcast notifications: admin-created, target filters (course, batch, hostel, payment status).
- Announcements: persistent college-level notices in Student Hub.
- Support tickets: inbox, assignment, status tracking, in-ticket chat.
- Direct messaging: 1:1 chat (student ↔ ambassador).

---

## 16. Dynamic Form & Document Configuration

- **`admission_form_configs`:** Colleges configure custom form fields per section. Frontend reads this to render dynamically. Includes `quota_details` section for quota-specific fields.
- **`document_upload_configs`:** Configures required documents based on quota, nationality, course. Frontend shows/hides upload slots dynamically.

---

## 17. Explore Your Interest (Discovery)

4-step filter wizard:

1. Stream (Management, Engineering, Medicine, etc.) → `streams` table (has `icon_url`)
2. Study Level (Short term, Skill development, Diploma, UG, PG Diploma, PG) → `study_levels`
3. Program Type (Standard, Hons., Integrated, Lateral Entry, Study Abroad, International Transfer) → `program_types`
4. Preferred Location (state filter) → `colleges.state`

All query/filter based on existing tables. No new tables needed.

---

## 18. Technical Solutions

1. **Referral attribution:** Encrypted URL → localStorage + cookie → DB tracking end-to-end.
2. **SSO (BeaconU → College Web):** Short-lived JWT (5 min) via redirect URL.
3. **Razorpay webhooks:** Idempotent (Redis key), retry queue for failed transfers, signature verification.
4. **Assessment anti-cheat:** Tab switch (10s → terminate), disconnect (2min → auto-submit), webcam heartbeat.
5. **File uploads:** S3 pre-signed URLs, direct upload, path: `/{collegeId}/{module}/{entityId}/{filename}`, 5MB limit.
6. **Concurrent booking:** Pessimistic locking (SELECT FOR UPDATE) for hostel beds, bus seats, interview slots, event seats.
7. **Fee calculation:** Application fee → lookup `application_fee_configs` (cycle + course + quota + nationality). Tuition → `fee_structures` + `course_quotas.tuition_fee_override`.

---

## 19. Background Jobs (BullMQ)

| Job                       | Frequency      |
| ------------------------- | -------------- |
| Offer expiry              | Hourly         |
| Fee overdue marker        | Daily midnight |
| Assessment auto-submit    | Every minute   |
| Razorpay transfer retry   | Every 5 min    |
| Session reminder          | 1.5h before    |
| Materialized view refresh | Every 15 min   |
| BeaconU card expiry       | Daily          |

---

## 20. Status Flows

**Application:** draft → submitted → under_review → eligibility_check → assessment_pending → assessment_completed → interview_pending → interview_completed → shortlisted → offer_issued → token_paid → enrolled | rejected | dropped_out | deferred

**Enrollment:** active | on_leave | suspended | completed | withdrawn | course_switched

**Assessment Attempt:** not_started → in_progress → completed | auto_submitted | terminated → under_evaluation → evaluated → result_published

**Transaction:** pending → completed | failed | rejected | refunded

**Document Request:** submitted → processing → awaiting_approval → approved | rejected → issued → collected

**Support Ticket:** in_progress → awaiting_response → resolved → closed | reopened

---

## 21. Schema Summary — 110 Tables

| Module                     | Tables                                                                                                                                                                                                                                 | Count   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1. Identity & Access       | students, platform_admins, college_roles, college_role_permissions, staff_members, blink_roles, blink_users, counsellors, user_sessions, audit_logs, college_onboarding_invites                                                        | 11      |
| 2. Institutional Hierarchy | university_types, universities, colleges, campuses, streams, disciplines, study_levels, program_types, courses, course_quotas, college_gallery, college_reviews, college_onboarding_requests                                           | 13      |
| 3. Content & Discovery     | news_alerts, articles, blogs, entrance_exams, events, event_registrations                                                                                                                                                              | 6       |
| 4. Admissions              | admission_cycles, admission_cycle_courses, applications, application_courses, application_documents, application_status_logs, seat_cancellations, enrollments, course_switch_requests, admission_form_configs, document_upload_configs | 11      |
| 5. Assessments             | assessment_sections, questions, question_course_mappings, assessment_templates, template_sections, assessment_papers, paper_questions, assessment_slots, assessment_attempts, assessment_reschedules                                   | 10      |
| 6. Interviews & Offers     | interview_slots, interview_bookings, interview_reschedules, offer_letters                                                                                                                                                              | 4       |
| 7. Fees & Payments         | fee_structures, student_fee_ledger, transactions, payment_receipts, refunds, scholarship_configs, scholarship_applications, college_payment_accounts, application_fee_configs                                                          | 9       |
| 8. Documents               | document_templates, document_requests, issued_documents                                                                                                                                                                                | 3       |
| 9. Hostel                  | hostels, hostel_room_types, hostel_mess_plans, hostel_addon_services, hostel_reviews, hostel_enrollments, hostel_wishlists, hostel_movement_logs                                                                                       | 8       |
| 10. Commute                | commute_routes, commute_route_stops, commute_buses, commute_enrollments, commute_ride_history                                                                                                                                          | 5       |
| 11. Counselling            | counsellor_availability, counselling_sessions, session_reschedules, counsellor_wallets, counsellor_wallet_transactions                                                                                                                 | 5       |
| 12. Blink / Referrals      | referral_codes, referrals, service_charge_configs, commissions, blink_wallets, blink_wallet_transactions, campus_visits, media_kits                                                                                                    | 8       |
| 13. Engagement             | communities, community_members, community_posts, community_post_votes, community_comments, squad_searches, beaconu_cards, student_bank_accounts, student_wallet_transactions, anti_ragging_complaints                                  | 10      |
| 14. Communication          | notifications, broadcast_notifications, announcements, support_tickets, ticket_messages, chat_conversations, chat_messages                                                                                                             | 7       |
| **TOTAL**                  |                                                                                                                                                                                                                                        | **110** |

---

## 22. Blocked Items

| Item                                 | Impact                                |
| ------------------------------------ | ------------------------------------- |
| SMS and Email providers              | Module 14, all notifications          |
| Blink module simplification          | Module 12 — deferred                  |
| Psychometric assessment flow changes | Module 5 — pending client explanation |
