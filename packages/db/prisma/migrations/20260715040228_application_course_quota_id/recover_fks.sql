-- Manual recovery for 20260715040228_application_course_quota_id.
-- Everything in this migration ran except the 6 AddForeignKey statements
-- at the end, which failed because course_quota_seats didn't exist yet
-- (now created). Confirmed via live inspection: all columns/tables/indexes
-- already match the migration; zero of these 6 FKs exist yet.

ALTER TABLE "application_courses" ADD CONSTRAINT "application_courses_course_quota_seat_id_fkey" FOREIGN KEY ("course_quota_seat_id") REFERENCES "course_quota_seats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "document_upload_configs" ADD CONSTRAINT "document_upload_configs_admission_cycle_id_fkey" FOREIGN KEY ("admission_cycle_id") REFERENCES "admission_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "document_upload_config_courses" ADD CONSTRAINT "document_upload_config_courses_document_upload_config_id_fkey" FOREIGN KEY ("document_upload_config_id") REFERENCES "document_upload_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "document_upload_config_courses" ADD CONSTRAINT "document_upload_config_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "document_upload_config_quotas" ADD CONSTRAINT "document_upload_config_quotas_document_upload_config_id_fkey" FOREIGN KEY ("document_upload_config_id") REFERENCES "document_upload_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "document_upload_config_quotas" ADD CONSTRAINT "document_upload_config_quotas_college_quota_id_fkey" FOREIGN KEY ("college_quota_id") REFERENCES "college_quotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
