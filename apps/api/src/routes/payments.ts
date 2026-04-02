import { Router, Response } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@esign/db'
import { authenticate, requireMFA, AuthenticatedRequest } from '../middleware/authenticate'
import { idempotencyMiddleware } from '../middleware/idempotency'
import { auditLog } from '../middleware/audit'

const router: import('express').Router = Router()

// ─── Create Team Subscription ──────────────────────────────────

router.post(
  '/subscriptions',
  authenticate,
  requireMFA,
  idempotencyMiddleware,
  auditLog({ action: 'SUBSCRIPTION_CREATED' }),
  async (req: AuthenticatedRequest, res: Response) => {
    const { teamId, plan, txHash, walletAddress } = z
      .object({
        teamId: z.string(),
        plan: z.enum(['TEAM', 'ENTERPRISE']),
        txHash: z.string(),
        walletAddress: z.string(),
      })
      .parse(req.body)

    // Verify team membership
    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId: req.user!.id, role: { in: ['OWNER', 'ADMIN'] } },
    })

    if (!member) {
      return res.status(403).json({ error: 'Insufficient team permissions' })
    }

    const periodStart = new Date()
    const periodEnd = new Date(periodStart)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const limits = { TEAM: 100, ENTERPRISE: 10000 }

    const [subscription, payment] = await prisma.$transaction([
      prisma.subscription.create({
        data: {
          teamId,
          plan,
          status: 'active',
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          signaturesLimit: limits[plan],
        },
      }),
      prisma.payment.create({
        data: {
          userId: req.user!.id,
          teamId,
          type: 'TEAM_PACKAGE',
          status: 'COMPLETED',
          amount: plan === 'TEAM' ? '0.1' : '1.0',
          currency: 'ETH',
          txHash,
          walletAddress,
          idempotencyKey: req.headers['x-idempotency-key'] as string || uuidv4(),
        },
      }),
      prisma.team.update({
        where: { id: teamId },
        data: { plan },
      }),
    ])

    res.status(201).json({ subscription, payment })
  }
)

// ─── Payment History ───────────────────────────────────────────

router.get(
  '/history',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { page = '1', limit = '20' } = req.query as Record<string, string>
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, parseInt(limit))

    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.id },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        document: { select: { id: true, title: true } },
      },
    })

    res.json({ payments })
  }
)

export default router