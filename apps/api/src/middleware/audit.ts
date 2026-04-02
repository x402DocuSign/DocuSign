import { Request, Response, NextFunction } from 'express'
import { prisma, AuditAction } from '@esign/db'
import { AuthenticatedRequest } from './authenticate'
import { logger } from '@esign/utils/logger'

interface AuditOptions {
  action: AuditAction
  getDocumentId?: (req: Request) => string | undefined
  getMetadata?: (req: Request, res: Response) => object | undefined
}

/**
 * Audit log middleware factory
 */
export function auditLog(options: AuditOptions) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res)
    let responseBody: object

    res.json = function (body) {
      responseBody = body
      return originalJson(body)
    }

    res.on('finish', async () => {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await prisma.auditLog.create({
            data: {
              userId: (req as AuthenticatedRequest).user?.id,
              documentId: options.getDocumentId?.(req),
              action: options.action,
              ipAddress: req.ip || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'],
              metadata: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                ...options.getMetadata?.(req, res),
              },
            },
          })
        }
      } catch (err) {
        logger.error('Failed to write audit log', { error: err })
      }
    })

    next()
  }
}