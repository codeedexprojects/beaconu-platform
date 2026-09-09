# Student Referrals & Card Redemption — Mobile Integration Guide

Handoff doc for the mobile team. An **enrolled** student invites someone to the BeaconU app; when that invitee enrolls at any college, the referrer is credited a percentage of the course's referral amount to their BeaconU Card, which they can then redeem to a bank account.

The backend is fully built. Nothing here has run against a live database yet — see [Prerequisites](#1-prerequisites--none-of-this-works-until-these-are-done). The mobile app is the only client for the student side; the super-admin web panel handles payout approval.

This is **not** the Blink referral system (agencies, associates, campus ambassadors). Different tables, different endpoints, different payout rules. Don't reuse `/public/referrals/*` — that's Blink's.

All student endpoints below are under `/api/v1/student/*` and need the usual student JWT (`Authorization: Bearer <token>`). No new credential.

---

## ⚠️ Read this first

**1. `GET /student/referrals/code` returns 403 for most students.** Referral codes require an **active enrollment**. A student browsing colleges — the majority — gets `403 Forbidden` with "Referral codes are available once you're enrolled in a college". This is the expected state, not an error. Render an explanatory empty state, not a failure toast.

**2. Available balance ≠ card balance.** Pending redemption requests are _held_ against the balance rather than debited. The server computes `available = balance − sum(pending)`. If you show raw `balance` as spendable, students will hit "Insufficient balance" while staring at a healthy number. Show pending requests and subtract them.

**3. iOS cannot recover a referral code after a cold install.** Android has the Play Install Referrer; iOS has no equivalent, and Firebase Dynamic Links is shut down. The manual "Have a referral code?" field is therefore **load-bearing on iOS**, not a nicety. Don't cut it.

**4. Send `referral_code` on signup unconditionally.** The server only attributes it when the account is genuinely new, and silently ignores codes that are unknown, expired, self-referring, or belong to an already-attributed student. A bad code never fails signup. No client-side guarding needed.

---

## 1. Prerequisites — none of this works until these are done

|                                                                                                        | Blocks                                                        |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Migration `20260909120645_student_hub_referrals` applied                                               | Everything                                                    |
| `studentReferralPercentage` set (defaults to **0**)                                                    | Payouts — at 0, referrals reach `enrolled` and pay ₹0 forever |
| `ENCRYPTION_KEY` set                                                                                   | All bank-account endpoints throw                              |
| `ANDROID_PACKAGE_NAME`, `ANDROID_SHA256_FINGERPRINTS`, `IOS_TEAM_ID`, `IOS_BUNDLE_ID`, `APP_SHARE_URL` | Deep links (§5)                                               |

Ask backend before assuming any of these are live. Until the percentage is set, the whole flow works end-to-end but every payout is zero — which looks identical to a bug.

There is **no OpenAPI spec** despite what root `CLAUDE.md` says (`swagger-jsdoc` is a dependency with zero usage). The Bruno collection in `packages/api-contracts/` is the real contract. Phase 5 (wallet/redemption) contracts aren't written yet — this doc is the reference for those.

---

## 2. Signup — capturing the code

Add an optional **"Have a referral code?"** field to both signup paths. Pass whatever the app is holding (deep link, install referrer, or typed) as `referral_code`:

**`POST /student/auth/register`** (OTP path)

```json
{
  "full_name": "Riya Nair",
  "phone_number": "9876543210",
  "phone_country_code": "+91",
  "registration_token": "…",
  "fcm_token": "…",
  "referral_code": "K7M2QXBP"
}
```

**`POST /student/auth/firebase`** (Google path)

```json
{ "id_token": "…", "fcm_token": "…", "referral_code": "K7M2QXBP" }
```

Note the Google endpoint runs on **every** login, not just the first. The server attributes the referral only when that call actually creates the account, so sending the code on a returning user's login is harmless — it's ignored.

Attribution happens at signup, **before** any application exists. The payout fires later, when the invitee enrolls.

Store the pending code locally with a **30-day TTL** (matches the existing Blink referral convention) so a stale code can't attach to an unrelated signup months later.

---

## 3. Referral screen

### Header counters

**`GET /student/referrals/summary`**

```json
{
  "success": true,
  "data": {
    "totalInvites": 7,
    "signedUp": 4,
    "enrolled": 1,
    "paid": 2,
    "totalEarned": 3000,
    "cardBalance": 1500
  }
}
```

`totalEarned` is lifetime referral income; `cardBalance` is what's left after redemptions. They diverge as soon as a student redeems — label them distinctly ("Total earned" vs "Available").

### The code + share

**`GET /student/referrals/code`** — creates it on first call, same code forever after.

```json
{
  "success": true,
  "data": {
    "code": "K7M2QXBP",
    "shareUrl": "https://beaconu.com/r/K7M2QXBP",
    "totalSignups": 4
  }
}
```

`403` unless enrolled (see ⚠️ #1). Feed `shareUrl` to the native share sheet; show `code` prominently too, since that's the iOS fallback path.

### Invitee list

**`GET /student/referrals`**

```json
{
  "success": true,
  "data": [
    {
      "id": "SRF-12",
      "status": "paid",
      "invitedAt": "2026-08-02T09:14:00.000Z",
      "paidAt": "2026-09-01T11:02:00.000Z",
      "earnedAmount": 1500,
      "student": {
        "id": "STU-88",
        "fullName": "Arjun Menon",
        "avatarUrl": null
      }
    }
  ]
}
```

Status flow:

| Status      | Meaning                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `signed_up` | Invitee made an account. `earnedAmount: null`                                                                                       |
| `enrolled`  | Invitee enrolled but **nothing was payable** — course had no referral amount, or the platform percentage is 0. `earnedAmount: null` |
| `paid`      | Credited to the card                                                                                                                |

`enrolled` is a real terminal-looking state that never becomes `paid`. Don't render it as "processing" — it means no reward is coming for that invitee.

---

## 4. Wallet & redemption

### Card + ledger

**`GET /student/beaconu-card`** — existing endpoint, unchanged.

**`GET /student/beaconu-card/transactions?page=1&limit=20&type=credit`**

```json
{
  "success": true,
  "data": [
    {
      "id": "SWT-31",
      "type": "credit",
      "amount": 1500,
      "description": "Referral reward",
      "withdrawalStatus": null,
      "balanceAfter": 1500,
      "createdAt": "2026-09-01T11:02:00.000Z",
      "referral": {
        "id": "SRF-12",
        "referredStudentName": "Arjun Menon",
        "baseAmount": 5000,
        "percentage": 30
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

`referral` is non-null only on referral credits — enough to render "why this amount" inline without a second call. `type: "debit"` rows are redemptions and carry `withdrawalStatus` (`pending` / `approved` / `rejected`).

> Open question for the product side: `baseAmount` and `percentage` expose the course commission figure to students. Confirm that's intended before surfacing it in the UI — it's easy to hide client-side.

### Bank accounts

**`GET /student/bank-accounts`** / **`POST /student/bank-accounts`**

```json
{
  "bankName": "State Bank of India",
  "accountHolderName": "Riya Nair",
  "accountNumber": "12345678901",
  "ifscCode": "SBIN0001234",
  "accountType": "savings",
  "isPrimary": true
}
```

Validation mirrored from the server — enforce client-side to avoid round trips:

- `accountNumber` — 9–18 digits, digits only
- `ifscCode` — `^[A-Z]{4}0[A-Z0-9]{6}$` (uppercased server-side)
- `accountType` — `savings` | `current`

Responses **never** contain the full account number — only `accountNumberLast4`. It's encrypted at rest and decrypted only for the super admin at payout time.

The first account added is always primary regardless of the `isPrimary` flag, so there's always a default.

**`PATCH /student/bank-accounts/:id/primary`** — switch the default.

### Requesting a redemption

**`POST /student/beaconu-card/redeem`**

```json
{ "amount": 1000, "bankAccountId": "SBA-4" }
```

```json
{
  "success": true,
  "data": {
    "id": "SWT-45",
    "amount": 1000,
    "withdrawalStatus": "pending",
    "requestedAt": "2026-09-09T10:00:00.000Z"
  }
}
```

Preconditions to check before enabling the button:

1. At least one bank account exists
2. `amount ≥ studentMinWithdrawalAmount` (default ₹500 — read it from platform config, don't hardcode)
3. `amount ≤ available` (balance minus pending — see ⚠️ #2)

**Payouts are manual.** A super admin transfers the money by hand and then marks the request approved. There is no payment gateway. Expect hours-to-days, not seconds — set that expectation in the UI copy. The student gets a push notification (`type: "redemption_reviewed"`) on approve or reject.

---

## 5. Deep linking

Server side is built and verified. `https://<domain>/r/<code>` serves App Links / Universal Links, with a web landing page fallback that shows the code and routes to the right store.

### Both platforms

Register App Links / Universal Links for `https://<domain>/r/*`. On link open, extract the code from the path and store it (30-day TTL) until signup completes. If the app is installed, the OS opens it directly and the web page never loads.

### Android — real deferred deep linking

On first launch, read the Play Install Referrer and **POST the raw string** to the server:

**`POST /public/invite/resolve`** (no auth)

```json
{ "referrer": "utm_source=beaconu&utm_medium=invite&ref=K7M2QXBP" }
```

```json
{ "success": true, "data": { "valid": true, "code": "K7M2QXBP" } }
```

**Don't parse `ref=` in Dart.** Server-side parsing means the link format can change without an app release.

This endpoint **always returns 200**, never 404 — an organic install legitimately has no referral, and `{ "valid": false, "code": null }` is the normal answer. Treat a `false` as "no referral", not an error.

Also accepts `{ "code": "K7M2QXBP" }` directly for the link-opened and manual-entry cases.

### iOS — manual only

No Install Referrer equivalent. After a cold install the code is unrecoverable; the landing page shows it in large monospace for the user to copy, and they paste it into the signup field. Closing this properly needs Branch or AppsFlyer — a product decision, not built.

### Validating a typed code

**`GET /public/invite/:code`** (no auth) — `{ "valid": true, "code": "…" }`, or **404** if unknown/inactive. Use this for inline validation on the manual field; use `/resolve` for the first-open flow.

Note the path is `/public/invite/`, **not** `/public/referrals/` — the latter is Blink's resolver and would silently resolve against the wrong table.

---

## 6. Error cases worth handling explicitly

| Situation                           | Response                                             | UI                                            |
| ----------------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| Not enrolled, opens referral screen | `403` on `/referrals/code`                           | "Invite friends once you join a college"      |
| Redeem below minimum                | `422` ValidationError with the amount in the message | Show the server message; it names the minimum |
| Redeem above available              | `422` "Insufficient balance. Available: ₹X"          | Pre-check to avoid this                       |
| Redeem with no bank account         | `404` "Bank account"                                 | Route to add-account first                    |
| Card inactive                       | `409`                                                | Rare; surface the message                     |
| Unknown code, manual entry          | `404` on `/public/invite/:code`                      | Inline field error, never block signup        |
| Organic install                     | `200` `{valid: false}` on `/resolve`                 | Silent, no UI                                 |

---

## 7. Explicit non-goals — not built, don't wait for these

- **No payment gateway.** Redemption is a request queue; a human pays out.
- **No referrer identity before signup.** `/public/invite/:code` deliberately returns nothing about who invited you (it's an unauthenticated endpoint anyone can hit). An "Invited by X" screen would need a new authenticated endpoint — ask if you want it.
- **No bank account verification.** `isVerified` exists on the model but nothing sets it; admins eyeball the details.
- **No editing or deleting bank accounts.** Add and set-primary only.
- **No iOS deferred deep linking.** See §5.

---

## 8. Suggested build order

1. **Signup capture** (§2) — works standalone with manual entry, on both platforms, with zero deep-link setup. Ships value immediately.
2. **Referral screen** (§3) — read-only, low risk.
3. **Wallet & redemption** (§4) — closes the money loop.
4. **Deep linking** (§5) — highest effort, most environment-dependent, and everything above already works without it.
