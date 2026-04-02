'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { AxiosError } from 'axios'
import type { Role, PlanType } from '@esign/db'
import {
  Table,
  Badge,
  Button,
  ButtonGroup,
  Spinner,
  Alert,
  Modal,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap'
import { formatDistanceToNow, format } from 'date-fns'
import axios from 'axios'
import SignatureModal from './SignatureModal'

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

interface Signature {
  id: string
  status: 'PENDING' | 'SIGNED' | 'DECLINED' | 'EXPIRED'
  signedAt: string | null
}

interface Document {
  id: string
  title: string
  fileName: string
  fileSize: number
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'PARTIALLY_SIGNED' | 'SIGNED' | 'EXPIRED' | 'CANCELLED'
  sha3Hash: string
  createdAt: string
  signatures: Signature[]
  _count: { signatures: number }
}

interface Props {
  documents: Document[]
  onRefresh: () => void
}

const STATUS_VARIANTS: Record<Document['status'], string> = {
  DRAFT: 'secondary',
  PENDING_SIGNATURE: 'warning',
  PARTIALLY_SIGNED: 'info',
  SIGNED: 'success',
  EXPIRED: 'danger',
  CANCELLED: 'dark',
}

const STATUS_LABELS: Record<Document['status'], string> = {
  DRAFT: 'Draft',
  PENDING_SIGNATURE: 'Awaiting Signature',
  PARTIALLY_SIGNED: 'Partially Signed',
  SIGNED: '✓ Signed',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentList({ documents, onRefresh }: Props) {
  const { data: session } = useSession()
  const [signingDocId, setSigningDocId] = useState<string | null>(null)
  const [verifyDoc, setVerifyDoc] = useState<Document | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [accessToken, setAccessToken] = useState('')

  // Get access token from session or localStorage (client-side only)
  useEffect(() => {
    const sessionUser = session?.user as ExtendedUser
    const token = sessionUser?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '') || ''
    setAccessToken(token)
  }, [session])

  const authHeader = () => ({
    Authorization: `Bearer ${accessToken}`,
  })

  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id)
    setError('')
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${doc.id}/download`,
        { headers: authHeader() }
      )
      console.log('[DocumentList] Presigned URL received:', data.url)
      console.log('[DocumentList] Opening in new window...')
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>
      console.error('[DocumentList] Download error:', err)
      setError(err.response?.data?.error || 'Download failed')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document? This action cannot be undone.')) return
    setDeletingId(docId)
    setError('')
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${docId}`,
        { headers: authHeader() }
      )
      onRefresh()
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>
      setError(err.response?.data?.error || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <div style={{ fontSize: '3rem' }}>📄</div>
        <p className="mt-2">No documents yet. Upload your first PDF to get started.</p>
      </div>
    )
  }

  return (
    <>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="table-responsive">
        <Table hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Document</th>
              <th>Status</th>
              <th>Signatures</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <div className="fw-semibold text-truncate" style={{ maxWidth: 240 }}>
                    {doc.title}
                  </div>
                  <small className="text-muted text-truncate d-block" style={{ maxWidth: 240 }}>
                    {doc.fileName}
                  </small>
                </td>

                <td>
                  <Badge bg={STATUS_VARIANTS[doc.status]} className="px-2 py-1">
                    {STATUS_LABELS[doc.status]}
                  </Badge>
                </td>

                <td>
                  {doc._count.signatures === 0 ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <span>
                      {doc.signatures.filter((s) => s.status === 'SIGNED').length}
                      {' / '}
                      {doc._count.signatures} signed
                    </span>
                  )}
                </td>

                <td>
                  <small className="text-muted">{formatBytes(doc.fileSize)}</small>
                </td>

                <td>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>{format(new Date(doc.createdAt), 'PPpp')}</Tooltip>}
                  >
                    <small className="text-muted" style={{ cursor: 'default' }}>
                      {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                    </small>
                  </OverlayTrigger>
                </td>

                <td className="text-end">
                  <ButtonGroup size="sm">
                    {['DRAFT', 'PENDING_SIGNATURE', 'PARTIALLY_SIGNED'].includes(doc.status) && (
                      <OverlayTrigger placement="top" overlay={<Tooltip>Sign document</Tooltip>}>
                        <Button variant="outline-primary" onClick={() => setSigningDocId(doc.id)}>
                          ✍️
                        </Button>
                      </OverlayTrigger>
                    )}

                    <OverlayTrigger placement="top" overlay={<Tooltip>Verify SHA-3 hash</Tooltip>}>
                      <Button variant="outline-secondary" onClick={() => setVerifyDoc(doc)}>
                        🔍
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          {doc.status === 'SIGNED' ? 'Download signed PDF' : 'Download original'}
                        </Tooltip>
                      }
                    >
                      <Button
                        variant="outline-success"
                        disabled={downloadingId === doc.id}
                        onClick={() => handleDownload(doc)}
                      >
                        {downloadingId === doc.id ? <Spinner size="sm" /> : '⬇️'}
                      </Button>
                    </OverlayTrigger>

                    {['DRAFT', 'CANCELLED'].includes(doc.status) && (
                      <OverlayTrigger placement="top" overlay={<Tooltip>Delete document</Tooltip>}>
                        <Button
                          variant="outline-danger"
                          disabled={deletingId === doc.id}
                          onClick={() => handleDelete(doc.id)}
                        >
                          {deletingId === doc.id ? <Spinner size="sm" /> : '🗑️'}
                        </Button>
                      </OverlayTrigger>
                    )}
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {signingDocId && (
        <SignatureModal
          documentId={signingDocId}
          show={!!signingDocId}
          onHide={() => setSigningDocId(null)}
          onSigned={() => {
            setSigningDocId(null)
            onRefresh()
          }}
        />
      )}

      <Modal show={!!verifyDoc} onHide={() => setVerifyDoc(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Document Integrity Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {verifyDoc && (
            <>
              <p className="mb-1"><strong>Document:</strong> {verifyDoc.title}</p>
              <p className="mb-3"><strong>File:</strong> {verifyDoc.fileName}</p>
              <p className="text-muted small mb-1">SHA-3 Hash (stored at upload):</p>
              <code
                className="d-block p-3 bg-light rounded"
                style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}
              >
                {verifyDoc.sha3Hash}
              </code>
              <p className="mt-3 small text-muted">
                Run <code>sha3sum -a 256 &lt;file&gt;.pdf</code> locally to confirm
                the hash matches and the file has not been tampered with.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVerifyDoc(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}