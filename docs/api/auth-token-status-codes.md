# Auth Token Expiry Status Codes

This note defines how to handle expired tokens in BeaconU APIs.

## 1) Access Token Expired

- HTTP status: 401 Unauthorized
- Error code: TOKEN_EXPIRED
- Message: Access token expired. Please refresh your session.

Example response:

```json
{
  "success": false,
  "message": "Access token expired. Please refresh your session.",
  "error": {
    "code": "TOKEN_EXPIRED",
    "details": []
  },
  "timestamp": "2026-05-18T10:30:00.000Z"
}
```

Expected client behavior:

1. Call refresh-token endpoint.
2. Retry the original request once after successful refresh.
3. If refresh fails, force logout and redirect to login.

## 2) Refresh Token Expired or Invalid

- HTTP status: 401 Unauthorized
- Error code: SESSION_EXPIRED
- Message: Refresh token expired. Please login again.

Example response:

```json
{
  "success": false,
  "message": "Refresh token expired. Please login again.",
  "error": {
    "code": "SESSION_EXPIRED",
    "details": []
  },
  "timestamp": "2026-05-18T10:30:00.000Z"
}
```

Expected client behavior:

1. Clear auth state (access token + user state).
2. Clear refresh cookie/session if stored.
3. Redirect user to login screen.

## 3) Endpoint-Level Recommendation

Use this pattern in all auth-protected APIs:

- Protected API with expired access token -> 401 + TOKEN_EXPIRED
- Refresh endpoint with expired/invalid refresh token -> 401 + SESSION_EXPIRED

This keeps frontend retry logic deterministic and avoids ambiguous 401 handling.
