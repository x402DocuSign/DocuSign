'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'Server configuration error. Please contact support.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification link is invalid or has expired.',
  Default: 'An error occurred during sign in. Please try again.',
}

function AuthErrorContent() {
  const params = useSearchParams()
  const error = params.get('error') || 'Default'
  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: '#f0f2f5' }}
    >
      <div className="card shadow-sm text-center" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-body p-4">
          <div style={{ fontSize: '2.5rem' }}>⚠️</div>
          <h5 className="fw-bold mt-2">Authentication Error</h5>
          <p className="text-muted small">{message}</p>
          <a href="/auth/login" className="btn btn-primary btn-sm">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  )
}