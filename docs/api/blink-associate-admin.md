# Blink Associate Admin — API Reference

**Base URL:** `/api/v1/blink`

**Auth header (all authenticated routes):**

```
Authorization: Bearer <accessToken>
```

**Standard response envelope:**

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

---

## Auth (`/blink/auth/*`)

### POST `/blink/auth/register`

Register a new Associate Admin account. Requires platform approval before login.

**Request body**

```json
{
  "full_name": "John Doe",
  "email": "john@agency.com",
  "phone_number": "+919876543210",
  "country": "India",
  "agency_name": "Bright Futures Agency",
  "agency_reg_number": "REG-8214",
  "password": "Password@123",
  "confirm_password": "Password@123",
  "companyPan": "ABCDE1234F",
  "currentAccNo": "123456789012",
  "ifsc": "SBIN0001234",
  "gstin": "22ABCDE1234F1Z5"
}
```

**Response — 201**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "BLU-1",
      "email": "john@agency.com",
      "fullName": "John Doe",
      "status": "pending_approval",
      "roleSlug": "associate_admin"
    },
    "message": "Registration submitted. Pending platform approval."
  }
}
```

---

### POST `/blink/auth/login`

Authenticate any Blink user. `blink_role` validates the account type at login time.

**Request body**

```json
{
  "email": "john@agency.com",
  "password": "Password@123",
  "blink_role": "associate_admin",
  "agency_reg_number": "REG-8214",
  "fcm_token": "firebase-cloud-messaging-token"
}
```

| Field               | Required                  | Notes                                                                                                                          |
| ------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `email`             | Yes                       |                                                                                                                                |
| `password`          | Yes                       |                                                                                                                                |
| `blink_role`        | No                        | `associate_admin` \| `associate_employee` \| `campus_ambassador`. If sent, must match account's actual role (403 on mismatch). |
| `agency_reg_number` | Yes for `associate_admin` |                                                                                                                                |
| `fcm_token`         | No                        | Stored in session for push notifications. Clears duplicate tokens on other sessions.                                           |

**Response — 200**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "BLU-1",
      "email": "john@agency.com",
      "fullName": "John Doe",
      "userType": "blink_associate",
      "roleSlug": "associate_admin"
    },
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<token>"
    }
  }
}
```

**Error cases**
| Status | Reason |
|---|---|
| 401 | Invalid credentials or wrong `agency_reg_number` |
| 403 | `blink_role` mismatch — "This account is registered as an associate employee. Please use the correct login." |
| 403 | Account not active — pending_approval / rejected / suspended / inactive (role-specific message) |

---

### POST `/blink/auth/refresh-token`

Rotate the access token using the refresh token cookie.

**Request** — no body (reads `refreshToken` cookie automatically)

**Response — 200**

```json
{
  "success": true,
  "data": {
    "accessToken": "<new-jwt>"
  }
}
```

---

### POST `/blink/auth/logout`

Invalidate the current session.

**Request** — no body

**Response — 200**

```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

### POST `/blink/auth/forgot-password`

Send a 4-digit OTP to the registered email.

**Request body**

```json
{ "email": "john@agency.com" }
```

**Response — 200**

```json
{
  "success": true,
  "data": { "message": "OTP sent to your email" }
}
```

---

### POST `/blink/auth/verify-reset-otp`

Verify the OTP and receive a short-lived `reset_token`.

**Request body**

```json
{
  "email": "john@agency.com",
  "otp": "4821"
}
```

**Response — 200**

```json
{
  "success": true,
  "data": {
    "reset_token": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### POST `/blink/auth/reset-password`

Set a new password using the `reset_token` from the previous step.

**Request body**

```json
{
  "reset_token": "550e8400-e29b-41d4-a716-446655440000",
  "new_password": "NewPassword@456"
}
```

**Response — 200**

```json
{
  "success": true,
  "data": { "message": "Password reset successful" }
}
```

---

## Profile

### GET `/blink/associate/profile`

Fetch the authenticated Associate Admin's own profile.

**Auth:** `blink_associate` JWT required.

**Response — 200**

```json
{
  "success": true,
  "data": {
    "id": "BLU-1",
    "email": "john@agency.com",
    "fullName": "John Doe",
    "phoneNumber": "+919876543210",
    "agencyName": "Bright Futures Agency",
    "collegeId": null,
    "roleSlug": "associate_admin",
    "status": "active"
  }
}
```

---

## Employees

### GET `/blink/associate/employees`

List all employees under this admin with performance-based rankings.

**Auth:** `blink_associate` JWT required.

**Response — 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "BLU-5",
      "fullName": "Alice Smith",
      "email": "alice@agency.com",
      "phoneNumber": "+919000000001",
      "status": "active",
      "roleSlug": "associate_employee",
      "confirmedReferrals": 12,
      "rank": 1,
      "createdAt": "2025-01-10T09:00:00.000Z"
    }
  ]
}
```

---

### POST `/blink/associate/employees` → `/blink/associate/employees/register`

Register a new employee under this admin.

> **Note:** The actual path is `POST /blink/associate/employees/register` (no auth required — public onboarding link flow).

**Request body**

```json
{
  "full_name": "Alice Smith",
  "email": "alice@agency.com",
  "phone_number": "+919000000001",
  "associate_parent_id": "BLU-1",
  "password": "Password@123",
  "confirm_password": "Password@123"
}
```

**Response — 201**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "BLU-5",
      "email": "alice@agency.com",
      "fullName": "Alice Smith",
      "status": "active",
      "roleSlug": "associate_employee"
    },
    "message": "Registration submitted. Your account is pending approval by your admin."
  }
}
```

**Error cases**
| Status | Reason |
|---|---|
| 409 | Email already exists |
| 404 | `associate_parent_id` not found |
| 403 | `associate_parent_id` is not an associate admin account |

---

### GET `/blink/associate/employees/pending`

List employees whose status is `pending_approval`.

**Auth:** `blink_associate` JWT required.

**Response — 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "BLU-6",
      "fullName": "Bob Raj",
      "email": "bob@agency.com",
      "phoneNumber": null,
      "status": "pending_approval",
      "roleSlug": "associate_employee",
      "createdAt": "2025-06-15T11:00:00.000Z"
    }
  ]
}
```

---

### GET `/blink/associate/employees/:employeeId/performance`

Per-employee referral stats and commission breakdown.

**Auth:** `blink_associate` JWT required.

**Response — 200**

```json
{
  "success": true,
  "data": {
    "id": "BLU-5",
    "fullName": "Alice Smith",
    "email": "alice@agency.com",
    "status": "active",
    "roleSlug": "associate_employee",
    "referrals": {
      "total": 20,
      "byStatus": {
        "registered": 5,
        "confirmed": 12,
        "rejected": 2,
        "dropped_out": 1
      },
      "conversionRate": 0.6
    },
    "commission": {
      "earned": 48000.0,
      "pending": 12000.0
    }
  }
}
```

**Error cases**
| Status | Reason |
|---|---|
| 404 | Employee not found |
| 403 | Employee does not belong to this admin |

---

### PATCH `/blink/associate/employees/:employeeId/status`

Approve, reject, or suspend an employee.

**Auth:** `blink_associate` JWT required.

**Request body**

```json
{ "status": "active" }
```

`status` enum: `active` | `inactive` | `suspended` | `rejected`

**Response — 200**

```json
{
  "success": true,
  "data": {
    "id": "BLU-5",
    "fullName": "Alice Smith",
    "email": "alice@agency.com",
    "status": "active",
    "roleSlug": "associate_employee"
  }
}
```

**Error cases**
| Status | Reason |
|---|---|
| 404 | Employee not found |
| 403 | Target user is not an associate employee, or belongs to a different admin |

---

## Referrals

### GET `/blink/associate/referrals`

All referrals made by this admin's team, with optional status filter.

**Auth:** `blink_associate` JWT required.

**Query params**
| Param | Type | Default | Notes |
|---|---|---|---|
| `status` | string | — | `registered` \| `rejected` \| `confirmed` \| `dropped_out` |
| `page` | number | `1` | |
| `limit` | number | `20` | max 100 |

**Response — 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "RFL-1",
      "status": "confirmed",
      "student": {
        "id": "STU-12",
        "fullName": "Priya Sharma",
        "email": "priya@example.com",
        "phoneNumber": "+919876500001"
      },
      "referredBy": {
        "id": "BLU-5",
        "fullName": "Alice Smith",
        "roleSlug": "associate_employee"
      },
      "college": {
        "id": "COL-3",
        "name": "Sunrise Engineering College"
      },
      "course": {
        "id": "CRS-7",
        "name": "B.Tech Computer Science"
      },
      "commission": {
        "id": "CMN-4",
        "netPayout": 15000.0,
        "status": "credited"
      },
      "createdAt": "2025-05-20T08:30:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "hasNext": true
  }
}
```

---

### GET `/blink/associate/referrals/:referralId/student`

Full student profile for a specific referral.

**Auth:** `blink_associate` JWT required.

**Response — 200**

```json
{
  "success": true,
  "data": {
    "id": "STU-12",
    "fullName": "Priya Sharma",
    "email": "priya@example.com",
    "phoneNumber": "+919876500001",
    "avatarUrl": null,
    "status": "active",
    "createdAt": "2025-05-20T08:30:00.000Z",
    "referral": {
      "id": "RFL-1",
      "status": "confirmed",
      "commission": {
        "id": "CMN-4",
        "netPayout": 15000.0,
        "status": "credited"
      },
      "createdAt": "2025-05-20T08:30:00.000Z"
    }
  }
}
```

**Error cases**
| Status | Reason |
|---|---|
| 404 | Referral not found or not owned by this admin's team |

---

## Wallet

### GET `/blink/associate/wallet`

Current wallet balance, earnings summary, and saved bank details.

**Auth:** `blink_associate` JWT required.

**Response — 200**

```json
{
  "success": true,
  "data": {
    "id": "WLT-3",
    "balance": 25000.0,
    "totalEarned": 75000.0,
    "totalWithdrawn": 50000.0,
    "bankDetails": {
      "accountHolderName": "John Doe",
      "accountNumber": "123456789012",
      "ifsc": "SBIN0001234",
      "bankName": "State Bank of India"
    },
    "updatedAt": "2025-06-14T10:00:00.000Z"
  }
}
```

> If no commissions have been earned yet, `id` is `null` and all amounts are `0`.

---

### GET `/blink/associate/wallet/transactions`

Paginated transaction history (credits and debits).

**Auth:** `blink_associate` JWT required.

**Query params**
| Param | Type | Default |
|---|---|---|
| `page` | number | `1` |
| `limit` | number | `20` (max 100) |

**Response — 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "TXN-9",
      "type": "credit",
      "amount": 15000.0,
      "description": "Commission for referral RFL-1",
      "withdrawalStatus": null,
      "balanceAfter": 40000.0,
      "createdAt": "2025-06-01T12:00:00.000Z"
    },
    {
      "id": "TXN-10",
      "type": "debit",
      "amount": 15000.0,
      "description": "Withdrawal request",
      "withdrawalStatus": "pending",
      "balanceAfter": 25000.0,
      "createdAt": "2025-06-14T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "hasNext": false
  }
}
```

`type`: `credit` | `debit`
`withdrawalStatus`: `null` (credits) | `pending` | `approved` | `rejected`

---

### PUT `/blink/associate/wallet/bank-details`

Save or update the payout bank account.

**Auth:** `blink_associate` JWT required.

**Request body**

```json
{
  "accountHolderName": "John Doe",
  "accountNumber": "123456789012",
  "ifsc": "SBIN0001234",
  "bankName": "State Bank of India"
}
```

**Validation**

- `accountNumber` — 9 to 18 digits
- `ifsc` — format `SBIN0001234` (4 alpha + `0` + 6 alphanumeric)

**Response — 200**

```json
{
  "success": true,
  "data": {
    "accountHolderName": "John Doe",
    "accountNumber": "123456789012",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank of India"
  }
}
```

**Error cases**
| Status | Reason |
|---|---|
| 404 | No wallet exists yet (no commissions earned) |

---

### POST `/blink/associate/wallet/withdraw`

Request a withdrawal from available balance. Creates a debit transaction with `withdrawalStatus: pending`.

**Auth:** `blink_associate` JWT required.

**Request body**

```json
{
  "amount": 10000,
  "description": "Monthly payout"
}
```

| Field         | Required | Notes                                              |
| ------------- | -------- | -------------------------------------------------- |
| `amount`      | Yes      | Positive number, must not exceed available balance |
| `description` | No       | Max 255 chars                                      |

**Response — 201**

```json
{
  "success": true,
  "data": {
    "transactionId": "TXN-10",
    "amount": 10000.0,
    "withdrawalStatus": "pending",
    "balanceAfter": 15000.0
  }
}
```

**Error cases**
| Status | Reason |
|---|---|
| 422 | No wallet found |
| 422 | Insufficient balance — "Available: ₹25000.00" |

---

## Service Charges (Commission Configs)

### GET `/blink/associate/service-charges`

List all commission configurations, with optional filters.

**Auth:** `blink_associate` JWT required.

**Query params**
| Param | Type | Notes |
|---|---|---|
| `collegeId` | string | Filter by college |
| `courseId` | string | Filter by course |
| `academicYear` | string | e.g. `"2025-26"` |
| `isActive` | boolean | `true` / `false` |

**Response — 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "SC-1",
      "college": { "id": "COL-3", "name": "Sunrise Engineering College" },
      "course": { "id": "CRS-7", "name": "B.Tech Computer Science" },
      "academicYear": "2025-26",
      "studentCategory": "general",
      "grossAmount": 50000.0,
      "gstPercentage": 18.0,
      "gstAmount": 9000.0,
      "netPayout": 41000.0,
      "termsAndConditions": "Commission paid within 30 days of enrollment.",
      "isActive": true,
      "updatedAt": "2025-06-01T00:00:00.000Z"
    }
  ]
}
```

---

### PATCH `/blink/associate/service-charges/:id`

Edit a commission config. At least one field required.

**Auth:** `blink_associate` JWT required.

**Request body** (all fields optional, at least one required)

```json
{
  "grossAmount": 55000,
  "gstPercentage": 18,
  "termsAndConditions": "Commission paid within 30 days of student enrollment.",
  "isActive": true
}
```

> When `grossAmount` or `gstPercentage` is changed, `gstAmount` and `netPayout` are automatically recomputed:
>
> ```
> gstAmount = grossAmount × gstPercentage / 100
> netPayout = grossAmount − gstAmount
> ```

**Response — 200**

```json
{
  "success": true,
  "data": {
    "id": "SC-1",
    "college": { "id": "COL-3", "name": "Sunrise Engineering College" },
    "course": { "id": "CRS-7", "name": "B.Tech Computer Science" },
    "academicYear": "2025-26",
    "studentCategory": "general",
    "grossAmount": 55000.0,
    "gstPercentage": 18.0,
    "gstAmount": 9900.0,
    "netPayout": 45100.0,
    "termsAndConditions": "Commission paid within 30 days of student enrollment.",
    "isActive": true,
    "updatedAt": "2025-06-16T10:30:00.000Z"
  }
}
```

**Error cases**
| Status | Reason |
|---|---|
| 400 | No fields provided |
| 404 | Service charge config not found |

---

## Common Error Responses

```json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Invalid credentials" } }
{ "success": false, "error": { "code": "FORBIDDEN", "message": "This account is registered as an associate employee. Please use the correct login." } }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Employee not found" } }
{ "success": false, "error": { "code": "CONFLICT", "message": "Email already exists" } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Insufficient balance. Available: ₹25000.00" } }
```

| HTTP Status | Code               | When                                                                                 |
| ----------- | ------------------ | ------------------------------------------------------------------------------------ |
| 400         | `BAD_REQUEST`      | Zod validation failure                                                               |
| 401         | `UNAUTHORIZED`     | Invalid credentials / missing/expired JWT                                            |
| 403         | `FORBIDDEN`        | Role mismatch, wrong agency number, account not active, resource ownership violation |
| 404         | `NOT_FOUND`        | Resource not found                                                                   |
| 409         | `CONFLICT`         | Duplicate email                                                                      |
| 422         | `VALIDATION_ERROR` | Business rule violation (insufficient balance, etc.)                                 |
