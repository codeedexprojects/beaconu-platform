# Admission Form Screens — API Reference (Screens 1–10)

For frontend implementation of the 10-screen student admission form. All routes below are
prefixed with:

```
{{baseUrl}}/api/v1/student/application-forms
```

**Auth**: every route requires `Authorization: Bearer <studentAccessToken>`.

**Response envelope** (all endpoints):

```json
{ "success": true, "message": "...", "data": { ... } }
```

On error:

```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

**Common error cases** (all PATCH endpoints below, unless noted):

- `404 RESOURCE_NOT_FOUND` — application doesn't exist or isn't yours
- `409 CONFLICT` — application already submitted (`"This application has already been submitted and can no longer be edited"`) or its fee isn't paid yet (`"Complete payment for your primary course before continuing"`)
- `422 VALIDATION_ERROR` — body failed schema validation, `error.details` has field-level messages

**Shared "Application" response shape** returned by every PATCH in Screens 1–8 and 10 (this is
`data` in the envelope — it reflects updated `currentStep`, not the section payload itself):

```json
{
  "id": "APP-123",
  "applicationNumber": "CLG10-2026-000123",
  "studentId": "STU-1",
  "collegeId": "CLG-10",
  "campusId": "CMP-1",
  "admissionCycleId": "ACY-1",
  "currentStep": 6,
  "formStatus": "draft",
  "profilePhotoUrl": null,
  "whatsappCountryCode": "+91",
  "whatsappNumber": "9876543210",
  "nationality": "national",
  "stateOfDomicile": "Karnataka",
  "passportCountry": null,
  "passportNumber": null,
  "totalApplicationFee": "5000",
  "feePaymentStatus": "paid",
  "submittedAt": null,
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-13T06:00:00.000Z"
}
```

> Note: this shape does **not** echo back the section data you just submitted (e.g. personal
> details, address, etc.) — only `currentStep` changes are visible here. To read back what's
> saved for the reusable-profile sections (Screens 1–4, 7), use
> `GET /my-applications/:applicationId/details?section=<section>` separately.

---

## Screen 1 — Personal Information

`PATCH /my-applications/:applicationId/personal-details`

Lands on the Student's reusable profile, not this Application (except the 5 fields marked
_(application-level)_ below, which stay on the Application row itself).

**Request body:**

```json
{
  "full_name": "Rahul Sharma",
  "date_of_birth": "2005-06-15",
  "gender": "male",
  "category": "General",
  "blood_group": "O+",
  "religion": "Hindu",
  "mother_tongue": "Hindi",
  "marital_status": "single",
  "aadhar_number": "123456789012",
  "profile_photo_url": null,
  "email": "rahul.sharma@example.com",
  "mobile_country_code": "+91",
  "mobile_number": "9876543210",
  "whatsapp_country_code": "+91",
  "whatsapp_number": "9876543210"
}
```

| Field                                         | Type                            | Required | Notes                                                                       |
| --------------------------------------------- | ------------------------------- | -------- | --------------------------------------------------------------------------- |
| `full_name`                                   | string                          | ✅       | min 1, max 255                                                              |
| `date_of_birth`                               | date string (`YYYY-MM-DD`)      | ✅       |                                                                             |
| `gender`                                      | `"male" \| "female" \| "other"` | ✅       |                                                                             |
| `category`                                    | string                          | —        | maps to "Community/Caste" on screen                                         |
| `blood_group`                                 | string                          | —        | max 5                                                                       |
| `religion`                                    | string                          | —        | max 50                                                                      |
| `mother_tongue`                               | string                          | —        | max 50                                                                      |
| `marital_status`                              | string                          | —        | max 20                                                                      |
| `aadhar_number`                               | string                          | —        | max 20                                                                      |
| `profile_photo_url` _(application-level)_     | string (URL)                    | —        | upload file first, pass the returned URL                                    |
| `email`                                       | string (email)                  | —        | contact email — separate from login email, never overwrites `Student.email` |
| `mobile_country_code`                         | string                          | —        | e.g. `"+91"`                                                                |
| `mobile_number`                               | string                          | —        | max 15                                                                      |
| `whatsapp_country_code` _(application-level)_ | string                          | —        |                                                                             |
| `whatsapp_number` _(application-level)_       | string                          | —        |                                                                             |

**Response:** shared Application shape above (`currentStep` advances to ≥ 3).

---

## Screen 2 — Family/Guardian Details

`PATCH /my-applications/:applicationId/family-details`

**Request body:**

```json
{
  "father_name": "Suresh Sharma",
  "father_occupation": "Software Engineer",
  "father_phone": "9876500001",
  "father_email": "suresh@example.com",
  "mother_name": "Anita Sharma",
  "mother_occupation": "Teacher",
  "mother_phone": "9876500002",
  "mother_email": "anita@example.com",
  "guardian_name": "Ramesh Sharma",
  "guardian_relation": "Grandparent",
  "guardian_phone": "9876500003",
  "annual_family_income": 1200000,
  "number_of_siblings": 1
}
```

| Field                                                    | Type    | Required |
| -------------------------------------------------------- | ------- | -------- |
| `father_name`                                            | string  | ✅       |
| `father_occupation` / `father_phone` / `father_email`    | string  | —        |
| `mother_name`                                            | string  | ✅       |
| `mother_occupation` / `mother_phone` / `mother_email`    | string  | —        |
| `guardian_name` / `guardian_relation` / `guardian_phone` | string  | —        |
| `annual_family_income`                                   | number  | —        |
| `number_of_siblings`                                     | integer | —        |

**Response:** shared Application shape (`currentStep` advances to ≥ 4).

---

## Screen 3 — Address Details

`PATCH /my-applications/:applicationId/address-details`

**Request body:**

```json
{
  "correspondence": {
    "address_line1": "12 MG Road",
    "address_line2": "Near City Mall",
    "city": "Bengaluru",
    "state": "Karnataka",
    "district": "Bengaluru Urban",
    "pin_code": "560001",
    "country": "India"
  },
  "same_as_correspondence": true,
  "permanent": null
}
```

| Field                    | Type                   | Required    | Notes                                                                     |
| ------------------------ | ---------------------- | ----------- | ------------------------------------------------------------------------- |
| `correspondence`         | `AddressBlock`         | ✅          | the primary/mailing address (labelled "Correspondence Address" on screen) |
| `same_as_correspondence` | boolean                | ✅          | if `true`, `permanent` can be `null`                                      |
| `permanent`              | `AddressBlock \| null` | conditional | **required** if `same_as_correspondence` is `false`                       |

`AddressBlock`:
| Field | Type | Required |
|---|---|---|
| `address_line1` | string | ✅ ("House No/Name") |
| `address_line2` | string | — ("Street/Area") |
| `city` | string | ✅ |
| `state` | string | ✅ |
| `district` | string | — |
| `pin_code` | string | ✅ |
| `country` | string | — (defaults to `"India"` server-side if omitted) |

**Response:** shared Application shape (`currentStep` advances to ≥ 5).

---

## Screens 4–6 — Academic Records

Three independent screens, three independent endpoints. Each is a **full replace** of its own
section only — submitting the 12th Grade screen never touches 10th Grade or Undergraduate data.

### Screen 4 — 10th Grade Details

`PATCH /my-applications/:applicationId/academic-records/tenth-grade`

**Request body:**

```json
{
  "academic_year": "2022-23",
  "admission_year": "2022",
  "year_of_passing": 2023,
  "board_name": "CBSE",
  "registration_number": "REG12345",
  "school_name": "Delhi Public School",
  "school_code": "DPS001",
  "school_address": "Sector 45, Gurugram",
  "school_state": "Haryana",
  "medium_of_instruction": "English",
  "subjects": [
    {
      "subject_name": "Mathematics",
      "evaluation_pattern": "Theory + Practical",
      "theory_marks": 78,
      "practical_marks": 20,
      "internal_marks": null,
      "max_marks": 100,
      "obtained_marks": 98,
      "attempts": 1,
      "percentage": 98
    }
  ],
  "result_summary": {
    "marking_scheme": "percentage",
    "marks_obtained": 490,
    "max_marks": 500,
    "percentage": 98,
    "remarks": "1st Div"
  },
  "marksheet_url": "https://example.com/uploads/class10-marksheet.pdf"
}
```

| Field                   | Type                  | Required   |
| ----------------------- | --------------------- | ---------- |
| `academic_year`         | string                | ✅         |
| `admission_year`        | string                | ✅         |
| `year_of_passing`       | integer (1950–2100)   | ✅         |
| `board_name`            | string                | ✅         |
| `registration_number`   | string                | —          |
| `school_name`           | string                | ✅         |
| `school_code`           | string                | —          |
| `school_address`        | string                | —          |
| `school_state`          | string                | ✅         |
| `medium_of_instruction` | string                | ✅         |
| `subjects`              | `SubjectMarksEntry[]` | ✅ (min 1) |
| `result_summary`        | `ResultSummary`       | ✅         |
| `marksheet_url`         | string (URL)          | —          |

`SubjectMarksEntry`:
| Field | Type | Required |
|---|---|---|
| `subject_name` | string | ✅ |
| `evaluation_pattern` | string | ✅ (free text, e.g. `"Theory + Practical"`) |
| `theory_marks` / `practical_marks` / `internal_marks` | number | — |
| `max_marks` | number | ✅ |
| `obtained_marks` | number | ✅ |
| `attempts` | integer | — |
| `percentage` | number (0–100) | — |

`ResultSummary`:
| Field | Type | Required |
|---|---|---|
| `marking_scheme` | `"percentage" \| "gpa" \| "other"` | ✅ |
| `marks_obtained` / `max_marks` / `percentage` | number | — |
| `remarks` | string | — |

**Response:** shared Application shape (`currentStep` advances to ≥ 6).

---

### Screen 5 — 12th Grade Details

`PATCH /my-applications/:applicationId/academic-records/twelfth-grade`

Same shape as 10th Grade, **plus**:

```json
{
  "academic_year": "2024-25",
  "admission_year": "2024",
  "year_of_passing": 2025,
  "board_name": "CBSE",
  "registration_number": "REG54321",
  "school_name": "Delhi Public School",
  "school_code": "DPS001",
  "school_address": "Sector 45, Gurugram",
  "school_state": "Haryana",
  "medium_of_instruction": "English",
  "has_separate_class_xi_exam": true,
  "class_xi_status": "declared",
  "subjects": [
    /* same shape as 10th grade */
  ],
  "result_summary": {
    /* same shape as 10th grade */
  },
  "marksheet_url": "https://example.com/uploads/class12-marksheet.pdf",
  "migration_certificate_url": "https://example.com/uploads/migration-cert.pdf"
}
```

| Extra field                  | Type                         | Required                                                                     |
| ---------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `has_separate_class_xi_exam` | boolean                      | ✅ — "Does your Board conduct a separate Class XI / First Year Examination?" |
| `class_xi_status`            | `"declared" \| "undeclared"` | only meaningful when `has_separate_class_xi_exam` is `true`                  |
| `migration_certificate_url`  | string (URL)                 | —                                                                            |

**Response:** shared Application shape (`currentStep` advances to ≥ 6).

---

### Screen 6 — Undergraduate Details

`PATCH /my-applications/:applicationId/academic-records/undergraduate`

**Request body:**

```json
{
  "program_type": "regular",
  "degree_type": "Bachelor",
  "program_name": "B.Tech Computer Science",
  "specialization": "Artificial Intelligence",
  "university_name": "Anna University",
  "university_type": "State",
  "institution_name": "XYZ Engineering College",
  "institution_type": "Affiliated",
  "admission_year": "2021",
  "passing_year": "2025",
  "duration_years": 4,
  "register_number": "REG998877",
  "academic_cycle": "semester",
  "semester_records": [
    {
      "label": "Semester 1",
      "duration": "6 months",
      "gpa": 8.5,
      "cgpa_or_percentage": 8.5,
      "backlogs": 0
    }
  ],
  "final_summary": {
    "total_credits": 160,
    "cgpa": 8.7,
    "percentage": null,
    "rank": null,
    "total_backlogs": 0,
    "result_status": "Passed",
    "remarks": null
  },
  "documents": {
    "semester_mark_sheet_urls": [
      "https://example.com/uploads/sem1-marksheet.pdf"
    ],
    "degree_certificate_url": "https://example.com/uploads/degree-cert.pdf",
    "provisional_certificate_url": "https://example.com/uploads/provisional-cert.pdf",
    "consolidated_mark_sheet_url": "https://example.com/uploads/consolidated-marksheet.pdf"
  },
  "has_projects": true,
  "projects": [
    {
      "title": "Smart Attendance System",
      "project_type": "Academic Project",
      "duration": "3 months",
      "team_size": 4,
      "role": "Team Lead",
      "description": "Face-recognition based attendance system.",
      "key_outcomes": "Deployed in 2 campus labs.",
      "project_url": "https://github.com/example/smart-attendance"
    }
  ]
}
```

| Field                             | Type                      | Required                                                   |
| --------------------------------- | ------------------------- | ---------------------------------------------------------- |
| `program_type`                    | `"regular" \| "distance"` | ✅                                                         |
| `degree_type`                     | string                    | ✅ (e.g. "Bachelor")                                       |
| `program_name`                    | string                    | ✅                                                         |
| `specialization`                  | string                    | —                                                          |
| `university_name`                 | string                    | ✅                                                         |
| `university_type`                 | string                    | ✅ (e.g. "State")                                          |
| `institution_name`                | string                    | ✅                                                         |
| `institution_type`                | string                    | ✅ (e.g. "Affiliated")                                     |
| `admission_year` / `passing_year` | string                    | ✅                                                         |
| `duration_years`                  | integer (1–10)            | ✅                                                         |
| `register_number`                 | string                    | —                                                          |
| `academic_cycle`                  | `"semester" \| "yearly"`  | ✅                                                         |
| `semester_records`                | `SemesterRecord[]`        | — (default `[]`)                                           |
| `final_summary.result_status`     | string                    | ✅ (e.g. "Passed")                                         |
| `final_summary.*` (rest)          | number/string             | —                                                          |
| `documents.*`                     | URLs                      | — (all optional, `semester_mark_sheet_urls` defaults `[]`) |
| `has_projects`                    | boolean                   | ✅                                                         |
| `projects`                        | `ProjectEntry[]`          | — (should be `[]` if `has_projects` is `false`)            |

`SemesterRecord`: `{ label (✅), duration?, gpa?, cgpa_or_percentage?, backlogs? }`
`ProjectEntry`: `{ title (✅), project_type (✅), duration?, team_size?, role?, description?, key_outcomes?, project_url? }`

**Response:** shared Application shape (`currentStep` advances to ≥ 6).

---

### Legacy — `PATCH /my-applications/:applicationId/qualification-details`

Superseded by the 3 endpoints above. **Do not use for new implementation** — kept only for old
draft data. Calling it after using the new endpoints will wipe out
`tenth_grade`/`twelfth_grade`/`undergraduate` data (it's a full-column overwrite, not a merge).

---

## Screen 7 — Achievements & Extracurricular

`PATCH /my-applications/:applicationId/achievements-details`

Every field/section is **optional** — this whole screen is supplementary and never blocks
progressing to Declaration/Submit.

**Request body:**

```json
{
  "internships": [
    {
      "company_name": "Acme Corp",
      "role": "Software Engineering Intern",
      "start_date": "2024-05-01",
      "end_date": "2024-07-31",
      "key_responsibilities": "Built internal tooling for the QA team."
    }
  ],
  "has_work_experience": true,
  "work_experience": [
    {
      "company_name": "Beta Systems",
      "job_title": "UI/UX Designer",
      "industry": "Software",
      "employment_type": "Full-Time",
      "total_experience": "6 Months"
    }
  ],
  "languages": [{ "language": "English", "proficiency": "Native" }],
  "academic_awards": [
    {
      "title": "Dean's List",
      "year": 2024,
      "issuing_body": "University Name",
      "proof_url": "https://example.com/uploads/deans-list.pdf"
    }
  ],
  "sports_achievements": [
    {
      "sport_name": "Basketball",
      "competition_level": "College",
      "position_secured": "1st Place",
      "achievement_year": 2023,
      "certificate_url": "https://example.com/uploads/basketball-cert.pdf"
    }
  ],
  "arts_cultural_achievements": [
    {
      "category": "Music",
      "competition_name": "Inter-College Fest",
      "achievement_level": "State",
      "position_secured": "Runner Up",
      "certificate_url": "https://example.com/uploads/music-cert.pdf"
    }
  ],
  "hobbies": ["Photography", "Coding"],
  "other_interests": "Tell us more about what you enjoy doing in your free time...",
  "publications": [
    {
      "title": "A Study on AI",
      "journal_publisher": "IEEE",
      "url": "https://example.com/publications/a-study-on-ai"
    }
  ],
  "patents": [
    {
      "title": "New Solar Panel Tech",
      "patent_number": "US1234567",
      "status": "filed",
      "filing_date": "2024-01-15",
      "patent_office": "USPTO, EPO",
      "co_inventors": "Jane Doe, John Smith",
      "document_url": "https://example.com/uploads/patent-doc.pdf"
    }
  ],
  "professional_certifications": [
    {
      "name": "AWS Certified Developer",
      "issuing_authority": "Amazon Web Services",
      "certification_id": "CERT-123456",
      "issue_date": "2023-06-01",
      "expiry_date": "2026-06-01",
      "verification_url": "https://example.com/verify/cert-123456",
      "certificate_url": "https://example.com/uploads/aws-cert.pdf"
    }
  ],
  "portfolio_links": {
    "linkedin_url": "https://linkedin.com/in/example",
    "github_url": "https://github.com/example",
    "researchgate_url": null,
    "google_scholar_url": null,
    "orcid_id": "0000-0000-0000-0000",
    "personal_website_url": null,
    "behance_url": null,
    "dribbble_url": null,
    "kaggle_url": null
  },
  "recommendation_letters": [
    { "document_url": "https://example.com/uploads/recommendation-letter.pdf" }
  ],
  "innovation_entrepreneurship": [
    {
      "startup_name": "EcoTech Solutions",
      "role": "Founder, Lead Developer",
      "contribution": "Led product development and fundraising.",
      "incubation_support": "T-Hub, NSRCEL",
      "dpiit_registration_number": "DIPP12345"
    }
  ],
  "volunteering": [
    {
      "organization_name": "Red Cross",
      "role": "Community Volunteer",
      "start_date": "2023-01-01",
      "end_date": "2023-06-01",
      "description": "Organized blood donation drives."
    }
  ]
}
```

Every top-level key is a section; every array defaults to `[]` if omitted — send only the
sections the student filled in, or send the whole object with empty arrays for the rest.

| Section                                               | Array item fields                                                                                                                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `internships[]`                                       | `company_name` (✅), `role` (✅), `start_date`, `end_date`, `key_responsibilities`                                                                                     |
| `has_work_experience` (boolean) + `work_experience[]` | `company_name` (✅), `job_title`, `industry`, `employment_type`, `total_experience`                                                                                    |
| `languages[]`                                         | `language` (✅), `proficiency`                                                                                                                                         |
| `academic_awards[]`                                   | `title` (✅), `year`, `issuing_body`, `proof_url`                                                                                                                      |
| `sports_achievements[]`                               | `sport_name` (✅), `competition_level`, `position_secured`, `achievement_year`, `certificate_url`                                                                      |
| `arts_cultural_achievements[]`                        | `category` (✅), `competition_name`, `achievement_level`, `position_secured`, `certificate_url`                                                                        |
| `hobbies` (`string[]`) + `other_interests` (string)   | —                                                                                                                                                                      |
| `publications[]`                                      | `title` (✅), `journal_publisher`, `url`                                                                                                                               |
| `patents[]`                                           | `title` (✅), `patent_number`, `status` (✅ `"filed"\|"published"\|"granted"`), `filing_date`, `patent_office`, `co_inventors`, `document_url`                         |
| `professional_certifications[]`                       | `name` (✅), `issuing_authority` (✅), `certification_id`, `issue_date`, `expiry_date`, `verification_url`, `certificate_url`                                          |
| `portfolio_links` (single object)                     | `linkedin_url`, `github_url`, `researchgate_url`, `google_scholar_url`, `orcid_id`, `personal_website_url`, `behance_url`, `dribbble_url`, `kaggle_url` — all optional |
| `recommendation_letters[]`                            | `document_url` (✅)                                                                                                                                                    |
| `innovation_entrepreneurship[]`                       | `startup_name` (✅), `role`, `contribution`, `incubation_support`, `dpiit_registration_number`                                                                         |
| `volunteering[]`                                      | `organization_name` (✅), `role`, `start_date`, `end_date`, `description`                                                                                              |

**Response:** shared Application shape (`currentStep` advances to ≥ 7 — but again, this section
is optional and never gates progression).

---

## Screen 8 — Competitive Exam Records

`PATCH /my-applications/:applicationId/entrance-exam-details`

Unlike Screens 1–7, this section lives directly on the Application (not the reusable Student
profile) — it's application-specific and **mandatory** in the resume sequence.

**Request body:**

```json
{
  "has_attempted_entrance_exam": true,
  "exams": [
    {
      "exam_name": "JEE Main",
      "year_of_appearance": 2024,
      "roll_number": "24101234",
      "score_or_percentile": "96.5 percentile",
      "mark_card_url": "https://example.com/uploads/jee-marks-card.pdf"
    }
  ],
  "recommendation_letters": [
    { "document_url": "https://example.com/uploads/recommendation-letter.pdf" }
  ]
}
```

| Field                         | Type                   | Required    | Notes                                                                                      |
| ----------------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `has_attempted_entrance_exam` | boolean                | ✅          |                                                                                            |
| `exams`                       | `EntranceExamRecord[]` | conditional | **must have ≥ 1 entry** if `has_attempted_entrance_exam` is `true`; can be `[]` if `false` |
| `recommendation_letters`      | `{document_url}[]`     | —           | defaults `[]`                                                                              |

`EntranceExamRecord`: `{ exam_name (✅), year_of_appearance?, roll_number?, score_or_percentile?, mark_card_url? }`

**Response:** shared Application shape (`currentStep` advances to ≥ 8).

---

## Screen 9 — Identity & Category Proofs (Documents)

Three endpoints — this is a checklist, not a single-submit form. `currentStep` is **not**
advanced by these (documents aren't part of the linear resume sequence).

### `GET /my-applications/:applicationId/documents/required`

No request body. Returns the list of document types this application actually needs (resolved
from the college's configured requirements against the student's nationality/selected
courses/quota), cross-referenced with what's already uploaded.

**Response `data`:**

```json
[
  {
    "documentType": "aadhaar_card",
    "documentCategory": "identification",
    "documentLabel": "Aadhaar Card",
    "isRequired": true,
    "acceptedMimeTypes": ["image/jpeg", "image/png", "application/pdf"],
    "uploaded": {
      "id": "ADOC-1",
      "fileUrl": "https://example.com/uploads/aadhaar.pdf",
      "fileName": "aadhaar.pdf",
      "verificationStatus": "pending",
      "rejectionReason": null
    }
  },
  {
    "documentType": "pan_card",
    "documentCategory": "identification",
    "documentLabel": "PAN Card",
    "isRequired": true,
    "acceptedMimeTypes": ["image/jpeg", "image/png", "application/pdf"],
    "uploaded": null
  }
]
```

`uploaded: null` means not yet uploaded (shows the plain upload icon on screen); a populated
`uploaded` object means it's already there (shows view/delete icons).

### `GET /my-applications/:applicationId/documents`

No request body. Returns every document uploaded for this application so far.

**Response `data`:**

```json
[
  {
    "id": "ADOC-1",
    "applicationId": "APP-123",
    "documentType": "aadhaar_card",
    "documentCategory": "identification",
    "fileUrl": "https://example.com/uploads/aadhaar.pdf",
    "fileName": "aadhaar.pdf",
    "fileSizeBytes": 204800,
    "verificationStatus": "pending",
    "rejectionReason": null,
    "createdAt": "2026-08-10T09:00:00.000Z",
    "updatedAt": "2026-08-10T09:00:00.000Z"
  }
]
```

### `POST /my-applications/:applicationId/documents`

Upload the file to storage first (via the app's standard presign/upload flow), then register
its URL here.

**Request body:**

```json
{
  "document_type": "aadhaar_card",
  "file_url": "https://example.com/uploads/aadhaar.pdf",
  "file_name": "aadhaar.pdf",
  "file_size_bytes": 204800,
  "mime_type": "application/pdf"
}
```

| Field             | Type                                                     | Required | Notes                                                                |
| ----------------- | -------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `document_type`   | string                                                   | ✅       | must match one of the `documentType` values from the `required` list |
| `file_url`        | string                                                   | ✅       |                                                                      |
| `file_name`       | string                                                   | —        |                                                                      |
| `file_size_bytes` | integer                                                  | —        |                                                                      |
| `mime_type`       | one of the accepted image MIME types + `application/pdf` | ✅       | must be in that document's `acceptedMimeTypes`                       |

Uploading again for the same `document_type` **replaces** the previous upload (upsert, not
append).

**Response `data`:** same shape as one item from the "list uploaded" response above.

**Extra errors specific to this endpoint:**

- `404` — `document_type` isn't a valid/applicable requirement for this application
- `422` — `mime_type` not accepted for that document type

---

## Screen 10 — Declaration

`PATCH /my-applications/:applicationId/declaration`

This is the last step before Submit.

**Request body:**

```json
{
  "accepted": true,
  "signature_url": "https://example.com/uploads/signature.png",
  "place": "New York",
  "date": "2026-08-13"
}
```

| Field           | Type                       | Required | Notes                                                                                |
| --------------- | -------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `accepted`      | boolean                    | ✅       | must be `true` — `false` is rejected by validation, this isn't an "un-accept" toggle |
| `signature_url` | string (URL)               | ✅       | upload the signature image first, pass its URL                                       |
| `place`         | string                     | ✅       | max 100                                                                              |
| `date`          | date string (`YYYY-MM-DD`) | ✅       |                                                                                      |

Server stamps `accepted_at` itself — do not send it.

**Response:** shared Application shape (`currentStep` advances to ≥ 9).

---

## Final step — Submit

`POST /my-applications/:applicationId/submit`

No request body. Requires `currentStep` to have reached Declaration and every mandatory course
to be in a submittable state. On success: `formStatus` flips to `"submitted"`, the four
reusable-profile sections (personal/family/address/qualification/achievements) are frozen onto
the Application row as a permanent snapshot, and the application can no longer be edited.

**Response:** shared Application shape, with `formStatus: "submitted"` and `submittedAt` set.
