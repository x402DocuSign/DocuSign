import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { authOptions } = await import('@/lib/auth')
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DashboardClient user={session.user as any} />
}