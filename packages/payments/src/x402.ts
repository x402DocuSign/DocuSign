/**
 * X402 v2 Payment Integration
 * Protocol: HTTP 402 Payment Required
 * Chain: Base (chainId 8453)
 */

export interface X402PaymentHeader {
  scheme: 'exact'
  network: string
  maxAmountRequired: string
  resource: string
  description: string
  mimeType: string
  payTo: string
  maxTimeoutSeconds: number
  asset: string
  extra?: {
    name: string
    version: string
  }
}

export interface X402VerifyResult {
  valid: boolean
  paymentId?: string
  txHash?: string
  amount?: string
  error?: string
}

/**
 * Build the WWW-Authenticate header for 402 responses
 */
export function buildX402Header(
  resource: string,
  priceEth = '0.01',
  walletAddress?: string
): X402PaymentHeader {
  return {
    scheme: 'exact',
    network: `eip155:${process.env.X402_CHAIN_ID || '8453'}`,
    maxAmountRequired: priceEth,
    resource,
    description: `Sign document: ${resource}`,
    mimeType: 'application/pdf',
    payTo: walletAddress || process.env.X402_WALLET_ADDRESS || '',
    maxTimeoutSeconds: 300,
    asset: `eip155:${process.env.X402_CHAIN_ID || '8453'}/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`, // USDC on Base
    extra: {
      name: 'ESIGN Platform',
      version: '2.0',
    },
  }
}

/**
 * Verify payment with X402 facilitator
 */
export async function verifyX402Payment(
  paymentToken: string,
  resource: string,
  amount: string
): Promise<X402VerifyResult> {
  // In development mode, accept any payment token (mock verification)
  if (process.env.NODE_ENV === 'development') {
    console.log('[X402] Development mode: simulating payment verification')
    return {
      valid: true,
      paymentId: `dev-${Date.now()}`,
      txHash: `0x${'a'.repeat(64)}`,
      amount,
    }
  }

  const facilitatorUrl = process.env.X402_FACILITATOR_URL || 'https://facilitator.coinbase.com'

  try {
    const response = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment: paymentToken,
        resource,
        amount,
        network: `eip155:${process.env.X402_CHAIN_ID || '84532'}`,
      }),
    })

    if (!response.ok) {
      return { valid: false, error: `Facilitator error: ${response.status}` }
    }

    const data = await response.json()

    return {
      valid: data.valid === true,
      paymentId: data.paymentId,
      txHash: data.txHash,
      amount: data.amount,
    }
  } catch (error: any) {
    return { valid: false, error: error.message }
  }
}

/**
 * Check if user has an active subscription that covers signing
 */
export async function checkSubscriptionCoverage(
  userId: string,
  teamId?: string | null
): Promise<boolean> {
  const { prisma } = await import('@esign/db')

  // Check individual plan
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.plan === 'TEAM' || user?.plan === 'ENTERPRISE') return true

  // Check team subscription
  if (teamId) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        teamId,
        status: 'active',
        currentPeriodEnd: { gt: new Date() },
        signaturesUsed: { lt: prisma.subscription.fields.signaturesLimit as any },
      },
    })

    if (subscription) {
      // Increment usage counter
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { signaturesUsed: { increment: 1 } },
      })
      return true
    }
  }

  return false
}