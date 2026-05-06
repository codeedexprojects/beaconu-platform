-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone_country_code" VARCHAR(5) DEFAULT '+91',
    "phone_number" VARCHAR(15),
    "avatar_url" TEXT,
    "password_hash" TEXT,
    "google_id" VARCHAR(255),
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "source" VARCHAR(30) NOT NULL DEFAULT 'beaconu_app',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "profile_metadata" JSONB NOT NULL DEFAULT '{}',
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_admins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone_number" VARCHAR(15),
    "avatar_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "is_system_role" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "college_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_role_id" UUID NOT NULL,
    "permission_code" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "college_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "college_role_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone_number" VARCHAR(15),
    "avatar_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "invited_by" UUID,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blink_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "is_system_role" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blink_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blink_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "blink_role_id" UUID NOT NULL,
    "college_id" UUID,
    "associate_parent_id" UUID,
    "linked_student_id" UUID,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone_country_code" VARCHAR(5) DEFAULT '+91',
    "phone_number" VARCHAR(15),
    "country" VARCHAR(100),
    "avatar_url" TEXT,
    "ambassador_type" VARCHAR(20),
    "agency_name" VARCHAR(255),
    "agency_reg_number" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_by_staff_id" UUID,
    "profile_metadata" JSONB NOT NULL DEFAULT '{}',
    "last_login_at" TIMESTAMPTZ,
    "password_changed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blink_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counsellors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone_number" VARCHAR(15),
    "avatar_url" TEXT,
    "counsellor_type" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "profile_metadata" JSONB NOT NULL DEFAULT '{}',
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "counsellors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_type" VARCHAR(20) NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "device_info" JSONB NOT NULL DEFAULT '{}',
    "ip_address" INET,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_active_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_type" VARCHAR(20) NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "changes" JSONB,
    "ip_address" INET,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "preferred_streams" JSONB NOT NULL DEFAULT '[]',
    "preferred_level" VARCHAR(20),
    "preferred_states" JSONB NOT NULL DEFAULT '[]',
    "current_education" JSONB NOT NULL DEFAULT '{}',
    "whatsapp_number" VARCHAR(15),
    "status" VARCHAR(20) NOT NULL DEFAULT 'new',
    "assigned_to" UUID,
    "assigned_at" TIMESTAMPTZ,
    "consultation_notes" TEXT,
    "last_contacted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "university_type_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100),
    "city" VARCHAR(100),
    "accreditation" VARCHAR(255),
    "governance_details" TEXT,
    "logo_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colleges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "university_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "domain" VARCHAR(255),
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "state" VARCHAR(100),
    "city" VARCHAR(100),
    "district" VARCHAR(100),
    "address" TEXT,
    "pin_code" VARCHAR(10),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "profile_sections" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campuses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pin_code" VARCHAR(10),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "is_main_campus" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stream_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_levels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(30) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(30) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "campus_id" UUID,
    "discipline_id" UUID NOT NULL,
    "study_level_id" UUID NOT NULL,
    "program_type_id" UUID NOT NULL,
    "app_fee_commission_type" VARCHAR(10),
    "app_fee_commission_value" DECIMAL(10,2),
    "tuition_commission_type" VARCHAR(10),
    "tuition_commission_value" DECIMAL(10,2),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "duration" VARCHAR(50),
    "eligibility" TEXT,
    "intake_capacity" INTEGER,
    "study_mode" VARCHAR(20) NOT NULL DEFAULT 'full_time',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_quotas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL,
    "tuition_fee_override" DECIMAL(12,2),
    "quota_name" VARCHAR(100) NOT NULL,
    "seats" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "course_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_gallery" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "media_type" VARCHAR(10) NOT NULL,
    "url" TEXT NOT NULL,
    "caption" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "college_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "review_text" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "college_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "category" VARCHAR(30) NOT NULL DEFAULT 'news',
    "college_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ,
    "published_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "news_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "author_name" VARCHAR(100),
    "author_type" VARCHAR(20) NOT NULL,
    "author_id" UUID,
    "college_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "author_id" UUID NOT NULL,
    "author_type" VARCHAR(20) NOT NULL,
    "author_name" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "published_at" TIMESTAMPTZ,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrance_exams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "conducting_body" VARCHAR(255),
    "exam_level" VARCHAR(20) NOT NULL,
    "applicable_courses" JSONB NOT NULL DEFAULT '[]',
    "eligibility" TEXT,
    "description" TEXT,
    "registration_start" DATE,
    "registration_end" DATE,
    "exam_date" DATE,
    "result_date" DATE,
    "official_website" TEXT,
    "application_link" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "entrance_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "category" VARCHAR(30) NOT NULL,
    "speaker_name" VARCHAR(255),
    "speaker_title" VARCHAR(255),
    "organizer" VARCHAR(255),
    "event_date" DATE NOT NULL,
    "start_time" TIME,
    "end_time" TIME,
    "duration" VARCHAR(50),
    "event_mode" VARCHAR(20) NOT NULL,
    "venue" VARCHAR(255),
    "online_link" TEXT,
    "is_free" BOOLEAN NOT NULL DEFAULT true,
    "ticket_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_seats" INTEGER,
    "registered_count" INTEGER NOT NULL DEFAULT 0,
    "has_recording" BOOLEAN NOT NULL DEFAULT false,
    "recording_url" TEXT,
    "recording_duration" VARCHAR(20),
    "recorded_at" DATE,
    "college_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "created_by_type" VARCHAR(20),
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "payment_status" VARCHAR(20) NOT NULL DEFAULT 'not_applicable',
    "transaction_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'registered',
    "registered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMPTZ,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_cycles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "program_level" VARCHAR(30) NOT NULL,
    "admission_year" VARCHAR(10) NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admission_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_cycle_courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admission_cycle_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "application_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "interview_required" BOOLEAN NOT NULL DEFAULT true,
    "assessment_required" BOOLEAN NOT NULL DEFAULT true,
    "token_payment_stage" VARCHAR(20),
    "work_experience_required" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_cycle_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_number" VARCHAR(30) NOT NULL,
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "campus_id" UUID,
    "admission_cycle_id" UUID NOT NULL,
    "current_step" SMALLINT NOT NULL DEFAULT 1,
    "form_status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "profile_photo_url" TEXT,
    "whatsapp_country_code" VARCHAR(5) DEFAULT '+91',
    "whatsapp_number" VARCHAR(15),
    "nationality" VARCHAR(100),
    "state_of_domicile" VARCHAR(100),
    "passport_country" VARCHAR(100),
    "passport_number" VARCHAR(50),
    "work_experience_details" JSONB,
    "entrance_exam_details" JSONB,
    "application_pdf_url" TEXT,
    "quota_details" JSONB NOT NULL DEFAULT '{}',
    "personal_details" JSONB NOT NULL DEFAULT '{}',
    "family_details" JSONB NOT NULL DEFAULT '{}',
    "address_details" JSONB NOT NULL DEFAULT '{}',
    "qualification_details" JSONB NOT NULL DEFAULT '{}',
    "declaration" JSONB NOT NULL DEFAULT '{}',
    "total_application_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fee_payment_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "fee_transaction_id" UUID,
    "referral_code_id" UUID,
    "submitted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "application_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "rejection_reason" TEXT,
    "quota_id" UUID,
    "status_history" JSONB NOT NULL DEFAULT '[]',
    "status_updated_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "application_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "document_type" VARCHAR(50) NOT NULL,
    "document_category" VARCHAR(30) NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" VARCHAR(255),
    "file_size_bytes" INTEGER,
    "verification_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "verified_by" UUID,
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "application_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_status_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_course_id" UUID NOT NULL,
    "from_status" VARCHAR(30),
    "to_status" VARCHAR(30) NOT NULL,
    "changed_by_type" VARCHAR(20) NOT NULL,
    "changed_by_id" UUID,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_cancellations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_course_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "supporting_doc_urls" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "refund_amount" DECIMAL(10,2),
    "refund_status" VARCHAR(20),
    "processed_by" UUID,
    "remarks" TEXT,
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,

    CONSTRAINT "seat_cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "campus_id" UUID,
    "application_course_id" UUID NOT NULL,
    "admission_cycle_id" UUID NOT NULL,
    "enrollment_number" VARCHAR(30) NOT NULL,
    "academic_year" VARCHAR(10) NOT NULL,
    "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_switch_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "to_course_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "supporting_documents" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "processed_by" UUID,
    "remarks" TEXT,
    "processed_at" TIMESTAMPTZ,
    "new_enrollment_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "course_switch_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_form_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "admission_cycle_id" UUID,
    "section" VARCHAR(30) NOT NULL,
    "field_config" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admission_form_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_upload_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "admission_cycle_id" UUID,
    "document_type" VARCHAR(50) NOT NULL,
    "document_category" VARCHAR(30) NOT NULL,
    "document_label" VARCHAR(100) NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "applies_to_quotas" JSONB,
    "applies_to_nationalities" JSONB,
    "applies_to_courses" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_upload_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_core_section" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "assessment_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "response_format" VARCHAR(30) NOT NULL,
    "has_audio" BOOLEAN NOT NULL DEFAULT false,
    "has_image" BOOLEAN NOT NULL DEFAULT false,
    "has_passage" BOOLEAN NOT NULL DEFAULT false,
    "auto_scorable" BOOLEAN NOT NULL DEFAULT false,
    "is_system_type" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "question_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "question_type_id" UUID NOT NULL,
    "difficulty" VARCHAR(10) NOT NULL DEFAULT 'medium',
    "title" VARCHAR(255),
    "content" JSONB NOT NULL,
    "answer_key" JSONB,
    "marks" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "negative_marks" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parent_question_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_course_mappings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,

    CONSTRAINT "question_course_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "template_type" VARCHAR(20) NOT NULL DEFAULT 'admission',
    "total_questions" INTEGER NOT NULL,
    "total_marks" DECIMAL(7,2) NOT NULL,
    "total_duration_mins" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "assessment_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "template_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "question_count" INTEGER NOT NULL,
    "time_limit_mins" INTEGER NOT NULL,
    "section_weightage" DECIMAL(5,2),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "difficulty_distribution" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "template_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_papers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "template_id" UUID NOT NULL,
    "paper_code" VARCHAR(30) NOT NULL,
    "generation_type" VARCHAR(10) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "generated_by" UUID,
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paper_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "question_order" INTEGER NOT NULL,

    CONSTRAINT "paper_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "slot_type" VARCHAR(10) NOT NULL,
    "window_start" TIMESTAMPTZ NOT NULL,
    "window_end" TIMESTAMPTZ NOT NULL,
    "max_capacity" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "assessment_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_course_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "paper_id" UUID NOT NULL,
    "slot_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'not_started',
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "time_spent_secs" INTEGER,
    "total_score" DECIMAL(7,2),
    "max_score" DECIMAL(7,2),
    "section_scores" JSONB NOT NULL DEFAULT '{}',
    "anti_cheat_log" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "response" JSONB,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "time_spent_secs" INTEGER NOT NULL DEFAULT 0,
    "auto_score" DECIMAL(5,2),
    "manual_score" DECIMAL(5,2),
    "final_score" DECIMAL(5,2),
    "evaluated_by" UUID,
    "evaluation_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "evaluation_remarks" TEXT,
    "answered_at" TIMESTAMPTZ,

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_reschedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attempt_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "from_slot_id" UUID NOT NULL,
    "to_slot_id" UUID,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_reschedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "mode" VARCHAR(20) NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "duration_mins" INTEGER NOT NULL DEFAULT 30,
    "max_capacity" INTEGER NOT NULL DEFAULT 1,
    "booked_count" INTEGER NOT NULL DEFAULT 0,
    "zoom_meeting_url" TEXT,
    "zoom_meeting_id" VARCHAR(50),
    "zoom_passcode" VARCHAR(20),
    "phone_number" VARCHAR(20),
    "venue" VARCHAR(255),
    "interviewer_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "interview_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_course_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "slot_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'booked',
    "interview_score" DECIMAL(5,2),
    "interview_remarks" TEXT,
    "interview_outcome" VARCHAR(20),
    "evaluated_by" UUID,
    "evaluated_at" TIMESTAMPTZ,
    "booked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "interview_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_reschedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "from_slot_id" UUID NOT NULL,
    "to_slot_id" UUID,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "review_remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_reschedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_letters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_course_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "offer_number" VARCHAR(30) NOT NULL,
    "offer_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "valid_until" DATE NOT NULL,
    "token_amount" DECIMAL(10,2) NOT NULL,
    "token_payment_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "token_transaction_id" UUID,
    "document_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'issued',
    "issued_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "offer_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "academic_year" VARCHAR(10) NOT NULL,
    "fee_category" VARCHAR(30) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "year_or_semester" VARCHAR(20),
    "instalment_allowed" BOOLEAN NOT NULL DEFAULT false,
    "instalment_config" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_fee_ledger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "application_course_id" UUID,
    "enrollment_id" UUID,
    "fee_category" VARCHAR(30) NOT NULL,
    "description" VARCHAR(255),
    "total_amount" DECIMAL(12,2) NOT NULL,
    "scholarship_discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(12,2) NOT NULL,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balance_amount" DECIMAL(12,2) NOT NULL,
    "due_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_fee_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_number" VARCHAR(30) NOT NULL,
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "ledger_entry_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'INR',
    "payment_method" VARCHAR(20) NOT NULL,
    "razorpay_order_id" VARCHAR(100),
    "razorpay_payment_id" VARCHAR(100),
    "razorpay_signature" TEXT,
    "gateway_response" JSONB NOT NULL DEFAULT '{}',
    "transfer_status" VARCHAR(20) NOT NULL DEFAULT 'not_applicable',
    "razorpay_transfer_id" VARCHAR(100),
    "platform_commission" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "vendor_payout" DECIMAL(10,2),
    "upload_proof_url" TEXT,
    "upload_proof_file_name" VARCHAR(255),
    "dd_number" VARCHAR(50),
    "dd_bank_name" VARCHAR(100),
    "dd_date" DATE,
    "bank_ref_number" VARCHAR(100),
    "verification_status" VARCHAR(20) NOT NULL DEFAULT 'not_required',
    "verified_by" UUID,
    "verified_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_receipts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "receipt_number" VARCHAR(30) NOT NULL,
    "receipt_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "fee_category" VARCHAR(30) NOT NULL,
    "description" VARCHAR(255),
    "amount" DECIMAL(12,2) NOT NULL,
    "document_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "refund_amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "refund_type" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "gateway_refund_id" VARCHAR(100),
    "processed_by" UUID,
    "processed_at" TIMESTAMPTZ,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "scholarship_type" VARCHAR(30) NOT NULL,
    "eligibility" JSONB NOT NULL,
    "discount_type" VARCHAR(20) NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "applicable_years" JSONB NOT NULL DEFAULT '["all"]',
    "terms_and_conditions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "scholarship_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scholarship_config_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "application_course_id" UUID NOT NULL,
    "supporting_documents" JSONB NOT NULL DEFAULT '[]',
    "remarks" TEXT,
    "discount_amount" DECIMAL(12,2),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "review_remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "scholarship_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_payment_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "razorpay_account_id" VARCHAR(100) NOT NULL,
    "onboarding_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "business_name" VARCHAR(255),
    "pan_number" VARCHAR(20),
    "gst_number" VARCHAR(20),
    "bank_account_number" VARCHAR(30),
    "bank_ifsc" VARCHAR(15),
    "bank_name" VARCHAR(100),
    "platform_commission_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "college_payment_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_standard" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "has_fee" BOOLEAN NOT NULL DEFAULT false,
    "fee_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_number" VARCHAR(30) NOT NULL,
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "document_template_id" UUID,
    "document_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "delivery_mode" VARCHAR(20) NOT NULL,
    "supporting_documents" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'submitted',
    "rejection_reason" TEXT,
    "resubmission_count" INTEGER NOT NULL DEFAULT 0,
    "resubmission_history" JSONB NOT NULL DEFAULT '[]',
    "assigned_to" UUID,
    "processed_by" UUID,
    "issued_document_url" TEXT,
    "issued_at" TIMESTAMPTZ,
    "pickup_date" DATE,
    "pickup_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issued_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_request_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "document_name" VARCHAR(255) NOT NULL,
    "document_url" TEXT NOT NULL,
    "file_name" VARCHAR(255),
    "file_size_bytes" INTEGER,
    "delivery_mode" VARCHAR(20) NOT NULL,
    "issued_by" UUID NOT NULL,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issued_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "hostel_type" VARCHAR(20) NOT NULL,
    "is_on_campus" BOOLEAN NOT NULL DEFAULT true,
    "distance_from_campus" VARCHAR(50),
    "description" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "total_beds" INTEGER,
    "cover_image_url" TEXT,
    "gallery" JSONB NOT NULL DEFAULT '[]',
    "warden_info" JSONB NOT NULL DEFAULT '{}',
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "rules" JSONB NOT NULL DEFAULT '[]',
    "location_info" JSONB NOT NULL DEFAULT '{}',
    "avg_rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "hostels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_room_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hostel_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "total_beds" INTEGER NOT NULL,
    "available_beds" INTEGER NOT NULL,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "annual_plan_price" DECIMAL(10,2),
    "monthly_plan_price" DECIMAL(10,2),
    "admission_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "security_deposit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "hostel_room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_mess_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hostel_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "meals_included" JSONB NOT NULL DEFAULT '[]',
    "price_monthly" DECIMAL(10,2) NOT NULL,
    "duration" VARCHAR(20) NOT NULL DEFAULT '1 Month',
    "is_compulsory" BOOLEAN NOT NULL DEFAULT false,
    "dietary_options" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "hostel_mess_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_addon_services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hostel_id" UUID NOT NULL,
    "service_type" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_optional" BOOLEAN NOT NULL DEFAULT true,
    "plans" JSONB NOT NULL,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "hostel_addon_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hostel_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "review_text" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "hostel_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "hostel_id" UUID NOT NULL,
    "room_type_id" UUID NOT NULL,
    "room_plan_type" VARCHAR(10) NOT NULL,
    "mess_plan_id" UUID,
    "dietary_preference" VARCHAR(20),
    "selected_addons" JSONB NOT NULL DEFAULT '[]',
    "fee_breakdown" JSONB NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "enrolled_from" DATE NOT NULL,
    "enrolled_until" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "hostel_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_wishlists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "hostel_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hostel_wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commute_routes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "commute_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commute_route_stops" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "route_id" UUID NOT NULL,
    "stop_name" VARCHAR(255) NOT NULL,
    "landmark" VARCHAR(255),
    "morning_time" TIME,
    "evening_time" TIME,
    "is_pickup_point" BOOLEAN NOT NULL DEFAULT true,
    "stop_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "commute_route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commute_buses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "route_id" UUID NOT NULL,
    "bus_number" VARCHAR(20) NOT NULL,
    "bus_name" VARCHAR(100),
    "bus_type" VARCHAR(50),
    "total_seats" INTEGER NOT NULL,
    "available_seats" INTEGER NOT NULL,
    "driver_name" VARCHAR(100),
    "driver_phone" VARCHAR(20),
    "driver_status" VARCHAR(20) NOT NULL DEFAULT 'off_duty',
    "monthly_fee" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "commute_buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commute_enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "bus_id" UUID NOT NULL,
    "pickup_stop_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "enrolled_from" DATE NOT NULL,
    "enrolled_until" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "commute_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commute_ride_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enrollment_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "bus_id" UUID NOT NULL,
    "ride_date" DATE NOT NULL,
    "ride_type" VARCHAR(10) NOT NULL,
    "boarded_at" TIMESTAMPTZ,
    "dropped_at" TIMESTAMPTZ,
    "status" VARCHAR(20) NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commute_ride_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counsellor_availability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "counsellor_id" UUID NOT NULL,
    "available_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "session_duration_mins" INTEGER NOT NULL DEFAULT 45,
    "is_booked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "counsellor_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counselling_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "counsellor_id" UUID NOT NULL,
    "availability_id" UUID NOT NULL,
    "session_mode" VARCHAR(20) NOT NULL,
    "session_type" VARCHAR(20) NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "booking_reason" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'booked',
    "meeting_url" TEXT,
    "meeting_id" VARCHAR(50),
    "session_fee" DECIMAL(10,2),
    "payment_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "transaction_id" UUID,
    "cancelled_by" VARCHAR(20),
    "cancellation_reason" TEXT,
    "cancelled_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "session_notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "counselling_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_reschedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "rescheduled_by" VARCHAR(20) NOT NULL,
    "from_date" DATE NOT NULL,
    "from_time" TIME NOT NULL,
    "to_availability_id" UUID NOT NULL,
    "to_date" DATE NOT NULL,
    "to_time" TIME NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_reschedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counsellor_wallets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "counsellor_id" UUID NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_earned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_withdrawn" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "counsellor_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counsellor_wallet_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wallet_id" UUID NOT NULL,
    "counsellor_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" VARCHAR(255),
    "session_id" UUID,
    "withdrawal_status" VARCHAR(20),
    "bank_details" JSONB NOT NULL DEFAULT '{}',
    "balance_after" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counsellor_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "blink_user_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "course_id" UUID,
    "code" VARCHAR(30) NOT NULL,
    "referral_url" TEXT,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,
    "total_registrations" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referral_code_id" UUID NOT NULL,
    "blink_user_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "application_course_id" UUID,
    "status" VARCHAR(30) NOT NULL DEFAULT 'registered',
    "status_history" JSONB NOT NULL DEFAULT '[]',
    "status_updated_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_charge_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "academic_year" VARCHAR(10) NOT NULL,
    "student_category" VARCHAR(50) NOT NULL,
    "gross_amount" DECIMAL(10,2) NOT NULL,
    "gst_percentage" DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    "gst_amount" DECIMAL(10,2) NOT NULL,
    "net_payout" DECIMAL(10,2) NOT NULL,
    "terms_and_conditions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "service_charge_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referral_id" UUID NOT NULL,
    "blink_user_id" UUID NOT NULL,
    "service_charge_id" UUID NOT NULL,
    "gross_amount" DECIMAL(10,2) NOT NULL,
    "gst_amount" DECIMAL(10,2) NOT NULL,
    "net_payout" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "payout_due_date" DATE,
    "paid_at" TIMESTAMPTZ,
    "approved_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blink_wallets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "blink_user_id" UUID NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_earned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_withdrawn" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "bank_details" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blink_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blink_wallet_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wallet_id" UUID NOT NULL,
    "blink_user_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" VARCHAR(255),
    "commission_id" UUID,
    "withdrawal_status" VARCHAR(20),
    "balance_after" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blink_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_visits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "ambassador_id" UUID NOT NULL,
    "student_name" VARCHAR(255) NOT NULL,
    "course_interest" VARCHAR(255),
    "department" VARCHAR(255),
    "proposed_date" DATE NOT NULL,
    "proposed_time" TIME NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reassigned_from" UUID,
    "reassignment_reason" TEXT,
    "visit_notes" TEXT,
    "visit_rating" SMALLINT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "campus_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_kits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "course_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "asset_type" VARCHAR(20) NOT NULL,
    "scope" VARCHAR(20) NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" VARCHAR(255),
    "file_size_bytes" INTEGER,
    "thumbnail_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "media_kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "icon_url" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_by_type" VARCHAR(20) NOT NULL,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "post_count" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "community_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "notify_me" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "community_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "upvote_count" INTEGER NOT NULL DEFAULT 0,
    "downvote_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_post_votes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "vote_type" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_post_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "parent_comment_id" UUID,
    "content" TEXT NOT NULL,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squad_searches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "preferred_city" VARCHAR(100),
    "preferred_state" VARCHAR(100),
    "friends" JSONB NOT NULL,
    "results" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squad_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beaconu_cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "card_number" VARCHAR(20) NOT NULL,
    "card_holder_name" VARCHAR(255) NOT NULL,
    "valid_until" DATE NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_earned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_withdrawn" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "beaconu_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_bank_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "account_holder_name" VARCHAR(255) NOT NULL,
    "account_number_last4" VARCHAR(4) NOT NULL,
    "account_number_encrypted" TEXT NOT NULL,
    "ifsc_code" VARCHAR(15) NOT NULL,
    "account_type" VARCHAR(20) NOT NULL DEFAULT 'savings',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_wallet_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "card_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" VARCHAR(255),
    "referral_id" UUID,
    "bank_account_id" UUID,
    "withdrawal_status" VARCHAR(20),
    "balance_after" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anti_ragging_complaints" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "complaint_number" VARCHAR(30) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'submitted',
    "assigned_to" UUID,
    "resolution" TEXT,
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "anti_ragging_complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_type" VARCHAR(20) NOT NULL,
    "recipient_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "channel" VARCHAR(10) NOT NULL,
    "category" VARCHAR(30) NOT NULL DEFAULT 'general',
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "action_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "delivery_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcast_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "channels" JSONB NOT NULL,
    "target_filters" JSONB NOT NULL,
    "total_recipients" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "sent_by_type" VARCHAR(20) NOT NULL,
    "sent_by_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "scheduled_at" TIMESTAMPTZ,
    "sent_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcast_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "college_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(30) NOT NULL DEFAULT 'general',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'published',
    "published_at" TIMESTAMPTZ,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_number" VARCHAR(30) NOT NULL,
    "student_id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(30) NOT NULL DEFAULT 'general',
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "assigned_to" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    "resolved_at" TIMESTAMPTZ,
    "closed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "sender_type" VARCHAR(20) NOT NULL,
    "sender_id" UUID,
    "message" TEXT NOT NULL,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "participant_1_type" VARCHAR(20) NOT NULL,
    "participant_1_id" UUID NOT NULL,
    "participant_2_type" VARCHAR(20) NOT NULL,
    "participant_2_id" UUID NOT NULL,
    "last_message_text" TEXT,
    "last_message_at" TIMESTAMPTZ,
    "participant_1_unread" INTEGER NOT NULL DEFAULT 0,
    "participant_2_unread" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sender_type" VARCHAR(20) NOT NULL,
    "sender_id" UUID NOT NULL,
    "message" TEXT,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_google_id_key" ON "students"("google_id");

-- CreateIndex
CREATE INDEX "idx_students_email" ON "students"("email");

-- CreateIndex
CREATE INDEX "idx_students_phone" ON "students"("phone_number");

-- CreateIndex
CREATE INDEX "idx_students_google" ON "students"("google_id");

-- CreateIndex
CREATE INDEX "idx_students_status" ON "students"("status");

-- CreateIndex
CREATE UNIQUE INDEX "students_phone_country_code_phone_number_key" ON "students"("phone_country_code", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "platform_admins_email_key" ON "platform_admins"("email");

-- CreateIndex
CREATE INDEX "idx_college_roles_college" ON "college_roles"("college_id");

-- CreateIndex
CREATE UNIQUE INDEX "college_roles_college_id_slug_key" ON "college_roles"("college_id", "slug");

-- CreateIndex
CREATE INDEX "idx_role_perms_role" ON "college_role_permissions"("college_role_id");

-- CreateIndex
CREATE INDEX "idx_role_perms_code" ON "college_role_permissions"("permission_code");

-- CreateIndex
CREATE UNIQUE INDEX "college_role_permissions_college_role_id_permission_code_key" ON "college_role_permissions"("college_role_id", "permission_code");

-- CreateIndex
CREATE INDEX "idx_staff_college" ON "staff_members"("college_id");

-- CreateIndex
CREATE INDEX "idx_staff_role" ON "staff_members"("college_role_id");

-- CreateIndex
CREATE INDEX "idx_staff_email" ON "staff_members"("email");

-- CreateIndex
CREATE INDEX "idx_staff_status" ON "staff_members"("college_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "staff_members_email_college_id_key" ON "staff_members"("email", "college_id");

-- CreateIndex
CREATE UNIQUE INDEX "blink_roles_slug_key" ON "blink_roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blink_users_email_key" ON "blink_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "blink_users_agency_reg_number_key" ON "blink_users"("agency_reg_number");

-- CreateIndex
CREATE INDEX "idx_blink_role" ON "blink_users"("blink_role_id");

-- CreateIndex
CREATE INDEX "idx_blink_college" ON "blink_users"("college_id");

-- CreateIndex
CREATE INDEX "idx_blink_parent" ON "blink_users"("associate_parent_id");

-- CreateIndex
CREATE INDEX "idx_blink_student" ON "blink_users"("linked_student_id");

-- CreateIndex
CREATE INDEX "idx_blink_status" ON "blink_users"("status");

-- CreateIndex
CREATE INDEX "idx_blink_email" ON "blink_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "counsellors_email_key" ON "counsellors"("email");

-- CreateIndex
CREATE INDEX "idx_counsellors_type" ON "counsellors"("counsellor_type");

-- CreateIndex
CREATE INDEX "idx_counsellors_status" ON "counsellors"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refresh_token_key" ON "user_sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "idx_sessions_user" ON "user_sessions"("user_type", "user_id");

-- CreateIndex
CREATE INDEX "idx_sessions_token" ON "user_sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "idx_sessions_expiry" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "idx_audit_actor" ON "audit_logs"("actor_type", "actor_id");

-- CreateIndex
CREATE INDEX "idx_audit_entity" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_action" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "idx_audit_created" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "student_leads_student_id_key" ON "student_leads"("student_id");

-- CreateIndex
CREATE INDEX "idx_leads_status" ON "student_leads"("status");

-- CreateIndex
CREATE INDEX "idx_leads_assigned" ON "student_leads"("assigned_to");

-- CreateIndex
CREATE INDEX "idx_leads_student" ON "student_leads"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "university_types_name_key" ON "university_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "university_types_slug_key" ON "university_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "universities_slug_key" ON "universities"("slug");

-- CreateIndex
CREATE INDEX "idx_universities_type" ON "universities"("university_type_id");

-- CreateIndex
CREATE INDEX "idx_universities_state" ON "universities"("state");

-- CreateIndex
CREATE INDEX "idx_universities_status" ON "universities"("status");

-- CreateIndex
CREATE INDEX "idx_universities_slug" ON "universities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_slug_key" ON "colleges"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_code_key" ON "colleges"("code");

-- CreateIndex
CREATE INDEX "idx_colleges_university" ON "colleges"("university_id");

-- CreateIndex
CREATE INDEX "idx_colleges_slug" ON "colleges"("slug");

-- CreateIndex
CREATE INDEX "idx_colleges_domain" ON "colleges"("domain");

-- CreateIndex
CREATE INDEX "idx_colleges_state" ON "colleges"("state");

-- CreateIndex
CREATE INDEX "idx_colleges_status" ON "colleges"("status");

-- CreateIndex
CREATE INDEX "idx_campuses_college" ON "campuses"("college_id");

-- CreateIndex
CREATE INDEX "idx_campuses_status" ON "campuses"("college_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "streams_name_key" ON "streams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "streams_slug_key" ON "streams"("slug");

-- CreateIndex
CREATE INDEX "idx_disciplines_stream" ON "disciplines"("stream_id");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_stream_id_slug_key" ON "disciplines"("stream_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "study_levels_name_key" ON "study_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "study_levels_slug_key" ON "study_levels"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "program_types_name_key" ON "program_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "program_types_slug_key" ON "program_types"("slug");

-- CreateIndex
CREATE INDEX "idx_courses_college" ON "courses"("college_id");

-- CreateIndex
CREATE INDEX "idx_courses_campus" ON "courses"("campus_id");

-- CreateIndex
CREATE INDEX "idx_courses_discipline" ON "courses"("discipline_id");

-- CreateIndex
CREATE INDEX "idx_courses_level" ON "courses"("study_level_id");

-- CreateIndex
CREATE INDEX "idx_courses_program" ON "courses"("program_type_id");

-- CreateIndex
CREATE INDEX "idx_courses_status" ON "courses"("college_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "courses_college_id_code_key" ON "courses"("college_id", "code");

-- CreateIndex
CREATE INDEX "idx_quotas_course" ON "course_quotas"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_quotas_course_id_quota_name_key" ON "course_quotas"("course_id", "quota_name");

-- CreateIndex
CREATE INDEX "idx_gallery_college" ON "college_gallery"("college_id");

-- CreateIndex
CREATE INDEX "idx_reviews_college" ON "college_reviews"("college_id", "status");

-- CreateIndex
CREATE INDEX "idx_reviews_student" ON "college_reviews"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_alerts_slug_key" ON "news_alerts"("slug");

-- CreateIndex
CREATE INDEX "idx_news_status" ON "news_alerts"("status");

-- CreateIndex
CREATE INDEX "idx_news_category" ON "news_alerts"("category");

-- CreateIndex
CREATE INDEX "idx_news_college" ON "news_alerts"("college_id");

-- CreateIndex
CREATE INDEX "idx_news_published" ON "news_alerts"("published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_news_slug" ON "news_alerts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "idx_articles_status" ON "articles"("status");

-- CreateIndex
CREATE INDEX "idx_articles_college" ON "articles"("college_id");

-- CreateIndex
CREATE INDEX "idx_articles_published" ON "articles"("published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_articles_slug" ON "articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "idx_blogs_status" ON "blogs"("status");

-- CreateIndex
CREATE INDEX "idx_blogs_author" ON "blogs"("author_type", "author_id");

-- CreateIndex
CREATE INDEX "idx_blogs_published" ON "blogs"("published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_blogs_slug" ON "blogs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "entrance_exams_code_key" ON "entrance_exams"("code");

-- CreateIndex
CREATE INDEX "idx_exams_level" ON "entrance_exams"("exam_level");

-- CreateIndex
CREATE INDEX "idx_exams_status" ON "entrance_exams"("status");

-- CreateIndex
CREATE INDEX "idx_exams_dates" ON "entrance_exams"("exam_date");

-- CreateIndex
CREATE INDEX "idx_exams_code" ON "entrance_exams"("code");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "idx_events_status" ON "events"("status");

-- CreateIndex
CREATE INDEX "idx_events_date" ON "events"("event_date");

-- CreateIndex
CREATE INDEX "idx_events_college" ON "events"("college_id");

-- CreateIndex
CREATE INDEX "idx_events_category" ON "events"("category");

-- CreateIndex
CREATE INDEX "idx_events_mode" ON "events"("event_mode");

-- CreateIndex
CREATE INDEX "idx_events_free" ON "events"("is_free");

-- CreateIndex
CREATE INDEX "idx_events_recording" ON "events"("has_recording");

-- CreateIndex
CREATE INDEX "idx_events_slug" ON "events"("slug");

-- CreateIndex
CREATE INDEX "idx_ereg_event" ON "event_registrations"("event_id");

-- CreateIndex
CREATE INDEX "idx_ereg_student" ON "event_registrations"("student_id");

-- CreateIndex
CREATE INDEX "idx_ereg_status" ON "event_registrations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_event_id_student_id_key" ON "event_registrations"("event_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_cycles_college" ON "admission_cycles"("college_id");

-- CreateIndex
CREATE INDEX "idx_cycles_status" ON "admission_cycles"("college_id", "status");

-- CreateIndex
CREATE INDEX "idx_cycles_dates" ON "admission_cycles"("starts_on", "ends_on");

-- CreateIndex
CREATE UNIQUE INDEX "admission_cycles_college_id_slug_key" ON "admission_cycles"("college_id", "slug");

-- CreateIndex
CREATE INDEX "idx_cycle_courses_cycle" ON "admission_cycle_courses"("admission_cycle_id");

-- CreateIndex
CREATE INDEX "idx_cycle_courses_course" ON "admission_cycle_courses"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "admission_cycle_courses_admission_cycle_id_course_id_key" ON "admission_cycle_courses"("admission_cycle_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_application_number_key" ON "applications"("application_number");

-- CreateIndex
CREATE INDEX "idx_applications_student" ON "applications"("student_id");

-- CreateIndex
CREATE INDEX "idx_applications_college" ON "applications"("college_id");

-- CreateIndex
CREATE INDEX "idx_applications_cycle" ON "applications"("admission_cycle_id");

-- CreateIndex
CREATE INDEX "idx_applications_status" ON "applications"("college_id", "form_status");

-- CreateIndex
CREATE INDEX "idx_applications_number" ON "applications"("application_number");

-- CreateIndex
CREATE UNIQUE INDEX "applications_student_id_admission_cycle_id_key" ON "applications"("student_id", "admission_cycle_id");

-- CreateIndex
CREATE INDEX "idx_app_courses_application" ON "application_courses"("application_id");

-- CreateIndex
CREATE INDEX "idx_app_courses_course" ON "application_courses"("course_id");

-- CreateIndex
CREATE INDEX "idx_app_courses_status" ON "application_courses"("status");

-- CreateIndex
CREATE UNIQUE INDEX "application_courses_application_id_course_id_key" ON "application_courses"("application_id", "course_id");

-- CreateIndex
CREATE INDEX "idx_app_docs_application" ON "application_documents"("application_id");

-- CreateIndex
CREATE INDEX "idx_app_docs_type" ON "application_documents"("document_type");

-- CreateIndex
CREATE INDEX "idx_app_docs_status" ON "application_documents"("verification_status");

-- CreateIndex
CREATE INDEX "idx_status_logs_app_course" ON "application_status_logs"("application_course_id");

-- CreateIndex
CREATE INDEX "idx_status_logs_created" ON "application_status_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_cancellations_app_course" ON "seat_cancellations"("application_course_id");

-- CreateIndex
CREATE INDEX "idx_cancellations_student" ON "seat_cancellations"("student_id");

-- CreateIndex
CREATE INDEX "idx_cancellations_status" ON "seat_cancellations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_application_course_id_key" ON "enrollments"("application_course_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_enrollment_number_key" ON "enrollments"("enrollment_number");

-- CreateIndex
CREATE INDEX "idx_enrollments_student" ON "enrollments"("student_id");

-- CreateIndex
CREATE INDEX "idx_enrollments_college" ON "enrollments"("college_id");

-- CreateIndex
CREATE INDEX "idx_enrollments_course" ON "enrollments"("course_id");

-- CreateIndex
CREATE INDEX "idx_enrollments_app_course" ON "enrollments"("application_course_id");

-- CreateIndex
CREATE INDEX "idx_enrollments_status" ON "enrollments"("college_id", "status");

-- CreateIndex
CREATE INDEX "idx_enrollments_number" ON "enrollments"("enrollment_number");

-- CreateIndex
CREATE INDEX "idx_enrollments_academic_year" ON "enrollments"("academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_course_id_college_id_key" ON "enrollments"("student_id", "course_id", "college_id");

-- CreateIndex
CREATE INDEX "idx_csr_student" ON "course_switch_requests"("student_id");

-- CreateIndex
CREATE INDEX "idx_csr_college" ON "course_switch_requests"("college_id");

-- CreateIndex
CREATE INDEX "idx_csr_enrollment" ON "course_switch_requests"("enrollment_id");

-- CreateIndex
CREATE INDEX "idx_csr_status" ON "course_switch_requests"("status");

-- CreateIndex
CREATE INDEX "idx_afc_college" ON "admission_form_configs"("college_id");

-- CreateIndex
CREATE INDEX "idx_afc_cycle" ON "admission_form_configs"("admission_cycle_id");

-- CreateIndex
CREATE INDEX "idx_afc_section" ON "admission_form_configs"("section");

-- CreateIndex
CREATE INDEX "idx_afc_active" ON "admission_form_configs"("college_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_duc_college" ON "document_upload_configs"("college_id");

-- CreateIndex
CREATE INDEX "idx_duc_cycle" ON "document_upload_configs"("admission_cycle_id");

-- CreateIndex
CREATE INDEX "idx_duc_category" ON "document_upload_configs"("document_category");

-- CreateIndex
CREATE INDEX "idx_duc_active" ON "document_upload_configs"("college_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_sections_college" ON "assessment_sections"("college_id");

-- CreateIndex
CREATE INDEX "idx_sections_active" ON "assessment_sections"("college_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_sections_college_id_slug_key" ON "assessment_sections"("college_id", "slug");

-- CreateIndex
CREATE INDEX "idx_qtypes_college" ON "question_types"("college_id");

-- CreateIndex
CREATE INDEX "idx_qtypes_category" ON "question_types"("category");

-- CreateIndex
CREATE UNIQUE INDEX "question_types_college_id_slug_key" ON "question_types"("college_id", "slug");

-- CreateIndex
CREATE INDEX "idx_questions_type" ON "questions"("question_type_id");

-- CreateIndex
CREATE INDEX "idx_questions_college" ON "questions"("college_id");

-- CreateIndex
CREATE INDEX "idx_questions_section" ON "questions"("section_id");

-- CreateIndex
CREATE INDEX "idx_questions_difficulty" ON "questions"("difficulty");

-- CreateIndex
CREATE INDEX "idx_questions_status" ON "questions"("status");

-- CreateIndex
CREATE INDEX "idx_qcm_question" ON "question_course_mappings"("question_id");

-- CreateIndex
CREATE INDEX "idx_qcm_course" ON "question_course_mappings"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_course_mappings_question_id_course_id_key" ON "question_course_mappings"("question_id", "course_id");

-- CreateIndex
CREATE INDEX "idx_templates_college" ON "assessment_templates"("college_id");

-- CreateIndex
CREATE INDEX "idx_templates_status" ON "assessment_templates"("status");

-- CreateIndex
CREATE INDEX "idx_tsections_template" ON "template_sections"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_sections_template_id_section_id_key" ON "template_sections"("template_id", "section_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_papers_paper_code_key" ON "assessment_papers"("paper_code");

-- CreateIndex
CREATE INDEX "idx_papers_template" ON "assessment_papers"("template_id");

-- CreateIndex
CREATE INDEX "idx_papers_status" ON "assessment_papers"("status");

-- CreateIndex
CREATE INDEX "idx_pq_paper" ON "paper_questions"("paper_id");

-- CreateIndex
CREATE INDEX "idx_pq_section" ON "paper_questions"("section_id");

-- CreateIndex
CREATE UNIQUE INDEX "paper_questions_paper_id_question_id_key" ON "paper_questions"("paper_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "paper_questions_paper_id_question_order_key" ON "paper_questions"("paper_id", "question_order");

-- CreateIndex
CREATE INDEX "idx_slots_college" ON "assessment_slots"("college_id");

-- CreateIndex
CREATE INDEX "idx_slots_template" ON "assessment_slots"("template_id");

-- CreateIndex
CREATE INDEX "idx_slots_dates" ON "assessment_slots"("window_start", "window_end");

-- CreateIndex
CREATE INDEX "idx_slots_status" ON "assessment_slots"("status");

-- CreateIndex
CREATE INDEX "idx_attempts_app_course" ON "assessment_attempts"("application_course_id");

-- CreateIndex
CREATE INDEX "idx_attempts_student" ON "assessment_attempts"("student_id");

-- CreateIndex
CREATE INDEX "idx_attempts_paper" ON "assessment_attempts"("paper_id");

-- CreateIndex
CREATE INDEX "idx_attempts_slot" ON "assessment_attempts"("slot_id");

-- CreateIndex
CREATE INDEX "idx_attempts_status" ON "assessment_attempts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_attempts_application_course_id_student_id_key" ON "assessment_attempts"("application_course_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_answers_attempt" ON "student_answers"("attempt_id");

-- CreateIndex
CREATE INDEX "idx_answers_question" ON "student_answers"("question_id");

-- CreateIndex
CREATE INDEX "idx_answers_section" ON "student_answers"("section_id");

-- CreateIndex
CREATE INDEX "idx_answers_eval" ON "student_answers"("evaluation_status");

-- CreateIndex
CREATE UNIQUE INDEX "student_answers_attempt_id_question_id_key" ON "student_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE INDEX "idx_reschedules_attempt" ON "assessment_reschedules"("attempt_id");

-- CreateIndex
CREATE INDEX "idx_reschedules_student" ON "assessment_reschedules"("student_id");

-- CreateIndex
CREATE INDEX "idx_islots_college" ON "interview_slots"("college_id");

-- CreateIndex
CREATE INDEX "idx_islots_date" ON "interview_slots"("college_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "idx_islots_status" ON "interview_slots"("college_id", "status");

-- CreateIndex
CREATE INDEX "idx_islots_interviewer" ON "interview_slots"("interviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "interview_bookings_application_course_id_key" ON "interview_bookings"("application_course_id");

-- CreateIndex
CREATE INDEX "idx_ibookings_app_course" ON "interview_bookings"("application_course_id");

-- CreateIndex
CREATE INDEX "idx_ibookings_student" ON "interview_bookings"("student_id");

-- CreateIndex
CREATE INDEX "idx_ibookings_slot" ON "interview_bookings"("slot_id");

-- CreateIndex
CREATE INDEX "idx_ibookings_status" ON "interview_bookings"("status");

-- CreateIndex
CREATE INDEX "idx_ibookings_outcome" ON "interview_bookings"("interview_outcome");

-- CreateIndex
CREATE INDEX "idx_ireschedule_booking" ON "interview_reschedules"("booking_id");

-- CreateIndex
CREATE INDEX "idx_ireschedule_student" ON "interview_reschedules"("student_id");

-- CreateIndex
CREATE INDEX "idx_ireschedule_status" ON "interview_reschedules"("status");

-- CreateIndex
CREATE UNIQUE INDEX "offer_letters_application_course_id_key" ON "offer_letters"("application_course_id");

-- CreateIndex
CREATE UNIQUE INDEX "offer_letters_offer_number_key" ON "offer_letters"("offer_number");

-- CreateIndex
CREATE INDEX "idx_offers_app_course" ON "offer_letters"("application_course_id");

-- CreateIndex
CREATE INDEX "idx_offers_student" ON "offer_letters"("student_id");

-- CreateIndex
CREATE INDEX "idx_offers_college" ON "offer_letters"("college_id");

-- CreateIndex
CREATE INDEX "idx_offers_status" ON "offer_letters"("status");

-- CreateIndex
CREATE INDEX "idx_offers_token" ON "offer_letters"("token_payment_status");

-- CreateIndex
CREATE INDEX "idx_offers_valid" ON "offer_letters"("valid_until");

-- CreateIndex
CREATE INDEX "idx_fees_college" ON "fee_structures"("college_id");

-- CreateIndex
CREATE INDEX "idx_fees_course" ON "fee_structures"("course_id");

-- CreateIndex
CREATE INDEX "idx_fees_category" ON "fee_structures"("fee_category");

-- CreateIndex
CREATE INDEX "idx_fees_year" ON "fee_structures"("academic_year");

-- CreateIndex
CREATE INDEX "idx_ledger_student" ON "student_fee_ledger"("student_id");

-- CreateIndex
CREATE INDEX "idx_ledger_college" ON "student_fee_ledger"("college_id");

-- CreateIndex
CREATE INDEX "idx_ledger_app_course" ON "student_fee_ledger"("application_course_id");

-- CreateIndex
CREATE INDEX "idx_ledger_category" ON "student_fee_ledger"("fee_category");

-- CreateIndex
CREATE INDEX "idx_ledger_status" ON "student_fee_ledger"("status");

-- CreateIndex
CREATE INDEX "idx_ledger_due" ON "student_fee_ledger"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transaction_number_key" ON "transactions"("transaction_number");

-- CreateIndex
CREATE INDEX "idx_txn_student" ON "transactions"("student_id");

-- CreateIndex
CREATE INDEX "idx_txn_college" ON "transactions"("college_id");

-- CreateIndex
CREATE INDEX "idx_txn_ledger" ON "transactions"("ledger_entry_id");

-- CreateIndex
CREATE INDEX "idx_txn_number" ON "transactions"("transaction_number");

-- CreateIndex
CREATE INDEX "idx_txn_status" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "idx_txn_verification" ON "transactions"("verification_status");

-- CreateIndex
CREATE INDEX "idx_txn_method" ON "transactions"("payment_method");

-- CreateIndex
CREATE INDEX "idx_txn_paid" ON "transactions"("paid_at");

-- CreateIndex
CREATE INDEX "idx_txn_razorpay_order" ON "transactions"("razorpay_order_id");

-- CreateIndex
CREATE INDEX "idx_txn_razorpay_payment" ON "transactions"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "idx_txn_transfer_status" ON "transactions"("transfer_status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_receipts_transaction_id_key" ON "payment_receipts"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_receipts_receipt_number_key" ON "payment_receipts"("receipt_number");

-- CreateIndex
CREATE INDEX "idx_receipts_txn" ON "payment_receipts"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_receipts_student" ON "payment_receipts"("student_id");

-- CreateIndex
CREATE INDEX "idx_receipts_college" ON "payment_receipts"("college_id");

-- CreateIndex
CREATE INDEX "idx_receipts_number" ON "payment_receipts"("receipt_number");

-- CreateIndex
CREATE INDEX "idx_refunds_txn" ON "refunds"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_refunds_student" ON "refunds"("student_id");

-- CreateIndex
CREATE INDEX "idx_refunds_status" ON "refunds"("status");

-- CreateIndex
CREATE INDEX "idx_refunds_type" ON "refunds"("refund_type");

-- CreateIndex
CREATE INDEX "idx_scholarships_college" ON "scholarship_configs"("college_id");

-- CreateIndex
CREATE INDEX "idx_scholarships_type" ON "scholarship_configs"("scholarship_type");

-- CreateIndex
CREATE INDEX "idx_scholarships_active" ON "scholarship_configs"("college_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_schapp_config" ON "scholarship_applications"("scholarship_config_id");

-- CreateIndex
CREATE INDEX "idx_schapp_student" ON "scholarship_applications"("student_id");

-- CreateIndex
CREATE INDEX "idx_schapp_app_course" ON "scholarship_applications"("application_course_id");

-- CreateIndex
CREATE INDEX "idx_schapp_status" ON "scholarship_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "scholarship_applications_scholarship_config_id_student_id_a_key" ON "scholarship_applications"("scholarship_config_id", "student_id", "application_course_id");

-- CreateIndex
CREATE UNIQUE INDEX "college_payment_accounts_college_id_key" ON "college_payment_accounts"("college_id");

-- CreateIndex
CREATE INDEX "idx_cpa_college" ON "college_payment_accounts"("college_id");

-- CreateIndex
CREATE INDEX "idx_cpa_status" ON "college_payment_accounts"("onboarding_status");

-- CreateIndex
CREATE INDEX "idx_doc_templates_college" ON "document_templates"("college_id");

-- CreateIndex
CREATE INDEX "idx_doc_templates_active" ON "document_templates"("college_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "document_templates_college_id_slug_key" ON "document_templates"("college_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "document_requests_request_number_key" ON "document_requests"("request_number");

-- CreateIndex
CREATE INDEX "idx_docreq_student" ON "document_requests"("student_id");

-- CreateIndex
CREATE INDEX "idx_docreq_college" ON "document_requests"("college_id");

-- CreateIndex
CREATE INDEX "idx_docreq_template" ON "document_requests"("document_template_id");

-- CreateIndex
CREATE INDEX "idx_docreq_status" ON "document_requests"("college_id", "status");

-- CreateIndex
CREATE INDEX "idx_docreq_assigned" ON "document_requests"("assigned_to");

-- CreateIndex
CREATE INDEX "idx_docreq_number" ON "document_requests"("request_number");

-- CreateIndex
CREATE INDEX "idx_issued_request" ON "issued_documents"("document_request_id");

-- CreateIndex
CREATE INDEX "idx_issued_student" ON "issued_documents"("student_id");

-- CreateIndex
CREATE INDEX "idx_issued_college" ON "issued_documents"("college_id");

-- CreateIndex
CREATE INDEX "idx_hostels_college" ON "hostels"("college_id");

-- CreateIndex
CREATE INDEX "idx_hostels_type" ON "hostels"("hostel_type");

-- CreateIndex
CREATE INDEX "idx_hostels_status" ON "hostels"("college_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "hostels_college_id_slug_key" ON "hostels"("college_id", "slug");

-- CreateIndex
CREATE INDEX "idx_room_types_hostel" ON "hostel_room_types"("hostel_id");

-- CreateIndex
CREATE INDEX "idx_room_types_active" ON "hostel_room_types"("hostel_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_room_types_available" ON "hostel_room_types"("available_beds");

-- CreateIndex
CREATE INDEX "idx_mess_plans_hostel" ON "hostel_mess_plans"("hostel_id");

-- CreateIndex
CREATE INDEX "idx_addon_hostel" ON "hostel_addon_services"("hostel_id");

-- CreateIndex
CREATE INDEX "idx_addon_type" ON "hostel_addon_services"("service_type");

-- CreateIndex
CREATE INDEX "idx_hreviews_hostel" ON "hostel_reviews"("hostel_id", "status");

-- CreateIndex
CREATE INDEX "idx_hreviews_student" ON "hostel_reviews"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_reviews_hostel_id_student_id_key" ON "hostel_reviews"("hostel_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_henroll_student" ON "hostel_enrollments"("student_id");

-- CreateIndex
CREATE INDEX "idx_henroll_college" ON "hostel_enrollments"("college_id");

-- CreateIndex
CREATE INDEX "idx_henroll_hostel" ON "hostel_enrollments"("hostel_id");

-- CreateIndex
CREATE INDEX "idx_henroll_status" ON "hostel_enrollments"("status");

-- CreateIndex
CREATE INDEX "idx_hwish_student" ON "hostel_wishlists"("student_id");

-- CreateIndex
CREATE INDEX "idx_hwish_hostel" ON "hostel_wishlists"("hostel_id");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_wishlists_student_id_hostel_id_key" ON "hostel_wishlists"("student_id", "hostel_id");

-- CreateIndex
CREATE INDEX "idx_routes_college" ON "commute_routes"("college_id");

-- CreateIndex
CREATE INDEX "idx_routes_active" ON "commute_routes"("college_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_stops_route" ON "commute_route_stops"("route_id");

-- CreateIndex
CREATE UNIQUE INDEX "commute_route_stops_route_id_stop_order_key" ON "commute_route_stops"("route_id", "stop_order");

-- CreateIndex
CREATE INDEX "idx_buses_route" ON "commute_buses"("route_id");

-- CreateIndex
CREATE INDEX "idx_buses_active" ON "commute_buses"("route_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_buses_available" ON "commute_buses"("available_seats");

-- CreateIndex
CREATE INDEX "idx_cenroll_student" ON "commute_enrollments"("student_id");

-- CreateIndex
CREATE INDEX "idx_cenroll_college" ON "commute_enrollments"("college_id");

-- CreateIndex
CREATE INDEX "idx_cenroll_route" ON "commute_enrollments"("route_id");

-- CreateIndex
CREATE INDEX "idx_cenroll_bus" ON "commute_enrollments"("bus_id");

-- CreateIndex
CREATE INDEX "idx_cenroll_status" ON "commute_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "commute_enrollments_student_id_status_key" ON "commute_enrollments"("student_id", "status");

-- CreateIndex
CREATE INDEX "idx_rides_enrollment" ON "commute_ride_history"("enrollment_id");

-- CreateIndex
CREATE INDEX "idx_rides_student" ON "commute_ride_history"("student_id");

-- CreateIndex
CREATE INDEX "idx_rides_date" ON "commute_ride_history"("ride_date");

-- CreateIndex
CREATE INDEX "idx_avail_counsellor" ON "counsellor_availability"("counsellor_id");

-- CreateIndex
CREATE INDEX "idx_avail_date" ON "counsellor_availability"("available_date", "is_booked");

-- CreateIndex
CREATE UNIQUE INDEX "counsellor_availability_counsellor_id_available_date_start__key" ON "counsellor_availability"("counsellor_id", "available_date", "start_time");

-- CreateIndex
CREATE INDEX "idx_sessions_student" ON "counselling_sessions"("student_id");

-- CreateIndex
CREATE INDEX "idx_sessions_counsellor" ON "counselling_sessions"("counsellor_id");

-- CreateIndex
CREATE INDEX "idx_sessions_date" ON "counselling_sessions"("scheduled_date");

-- CreateIndex
CREATE INDEX "idx_sessions_status" ON "counselling_sessions"("status");

-- CreateIndex
CREATE INDEX "idx_sessions_type" ON "counselling_sessions"("session_type");

-- CreateIndex
CREATE INDEX "idx_sessions_payment" ON "counselling_sessions"("payment_status");

-- CreateIndex
CREATE INDEX "idx_sreschedule_session" ON "session_reschedules"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "counsellor_wallets_counsellor_id_key" ON "counsellor_wallets"("counsellor_id");

-- CreateIndex
CREATE INDEX "idx_wallet_counsellor" ON "counsellor_wallets"("counsellor_id");

-- CreateIndex
CREATE INDEX "idx_wtxn_wallet" ON "counsellor_wallet_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "idx_wtxn_counsellor" ON "counsellor_wallet_transactions"("counsellor_id");

-- CreateIndex
CREATE INDEX "idx_wtxn_type" ON "counsellor_wallet_transactions"("type");

-- CreateIndex
CREATE INDEX "idx_wtxn_created" ON "counsellor_wallet_transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- CreateIndex
CREATE INDEX "idx_refcodes_user" ON "referral_codes"("blink_user_id");

-- CreateIndex
CREATE INDEX "idx_refcodes_college" ON "referral_codes"("college_id");

-- CreateIndex
CREATE INDEX "idx_refcodes_code" ON "referral_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_application_course_id_key" ON "referrals"("application_course_id");

-- CreateIndex
CREATE INDEX "idx_referrals_user" ON "referrals"("blink_user_id");

-- CreateIndex
CREATE INDEX "idx_referrals_student" ON "referrals"("student_id");

-- CreateIndex
CREATE INDEX "idx_referrals_status" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "idx_referrals_code" ON "referrals"("referral_code_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_student_id_blink_user_id_key" ON "referrals"("student_id", "blink_user_id");

-- CreateIndex
CREATE INDEX "idx_scc_college" ON "service_charge_configs"("college_id");

-- CreateIndex
CREATE INDEX "idx_scc_course" ON "service_charge_configs"("course_id");

-- CreateIndex
CREATE INDEX "idx_scc_year" ON "service_charge_configs"("academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_referral_id_key" ON "commissions"("referral_id");

-- CreateIndex
CREATE INDEX "idx_comm_user" ON "commissions"("blink_user_id");

-- CreateIndex
CREATE INDEX "idx_comm_status" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "idx_comm_referral" ON "commissions"("referral_id");

-- CreateIndex
CREATE UNIQUE INDEX "blink_wallets_blink_user_id_key" ON "blink_wallets"("blink_user_id");

-- CreateIndex
CREATE INDEX "idx_bwallet_user" ON "blink_wallets"("blink_user_id");

-- CreateIndex
CREATE INDEX "idx_bwtxn_wallet" ON "blink_wallet_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "idx_bwtxn_user" ON "blink_wallet_transactions"("blink_user_id");

-- CreateIndex
CREATE INDEX "idx_bwtxn_type" ON "blink_wallet_transactions"("type");

-- CreateIndex
CREATE INDEX "idx_bwtxn_created" ON "blink_wallet_transactions"("created_at");

-- CreateIndex
CREATE INDEX "idx_visits_college" ON "campus_visits"("college_id");

-- CreateIndex
CREATE INDEX "idx_visits_ambassador" ON "campus_visits"("ambassador_id");

-- CreateIndex
CREATE INDEX "idx_visits_student" ON "campus_visits"("student_id");

-- CreateIndex
CREATE INDEX "idx_visits_date" ON "campus_visits"("proposed_date");

-- CreateIndex
CREATE INDEX "idx_visits_status" ON "campus_visits"("status");

-- CreateIndex
CREATE INDEX "idx_media_college" ON "media_kits"("college_id");

-- CreateIndex
CREATE INDEX "idx_media_course" ON "media_kits"("course_id");

-- CreateIndex
CREATE INDEX "idx_media_type" ON "media_kits"("asset_type");

-- CreateIndex
CREATE INDEX "idx_media_scope" ON "media_kits"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "communities_slug_key" ON "communities"("slug");

-- CreateIndex
CREATE INDEX "idx_communities_slug" ON "communities"("slug");

-- CreateIndex
CREATE INDEX "idx_communities_status" ON "communities"("status");

-- CreateIndex
CREATE INDEX "idx_communities_members" ON "communities"("member_count" DESC);

-- CreateIndex
CREATE INDEX "idx_cmembers_community" ON "community_members"("community_id");

-- CreateIndex
CREATE INDEX "idx_cmembers_student" ON "community_members"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_members_community_id_student_id_key" ON "community_members"("community_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_cposts_community" ON "community_posts"("community_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_cposts_author" ON "community_posts"("author_id");

-- CreateIndex
CREATE INDEX "idx_cposts_status" ON "community_posts"("status");

-- CreateIndex
CREATE INDEX "idx_votes_post" ON "community_post_votes"("post_id");

-- CreateIndex
CREATE INDEX "idx_votes_student" ON "community_post_votes"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_post_votes_post_id_student_id_key" ON "community_post_votes"("post_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_comments_post" ON "community_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_comments_author" ON "community_comments"("author_id");

-- CreateIndex
CREATE INDEX "idx_comments_parent" ON "community_comments"("parent_comment_id");

-- CreateIndex
CREATE INDEX "idx_squad_student" ON "squad_searches"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "beaconu_cards_student_id_key" ON "beaconu_cards"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "beaconu_cards_card_number_key" ON "beaconu_cards"("card_number");

-- CreateIndex
CREATE INDEX "idx_card_student" ON "beaconu_cards"("student_id");

-- CreateIndex
CREATE INDEX "idx_card_number" ON "beaconu_cards"("card_number");

-- CreateIndex
CREATE INDEX "idx_card_status" ON "beaconu_cards"("status");

-- CreateIndex
CREATE INDEX "idx_sba_student" ON "student_bank_accounts"("student_id");

-- CreateIndex
CREATE INDEX "idx_swtxn_card" ON "student_wallet_transactions"("card_id");

-- CreateIndex
CREATE INDEX "idx_swtxn_student" ON "student_wallet_transactions"("student_id");

-- CreateIndex
CREATE INDEX "idx_swtxn_type" ON "student_wallet_transactions"("type");

-- CreateIndex
CREATE INDEX "idx_swtxn_created" ON "student_wallet_transactions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_swtxn_withdrawal" ON "student_wallet_transactions"("withdrawal_status");

-- CreateIndex
CREATE UNIQUE INDEX "anti_ragging_complaints_complaint_number_key" ON "anti_ragging_complaints"("complaint_number");

-- CreateIndex
CREATE INDEX "idx_arc_student" ON "anti_ragging_complaints"("student_id");

-- CreateIndex
CREATE INDEX "idx_arc_college" ON "anti_ragging_complaints"("college_id");

-- CreateIndex
CREATE INDEX "idx_arc_status" ON "anti_ragging_complaints"("status");

-- CreateIndex
CREATE INDEX "idx_arc_number" ON "anti_ragging_complaints"("complaint_number");

-- CreateIndex
CREATE INDEX "idx_notif_recipient" ON "notifications"("recipient_type", "recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "idx_notif_category" ON "notifications"("category");

-- CreateIndex
CREATE INDEX "idx_notif_created" ON "notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notif_entity" ON "notifications"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_broadcast_college" ON "broadcast_notifications"("college_id");

-- CreateIndex
CREATE INDEX "idx_broadcast_status" ON "broadcast_notifications"("status");

-- CreateIndex
CREATE INDEX "idx_broadcast_sent" ON "broadcast_notifications"("sent_at" DESC);

-- CreateIndex
CREATE INDEX "idx_announce_college" ON "announcements"("college_id", "status");

-- CreateIndex
CREATE INDEX "idx_announce_published" ON "announcements"("published_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticket_number_key" ON "support_tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "idx_tickets_student" ON "support_tickets"("student_id");

-- CreateIndex
CREATE INDEX "idx_tickets_college" ON "support_tickets"("college_id");

-- CreateIndex
CREATE INDEX "idx_tickets_status" ON "support_tickets"("college_id", "status");

-- CreateIndex
CREATE INDEX "idx_tickets_assigned" ON "support_tickets"("assigned_to");

-- CreateIndex
CREATE INDEX "idx_tickets_number" ON "support_tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "idx_tickets_category" ON "support_tickets"("category");

-- CreateIndex
CREATE INDEX "idx_tmsg_ticket" ON "ticket_messages"("ticket_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_tmsg_sender" ON "ticket_messages"("sender_type", "sender_id");

-- CreateIndex
CREATE INDEX "idx_conv_p1" ON "chat_conversations"("participant_1_type", "participant_1_id");

-- CreateIndex
CREATE INDEX "idx_conv_p2" ON "chat_conversations"("participant_2_type", "participant_2_id");

-- CreateIndex
CREATE INDEX "idx_conv_last_msg" ON "chat_conversations"("last_message_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversations_participant_1_type_participant_1_id_part_key" ON "chat_conversations"("participant_1_type", "participant_1_id", "participant_2_type", "participant_2_id");

-- CreateIndex
CREATE INDEX "idx_cmsg_conversation" ON "chat_messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_cmsg_sender" ON "chat_messages"("sender_type", "sender_id");

-- CreateIndex
CREATE INDEX "idx_cmsg_unread" ON "chat_messages"("conversation_id", "is_read");

-- AddForeignKey
ALTER TABLE "college_roles" ADD CONSTRAINT "college_roles_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_role_permissions" ADD CONSTRAINT "college_role_permissions_college_role_id_fkey" FOREIGN KEY ("college_role_id") REFERENCES "college_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_college_role_id_fkey" FOREIGN KEY ("college_role_id") REFERENCES "college_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blink_users" ADD CONSTRAINT "blink_users_blink_role_id_fkey" FOREIGN KEY ("blink_role_id") REFERENCES "blink_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blink_users" ADD CONSTRAINT "blink_users_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blink_users" ADD CONSTRAINT "blink_users_associate_parent_id_fkey" FOREIGN KEY ("associate_parent_id") REFERENCES "blink_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blink_users" ADD CONSTRAINT "blink_users_linked_student_id_fkey" FOREIGN KEY ("linked_student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blink_users" ADD CONSTRAINT "blink_users_created_by_staff_id_fkey" FOREIGN KEY ("created_by_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_leads" ADD CONSTRAINT "student_leads_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_leads" ADD CONSTRAINT "student_leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_university_type_id_fkey" FOREIGN KEY ("university_type_id") REFERENCES "university_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplines" ADD CONSTRAINT "disciplines_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "disciplines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_study_level_id_fkey" FOREIGN KEY ("study_level_id") REFERENCES "study_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_program_type_id_fkey" FOREIGN KEY ("program_type_id") REFERENCES "program_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_quotas" ADD CONSTRAINT "course_quotas_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_gallery" ADD CONSTRAINT "college_gallery_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_reviews" ADD CONSTRAINT "college_reviews_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_reviews" ADD CONSTRAINT "college_reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_alerts" ADD CONSTRAINT "news_alerts_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_alerts" ADD CONSTRAINT "news_alerts_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrance_exams" ADD CONSTRAINT "entrance_exams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_cycles" ADD CONSTRAINT "admission_cycles_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_cycle_courses" ADD CONSTRAINT "admission_cycle_courses_admission_cycle_id_fkey" FOREIGN KEY ("admission_cycle_id") REFERENCES "admission_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_cycle_courses" ADD CONSTRAINT "admission_cycle_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_admission_cycle_id_fkey" FOREIGN KEY ("admission_cycle_id") REFERENCES "admission_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_referral_code_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "referral_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_courses" ADD CONSTRAINT "application_courses_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_courses" ADD CONSTRAINT "application_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_courses" ADD CONSTRAINT "application_courses_quota_id_fkey" FOREIGN KEY ("quota_id") REFERENCES "course_quotas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_status_logs" ADD CONSTRAINT "application_status_logs_application_course_id_fkey" FOREIGN KEY ("application_course_id") REFERENCES "application_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_cancellations" ADD CONSTRAINT "seat_cancellations_application_course_id_fkey" FOREIGN KEY ("application_course_id") REFERENCES "application_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_cancellations" ADD CONSTRAINT "seat_cancellations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_cancellations" ADD CONSTRAINT "seat_cancellations_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_application_course_id_fkey" FOREIGN KEY ("application_course_id") REFERENCES "application_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_admission_cycle_id_fkey" FOREIGN KEY ("admission_cycle_id") REFERENCES "admission_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_switch_requests" ADD CONSTRAINT "course_switch_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_switch_requests" ADD CONSTRAINT "course_switch_requests_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_switch_requests" ADD CONSTRAINT "course_switch_requests_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_switch_requests" ADD CONSTRAINT "course_switch_requests_to_course_id_fkey" FOREIGN KEY ("to_course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_switch_requests" ADD CONSTRAINT "course_switch_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_switch_requests" ADD CONSTRAINT "course_switch_requests_new_enrollment_id_fkey" FOREIGN KEY ("new_enrollment_id") REFERENCES "enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_form_configs" ADD CONSTRAINT "admission_form_configs_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_form_configs" ADD CONSTRAINT "admission_form_configs_admission_cycle_id_fkey" FOREIGN KEY ("admission_cycle_id") REFERENCES "admission_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_upload_configs" ADD CONSTRAINT "document_upload_configs_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_upload_configs" ADD CONSTRAINT "document_upload_configs_admission_cycle_id_fkey" FOREIGN KEY ("admission_cycle_id") REFERENCES "admission_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_sections" ADD CONSTRAINT "assessment_sections_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_types" ADD CONSTRAINT "question_types_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "assessment_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_question_type_id_fkey" FOREIGN KEY ("question_type_id") REFERENCES "question_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_parent_question_id_fkey" FOREIGN KEY ("parent_question_id") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_course_mappings" ADD CONSTRAINT "question_course_mappings_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_course_mappings" ADD CONSTRAINT "question_course_mappings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_templates" ADD CONSTRAINT "assessment_templates_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_sections" ADD CONSTRAINT "template_sections_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "assessment_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_sections" ADD CONSTRAINT "template_sections_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "assessment_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_papers" ADD CONSTRAINT "assessment_papers_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "assessment_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_questions" ADD CONSTRAINT "paper_questions_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "assessment_papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_questions" ADD CONSTRAINT "paper_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_questions" ADD CONSTRAINT "paper_questions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "assessment_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_slots" ADD CONSTRAINT "assessment_slots_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_slots" ADD CONSTRAINT "assessment_slots_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "assessment_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_application_course_id_fkey" FOREIGN KEY ("application_course_id") REFERENCES "application_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "assessment_papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "assessment_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "assessment_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_evaluated_by_fkey" FOREIGN KEY ("evaluated_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_reschedules" ADD CONSTRAINT "assessment_reschedules_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "assessment_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_reschedules" ADD CONSTRAINT "assessment_reschedules_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_reschedules" ADD CONSTRAINT "assessment_reschedules_from_slot_id_fkey" FOREIGN KEY ("from_slot_id") REFERENCES "assessment_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_reschedules" ADD CONSTRAINT "assessment_reschedules_to_slot_id_fkey" FOREIGN KEY ("to_slot_id") REFERENCES "assessment_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_reschedules" ADD CONSTRAINT "assessment_reschedules_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_slots" ADD CONSTRAINT "interview_slots_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_slots" ADD CONSTRAINT "interview_slots_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_bookings" ADD CONSTRAINT "interview_bookings_application_course_id_fkey" FOREIGN KEY ("application_course_id") REFERENCES "application_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_bookings" ADD CONSTRAINT "interview_bookings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_bookings" ADD CONSTRAINT "interview_bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "interview_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_bookings" ADD CONSTRAINT "interview_bookings_evaluated_by_fkey" FOREIGN KEY ("evaluated_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_reschedules" ADD CONSTRAINT "interview_reschedules_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "interview_bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_reschedules" ADD CONSTRAINT "interview_reschedules_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_reschedules" ADD CONSTRAINT "interview_reschedules_from_slot_id_fkey" FOREIGN KEY ("from_slot_id") REFERENCES "interview_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_reschedules" ADD CONSTRAINT "interview_reschedules_to_slot_id_fkey" FOREIGN KEY ("to_slot_id") REFERENCES "interview_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_reschedules" ADD CONSTRAINT "interview_reschedules_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_letters" ADD CONSTRAINT "offer_letters_application_course_id_fkey" FOREIGN KEY ("application_course_id") REFERENCES "application_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_letters" ADD CONSTRAINT "offer_letters_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_letters" ADD CONSTRAINT "offer_letters_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_letters" ADD CONSTRAINT "offer_letters_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fee_ledger" ADD CONSTRAINT "student_fee_ledger_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fee_ledger" ADD CONSTRAINT "student_fee_ledger_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fee_ledger" ADD CONSTRAINT "student_fee_ledger_application_course_id_fkey" FOREIGN KEY ("application_course_id") REFERENCES "application_courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fee_ledger" ADD CONSTRAINT "student_fee_ledger_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_ledger_entry_id_fkey" FOREIGN KEY ("ledger_entry_id") REFERENCES "student_fee_ledger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_configs" ADD CONSTRAINT "scholarship_configs_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_applications" ADD CONSTRAINT "scholarship_applications_scholarship_config_id_fkey" FOREIGN KEY ("scholarship_config_id") REFERENCES "scholarship_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_applications" ADD CONSTRAINT "scholarship_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_applications" ADD CONSTRAINT "scholarship_applications_application_course_id_fkey" FOREIGN KEY ("application_course_id") REFERENCES "application_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_applications" ADD CONSTRAINT "scholarship_applications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_payment_accounts" ADD CONSTRAINT "college_payment_accounts_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_document_template_id_fkey" FOREIGN KEY ("document_template_id") REFERENCES "document_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_document_request_id_fkey" FOREIGN KEY ("document_request_id") REFERENCES "document_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostels" ADD CONSTRAINT "hostels_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_room_types" ADD CONSTRAINT "hostel_room_types_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_mess_plans" ADD CONSTRAINT "hostel_mess_plans_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_addon_services" ADD CONSTRAINT "hostel_addon_services_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_reviews" ADD CONSTRAINT "hostel_reviews_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_reviews" ADD CONSTRAINT "hostel_reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_enrollments" ADD CONSTRAINT "hostel_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_enrollments" ADD CONSTRAINT "hostel_enrollments_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_enrollments" ADD CONSTRAINT "hostel_enrollments_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "hostels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_enrollments" ADD CONSTRAINT "hostel_enrollments_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "hostel_room_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_enrollments" ADD CONSTRAINT "hostel_enrollments_mess_plan_id_fkey" FOREIGN KEY ("mess_plan_id") REFERENCES "hostel_mess_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_wishlists" ADD CONSTRAINT "hostel_wishlists_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_wishlists" ADD CONSTRAINT "hostel_wishlists_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_routes" ADD CONSTRAINT "commute_routes_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_route_stops" ADD CONSTRAINT "commute_route_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "commute_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_buses" ADD CONSTRAINT "commute_buses_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "commute_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_enrollments" ADD CONSTRAINT "commute_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_enrollments" ADD CONSTRAINT "commute_enrollments_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_enrollments" ADD CONSTRAINT "commute_enrollments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "commute_routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_enrollments" ADD CONSTRAINT "commute_enrollments_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "commute_buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_enrollments" ADD CONSTRAINT "commute_enrollments_pickup_stop_id_fkey" FOREIGN KEY ("pickup_stop_id") REFERENCES "commute_route_stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_ride_history" ADD CONSTRAINT "commute_ride_history_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "commute_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_ride_history" ADD CONSTRAINT "commute_ride_history_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commute_ride_history" ADD CONSTRAINT "commute_ride_history_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "commute_buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counsellor_availability" ADD CONSTRAINT "counsellor_availability_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "counsellors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselling_sessions" ADD CONSTRAINT "counselling_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselling_sessions" ADD CONSTRAINT "counselling_sessions_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "counsellors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselling_sessions" ADD CONSTRAINT "counselling_sessions_availability_id_fkey" FOREIGN KEY ("availability_id") REFERENCES "counsellor_availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_reschedules" ADD CONSTRAINT "session_reschedules_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "counselling_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_reschedules" ADD CONSTRAINT "session_reschedules_to_availability_id_fkey" FOREIGN KEY ("to_availability_id") REFERENCES "counsellor_availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counsellor_wallets" ADD CONSTRAINT "counsellor_wallets_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "counsellors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counsellor_wallet_transactions" ADD CONSTRAINT "counsellor_wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "counsellor_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counsellor_wallet_transactions" ADD CONSTRAINT "counsellor_wallet_transactions_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "counsellors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counsellor_wallet_transactions" ADD CONSTRAINT "counsellor_wallet_transactions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "counselling_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_blink_user_id_fkey" FOREIGN KEY ("blink_user_id") REFERENCES "blink_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_code_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "referral_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_blink_user_id_fkey" FOREIGN KEY ("blink_user_id") REFERENCES "blink_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_application_course_id_fkey" FOREIGN KEY ("application_course_id") REFERENCES "application_courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_charge_configs" ADD CONSTRAINT "service_charge_configs_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_charge_configs" ADD CONSTRAINT "service_charge_configs_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_blink_user_id_fkey" FOREIGN KEY ("blink_user_id") REFERENCES "blink_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_service_charge_id_fkey" FOREIGN KEY ("service_charge_id") REFERENCES "service_charge_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blink_wallets" ADD CONSTRAINT "blink_wallets_blink_user_id_fkey" FOREIGN KEY ("blink_user_id") REFERENCES "blink_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blink_wallet_transactions" ADD CONSTRAINT "blink_wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "blink_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blink_wallet_transactions" ADD CONSTRAINT "blink_wallet_transactions_blink_user_id_fkey" FOREIGN KEY ("blink_user_id") REFERENCES "blink_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blink_wallet_transactions" ADD CONSTRAINT "blink_wallet_transactions_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_visits" ADD CONSTRAINT "campus_visits_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_visits" ADD CONSTRAINT "campus_visits_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_visits" ADD CONSTRAINT "campus_visits_ambassador_id_fkey" FOREIGN KEY ("ambassador_id") REFERENCES "blink_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_visits" ADD CONSTRAINT "campus_visits_reassigned_from_fkey" FOREIGN KEY ("reassigned_from") REFERENCES "blink_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_kits" ADD CONSTRAINT "media_kits_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_kits" ADD CONSTRAINT "media_kits_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_post_votes" ADD CONSTRAINT "community_post_votes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_post_votes" ADD CONSTRAINT "community_post_votes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "community_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_searches" ADD CONSTRAINT "squad_searches_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beaconu_cards" ADD CONSTRAINT "beaconu_cards_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_bank_accounts" ADD CONSTRAINT "student_bank_accounts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_wallet_transactions" ADD CONSTRAINT "student_wallet_transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "beaconu_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_wallet_transactions" ADD CONSTRAINT "student_wallet_transactions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_wallet_transactions" ADD CONSTRAINT "student_wallet_transactions_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_wallet_transactions" ADD CONSTRAINT "student_wallet_transactions_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "student_bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anti_ragging_complaints" ADD CONSTRAINT "anti_ragging_complaints_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anti_ragging_complaints" ADD CONSTRAINT "anti_ragging_complaints_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anti_ragging_complaints" ADD CONSTRAINT "anti_ragging_complaints_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broadcast_notifications" ADD CONSTRAINT "broadcast_notifications_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
