# BeaconU — Complete Database Design Context (v2 — Updated)

## For Continuation in New Chat Sessions

---

## 1. System Overview

BeaconU is a monolithic education platform with **4 applications** sharing **one PostgreSQL database**:

1. **BeaconU App (Launchpad)** — Student-facing mobile/web app for exploring colleges, courses, financial aid, events, community, psychometric assessments, BeaconU Card
2. **Blink App** — Separate app for Campus Ambassadors, Associate Agencies (Admin + Employees), and Counsellors (Academic + MindCare). Handles referral tracking, commission management, campus visits, counsellor sessions
3. **College Web Portal** — Per-college student portal (each college has its own domain). Students apply, take assessments, book interviews, pay fees, manage hostel/commute, raise queries. Also has Student Hub (post-admission)
4. **College Admin Portal** — Per-college admin panel (separate domain). Staff manage applications, assessments, interviews, fees, documents, hostels, commute, marketing, and student support

**Super Admin** manages the platform from a separate admin panel — onboards universities/colleges, manages platform-wide content (news, articles, blogs), system configuration.

---

## 2. Architecture Decisions

- **Database:** PostgreSQL (single database, not microservices)
- **Payments:** Razorpay Marketplace Model — linked accounts per college, webhook-driven, transfers API for fund splitting (platform commission + college payout)
- **Platform commission:** Per college per course (not a single global rate). Stored in `course_commission_configs` table
- **Payment methods:** Configurable per college via `colleges.settings.payment_modes` JSONB
- **Refund policy:** Fixed platform-wide. Not configurable per college
- **OTP:** Third-party service (2Factor, MSG91, or Twilio Verify) — no OTP storage in DB. But internal verification tokens stored in `student_verification_tokens` for email link verification
- **Auth:** Email + Password for admin roles, Google OAuth for students only (BeaconU App). All other roles use email + password
- **Multi-device sessions:** Allowed for all user types. No session limit
- **Google account change:** Not allowed. Different Google = new student record. Account merging is out of scope (manual by support)
- **College admin credential delivery:** Super Admin approves onboarding → system sends registration link to college admin email → they register via that link (tracked in `college_onboarding_invites`)
- **Multi-tenancy:** Each college portal has its own domain mapping to a `college_id`. All data is scoped to `college_id`. Staff session carries college_id for automatic filtering
- **JSONB Strategy:** Used for evolving/display-only fields (profile_metadata, profile_sections, settings, content, answers, fee_breakdown, eligibility, attachments). Operational/queryable data uses proper columns
- **Soft deletes:** `status = 'archived'` or `is_active = FALSE` everywhere, never hard DELETE
- **Status fields:** VARCHAR with CHECK constraints (not Postgres ENUM type) for easy addition of new statuses
- **File storage:** AWS S3. Key convention: `/{college_id}/{module}/{entity_id}/{filename}`. 5MB limit across all upload types (stored as config value for easy change)
- **Psychometric assessment:** Configured and managed by Super Admin only
- **SMS and Email providers:** Not yet decided (BLOCKED)

---

## 3. Identity & Access Architecture

**Separate identity tables per application domain:**

| Table             | Who                                         | Auth                                                | App                            |
| ----------------- | ------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| `students`        | Students                                    | Google OAuth (BeaconU App only) + optional password | BeaconU App + College Web      |
| `platform_admins` | Super Admins (2-5 people)                   | Email + Password                                    | Super Admin Panel              |
| `staff_members`   | College staff (scoped to college_id)        | Email + Password                                    | College Admin Portal           |
| `blink_users`     | Associates (admin + employee) + Ambassadors | Email + Password                                    | Blink App                      |
| `counsellors`     | Academic + MindCare counsellors             | Email + Password                                    | Blink App (Counsellor section) |

**Key rules:**

- A student can have only ONE role (student). If a student becomes an ambassador, they get a separate `blink_users` row linked via `linked_student_id`
- Students register once and can access any college portal (filtered to that college's data)
- Students coming from BeaconU auto-login to College Web; direct college visitors register fresh
- `students.source` tracks origin: 'beaconu_app', 'college_web', 'blink_referral'

**Role-based access (dynamic, not hardcoded):**

- `college_roles` — per-college, admin can create custom roles
- `college_role_permissions` — granular permission codes per role (module.action pattern)
- `blink_roles` — global (associate_admin, associate_employee, campus_ambassador)

**Cross-cutting auth tables:**

- `user_sessions` — polymorphic (user_type + user_id), supports multi-device
- `audit_logs` — polymorphic (actor_type + actor_id)
- `college_onboarding_invites` — registration links for college admins after approval
- `student_verification_tokens` — email/phone verification during student registration

---

## 4. Locked Decisions — Admissions

- **Interview stage** → Optional per course. Controlled via `admission_cycle_courses.interview_required` boolean
- **Assessment stage** → Optional per course. Controlled via `admission_cycle_courses.assessment_required` boolean
- **Quota selection** → Part of application form (Step 7). Quota can affect tuition fee via `course_quotas.tuition_fee_override`
- **Token payment expiry** → Offer permanently closed. No re-issue. `application_courses.status` → `dropped_out` automatically
- **Nationality split** → Application form asks Indian vs Non-Indian. Indian → select state of domicile. Non-Indian → enter country and passport number
- **Application fee calculation** → Auto-calculated based on program + quota + nationality via `application_fee_configs` table. Not a flat fee per course
- **Work experience step** → Optional step in application form (Step 14)
- **Entrance exam details step** → Student enters exam scores as part of application (Step 15). College configures which exams are accepted
- **Download form before submission** → Student can preview and download PDF (Step 18)
- **Eligibility check stage** → Explicit admin stage between document verification and assessment. New status: `eligibility_check`
- **Blogs** → Super Admin adds directly. No user submission or approval workflow
- **Entrance exams** → Managed by colleges only. Super Admin does not manage entrance exam info. Scoped to `college_id`

---

## 5. Locked Decisions — Blink Commission & Wallet

- **Commission formula** → Per college per course. Each college configures amount or percentage. Stored in `blink_commission_configs`
- **Payout trigger** → When first instalment OR entire tuition fee is paid (whichever college configures). Commission credited to Associate Admin wallet at that point
- **Commission ownership** → Goes entirely to Associate Admin wallet. Associate Admin manually pays their employees outside the platform
- **Withdrawal** → No minimum amount. Available immediately after credit. Currently manual processing
- **Referral statuses** → Simplified to 4: submitted, rejected, confirmed, dropped_out
- **Commission tracking** → Inline on `referrals` table (commission_amount, commission_status, commission_credited_at). No separate commissions table

---

## 6. Client Workflow — Admission Application Flow (19 Steps)

**Student side:**

1. First Registration (basic details)
2. Verify Email and Phone Number (OTP / verification link)
3. Redirect to Student Portal
4. Select Campus (for university/group. Not required for single institution)
5. Select Form (choose admission cycle, view programs)
6. Indian or Non-Indian? → 6A: Indian → State of Domicile. 6B: Non-Indian → Country + Passport
7. Select Programs & Quota Category (fee auto-calculated based on program, quota, nationality)
8. Pay Application Fee
9. Payment Successful → receipt generated
10. Personal Details
11. Address (permanent and correspondence)
12. Parents / Guardian Details
13. Educational Qualification (10th onwards)
14. Work Experience (if any)
15. Entrance Exam Details (customized per college's accepted exams)
16. Upload Documents (based on quota, country, program)
17. Declaration
18. Download Form (preview and download PDF)
19. Application Submitted

**Admin side after submission:**
→ Document Verification → `under_review`
→ Eligibility Check → `eligibility_check`
→ Assessment (if required) → `assessment_pending` → `assessment_completed`
→ Interview (if required) → `interview_pending` → `interview_completed`
→ Shortlisting → `shortlisted`
→ Offer Letter → `offer_issued`
→ Token Payment → `token_paid`
→ Full Enrollment → `enrolled`

> Note: Workflow steps, fields, documents, fees, and exams are fully customizable by each college/university.

---

## 7. Module Breakdown (14 Modules, 107 Tables)

### Module 1 — Identity & Access Control (12 tables)

`students`, `platform_admins`, `college_roles`, `college_role_permissions`, `staff_members`, `blink_roles`, `blink_users`, `counsellors`, `user_sessions`, `audit_logs`, `college_onboarding_invites`, `student_verification_tokens`

### Module 2 — Institutional Hierarchy (13 tables)

`university_types`, `universities`, `colleges`, `campuses`, `streams`, `disciplines`, `study_levels`, `program_types`, `courses`, `course_quotas`, `college_gallery`, `college_reviews`, `college_onboarding_requests`

- `course_quotas` has `tuition_fee_override` column (NULL = use default course fee)
- `entrance_exams` rescoped to college-only (moved from Module 3, now has `college_id` FK, no `platform_admins` FK)
- Colleges have `profile_sections` JSONB for all display content
- Colleges have `settings` JSONB for operational config (timezone, currency, payment_modes, bank_details, whatsapp_community_link)

### Module 3 — Content & Discovery (6 tables)

`news_alerts`, `articles`, `blogs`, `entrance_exams`, `events`, `event_registrations`

- `blogs` simplified: Super Admin publishes directly, no approval workflow. Status: draft/published/archived only
- `entrance_exams` scoped to `college_id` (not platform-wide)

### Module 4 — Admissions (7 tables)

`admission_cycles`, `admission_cycle_courses`, `applications`, `application_courses`, `application_documents`, `application_status_logs`, `seat_cancellations`

- `admission_cycle_courses` has `interview_required` and `assessment_required` booleans
- `applications` has: `nationality`, `state_of_domicile`, `passport_country`, `passport_number`, `work_experience_details` JSONB, `entrance_exam_details` JSONB, `application_pdf_url`
- `application_courses` has `quota_id` FK to `course_quotas`
- `application_courses` status flow: draft → submitted → under_review → eligibility_check → assessment_pending → assessment_completed → interview_pending → interview_completed → shortlisted → offer_issued → token_paid → enrolled → rejected | dropped_out | deferred
- Parent-child model: one form → multiple course selections tracked independently
- 6-step form stored as JSONB: personal_details, family_details, address_details, qualification_details, declaration
- No hardcoded application fee — dynamic via `application_fee_configs` lookup

### Module 5 — Assessments (10 tables)

`assessment_sections`, `questions`, `question_course_mappings`, `assessment_templates`, `template_sections`, `assessment_papers`, `paper_questions`, `assessment_slots`, `assessment_attempts`, `assessment_reschedules`

- Question types as VARCHAR (no separate table)
- Student answers as JSONB on `assessment_attempts`
- `assessment_attempts.application_course_id` is NULLABLE (psychometric assessments aren't tied to applications)
- Two slot types: fixed and window
- Anti-cheat: webcam, tab-switch, disconnect — logged in `anti_cheat_log` JSONB
- Psychometric assessments configured by Super Admin only

### Module 6 — Interviews & Offers (4 tables)

`interview_slots`, `interview_bookings`, `interview_reschedules`, `offer_letters`

- Interview modes: zoom, telephonic, on_campus
- Token payment expiry → permanent closure, no re-issue, auto drops application
- Max 1 reschedule, ≥30 min before session

### Module 7 — Fees, Payments & Financials (10 tables)

`fee_structures`, `student_fee_ledger`, `transactions`, `payment_receipts`, `refunds`, `scholarship_configs`, `scholarship_applications`, `college_payment_accounts`, `course_commission_configs`, `application_fee_configs`

- `transactions` has Razorpay marketplace fields: razorpay_order_id, razorpay_payment_id, razorpay_signature, transfer_status, razorpay_transfer_id, platform_commission, vendor_payout
- `college_payment_accounts` — Razorpay linked account per college (no platform_commission_pct — moved to course_commission_configs)
- `course_commission_configs` — platform commission per college per course
- `application_fee_configs` — dynamic application fee by program + quota + nationality
- Scholarships: admin configures → student applies → approved → discount on tuition in student_fee_ledger

### Module 8 — Documents (3 tables)

`document_templates`, `document_requests`, `issued_documents`

### Module 9 — Hostel (8 tables)

`hostels`, `hostel_room_types`, `hostel_mess_plans`, `hostel_addon_services`, `hostel_reviews`, `hostel_enrollments`, `hostel_wishlists`, `hostel_movement_logs`

- `hostel_movement_logs` tracks move-in/move-out events

### Module 10 — Commute (5 tables)

`commute_routes`, `commute_route_stops`, `commute_buses`, `commute_enrollments`, `commute_ride_history`

- Fixed unique constraint: partial unique index `WHERE status = 'active'` instead of broken UNIQUE(student_id, status)

### Module 11 — Counselling & Sessions (5 tables)

`counsellor_availability`, `counselling_sessions`, `session_reschedules`, `counsellor_wallets`, `counsellor_wallet_transactions`

### Module 12 — Blink / Referrals & Commissions (7 tables)

`blink_commission_configs`, `referrals`, `blink_wallets`, `blink_wallet_transactions`, `campus_visits`, `media_kits`

- **Simplified from original design:** removed `referral_codes`, `commissions`, `service_charge_configs`
- Referral code stored as VARCHAR on `referrals` (no separate table)
- Commission tracking inline on `referrals` (commission_amount, commission_status, commission_credited_at)
- `blink_commission_configs` replaces `service_charge_configs` — simpler: college + course + type (fixed/percentage) + payout_trigger
- Commission goes to Associate Admin wallet only. Admin pays employees manually outside platform

**Commission flow:**

```
Student pays first instalment OR full tuition (based on payout_trigger config)
→ Check referrals WHERE application_course_id = :id AND commission_status = 'pending'
→ Lookup blink_commission_configs for college + course
→ Calculate amount (fixed or % of tuition)
→ Credit Associate Admin blink_wallet
→ INSERT blink_wallet_transactions (type: 'credit', referral_id)
→ UPDATE referrals SET commission_status = 'credited'
```

### Module 13 — Engagement (10 tables)

`communities`, `community_members`, `community_posts`, `community_post_votes`, `community_comments`, `squad_searches`, `beaconu_cards`, `student_bank_accounts`, `student_wallet_transactions`, `anti_ragging_complaints`

### Module 14 — Communication & Notifications (7 tables)

`notifications`, `broadcast_notifications`, `announcements`, `support_tickets`, `ticket_messages`, `chat_conversations`, `chat_messages`

---

## 8. Key Design Patterns

1. **Separate identity tables per app domain**
2. **Dynamic roles via lookup tables** (college_roles, blink_roles)
3. **JSONB for flexibility** (display content, evolving fields, form data)
4. **Parent-child for applications** (one form → multiple course selections)
5. **Unified transactions table** (all payment types, Razorpay marketplace)
6. **Wallet pattern** (3 instances: counsellor_wallets, blink_wallets, beaconu_cards)
7. **Polymorphic references** (user_sessions, notifications, audit_logs, chat)
8. **Denormalized counts** (community member_count, hostel available_beds, event registered_count)
9. **Status history as JSONB** (application_courses, referrals)
10. **Partial indexes** (hot status values only)

---

## 9. Technical Problems Solved

1. **Referral link attribution** — encrypted URL payload, localStorage + cookie persistence, tracked from landing → registration → application → commission
2. **BeaconU → College Web SSO** — short-lived JWT token passed via redirect URL
3. **College portal domain routing** — middleware resolves hostname → college_id, all queries scoped
4. **Razorpay webhooks** — idempotent processing, retry queue for failed transfers, signature verification
5. **Assessment anti-cheat** — tab-switch detection, webcam heartbeat, disconnect auto-submit
6. **File uploads** — S3 pre-signed URLs, direct upload from frontend, 5MB limit
7. **Concurrent booking** — pessimistic locking (SELECT FOR UPDATE) for hostel beds, bus seats, interview slots
8. **Background jobs** — offer expiry, fee overdue, assessment auto-submit, transfer retry, session reminders, materialized view refresh

---

## 10. Deployment Phases

- **Phase 1:** Modules 1 + 2 (Identity + Institutions)
- **Phase 2:** Modules 3 + 4 + 5 + 6 + 7 (Content + Admissions + Assessments + Interviews + Payments)
- **Phase 3:** Modules 8 + 9 + 10 + 11 (Documents + Hostel + Commute + Counselling)
- **Phase 4:** Modules 12 + 13 + 14 (Blink + Engagement + Communication)

---

## 11. Total Schema Size

**107 tables across 14 modules**

| Module                     | Tables  |
| -------------------------- | ------- |
| 1. Identity & Access       | 12      |
| 2. Institutional Hierarchy | 13      |
| 3. Content & Discovery     | 6       |
| 4. Admissions              | 7       |
| 5. Assessments             | 10      |
| 6. Interviews & Offers     | 4       |
| 7. Fees & Payments         | 10      |
| 8. Documents               | 3       |
| 9. Hostel                  | 8       |
| 10. Commute                | 5       |
| 11. Counselling            | 5       |
| 12. Blink / Referrals      | 7       |
| 13. Engagement             | 10      |
| 14. Communication          | 7       |
| **TOTAL**                  | **107** |

---

## 12. Blocked Items

| #   | Item                    | Impact                       |
| --- | ----------------------- | ---------------------------- |
| 1   | SMS and Email providers | Module 14, all notifications |
