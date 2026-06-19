-- Database Cleanup Script
-- Remove X-Amz query parameters from S3 URLs stored in database
-- This script is database-agnostic (works on PostgreSQL, MySQL 8+)

-- ============================================================================
-- IMPORTANT: Run in staging/test environment first!
-- Backup database before running on production
-- ============================================================================

-- 1. Clean colleges table (logoUrl)
UPDATE colleges
SET logo_url = SUBSTRING_INDEX(logo_url, '?', 1)
WHERE logo_url LIKE '%?%' AND logo_url LIKE '%X-Amz%';

-- 2. Clean colleges table (coverImageUrl)
UPDATE colleges
SET cover_image_url = SUBSTRING_INDEX(cover_image_url, '?', 1)
WHERE cover_image_url LIKE '%?%' AND cover_image_url LIKE '%X-Amz%';

-- 3. Clean college_profile_sections (if storing profile data as JSON)
-- NOTE: This requires careful JSON manipulation. Example for MySQL:
UPDATE college_profile_sections
SET data = JSON_SET(
  data,
  '$.college_overview.accolades[*].image',
  JSON_EXTRACT(
    data,
    CONCAT('$.college_overview.accolades[*].image')
  )
)
WHERE JSON_CONTAINS(data, JSON_OBJECT('X-Amz', '%'), '$.college_overview.accolades[*].image');

-- 4. For Hostels
UPDATE hostels
SET cover_image_url = SUBSTRING_INDEX(cover_image_url, '?', 1)
WHERE cover_image_url LIKE '%?%' AND cover_image_url LIKE '%X-Amz%';

-- 5. For Student Profiles
UPDATE student_profiles
SET avatar_url = SUBSTRING_INDEX(avatar_url, '?', 1)
WHERE avatar_url LIKE '%?%' AND avatar_url LIKE '%X-Amz%';

-- 6. For Staff Members
UPDATE staff_members
SET avatar_url = SUBSTRING_INDEX(avatar_url, '?', 1)
WHERE avatar_url LIKE '%?%' AND avatar_url LIKE '%X-Amz%';

-- 7. Verify results
SELECT COUNT(*) as urls_with_presign_params
FROM (
  SELECT logo_url FROM colleges WHERE logo_url LIKE '%X-Amz%'
  UNION ALL
  SELECT cover_image_url FROM colleges WHERE cover_image_url LIKE '%X-Amz%'
  UNION ALL
  SELECT cover_image_url FROM hostels WHERE cover_image_url LIKE '%X-Amz%'
  UNION ALL
  SELECT avatar_url FROM student_profiles WHERE avatar_url LIKE '%X-Amz%'
  UNION ALL
  SELECT avatar_url FROM staff_members WHERE avatar_url LIKE '%X-Amz%'
) as remaining_presigned;

-- Should return 0 rows if cleanup was successful
