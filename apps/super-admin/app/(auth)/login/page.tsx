'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store'

export default function LoginPage(): React.JSX.Element {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? 'Invalid credentials')
        return
      }

      setAuth(data.data.admin, data.data.token)
      router.replace('/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleDevBypass() {
    setAuth(
      {
        id: 'dev-admin-001',
        fullName: 'Super Admin',
        email: 'admin@beaconu.com',
        role: 'super_admin',
      },
      'dev-token',
    )
    router.replace('/')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B14] flex items-center justify-center p-4">
      {/* Ambient glow — matches mobile hero aesthetic */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/40">
            <span className="text-xl font-black text-white">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">BeaconU</h1>
          <p className="mt-1 text-sm text-white/40">Super Admin Panel</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md shadow-2xl">
          <h2 className="mb-1 text-lg font-semibold text-white">Welcome back</h2>
          <p className="mb-6 text-sm text-white/50">Sign in to your admin account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@beaconu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-white/25 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/70">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/25 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="mt-2 w-full h-10 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-center text-xs font-medium text-white/40 uppercase tracking-widest">
              Dev bypass
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 border-white/15 bg-transparent text-white/60 hover:bg-white/5 hover:text-white text-sm"
              onClick={handleDevBypass}
            >
              Enter as Super Admin
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-white/25">
          © {new Date().getFullYear()} BeaconU. All rights reserved.
        </p>
      </div>
    </div>
  )
}
