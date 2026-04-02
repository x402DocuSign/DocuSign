'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap'
import type { Role, PlanType } from '@esign/db'
import DocumentUpload from '@/components/DocumentUpload'
import DocumentList from '@/components/DocumentList'

interface ExtendedUser {
  id: string
  email: string
  name?: string
  role: Role
  plan: PlanType
  totpEnabled: boolean
  accessToken?: string
  refreshToken?: string
}

interface User {
  id: string
  email: string
  name: string
  plan: string
  role: string
  totpEnabled: boolean
  accessToken?: string
}

export default function DashboardClient({ user }: { user: User }) {
  const { data: session } = useSession()
  const [showUpload, setShowUpload] = useState(false)
  const [accessToken, setAccessToken] = useState('')

  // Get access token from session or localStorage (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const sessionUser = session?.user as ExtendedUser | undefined
    console.log('[Dashboard] Session user:', { 
      exists: !!sessionUser, 
      hasAccessToken: !!sessionUser?.accessToken,
      tokenLength: sessionUser?.accessToken?.length || 0 
    })
    
    const fromSession = sessionUser?.accessToken
    const fromStorage = localStorage.getItem('accessToken')
    const token = fromSession || fromStorage || ''
    
    console.log('[Dashboard] Token sources:', {
      fromSession: !!fromSession,
      fromStorage: !!fromStorage,
      final: { length: token.length, preview: token.slice(0, 20) }
    })
    
    setAccessToken(token)
    
    // Store token in localStorage for persistence
    if (token && token.length > 0) {
      localStorage.setItem('accessToken', token)
      console.log('[Dashboard] Token persisted to localStorage')
    }
  }, [session])

  const fetcher = (url: string) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`
    console.log('[Dashboard] Fetching:', apiUrl, 'with token length:', accessToken?.length || 0)
    
    return fetch(apiUrl, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((r) => {
      if (!r.ok) {
        console.error('[Dashboard] API error:', r.status, r.statusText)
        throw new Error(`API error: ${r.status}`)
      }
      return r.json()
    })
  }

  const { data, error, isLoading, mutate } = useSWR(
    accessToken ? '/api/documents?limit=10' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 1,
    }
  )

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Welcome, {user.name}</h1>
              <p className="text-muted mb-0">
                Plan: <Badge bg={user.plan === 'FREE' ? 'secondary' : 'primary'}>{user.plan}</Badge>
                {!user.totpEnabled && (
                  <Badge bg="warning" className="ms-2">MFA Not Enabled</Badge>
                )}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowUpload(!showUpload)}
            >
              + Upload Document
            </Button>
          </div>
        </Col>
      </Row>

      {!user.totpEnabled && (
        <Alert variant="warning">
          <strong>Security Alert:</strong> Enable Multi-Factor Authentication to secure your account.{' '}
          <a href="/settings/security">Enable MFA →</a>
        </Alert>
      )}

      {!accessToken && (
        <Alert variant="danger">
          <strong>Authentication Error:</strong> Unable to retrieve access token. Please log in again.
        </Alert>
      )}

      {showUpload && (
        <Row className="mb-4">
          <Col>
            <DocumentUpload onSuccess={() => { setShowUpload(false); mutate() }} />
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Documents</h5>
            </Card.Header>
            <Card.Body>
              {isLoading && <div className="text-center py-4"><Spinner /></div>}
              {error && (
                <Alert variant="danger">
                  Failed to load documents: {error.message}
                </Alert>
              )}
              {data?.documents && (
                <DocumentList documents={data.documents} onRefresh={mutate} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}