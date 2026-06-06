# Events Frontend Integration Plan

## 1. Student App APIs

Base path: /api/v1/student/events

1. Upcoming list: GET /upcoming

- Required cards fields available:
  - total_seats
  - registered_count
  - cover_image_url
  - category
  - title
  - speaker_name
  - speaker_title
  - organizer
  - event_date
  - start_time
  - end_time
  - duration
  - event_mode
  - venue
  - is_free

2. Event detail:

- GET /:id (published/completed only)
- GET /slug/:slug (published/completed only)

3. Register/Cancel:

- POST /:id/register
- PATCH /:id/cancel

4. My registered events:

- GET /registrations

5. My joined recordings:

- GET /recordings

## 2. Admin APIs

Base path: /api/v1/admin/events

1. CRUD + lifecycle

- GET /
- POST /
- GET /:id
- PATCH /:id
- PATCH /:id/status
- DELETE /:id (soft delete via archived status)

2. Recordings

- PATCH /:id/recording
- Rule: recording upload allowed only when event status is completed.

3. Registrations insight

- GET /:id/registrations
- Returns:
  - data.registrations[]
  - data.summary.joined_count
  - data.summary.left_count

## 3. Suggested UI Flow

1. Student Home > Upcoming Events

- Call /upcoming with optional filters: category, event_mode, is_free.

2. Event Detail screen

- Call /:id or /slug/:slug.
- Show Register button only for published events.

3. Registration states

- After register/cancel, re-fetch event detail and registrations list.

4. My Events tab

- Registered tab -> /registrations?status=registered
- Left tab -> /registrations?status=cancelled

5. My Recordings tab

- /recordings and render recording_url CTA.

## 4. Token Handling

- Use studentAccessToken consistently in student contracts.
- Refresh token flow should refresh and reset studentAccessToken.

## 5. Non-Breaking Notes

- Existing payload keys remain snake_case.
- Admin event list/detail behavior remains backward compatible.
- New admin registrations summary is additive, not breaking.
