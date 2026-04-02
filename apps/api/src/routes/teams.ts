import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@esign/db'
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/authenticate'
import { auditLog } from '../middleware/audit'

const router: import('express').Router = Router()

function getParam(req: Request, name: string): string | undefined {
  const v = (req.params as any)[name]
  return typeof v === 'string' ? v : Array.isArray(v) ? v[0] : undefined
}

// ─── Create Team ───────────────────────────────────────────────

router.post(
  '/',
  authenticate,
  auditLog({ action: 'TEAM_CREATED' }),
  async (req: AuthenticatedRequest, res: Response) => {
    const { name } = z.object({ name: z.string().min(2).max(100) }).parse(req.body)

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const existing = await prisma.team.findUnique({ where: { slug } })
    if (existing) {
      return res.status(409).json({ error: 'Team name already taken' })
    }

    const [team] = await prisma.$transaction([
      prisma.team.create({ data: { name, slug } }),
    ])

    await prisma.teamMember.create({
      data: { teamId: team.id, userId: req.user!.id, role: 'OWNER' },
    })

    res.status(201).json({ team })
  }
)

// ─── Get Teams for User ────────────────────────────────────────

router.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const memberships = await prisma.teamMember.findMany({
      where: { userId: req.user!.id },
      include: {
        team: {
          include: {
            _count: { select: { members: true, documents: true } },
          },
        },
      },
    })

    res.json({ teams: memberships.map((m: typeof memberships[0]) => ({ ...m.team, role: m.role })) })
  }
)

// ─── Invite Member ─────────────────────────────────────────────

router.post(
  '/:teamId/members',
  authenticate,
  auditLog({ action: 'TEAM_MEMBER_ADDED' }),
  async (req: AuthenticatedRequest, res: Response) => {
    const { email, role } = z
      .object({
        email: z.string().email(),
        role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
      })
      .parse(req.body)

    // Check requester is owner/admin
    const myMembership = await prisma.teamMember.findFirst({
      where: {
        teamId: getParam(req, 'teamId'),
        userId: req.user!.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    })

    if (!myMembership) {
      return res.status(403).json({ error: 'Insufficient team permissions' })
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } })
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found' })
    }

    const existing = await prisma.teamMember.findFirst({
      where: { teamId: getParam(req, 'teamId'), userId: userToAdd.id },
    })

    if (existing) {
      return res.status(409).json({ error: 'User already a member' })
    }

    const member = await prisma.teamMember.create({
      data: { teamId: getParam(req, 'teamId')!, userId: userToAdd.id, role },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    })

    res.status(201).json({ member })
  }
)

export default router