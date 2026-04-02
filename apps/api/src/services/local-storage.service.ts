import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const STORAGE_DIR = path.join(process.cwd(), '.storage', 'uploads')

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true })
  console.log(`✓ [Local Storage] Created directory: ${STORAGE_DIR}`)
}

/**
 * Upload a file buffer to local file system
 */
export async function uploadToLocalStorage(
  buffer: Buffer,
  originalName: string,
  contentType = 'application/pdf',
  folder = 'documents'
): Promise<{ s3Key: string; size: number }> {
  const uniqueId = crypto.randomBytes(16).toString('hex')
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const s3Key = `${folder}/${new Date().getFullYear()}/${uniqueId}-${sanitizedName}`

  // Create folder structure
  const filePath = path.join(STORAGE_DIR, s3Key)
  const fileDir = path.dirname(filePath)

  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true })
  }

  // Write file
  fs.writeFileSync(filePath, buffer)

  console.log(`✓ [Local Storage] Uploaded: ${s3Key}`)

  return { s3Key, size: buffer.length }
}

/**
 * Download a file from local storage
 */
export async function downloadFromLocalStorage(s3Key: string): Promise<Buffer> {
  const filePath = path.join(STORAGE_DIR, s3Key)

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${s3Key}`)
  }

  return fs.readFileSync(filePath)
}

/**
 * Delete a file from local storage
 */
export async function deleteFromLocalStorage(s3Key: string): Promise<void> {
  const filePath = path.join(STORAGE_DIR, s3Key)

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`✓ [Local Storage] Deleted: ${s3Key}`)
  }
}

/**
 * Get signed URL for download (returns full URL for local storage)
 */
export async function getSignedUrlForLocalStorage(
  s3Key: string,
  expiresIn = 3600
): Promise<string> {
  // Build full URL with protocol and host from API_URL environment variable
  const apiUrl = (process.env.API_URL || 'http://localhost:4000').replace(/\/$/, '')
  const downloadUrl = `${apiUrl}/api/documents/download?key=${encodeURIComponent(s3Key)}`
  console.log(`[Local Storage] Generated presigned URL:`, downloadUrl)
  return downloadUrl
}

/**
 * Check if file exists
 */
export async function fileExistsInLocalStorage(s3Key: string): Promise<boolean> {
  const filePath = path.join(STORAGE_DIR, s3Key)
  return fs.existsSync(filePath)
}
