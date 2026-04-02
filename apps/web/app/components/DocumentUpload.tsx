'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useDropzone } from 'react-dropzone'
import { Card, Button, Alert, Spinner, Form, ProgressBar } from 'react-bootstrap'
import type { Role, PlanType } from '@esign/db'
import axios from 'axios'
import type { AxiosError } from 'axios'

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

interface Props {
  onSuccess: () => void
}

export default function DocumentUpload({ onSuccess }: Props) {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [accessToken, setAccessToken] = useState('')

  // Get access token from session or localStorage (client-side only)
  useEffect(() => {
    const sessionUser = session?.user as ExtendedUser
    const token = sessionUser?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '') || ''
    setAccessToken(token)
  }, [session])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdf = acceptedFiles[0]
    if (pdf) {
      setFile(pdf)
      setTitle(pdf.name.replace('.pdf', ''))
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      setError(fileRejections[0]?.errors[0]?.message || 'File rejected')
    },
  })

  const handleUpload = async () => {
    if (!file || !title.trim()) return
    if (!accessToken) {
      setError('Not authenticated. Please log in again.')
      return
    }
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('document', file)
      formData.append('title', title)

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / (e.total || 1))
            setProgress(pct)
          },
        }
      )

      onSuccess()
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Card>
      <Card.Body>
        <h5>Upload Document</h5>

        {error && <Alert variant="danger">{error}</Alert>}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded p-5 text-center mb-3 ${
            isDragActive ? 'border-primary bg-light' : 'border-secondary'
          }`}
          style={{ cursor: 'pointer' }}
        >
          <input {...getInputProps()} />
          {file ? (
            <div>
              <div className="text-success mb-2">📄 {file.name}</div>
              <small className="text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
            </div>
          ) : isDragActive ? (
            <p className="mb-0">Drop the PDF here...</p>
          ) : (
            <p className="mb-0">Drag & drop a PDF, or click to select</p>
          )}
        </div>

        {file && (
          <Form.Group className="mb-3">
            <Form.Label>Document Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
            />
          </Form.Group>
        )}

        {uploading && <ProgressBar now={progress} label={`${progress}%`} className="mb-3" />}

        <div className="d-flex gap-2">
          <Button
            variant="primary"
            disabled={!file || !title || uploading}
            onClick={handleUpload}
          >
            {uploading ? <><Spinner size="sm" /> Uploading...</> : 'Upload & Hash Document'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}