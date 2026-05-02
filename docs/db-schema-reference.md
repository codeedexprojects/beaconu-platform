# BeaconU DB Schema Reference

# 106 tables across 14 modules. PostgreSQL. All PKs are UUID. All tables have created_at, updated_at.

# Notation: FK=foreign key, UK=unique, IDX=index, PIDX=partial index, GIN=gin index, ?=nullable

# ============================================================

# MODULE 1: Identity & Access (11 tables)

# ============================================================

students:
id PK, full_name, email? UK, phone_country_code? default '+91', phone_number? UK,
avatar_url?, password_hash?, google_id? UK, is_email_verified default false,
is_phone_verified default false, source CHECK(beaconu_app|college_web|blink_referral),
status CHECK(active|inactive|suspended), profile_metadata JSONB default '{}',
last_login_at?
CHECK: email OR phone_number must exist
IDX: email, phone_number, google_id, status
GIN: profile_metadata

platform_admins:
id PK, full_name, email UK, password_hash, phone_number?, avatar_url?,
status CHECK(active|inactive), last_login_at?

college_roles:
id PK, college_id FK→colleges, name, slug, is_system_role default false,
is_active default true
UK: (college_id, slug)

college_role_permissions:
id PK, college_role_id FK→college_roles CASCADE, permission_code
UK: (college_role_id, permission_code)

staff_members:
id PK, college_id FK→colleges, college_role_id FK→college_roles, full_name,
email, password_hash, phone_number?, avatar_url?,
status CHECK(active|inactive|invited), invited_by? FK→staff_members,
last_login_at?
UK: (email, college_id)
IDX: college_id, college_role_id, email, status

blink_roles:
id PK, name, slug UK, is_system_role default false, is_active default true

# Seed: associate_admin, associate_employee, campus_ambassador

blink_users:
id PK, blink_role_id FK→blink_roles, college_id? FK→colleges,
associate_parent_id? FK→blink_users, linked_student_id? FK→students,
full_name, email UK, password_hash, phone_number?, avatar_url?,
ambassador_type? CHECK(student|teacher), agency_name?, agency_reg_number?,
status CHECK(active|inactive|suspended|pending_approval|rejected),
created_by_staff_id? FK→staff_members, profile_metadata JSONB default '{}',
last_login_at?
IDX: blink_role_id, college_id, associate_parent_id, linked_student_id, status

counsellors:
id PK, full_name, email UK, password_hash, phone_number?, avatar_url?,
counsellor_type CHECK(academic|mindcare),
status CHECK(active|inactive|pending_verification),
profile_metadata JSONB default '{}', last_login_at?
IDX: counsellor_type, status

user_sessions:
id PK, user_type CHECK(student|platform_admin|staff_member|blink_associate|blink_employee|blink_ambassador|counsellor),
user_id, refresh_token UK, device_info JSONB default '{}', ip_address INET?,
is_active default true, expires_at, last_active_at
IDX: (user_type, user_id) WHERE is_active, refresh_token, expires_at WHERE is_active

audit_logs:
id PK, actor_type, actor_id, action, entity_type?, entity_id?, changes JSONB?,
ip_address INET?

# Partition by created_at monthly

IDX: (actor_type, actor_id), (entity_type, entity_id), action, created_at

college_onboarding_invites:
id PK, college_id FK→colleges, email, invite_token UK,
status CHECK(pending|accepted|expired), expires_at

# ============================================================

# MODULE 2: Institutional Hierarchy (13 tables)

# ============================================================

university_types:
id PK, name UK, slug UK, sort_order default 0, is_active default true

# Seed: Central, State, Deemed, Private, INI

universities:
id PK, university_type_id FK→university_types, name, slug UK, state?, city?,
accreditation?, governance_details?, logo_url?,
status CHECK(active|inactive), metadata JSONB default '{}'
IDX: university_type_id, state, status

colleges:
id PK, university_id FK→universities, name, slug UK, code UK, domain?,
logo_url?, cover_image_url?, state?, city?, district?, address?, pin_code?,
status CHECK(active|inactive|onboarding),
profile_sections JSONB default '{}', settings JSONB default '{}'
IDX: university_id, slug, domain, state, status

campuses:
id PK, college_id FK→colleges CASCADE, name, address?, city?, state?,
pin_code?, latitude? DECIMAL(10,8), longitude? DECIMAL(11,8),
is_main_campus default false, status CHECK(active|inactive)
IDX: college_id

streams:
id PK, name UK, slug UK, sort_order default 0, is_active default true

disciplines:
id PK, stream_id FK→streams, name, slug, sort_order default 0, is_active default true
UK: (stream_id, slug)

study_levels:
id PK, name UK, slug UK, sort_order default 0, is_active default true

# Seed: Undergraduate, Postgraduate, Doctoral, Diploma

program_types:
id PK, name UK, slug UK, sort_order default 0, is_active default true

# Seed: Full-time, Part-time, Distance, Online

courses:
id PK, college_id FK→colleges, campus_id? FK→campuses,
discipline_id FK→disciplines, study_level_id FK→study_levels,
program_type_id FK→program_types,
name, code, duration?, eligibility?, intake_capacity?,
study_mode CHECK(full_time|part_time|distance|online),
status CHECK(active|inactive|draft), metadata JSONB default '{}',
platform_commission_type? CHECK(fixed|percentage),
platform_commission_value? DECIMAL(10,2)
UK: (college_id, code)
IDX: college_id, campus_id, discipline_id, study_level_id, program_type_id, status

course_quotas:
id PK, course_id FK→courses CASCADE, quota_name, seats,
tuition_fee_override? DECIMAL(12,2), is_active default true
UK: (course_id, quota_name)

college_gallery:
id PK, college_id FK→colleges CASCADE, media_type CHECK(image|video),
url, caption?, sort_order default 0

college_reviews:
id PK, college_id FK→colleges, student_id FK→students,
rating SMALLINT CHECK(1-5), review_text?,
status CHECK(pending|approved|rejected)
IDX: (college_id, status), student_id

college_onboarding_requests:
id PK, college_name, university_name?, contact_person_name, contact_email,
contact_phone?, city?, state?, message?,
status CHECK(pending|under_review|approved|rejected),
reviewed_by? FK→platform_admins, review_remarks?, created_college_id? FK→colleges

# ============================================================

# MODULE 3: Content & Discovery (6 tables)

# ============================================================

news_alerts:
id PK, title, slug UK, summary?, content, cover_image_url?,
category CHECK(news|alert|announcement), college_id? FK→colleges,
status CHECK(draft|published|archived), published_at?, published_by? FK→platform_admins
IDX: status, category, college_id, published_at DESC WHERE published

articles:
id PK, title, slug UK, summary?, content, cover_image_url?, tags JSONB default '[]',
author_name?, author_type CHECK(platform_admin|staff_member), author_id?,
college_id? FK→colleges, status CHECK(draft|published|archived), published_at?,
view_count default 0
IDX: status, college_id, published_at DESC, slug
GIN: tags

blogs:
id PK, title, slug UK, summary?, content, cover_image_url?, tags JSONB default '[]',
author_id, author_type CHECK(student|counsellor|staff_member|platform_admin),
author_name,
status CHECK(pending|under_review|approved|published|rejected|archived),
rejection_reason?, reviewed_by? FK→platform_admins, reviewed_at?, published_at?,
view_count default 0
IDX: status, (author_type, author_id), published_at DESC, slug
GIN: tags

entrance_exams:
id PK, college_id FK→colleges, name, code UK, conducting_body?,
exam_level CHECK(state|institutional), applicable_courses JSONB default '[]',
eligibility?, description?, registration_start?, registration_end?,
exam_date?, result_date?, official_website?, application_link?,
status CHECK(active|inactive|archived)
IDX: college_id, exam_level, status, exam_date

events:
id PK, title, slug UK, description?, cover_image_url?,
category CHECK(workshop|webinar|master_class|career_fair|hackathon|seminar|conference|other),
speaker_name?, speaker_title?, organizer?,
event_date, start_time?, end_time?, duration?,
event_mode CHECK(online|offline), venue?, online_link?,
is_free default true, ticket_price DECIMAL(10,2) default 0,
total_seats?, registered_count default 0,
has_recording default false, recording_url?, recording_duration?, recorded_at?,
college_id? FK→colleges, status CHECK(draft|published|ongoing|completed|cancelled),
created_by_type?, created_by_id?
IDX: status, event_date, college_id, category, event_mode, has_recording, slug

event_registrations:
id PK, event_id FK→events CASCADE, student_id FK→students,
payment_status CHECK(not_applicable|pending|paid|refunded),
transaction_id? FK→transactions,
status CHECK(registered|attended|cancelled|no_show), registered_at, cancelled_at?
UK: (event_id, student_id)

# ============================================================

# MODULE 4: Admissions (7 tables)

# ============================================================

admission_cycles:
id PK, college_id FK→colleges, name, slug,
program_level CHECK(undergraduate|postgraduate|doctoral|diploma),
admission_year, starts_on DATE, ends_on? DATE,
status CHECK(draft|open|closed|permanently_closed), settings JSONB default '{}'
UK: (college_id, slug)
IDX: college_id, status, (starts_on, ends_on)

admission_cycle_courses:
id PK, admission_cycle_id FK→admission_cycles CASCADE, course_id FK→courses,
application_fee DECIMAL(10,2) default 0, is_active default true,
interview_required default true, assessment_required default true,
work_experience_required default true,
token_payment_stage CHECK(before_assessment|after_shortlisting) default 'after_shortlisting'
UK: (admission_cycle_id, course_id)

applications:
id PK, application_number UK, student_id FK→students, college_id FK→colleges,
campus_id? FK→campuses, admission_cycle_id FK→admission_cycles,
current_step SMALLINT default 1, form_status CHECK(draft|in_progress|completed|submitted),
profile_photo_url?, whatsapp_country_code? default '+91', whatsapp_number?,
nationality CHECK(indian|non_indian) default 'indian',
state_of_domicile?, passport_country?, passport_number?,
personal_details JSONB default '{}', family_details JSONB default '{}',
address_details JSONB default '{}', qualification_details JSONB default '{}',
work_experience_details JSONB default '{}', entrance_exam_details JSONB default '{}',
declaration JSONB default '{}', application_pdf_url?,
total_application_fee DECIMAL(10,2) default 0,
fee_payment_status CHECK(pending|paid|failed|refunded),
fee_transaction_id?, referral_code_id?, submitted_at?
UK: (student_id, admission_cycle_id)
IDX: student_id, college_id, admission_cycle_id, form_status, application_number

application_courses:
id PK, application_id FK→applications CASCADE, course_id FK→courses,
quota_id? FK→course_quotas, application_fee DECIMAL(10,2) default 0,
status CHECK(draft|submitted|under_review|eligibility_check|assessment_pending|assessment_completed|interview_pending|interview_completed|shortlisted|offer_issued|token_paid|enrolled|rejected|dropped_out|deferred),
rejection_reason?, status_history JSONB default '[]', status_updated_at?
UK: (application_id, course_id)
IDX: application_id, course_id, status

application_documents:
id PK, application_id FK→applications CASCADE,
document_type, document_category CHECK(identity_proof|category_proof|academic_document),
file_url, file_name?, file_size_bytes?,
verification_status CHECK(pending|verified|rejected|resubmission_required),
rejection_reason?, verified_by? FK→staff_members, verified_at?
IDX: application_id, document_type, verification_status

application_status_logs:
id PK, application_course_id FK→application_courses CASCADE,
from_status?, to_status, changed_by_type CHECK(student|staff_member|system),
changed_by_id?, remarks?
IDX: application_course_id, created_at

seat_cancellations:
id PK, application_course_id FK→application_courses, student_id FK→students,
reason, supporting_doc_urls JSONB default '[]',
status CHECK(pending|under_review|approved|rejected),
refund_amount? DECIMAL(10,2), refund_status? CHECK(not_applicable|pending|processed|failed),
processed_by? FK→staff_members, remarks?, requested_at, processed_at?

# ============================================================

# MODULE 5: Assessments (10 tables)

# ============================================================

assessment_sections:
id PK, college_id FK→colleges CASCADE, name, slug, description?,
sort_order default 0, is_core_section default true, is_active default true
UK: (college_id, slug)

questions:
id PK, college_id FK→colleges CASCADE, section_id FK→assessment_sections,
question_type VARCHAR, difficulty CHECK(easy|medium|hard) default 'medium',
title?, content JSONB, answer_key? JSONB, marks DECIMAL(5,2) default 1.0,
negative_marks DECIMAL(5,2) default 0, version default 1,
parent_question_id? FK→questions,
status CHECK(draft|active|inactive|archived), created_by? FK→staff_members
IDX: college_id, section_id, question_type, difficulty, status
GIN: content

question_course_mappings:
id PK, question_id FK→questions CASCADE, course_id FK→courses CASCADE
UK: (question_id, course_id)

assessment_templates:
id PK, college_id FK→colleges CASCADE, name,
template_type CHECK(admission|psychometric) default 'admission',
total_questions, total_marks DECIMAL(7,2), total_duration_mins,
status CHECK(draft|active|archived), settings JSONB default '{}',
created_by? FK→staff_members
IDX: college_id, status, template_type

template_sections:
id PK, template_id FK→assessment_templates CASCADE,
section_id FK→assessment_sections,
question_count, time_limit_mins, section_weightage? DECIMAL(5,2),
sort_order default 0, difficulty_distribution JSONB default '{}'
UK: (template_id, section_id)

assessment_papers:
id PK, template_id FK→assessment_templates, paper_code UK,
generation_type CHECK(auto|manual), status CHECK(draft|approved|active|retired),
generated_by? FK→staff_members, approved_by? FK→staff_members, approved_at?
IDX: template_id, status

paper_questions:
id PK, paper_id FK→assessment_papers CASCADE, question_id FK→questions,
section_id FK→assessment_sections, question_order
UK: (paper_id, question_id), (paper_id, question_order)

assessment_slots:
id PK, college_id FK→colleges CASCADE, template_id FK→assessment_templates,
slot_type CHECK(window|fixed), window_start TIMESTAMPTZ, window_end TIMESTAMPTZ,
max_capacity?, status CHECK(draft|active|closed|cancelled)
CHECK: window_end > window_start
IDX: college_id, template_id, (window_start, window_end), status

assessment_attempts:
id PK, application_course_id? FK→application_courses, student_id FK→students,
paper_id FK→assessment_papers, slot_id FK→assessment_slots,
status CHECK(not_started|in_progress|completed|auto_submitted|terminated|under_evaluation|evaluated|result_published),
started_at?, completed_at?, time_spent_secs?,
answers JSONB default '{}', total_score? DECIMAL(7,2), max_score? DECIMAL(7,2),
section_scores JSONB default '{}', anti_cheat_log JSONB default '[]',
evaluated_by? FK→staff_members, evaluated_at?, evaluation_remarks?
UNIQUE IDX: (application_course_id, student_id) WHERE application_course_id IS NOT NULL
IDX: application_course_id, student_id, paper_id, slot_id, status
GIN: answers

assessment_reschedules:
id PK, attempt_id FK→assessment_attempts, student_id FK→students,
from_slot_id FK→assessment_slots, to_slot_id? FK→assessment_slots,
reason, status CHECK(pending|approved|rejected),
reviewed_by? FK→staff_members, reviewed_at?, review_remarks?
IDX: attempt_id, student_id, status

# ============================================================

# MODULE 6: Interviews & Offers (4 tables)

# ============================================================

interview_slots:
id PK, college_id FK→colleges CASCADE, mode CHECK(zoom|telephonic|on_campus),
scheduled_date DATE, start_time TIME, end_time TIME, duration_mins default 30,
max_capacity default 1, booked_count default 0,
zoom_meeting_url?, zoom_meeting_id?, zoom_passcode?, phone_number?, venue?,
interviewer_id? FK→staff_members, status CHECK(draft|active|full|completed|cancelled)
CHECK: end_time > start_time, booked_count <= max_capacity
IDX: college_id, (college_id, scheduled_date), status, interviewer_id

interview_bookings:
id PK, application_course_id FK→application_courses UK,
student_id FK→students, slot_id FK→interview_slots,
status CHECK(booked|in_progress|completed|no_show|cancelled),
interview_score? DECIMAL(5,2), interview_remarks?,
interview_outcome? CHECK(shortlisted|waitlisted|rejected),
evaluated_by? FK→staff_members, evaluated_at?, booked_at, completed_at?
IDX: application_course_id, student_id, slot_id, status, interview_outcome

interview_reschedules:
id PK, booking_id FK→interview_bookings, student_id FK→students,
from_slot_id FK→interview_slots, to_slot_id? FK→interview_slots,
reason, status CHECK(pending|approved|rejected),
reviewed_by? FK→staff_members, reviewed_at?, review_remarks?

offer_letters:
id PK, application_course_id FK→application_courses UK,
student_id FK→students, college_id FK→colleges,
offer_number UK, offer_date DATE, valid_until DATE,
token_amount DECIMAL(10,2), token_payment_status CHECK(pending|paid|expired|waived),
token_transaction_id?, document_url?,
status CHECK(issued|accepted|expired|withdrawn|declined),
issued_by? FK→staff_members
IDX: application_course_id, student_id, college_id, status, token_payment_status, valid_until WHERE issued

# ============================================================

# MODULE 7: Fees, Payments & Financials (9 tables)

# ============================================================

fee_structures:
id PK, college_id FK→colleges CASCADE, course_id FK→courses,
academic_year, fee_category CHECK(application_fee|token_amount|tuition_fee),
amount DECIMAL(12,2), year_or_semester?,
instalment_allowed default false, instalment_config JSONB default '{}',
is_active default true
IDX: college_id, course_id, fee_category, academic_year

student_fee_ledger:
id PK, student_id FK→students, college_id FK→colleges,
application_course_id? FK→application_courses,
fee_category CHECK(application_fee|token_amount|tuition_fee|hostel_fee|commute_fee|counselling_fee|event_fee|document_fee|examination_fee|library_fee|lab_fee|sports_fee|misc),
description?, total_amount DECIMAL(12,2), scholarship_discount DECIMAL(12,2) default 0,
net_amount DECIMAL(12,2), paid_amount DECIMAL(12,2) default 0,
balance_amount DECIMAL(12,2), due_date? DATE,
status CHECK(pending|partially_paid|paid|overdue|waived)
IDX: student_id, college_id, application_course_id, fee_category, status, due_date WHERE pending/overdue

transactions:
id PK, transaction_number UK, student_id FK→students, college_id FK→colleges,
ledger_entry_id? FK→student_fee_ledger, amount DECIMAL(12,2), currency default 'INR',
payment_method CHECK(upi|gpay|net_banking|credit_card|debit_card|demand_draft|bank_transfer),
razorpay_order_id?, razorpay_payment_id?, razorpay_signature?,
gateway_response JSONB default '{}',
transfer_status CHECK(not_applicable|pending|completed|failed) default 'not_applicable',
razorpay_transfer_id?, platform_commission DECIMAL(10,2) default 0,
vendor_payout? DECIMAL(10,2),
upload_proof_url?, upload_proof_file_name?, dd_number?, dd_bank_name?, dd_date?, bank_ref_number?,
verification_status CHECK(not_required|pending_verification|verified|rejected|flagged) default 'not_required',
verified_by? FK→staff_members, verified_at?, rejection_reason?,
status CHECK(pending|completed|failed|rejected|refunded), paid_at?
IDX: student_id, college_id, ledger_entry_id, transaction_number, status, verification_status WHERE pending/flagged, payment_method, paid_at, razorpay_order_id, razorpay_payment_id, transfer_status WHERE pending/failed

payment_receipts:
id PK, transaction_id FK→transactions, student_id FK→students,
college_id FK→colleges, receipt_number UK, receipt_date DATE,
fee_category, description?, amount DECIMAL(12,2), document_url?
IDX: transaction_id, student_id, college_id, receipt_number

refunds:
id PK, transaction_id FK→transactions, student_id FK→students,
college_id FK→colleges, refund_amount DECIMAL(12,2), reason,
refund_type CHECK(seat_cancellation|counselling_cancellation|event_cancellation|overpayment|other),
status CHECK(pending|approved|processed|rejected|failed),
gateway_refund_id?, processed_by? FK→staff_members, processed_at?, remarks?
IDX: transaction_id, student_id, status, refund_type

scholarship_configs:
id PK, college_id FK→colleges CASCADE, name,
scholarship_type CHECK(merit|need_based|category|sports|concession|other),
discount_type CHECK(percentage|fixed_amount), discount_value DECIMAL(10,2),
applicable_years JSONB default '["all"]', eligibility JSONB,
terms_and_conditions?, is_active default true
IDX: college_id, scholarship_type, (college_id, is_active)

scholarship_applications:
id PK, scholarship_config_id FK→scholarship_configs, student_id FK→students,
application_course_id FK→application_courses,
supporting_documents JSONB default '[]', student_remarks?,
discount_amount? DECIMAL(12,2),
status CHECK(pending|under_review|approved|rejected),
reviewed_by? FK→staff_members, reviewed_at?, review_remarks?
UK: (scholarship_config_id, student_id, application_course_id)

college_payment_accounts:
id PK, college_id FK→colleges UK, razorpay_account_id,
onboarding_status CHECK(pending|under_review|activated|suspended|rejected),
business_name?, pan_number?, gst_number?,
bank_account_number?, bank_ifsc?, bank_name?
IDX: college_id, onboarding_status

application_fee_configs:
id PK, admission_cycle_id FK→admission_cycles CASCADE, course_id FK→courses,
quota_id? FK→course_quotas, nationality CHECK(indian|non_indian|both) default 'indian',
application_fee DECIMAL(10,2), is_active default true
UK: (admission_cycle_id, course_id, quota_id, nationality)

# ============================================================

# MODULE 8: Documents (3 tables)

# ============================================================

document_templates:
id PK, college_id FK→colleges CASCADE, name, slug,
description?, is_standard default true, is_active default true,
has_fee default false, fee_amount DECIMAL(10,2) default 0, sort_order default 0
UK: (college_id, slug)

document_requests:
id PK, request_number UK, student_id FK→students, college_id FK→colleges,
document_template_id? FK→document_templates, document_name, description?,
delivery_mode CHECK(digital|physical), supporting_documents JSONB default '[]',
status CHECK(submitted|processing|awaiting_approval|approved|rejected|issued|collected),
rejection_reason?, resubmission_count default 0, resubmission_history JSONB default '[]',
assigned_to? FK→staff_members, processed_by? FK→staff_members,
issued_document_url?, issued_at?, pickup_date?, pickup_confirmed default false
IDX: student_id, college_id, document_template_id, status, assigned_to, request_number

issued_documents:
id PK, document_request_id FK→document_requests, student_id FK→students,
college_id FK→colleges, document_name, document_url, file_name?, file_size_bytes?,
delivery_mode CHECK(digital|physical), issued_by FK→staff_members, issued_at
IDX: document_request_id, student_id, college_id

# ============================================================

# MODULE 9: Hostel (8 tables)

# ============================================================

hostels:
id PK, college_id FK→colleges CASCADE, name, slug,
hostel_type CHECK(boys|girls|co_ed), is_on_campus default true,
distance_from_campus?, description?, tags JSONB default '[]', total_beds?,
cover_image_url?, gallery JSONB default '[]',
warden_info JSONB default '{}', amenities JSONB default '[]',
rules JSONB default '[]', location_info JSONB default '{}',
avg_rating DECIMAL(2,1) default 0, review_count default 0,
status CHECK(active|inactive|draft)
UK: (college_id, slug)
IDX: college_id, hostel_type, status

hostel_room_types:
id PK, hostel_id FK→hostels CASCADE, name, description?,
total_beds, available_beds, photos JSONB default '[]',
annual_plan_price? DECIMAL(10,2), monthly_plan_price? DECIMAL(10,2),
admission_fee DECIMAL(10,2) default 0, security_deposit DECIMAL(10,2) default 0,
is_active default true, sort_order default 0
IDX: hostel_id, (hostel_id, is_active), available_beds WHERE > 0

hostel_mess_plans:
id PK, hostel_id FK→hostels CASCADE, name, description?,
meals_included JSONB default '[]', price_monthly DECIMAL(10,2),
duration? default '1 Month', is_compulsory default false,
dietary_options JSONB default '[]', is_active default true, sort_order default 0

hostel_addon_services:
id PK, hostel_id FK→hostels CASCADE,
service_type CHECK(laundry|gym|parking|other), name, description?,
is_optional default true, plans JSONB, notes?, is_active default true, sort_order default 0
IDX: hostel_id, service_type

hostel_reviews:
id PK, hostel_id FK→hostels CASCADE, student_id FK→students,
rating SMALLINT CHECK(1-5), review_text?, is_verified default false,
status CHECK(pending|approved|rejected)
UK: (hostel_id, student_id)
IDX: (hostel_id, status), student_id

hostel_enrollments:
id PK, student_id FK→students, college_id FK→colleges, hostel_id FK→hostels,
room_type_id FK→hostel_room_types, room_plan_type CHECK(annual|monthly),
mess_plan_id? FK→hostel_mess_plans, dietary_preference?,
selected_addons JSONB default '[]', fee_breakdown JSONB,
status CHECK(active|inactive|pending_payment|cancelled),
enrolled_from DATE, enrolled_until? DATE
IDX: student_id, college_id, hostel_id, status

hostel_wishlists:
id PK, student_id FK→students CASCADE, hostel_id FK→hostels CASCADE
UK: (student_id, hostel_id)

hostel_movement_logs:
id PK, enrollment_id FK→hostel_enrollments, student_id FK→students,
hostel_id FK→hostels, movement_type CHECK(move_in|move_out),
scheduled_date DATE, actual_date? DATE, room_number?,
reason? CHECK(course_completion|voluntary|disciplinary|transfer|other),
condition_remarks?, recorded_by? FK→staff_members,
status CHECK(scheduled|completed|cancelled)
IDX: enrollment_id, student_id, movement_type, status

# ============================================================

# MODULE 10: Commute (5 tables)

# ============================================================

commute_routes:
id PK, college_id FK→colleges CASCADE, name, description?, is_active default true
IDX: college_id, (college_id, is_active)

commute_route_stops:
id PK, route_id FK→commute_routes CASCADE, stop_name, landmark?,
morning_time? TIME, evening_time? TIME, is_pickup_point default true, stop_order
UK: (route_id, stop_order)

commute_buses:
id PK, route_id FK→commute_routes CASCADE, bus_number, bus_name?, bus_type?,
total_seats, available_seats,
driver_name?, driver_phone?, driver_status CHECK(on_route|off_duty|on_leave) default 'off_duty',
monthly_fee DECIMAL(10,2), is_active default true
CHECK: available_seats >= 0 AND available_seats <= total_seats
IDX: route_id, (route_id, is_active), available_seats WHERE > 0

commute_enrollments:
id PK, student_id FK→students, college_id FK→colleges,
route_id FK→commute_routes, bus_id FK→commute_buses,
pickup_stop_id FK→commute_route_stops,
status CHECK(active|inactive|pending_payment|cancelled),
enrolled_from DATE, enrolled_until? DATE
PIDX: UNIQUE (student_id) WHERE status = 'active'
IDX: student_id, college_id, route_id, bus_id, status

commute_ride_history:
id PK, enrollment_id FK→commute_enrollments, student_id FK→students,
bus_id FK→commute_buses, ride_date DATE, ride_type CHECK(morning|evening),
boarded_at?, dropped_at?, status CHECK(completed|missed|cancelled) default 'completed'
IDX: enrollment_id, student_id, ride_date

# ============================================================

# MODULE 11: Counselling & Sessions (5 tables)

# ============================================================

counsellor_availability:
id PK, counsellor_id FK→counsellors CASCADE, available_date DATE,
start_time TIME, end_time TIME, session_duration_mins default 45,
is_booked default false
UK: (counsellor_id, available_date, start_time)
IDX: counsellor_id, (available_date, is_booked), (counsellor_id, available_date) WHERE NOT booked

counselling_sessions:
id PK, student_id FK→students, counsellor_id FK→counsellors,
availability_id FK→counsellor_availability,
session_mode CHECK(video_call|voice_call), session_type CHECK(academic|mindcare),
scheduled_date DATE, start_time TIME, end_time TIME, booking_reason?,
status CHECK(booked|in_progress|completed|cancelled|no_show|rescheduled),
meeting_url?, meeting_id?,
session_fee? DECIMAL(10,2), payment_status CHECK(pending|paid|refunded|not_applicable),
transaction_id?,
cancelled_by? CHECK(student|counsellor), cancellation_reason?, cancelled_at?,
completed_at?, session_notes?
IDX: student_id, counsellor_id, scheduled_date, status, session_type, payment_status WHERE academic

session_reschedules:
id PK, session_id FK→counselling_sessions,
rescheduled_by CHECK(student|counsellor),
from_date DATE, from_time TIME,
to_availability_id FK→counsellor_availability, to_date DATE, to_time TIME, reason?

counsellor_wallets:
id PK, counsellor_id FK→counsellors UK, balance DECIMAL(12,2) default 0,
total_earned DECIMAL(12,2) default 0, total_withdrawn DECIMAL(12,2) default 0

counsellor_wallet_transactions:
id PK, wallet_id FK→counsellor_wallets, counsellor_id FK→counsellors,
type CHECK(credit|withdrawal), amount DECIMAL(10,2), description?,
session_id? FK→counselling_sessions,
withdrawal_status? CHECK(pending|processed|failed),
bank_details JSONB default '{}', balance_after DECIMAL(12,2)
IDX: wallet_id, counsellor_id, type, created_at

# ============================================================

# MODULE 12: Blink / Referrals & Commissions (8 tables)

# ============================================================

referral_codes:
id PK, blink_user_id FK→blink_users, college_id FK→colleges,
course_id? FK→courses, code UK, referral_url?,
referrer_type CHECK(blink_user|student) default 'blink_user',
referrer_student_id? FK→students,
total_clicks default 0, total_registrations default 0, is_active default true
IDX: blink_user_id, college_id, code

# Note: blink_user_id nullable when referrer_type = 'student'

referrals:
id PK, referral_code_id FK→referral_codes, blink_user_id FK→blink_users,
student_id FK→students, application_course_id? FK→application_courses,
referrer_type CHECK(blink_user|student) default 'blink_user',
referrer_student_id? FK→students,
status CHECK(registered|application_submitted|assessment_completed|seat_booked|fee_payment_done|offer_issued|admission_confirmed|class_ongoing|application_rejected|dropped_out),
status_history JSONB default '[]', status_updated_at?
UK: (student_id, blink_user_id)
IDX: blink_user_id, student_id, status, referral_code_id

service_charge_configs:
id PK, college_id FK→colleges, course_id FK→courses, academic_year,
student_category, gross_amount DECIMAL(10,2), gst_percentage DECIMAL(5,2) default 18.00,
gst_amount DECIMAL(10,2), net_payout DECIMAL(10,2),
terms_and_conditions?, is_active default true
IDX: college_id, course_id, academic_year

commissions:
id PK, referral_id FK→referrals UK, blink_user_id FK→blink_users,
service_charge_id FK→service_charge_configs,
gross_amount DECIMAL(10,2), gst_amount DECIMAL(10,2), net_payout DECIMAL(10,2),
status CHECK(pending|approved|paid|rejected|on_hold),
payout_due_date? DATE, paid_at?, approved_by?
IDX: blink_user_id, status, referral_id

blink_wallets:
id PK, blink_user_id FK→blink_users UK, balance DECIMAL(12,2) default 0,
total_earned DECIMAL(12,2) default 0, total_withdrawn DECIMAL(12,2) default 0,
bank_details JSONB default '{}'

blink_wallet_transactions:
id PK, wallet_id FK→blink_wallets, blink_user_id FK→blink_users,
type CHECK(credit|withdrawal), amount DECIMAL(10,2), description?,
commission_id? FK→commissions,
withdrawal_status? CHECK(pending|processed|failed),
balance_after DECIMAL(12,2)
IDX: wallet_id, blink_user_id, type, created_at

campus_visits:
id PK, college_id FK→colleges, student_id FK→students,
ambassador_id FK→blink_users, student_name, course_interest?, department?,
proposed_date DATE, proposed_time TIME,
status CHECK(pending|confirmed|completed|cancelled|reassigned),
reassigned_from? FK→blink_users, reassignment_reason?,
visit_notes?, visit_rating? SMALLINT CHECK(1-5)
IDX: college_id, ambassador_id, student_id, proposed_date, status

media_kits:
id PK, college_id FK→colleges CASCADE, course_id? FK→courses,
title, asset_type CHECK(poster|video|brochure),
scope CHECK(campus_wide|course_specific),
file_url, file_name?, file_size_bytes?, thumbnail_url?,
sort_order default 0, is_active default true
IDX: college_id, course_id, asset_type, scope

# ============================================================

# MODULE 13: Engagement (10 tables)

# ============================================================

communities:
id PK, name, slug UK, description?, cover_image_url?, icon_url?,
created_by_id, created_by_type CHECK(student|staff_member|platform_admin),
member_count default 0, post_count default 0,
status CHECK(active|inactive|suspended|archived)
IDX: slug, status, member_count DESC

community_members:
id PK, community_id FK→communities CASCADE, student_id FK→students CASCADE,
notify_me default false, joined_at
UK: (community_id, student_id)

community_posts:
id PK, community_id FK→communities CASCADE, author_id FK→students,
content, attachments JSONB default '[]',
upvote_count default 0, downvote_count default 0, comment_count default 0, share_count default 0,
status CHECK(active|hidden|removed|reported)
IDX: (community_id, created_at DESC), author_id, status

community_post_votes:
id PK, post_id FK→community_posts CASCADE, student_id FK→students,
vote_type CHECK(upvote|downvote)
UK: (post_id, student_id)

community_comments:
id PK, post_id FK→community_posts CASCADE, author_id FK→students,
parent_comment_id? FK→community_comments, content, like_count default 0,
status CHECK(active|hidden|removed)
IDX: (post_id, created_at), author_id, parent_comment_id

squad_searches:
id PK, student_id FK→students, preferred_city?, preferred_state?,
friends JSONB, results JSONB default '{}'

beaconu_cards:
id PK, student_id FK→students UK, card_number UK, card_holder_name,
valid_until DATE, balance DECIMAL(12,2) default 0,
total_earned DECIMAL(12,2) default 0, total_withdrawn DECIMAL(12,2) default 0,
status CHECK(active|inactive|expired)
IDX: student_id, card_number, status

student_bank_accounts:
id PK, student_id FK→students CASCADE, bank_name, account_holder_name,
account_number_last4, account_number_encrypted, ifsc_code,
account_type CHECK(savings|current) default 'savings',
is_verified default false, is_primary default false

student_wallet_transactions:
id PK, card_id FK→beaconu_cards, student_id FK→students,
type CHECK(credit|withdrawal), amount DECIMAL(10,2), description?,
referral_id? FK→referrals, bank_account_id? FK→student_bank_accounts,
withdrawal_status? CHECK(pending|processing|successful|failed),
balance_after DECIMAL(12,2)
IDX: card_id, student_id, type, created_at DESC, withdrawal_status WHERE withdrawal

anti_ragging_complaints:
id PK, student_id FK→students, college_id FK→colleges,
complaint_number UK, subject, description, is_anonymous default false,
attachments JSONB default '[]',
status CHECK(submitted|under_investigation|resolved|dismissed),
assigned_to? FK→staff_members, resolution?, resolved_at?
IDX: student_id, college_id, status, complaint_number

# ============================================================

# MODULE 14: Communication & Notifications (7 tables)

# ============================================================

notifications:
id PK, recipient_type CHECK(student|staff_member|blink_user|counsellor|platform_admin),
recipient_id, title, body,
channel CHECK(push|sms|email|in_app), category CHECK(general|application_update|payment|assessment|interview|document|hostel|commute|counselling|referral|event|announcement|system),
entity_type?, entity_id?, action_url?,
is_read default false, read_at?,
delivery_status CHECK(pending|sent|delivered|failed)

# Partition by created_at monthly

IDX: (recipient_type, recipient_id, is_read), category, created_at DESC, (recipient_type, recipient_id) WHERE NOT read, (entity_type, entity_id)

broadcast_notifications:
id PK, college_id? FK→colleges, title, body, channels JSONB,
target_filters JSONB, total_recipients default 0, sent_count default 0, failed_count default 0,
sent_by_type, sent_by_id,
status CHECK(draft|scheduled|sending|sent|cancelled), scheduled_at?, sent_at?
IDX: college_id, status, sent_at DESC

announcements:
id PK, college_id FK→colleges CASCADE, title, content,
category CHECK(general|academic|fee_reminder|event|hostel|campus|urgent),
is_pinned default false, status CHECK(draft|published|archived),
published_at?, created_by FK→staff_members
IDX: (college_id, status), (college_id) WHERE pinned AND published, published_at DESC

support_tickets:
id PK, ticket_number UK, student_id FK→students, college_id FK→colleges,
subject, description,
category CHECK(general|admission|fee_payment|document|hostel|commute|assessment|technical|other),
attachments JSONB default '[]', assigned_to? FK→staff_members,
status CHECK(in_progress|awaiting_response|resolved|closed|reopened),
resolved_at?, closed_at?
IDX: student_id, college_id, (college_id, status), assigned_to, ticket_number, category

ticket_messages:
id PK, ticket_id FK→support_tickets CASCADE,
sender_type CHECK(student|staff_member|system), sender_id?,
message, attachments JSONB default '[]', is_system default false
IDX: (ticket_id, created_at), (sender_type, sender_id)

chat_conversations:
id PK, participant_1_type CHECK(student|blink_user|staff_member), participant_1_id,
participant_2_type CHECK(student|blink_user|staff_member), participant_2_id,
last_message_text?, last_message_at?,
participant_1_unread default 0, participant_2_unread default 0,
status CHECK(active|archived|blocked)
UK: (participant_1_type, participant_1_id, participant_2_type, participant_2_id)
IDX: (participant_1_type, participant_1_id), (participant_2_type, participant_2_id), last_message_at DESC

chat_messages:
id PK, conversation_id FK→chat_conversations CASCADE,
sender_type CHECK(student|blink_user|staff_member), sender_id,
message?, attachments JSONB default '[]',
is_read default false, read_at?
IDX: (conversation_id, created_at), (sender_type, sender_id), (conversation_id, is_read) WHERE NOT read
