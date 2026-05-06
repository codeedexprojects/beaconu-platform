import { api } from '@/lib/api'

interface LoginPayload {
  email: string
  password: string
}

export interface AdminProfile {
  id: string
  fullName: string
  email: string
  role: 'super_admin' | 'sub_admin'
  avatarUrl?: string
}

interface LoginResponse {
  admin: AdminProfile
  token: string
  refreshToken: string
}

// ---------------------------------------------------------------------------
// Mock data — remove when backend is ready
// ---------------------------------------------------------------------------
const MOCK_ADMINS = [
  {
    email: 'admin@beaconu.com',
    password: 'admin123',
    admin: {
      id: 'mock-admin-001',
      fullName: 'Super Admin',
      email: 'admin@beaconu.com',
      role: 'super_admin' as const,
    },
  },
  {
    email: 'subadmin@beaconu.com',
    password: 'admin123',
    admin: {
      id: 'mock-admin-002',
      fullName: 'Sub Admin',
      email: 'subadmin@beaconu.com',
      role: 'sub_admin' as const,
    },
  },
]

async function mockLogin(payload: LoginPayload): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 800))

  const match = MOCK_ADMINS.find(
    (a) => a.email === payload.email && a.password === payload.password,
  )

  if (!match) throw new Error('Invalid email or password')

  return {
    admin: match.admin,
    token: `mock-token-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
  }
}
// ---------------------------------------------------------------------------

const isMock =
  process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' ||
  (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL)

export async function loginAdmin(payload: LoginPayload): Promise<LoginResponse> {
  if (isMock) return mockLogin(payload)
  return api.post<LoginResponse>('/api/v1/auth/admin/login', payload)
}
