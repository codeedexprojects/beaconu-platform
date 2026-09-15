# Explore Colleges Filter — Mobile Integration Guide

Handoff doc for the mobile team. It covers the step-by-step "find a college" filter (Stream → Discipline → Study Level → Program Type → Course → State → District → results): every endpoint, its request and response, and how to wire the screens.

All endpoints are public (`/api/v1/public/*`) and need no auth. The one exception is the results list, which accepts an optional student token (see §2.6).

---

## ⚠️ Read this first

**1. IDs are strings like `STR-14`, `DSC-5`, `CRM-27`, not UUIDs.** Treat them as opaque strings. Don't validate them or parse them.

**2. The course step returns either `courseMasterId` or a bare name.** Each course option has `courseMasterId: string | null`. When the results call runs:

- if `courseMasterId` is set → send `courseMasterId`
- if it is `null` → send `courseName` with the option's `name`

Never send both. If you do, `courseName` is ignored. Sending `courseName` for an option that has a `courseMasterId` returns **zero colleges**, because name matching only covers courses not linked to the catalogue.

**3. Response envelopes are not consistent.** Streams return the list in `data` with pagination in `meta`. Disciplines, study levels and program types return `data: { data: [...], meta }`, one level deeper. See each endpoint below.

**4. The study level and program type lists are not narrowed by earlier steps.** They return every active level/type, so a user can pick a combination that no college offers. The course step (§2.5) _is_ narrowed by all earlier choices, so it's where that shows up: an empty list there means "no courses match". Show a proper empty state with a way back, not a blank screen.

**5. Every filter step is optional.** Every parameter can be left out. An empty string counts as not sent. You can offer "Skip" on any step.

---

## 1. Flow at a glance

| #   | Screen                             | Endpoint                                        | Sends                                                       |
| --- | ---------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| 1   | Academic Discipline (stream)       | `GET /public/universities/streams`              | —                                                           |
| 2   | Choose your Expertise (discipline) | `GET /public/universities/disciplines`          | `stream_id`                                                 |
| 3   | Study Level                        | `GET /public/universities/study-levels`         | —                                                           |
| 4   | Program Type                       | `GET /public/universities/program-types`        | —                                                           |
| 5   | Course                             | `GET /public/colleges/courses/filter-options`   | `streamId`, `disciplineId`, `studyLevelId`, `programTypeId` |
| 6   | State (optional)                   | `GET /public/colleges/locations/filter-options` | all of the above + `courseMasterId` or `courseName`         |
| 7   | District (optional)                | `GET /public/colleges/locations/filter-options` | same as 6 + `state`                                         |
| —   | Results                            | `GET /public/colleges`                          | all of the above + `state`, `district`                      |

Heads-up on casing: the taxonomy endpoints (1–4) take **snake_case** query params (`stream_id`). The college endpoints (5–7, results) take **camelCase** (`streamId`).

Standard envelope on every response:

```json
{ "success": true, "message": "...", "data": ..., "meta": ..., "timestamp": "2026-09-14T09:31:51.360Z" }
```

---

## 2. Endpoints

### 2.1 Streams

`GET /api/v1/public/universities/streams`

| Query    | Type      | Default | Notes                                       |
| -------- | --------- | ------- | ------------------------------------------- |
| `search` | string    | —       | name contains                               |
| `page`   | int ≥ 1   | 1       |                                             |
| `limit`  | int 1–100 | 10      | send `100` to get the full list in one call |

Response (list in `data`, pagination in `meta`):

```json
{
  "success": true,
  "message": "Streams fetched",
  "data": [
    {
      "id": "STR-14",
      "name": "Engineering & Technology",
      "slug": "engineering_technology",
      "logoUrl": "https://…/stream-icons/….png",
      "course_count": 10
    }
  ],
  "meta": { "total": 8, "page": 1, "limit": 100, "hasNext": false },
  "timestamp": "…"
}
```

- Only active streams are returned.
- `logoUrl` can be `null`, so keep a default icon.
- `course_count` counts active courses in the stream, including courses at colleges not listed publicly. Treat it as a rough size, not the number of results.

### 2.2 Disciplines

`GET /api/v1/public/universities/disciplines`

| Query       | Type      | Default | Notes                       |
| ----------- | --------- | ------- | --------------------------- |
| `stream_id` | string    | —       | the stream picked in step 1 |
| `search`    | string    | —       | name contains               |
| `page`      | int ≥ 1   | 1       |                             |
| `limit`     | int 1–100 | 10      |                             |

Response (**nested** `data.data`):

```json
{
  "success": true,
  "message": "Disciplines fetched",
  "data": {
    "data": [
      {
        "id": "DSC-14",
        "streamId": "STR-15",
        "name": "Dental Surgery (BDS)",
        "slug": "bds",
        "logoUrl": null,
        "sortOrder": 0,
        "isActive": true,
        "createdAt": "2026-07-23T11:49:51.124Z",
        "stream": {
          "id": "STR-15",
          "name": "Medical & Health Sciences",
          "slug": "medical_health"
        }
      }
    ],
    "meta": { "total": 8, "page": 1, "limit": 10, "totalPages": 1 }
  },
  "timestamp": "…"
}
```

- Only active disciplines are returned, ordered by `sortOrder`, then `name`.
- A discipline can appear even if no college offers it yet. Step 5 then comes back empty.

### 2.3 Study levels

`GET /api/v1/public/universities/study-levels`

Query: `search`, `page`, `limit` (same as above).

Response (**nested** `data.data`):

```json
{
  "success": true,
  "message": "Study levels fetched",
  "data": {
    "data": [
      {
        "id": "SVL-6",
        "name": "Undergraduate",
        "slug": "ug",
        "logoUrl": null,
        "sortOrder": 1,
        "isActive": true,
        "createdAt": "…"
      },
      {
        "id": "SVL-5",
        "name": "Postgraduate",
        "slug": "postgraduate",
        "logoUrl": null,
        "sortOrder": 2,
        "isActive": true,
        "createdAt": "…"
      }
    ],
    "meta": { "total": 7, "page": 1, "limit": 10, "totalPages": 1 }
  },
  "timestamp": "…"
}
```

### 2.4 Program types

`GET /api/v1/public/universities/program-types`

Query: `search`, `page`, `limit`.

Response: the same shape as study levels.

```json
{
  "success": true,
  "message": "Program types fetched",
  "data": {
    "data": [
      {
        "id": "PGT-1",
        "name": "Standard or Regular",
        "slug": "standard-or-regular",
        "logoUrl": null,
        "sortOrder": 0,
        "isActive": true,
        "createdAt": "…"
      },
      {
        "id": "PGT-2",
        "name": "Hons",
        "slug": "hons",
        "logoUrl": null,
        "sortOrder": 0,
        "isActive": true,
        "createdAt": "…"
      }
    ],
    "meta": { "total": 8, "page": 1, "limit": 10, "totalPages": 1 }
  },
  "timestamp": "…"
}
```

### 2.5 Course options

`GET /api/v1/public/colleges/courses/filter-options`

| Query                       | Type         | Notes                                                              |
| --------------------------- | ------------ | ------------------------------------------------------------------ |
| `streamId`                  | string       | ignored when `disciplineId` is sent                                |
| `disciplineId`              | string       |                                                                    |
| `studyLevelId`              | string       |                                                                    |
| `programTypeId`             | string       |                                                                    |
| `search`                    | string ≤ 100 | course name or catalogue name contains (case-insensitive)          |
| `universityId`              | string       | send if active on the results screen                               |
| `state`, `district`, `city` | string       | case-insensitive exact match; send if active on the results screen |

Example: `GET /api/v1/public/colleges/courses/filter-options?disciplineId=DSC-21&studyLevelId=SVL-5`

Response (list in `data`, **no pagination**):

```json
{
  "success": true,
  "message": "Course options fetched successfully",
  "data": [
    {
      "courseMasterId": "CRM-27",
      "name": "MBA (Master of Business Administration)",
      "collegeCount": 3,
      "logoUrl": null
    },
    {
      "courseMasterId": null,
      "name": "Executive MBA",
      "collegeCount": 1,
      "logoUrl": "https://…/discipline-icons/….png"
    }
  ],
  "timestamp": "…"
}
```

- Sorted by `collegeCount` (highest first), then `name`.
- Built from real courses at active, publicly listed colleges. Every option leads to exactly `collegeCount` colleges when you pass it to the results call with the same filters.
- Courses linked to a platform catalogue entry are merged under the catalogue name. For example, "Master of Business Administration" at one college and "MBA Digital Transformation" at another both show as one "MBA" option.
- `logoUrl` is the discipline icon, falling back to the stream icon. It can be `null`.
- `data: []` means nothing matches the earlier choices.

### 2.6 Results — colleges

`GET /api/v1/public/colleges`

| Query                       | Type                                                     | Notes                                                 |
| --------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| `streamId`                  | string                                                   | ignored when `disciplineId` is sent                   |
| `disciplineId`              | string                                                   |                                                       |
| `studyLevelId`              | string                                                   |                                                       |
| `programTypeId`             | string                                                   |                                                       |
| `courseMasterId`            | string                                                   | from a course option whose `courseMasterId` is set    |
| `courseName`                | string ≤ 255                                             | from a course option whose `courseMasterId` is `null` |
| `universityId`              | string                                                   |                                                       |
| `state`, `district`, `city` | string                                                   | case-insensitive exact match                          |
| `sortBy`                    | `popularity` \| `fees_high_to_low` \| `fees_low_to_high` | default: name A→Z                                     |

Headers: `Authorization: Bearer <student token>` is **optional**. With a valid token, `isWishlisted` reflects that student. Without one, or with an invalid or expired token, it is always `false` and the call still succeeds, with no 401.

All course filters must match **the same course** at a college. A college with a BBA course and a separate postgraduate course does not match "BBA + Postgraduate".

Example: `GET /api/v1/public/colleges?disciplineId=DSC-21&studyLevelId=SVL-5&courseMasterId=CRM-27&sortBy=popularity`

Response (list in `data`, **no pagination**, every match is returned):

```json
{
  "success": true,
  "message": "Colleges fetched successfully",
  "data": [
    {
      "id": "CLG-9",
      "universityId": "UNV-6",
      "name": "Vydehi Institute of Medical Science & Research Centre",
      "slug": "vydehi-institute",
      "code": "VIMSR",
      "domain": null,
      "logoUrl": null,
      "coverImageUrl": null,
      "state": "Karnataka",
      "city": "Bangalore",
      "district": "Bangalore Urban",
      "address": "82, EPIP Area, Whitefield, Bengaluru, Karnataka 560066",
      "pinCode": "560066",
      "status": "active",
      "createdAt": "2026-07-23T11:49:56.109Z",
      "updatedAt": "2026-08-19T04:47:43.697Z",
      "university": {
        "id": "UNV-6",
        "name": "Vydehi Deemed University",
        "logoUrl": null,
        "universityType": {
          "id": "UVT-5",
          "name": "Deemed University",
          "slug": "deemed_university"
        }
      },
      "campuses": [
        {
          "id": "CMP-7",
          "collegeId": "CLG-9",
          "name": "Main Campus – Bangalore",
          "address": "82, EPIP Area, Whitefield, Bengaluru, Karnataka 560066",
          "city": "Bangalore",
          "state": "Karnataka",
          "pinCode": "560066",
          "latitude": "12.9453",
          "longitude": "77.7207",
          "isMainCampus": true,
          "status": "active",
          "createdAt": "…",
          "updatedAt": "…"
        }
      ],
      "isWishlisted": false
    }
  ],
  "timestamp": "…"
}
```

- `latitude` and `longitude` are **strings** (decimal). Parse them before using them on a map.
- `campuses` are active only, main campus first.
- Fee sorts use each college's lowest active fee. Colleges without fees go last.

### 2.7 Location options (state, district)

`GET /api/v1/public/colleges/locations/filter-options`

| Query                                                       | Type   | Notes                                                                       |
| ----------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `state`                                                     | string | when sent, the response lists **districts** in that state instead of states |
| `streamId`, `disciplineId`, `studyLevelId`, `programTypeId` | string | same as the results call                                                    |
| `courseMasterId` / `courseName`                             | string | same rule as the results call: one or the other                             |
| `universityId`                                              | string |                                                                             |

Example: `GET /api/v1/public/colleges/locations/filter-options?disciplineId=DSC-21&courseMasterId=CRM-27`

Response without `state`:

```json
{
  "success": true,
  "message": "Location options fetched successfully",
  "data": [
    { "state": "Kerala", "collegeCount": 4 },
    { "state": "Karnataka", "collegeCount": 2 }
  ],
  "timestamp": "…"
}
```

Response with `state=Kerala`:

```json
{
  "success": true,
  "message": "Location options fetched successfully",
  "data": [
    { "district": "Aluva", "collegeCount": 1 },
    { "district": "Malappuram", "collegeCount": 1 }
  ],
  "timestamp": "…"
}
```

- Sorted by `collegeCount` (highest first), then name. Not paginated.
- Only states that have at least one matching college are listed, so the user can't pick a dead end. `GET /public/india-states` lists all 36 states; don't use it for this step.
- Pass the option's `state` (and `district`) unchanged to the results call. It returns exactly `collegeCount` colleges.
- Some colleges have no district, so district counts can add up to less than the state's count. Offer "All of Kerala" as the first district choice.
- District names are whatever colleges entered, so casing can vary (e.g. `palakkad`). Display them as returned.

### Errors

A malformed query, such as `limit=500` or an unknown `sortBy`, returns `400`:

```json
{ "success": false, "message": "…", "error": { "code": "VALIDATION_ERROR", "details": [ … ] }, "timestamp": "…" }
```

Unknown IDs do **not** error. They just return an empty list.

---

## 3. Frontend implementation plan

### 3.1 Filter state

Keep one immutable filter object for the whole flow and pass it screen to screen, or hold it in the explore feature's state:

```dart
class CollegeFilter {
  final Ref? stream;        // Ref = { id, name }
  final Ref? discipline;
  final Ref? studyLevel;
  final Ref? programType;
  final CourseOption? course; // { courseMasterId?, name }
  final String? universityId, state, district, city;
  final String? sortBy;
}
```

Keep the display names alongside the IDs so the results screen can render filter chips without refetching.

**Clear downstream choices when an upstream one changes.** Changing the stream clears the discipline and course. Changing the discipline, study level or program type clears the course. Changing the state clears the district. A stale course option can silently return zero results.

State and district are not cleared when a course filter changes. The results screen may then show zero colleges; its empty state should offer to remove the state chip.

### 3.2 Query builders

Build the params in one place so every screen sends identical values:

```dart
Map<String, String> taxonomyParams(CollegeFilter f) => {
  if (f.discipline != null) 'disciplineId': f.discipline!.id
  else if (f.stream != null) 'streamId': f.stream!.id,
  if (f.studyLevel != null) 'studyLevelId': f.studyLevel!.id,
  if (f.programType != null) 'programTypeId': f.programType!.id,
  if (f.universityId != null) 'universityId': f.universityId!,
};

Map<String, String> courseParams(CollegeFilter f) => {
  if (f.course?.courseMasterId != null) 'courseMasterId': f.course!.courseMasterId!
  else if (f.course != null) 'courseName': f.course!.name,
};

Map<String, String> locationParams(CollegeFilter f) => {
  if (f.state != null) 'state': f.state!,
  if (f.district != null) 'district': f.district!,
  if (f.city != null) 'city': f.city!,
};

// Step 5
Map<String, String> courseOptionParams(CollegeFilter f) =>
    {...taxonomyParams(f), ...locationParams(f)};

// Steps 6 and 7 (pass the chosen state to load districts)
Map<String, String> locationOptionParams(CollegeFilter f, {String? state}) =>
    {...taxonomyParams(f), ...courseParams(f), if (state != null) 'state': state};

// Results
Map<String, String> collegeListParams(CollegeFilter f) => {
  ...taxonomyParams(f),
  ...courseParams(f),
  ...locationParams(f),
  if (f.sortBy != null) 'sortBy': f.sortBy!,
};
```

Every options call sends the same filters as the results call, apart from the step it's choosing. That's what guarantees an option's `collegeCount` matches the results.

### 3.3 Screens

| Screen         | Load                                                          | Behaviour                                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Stream       | `streams?limit=100`                                           | Grid of icon + name. Cache for the session.                                                                                                                                                             |
| 2 Discipline   | `disciplines?stream_id=…&limit=100`                           | Read `data.data`. Show a "Skip" option that keeps only the stream.                                                                                                                                      |
| 3 Study Level  | `study-levels?limit=100`                                      | Read `data.data`. Cache for the session. Skippable.                                                                                                                                                     |
| 4 Program Type | `program-types?limit=100`                                     | Read `data.data`. Cache for the session. Skippable.                                                                                                                                                     |
| 5 Course       | `courses/filter-options` + `courseOptionParams`               | Search box with a ~300 ms debounce that re-calls with `search`. Show `collegeCount` as "N colleges". Empty list → "No courses match — change study level / program type" with a back action. Skippable. |
| 6 State        | `locations/filter-options` + `locationOptionParams`           | List of states with "N colleges". Skippable ("All India").                                                                                                                                              |
| 7 District     | `locations/filter-options` + `locationOptionParams(state: …)` | Only after a state is picked. First choice "All of <state>". Skippable.                                                                                                                                 |
| Results        | `colleges` + `collegeListParams`                              | Removable chips for each applied filter. Removing a chip clears its downstream choices (§3.1) and refetches. Sort sheet sets `sortBy`.                                                                  |

### 3.4 Models

- `CourseOption.courseMasterId` is nullable. Model it as `String?`, not `String`.
- `Campus.latitude` and `Campus.longitude` are `String?`, so parse them with `double.tryParse`.
- Every `logoUrl` is nullable. Use one shared placeholder icon.
- Parse the taxonomy lists through a small helper that unwraps `data.data`. Parse streams and colleges from `data` directly.

### 3.5 Loading, empty and error states

- Use skeleton lists while loading. Retry inline when a load fails, not with a toast.
- An empty course or results list is a valid answer, so show an empty state with "Change filters".
- Send the student token on the results call when logged in, so wishlist hearts render correctly. Send it only there.

### 3.6 Edge cases to test

1. Pick an option with `courseMasterId` → results count equals `collegeCount`.
2. Pick an option with `courseMasterId: null` → results are fetched by `courseName` and the count matches too.
3. Skip every step → the results screen lists all colleges.
4. Change the study level after picking a course → the course is cleared and results don't collapse to zero.
5. Pick Undergraduate + an MBA discipline → the course step shows the empty state.
6. Log out, then open results → `isWishlisted` is false and there is no error.
7. Pick a state → results count equals that state's `collegeCount`; pick a district → count equals the district's `collegeCount`.
8. Change the state after picking a district → the district is cleared.

---

## 4. Current data state (backend)

- Course options only get a `courseMasterId` after backend links college courses to the catalogue. Until that data fix runs, every option has `courseMasterId: null` and the `courseName` path is what gets used. The app code above handles both, so there's no change needed on your side when linking goes live.
- Some junk streams (e.g. "BSC CS", "Software") and a duplicate "UnderGraduate" study level still show in local/staging lists. They are removed by the same data fix, so don't hard-code IDs or filter them out client-side.
- The Bruno collection has the live contracts: `packages/api-contracts/public/colleges/list-colleges.bru`, `list-course-filter-options.bru` and `list-location-filter-options.bru`.
- Colleges with a missing or misspelled state don't appear in the state step until they're corrected in college settings. The college forms now only accept states from the official list.
