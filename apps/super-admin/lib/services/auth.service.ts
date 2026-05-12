import { ApiError } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

interface LoginPayload {
  email: string
  password: string
}

interface PlatformLoginPayload extends LoginPayload {
  role_slug: string
}

export interface AdminProfile {
  id: string
  fullName: string
  email: string
  role: 'super_admin' | 'sub_admin'
  avatarUrl?: string
}

interface LoginApiResponse {
  success: boolean
  message: string
  data: {
    user: { id: string; fullName: string; email: string }
    accessToken: string
  }
}

// Login uses a direct fetch instead of the shared api client because
// a failed login returns 401 (wrong credentials), which the api client
// would misinterpret as a session expiry and redirect away from the login page.
export async function loginAdmin(
  payload: LoginPayload,
): Promise<{ admin: AdminProfile; token: string }> {
  const roleSlug = process.env.NEXT_PUBLIC_PLATFORM_ROLE_SLUG ?? 'super_admin'
  const requestPayload: PlatformLoginPayload = {
    ...payload,
    role_slug: roleSlug,
  }

  const res = await fetch(`${API_BASE}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestPayload),
  })

  const body = (await res.json()) as LoginApiResponse

  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? 'Login failed')
  }

  return {
    admin: {
      id: body.data.user.id,
      fullName: body.data.user.fullName,
      email: body.data.user.email,
      role: 'super_admin',
    },
    token: body.data.accessToken,
  }
}
