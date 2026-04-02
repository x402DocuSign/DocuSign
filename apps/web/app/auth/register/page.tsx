'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface PasswordStrength {
  score: number
  label: string
  color: string
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const levels: PasswordStrength[] = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Very weak', color: 'danger' },
    { score: 2, label: 'Weak', color: 'warning' },
    { score: 3, label: 'Fair', color: 'info' },
    { score: 4, label: 'Strong', color: 'primary' },
    { score: 5, label: 'Very strong', color: 'success' },
  ]

  return levels[score]
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getPasswordStrength(form.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (strength.score < 4) {
      setError('Password is too weak. Use 12+ chars with uppercase, lowercase, number and symbol.')
      return
    }

    setLoading(true)

    try {
      // Register user via Express API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }
      )

      // Store tokens from Express API response
      const { accessToken, refreshToken } = response.data
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }

      // Automatically sign in user with NextAuth
      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        // Redirect to dashboard on successful sign-in
        router.push('/dashboard')
      } else {
        // If auto sign-in fails, redirect to login with registered flag
        router.push('/auth/login?registered=true')
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      setError(axiosError.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 py-4"
      style={{ background: '#f0f2f5' }}
    >
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: 460 }}>
        <div className="card-body p-4">

          {/* Header */}
          <div className="text-center mb-4">
            <div style={{ fontSize: '2rem' }}>✍️</div>
            <h4 className="fw-bold mb-0">Create your account</h4>
            <p className="text-muted small">Start signing documents securely</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name row */}
            <div className="row g-2 mb-3">
              <div className="col">
                <label className="form-label fw-semibold small">First name</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div className="col">
                <label className="form-label fw-semibold small">Last name</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold small">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="form-label fw-semibold small">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min 12 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="progress" style={{ height: 4 }}>
                    <div
                      className={`progress-bar bg-${strength.color}`}
                      style={{ width: `${(strength.score / 5) * 100}%`, transition: 'width 0.3s' }}
                    />
                  </div>
                  <div className={`small text-${strength.color} mt-1`}>
                    {strength.label}
                  </div>
                </div>
              )}
              <div className="form-text">
                Must be 12+ chars with uppercase, lowercase, number and symbol.
              </div>
            </div>

            {/* Confirm password */}
            <div className="mb-4">
              <label className="form-label fw-semibold small">Confirm password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                <div className="small text-danger mt-1">Passwords do not match</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? <span className="spinner-border spinner-border-sm me-2" />
                : null}
              Create Account
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Already have an account?{' '}
            <a href="/auth/login" className="text-decoration-none fw-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}