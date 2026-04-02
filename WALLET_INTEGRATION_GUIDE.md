# X402 Wallet Integration Guide

## Overview

The eSign platform now has a complete X402 payment integration for Base Sepolia testnet. Users can connect their crypto wallets (MetaMask, etc.) to pay for document signatures using ETH.

## Components Created

### 1. X402PaymentModal (`apps/web/app/components/X402PaymentModal.tsx`)
- **Purpose**: Displays payment UI when signing documents requires payment
- **Features**:
  - Connect/disconnect wallet button
  - Display connected wallet address and balance
  - Send ETH payment to X402 wallet
  - Auto-switch to Base Sepolia network
  - Error handling with user-friendly messages

### 2. Updated SignatureModal (`apps/web/app/components/SignatureModal.tsx`)
- **Changes**: Integrated X402PaymentModal for payment flow
- **Flow**:
  1. User draws/types signature
  2. Clicks "Sign Document"
  3. System detects 402 Payment Required response
  4. Shows X402PaymentModal dialog
  5. User connects wallet and completes payment
  6. System retries signature with payment token
  7. Document signed and stored

### 3. Environment Configuration
- **Added to `.env.local`**:
  - `NEXT_PUBLIC_X402_WALLET`: Recipient wallet address
  - `NEXT_PUBLIC_X402_CHAIN_ID`: Base Sepolia (84532)
  - `NEXT_PUBLIC_X402_NETWORK`: "base-sepolia"
  - `NEXT_PUBLIC_X402_RPC_URL`: Base Sepolia RPC endpoint
  - `NEXT_PUBLIC_X402_USDC_ADDRESS`: USDC token contract

### 4. Dependencies
- **Added**: `ethers@^6.13.0` for blockchain interaction

## How to Test

### Prerequisites
1. **MetaMask or Web3 Wallet**: Install MetaMask browser extension
2. **Base Sepolia Testnet**: Network will be auto-added by the app
3. **Test ETH**: Get free ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

### Test Flow

1. **Register & Login**
   ```
   Navigate to http://localhost:3000/auth/register
   Create account with test email/password
   Login with credentials
   ```

2. **Upload Document**
   ```
   Go to Dashboard
   Click "Upload Document"
   Select any PDF file
   Fill in title and description
   Click "Upload"
   ```

3. **Trigger Payment Flow**
   ```
   Click the document in the list
   Click "Sign Document" button
   You should see payment requirements (402 response)
   X402PaymentModal will appear
   ```

4. **Complete Payment**
   ```
   Click "🔗 Connect Wallet"
   MetaMask will open for connection
   Select your wallet account
   Network will auto-switch to Base Sepolia
   Click "💳 Pay 0.01 ETH"
   MetaMask will prompt to confirm transaction
   Sign and complete payment
   ```

5. **Sign Document**
   ```
   After payment completes, draw your signature
   Click "✍️ Sign Document"
   Document should be signed and saved
   ```

## Architecture

```
SignatureModal (detect 402 error)
    ↓
show X402PaymentModal
    ↓
user.connectWallet() → window.ethereum
    ↓
user.sendTransaction() → Base Sepolia
    ↓
get transaction hash
    ↓
create payment token from txHash
    ↓
retry signature with X-Payment header
    ↓
backend validates payment
    ↓
signature applied to PDF
```

## Payment Token Generation

The payment token is generated as:
```
x402:<txHash>:<walletAddress>:<amount>
```

Example:
```
x402:0x1234...5678:0xF5a7...DEF2:0.01
```

This token is sent in the `X-Payment` header to the API.

## Backend Validation

The API (`apps/api/src/middleware/x402.ts`) validates payments:

1. **Development Mode**: 
   - Can skip payment with `X-Skip-Payment: true` header
   - Or mocks payment verification

2. **Production Mode**:
   - Calls Coinbase facilitator API to verify payment
   - Checks if user is on allowed subscription plan
   - Ensures sufficient payment amount

## Testing Without Real Payments

To test the full flow without actual payments:

1. **Use Development Mode Bypass**:
   ```bash
   # In terminal, when sending signature request
   curl -X POST http://localhost:4000/api/signatures/{docId}/sign \
     -H "X-Skip-Payment: true" \
     -H "Authorization: Bearer {token}"
   ```

2. **Mock Payment Response**:
   - In development mode, fake payments are automatically accepted
   - Set `NODE_ENV=development` (already set in `.env.local`)

## Configuration

### Base Sepolia Network Details
- **Chain ID**: 84532 (0x14A34)
- **Network Name**: Base Sepolia
- **RPC URL**: https://sepolia.base.org
- **Currency**: ETH (1 ETH = 10^18 wei)
- **USDC Contract**: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

### Payment Configuration
- **Payment Amount**: 0.01 ETH per signature
- **Payment Recipient**: 0xF5a795CacA94Ac1bDeEc36a52769Dae0d5E8DEF2
- **Facilitator**: https://facilitator.coinbase.com (production)

## Troubleshooting

### "MetaMask or compatible wallet not found"
- Install MetaMask extension: https://metamask.io
- Enable the extension and refresh page

### "Failed to switch blockchain"
- Your wallet doesn't support programmatic chain switching
- Try switching manually to Base Sepolia in MetaMask

### "Payment failed"
- Ensure you have ETH balance on Base Sepolia
- Get free testnet ETH from faucet
- Check that transaction cost (gas) is enough

### "Payment verification failed"
- Currently in production, verify with Coinbase facilitator
- In development, payment should be mocked automatically

## Files Modified

1. **Created**:
   - `apps/web/app/components/X402PaymentModal.tsx` - Payment UI
   - `WALLET_INTEGRATION_GUIDE.md` - This file

2. **Updated**:
   - `apps/web/app/components/SignatureModal.tsx` - Integrated payment modal
   - `apps/web/package.json` - Added ethers.js dependency
   - `apps/web/.env.local` - Added X402 configuration

## Next Steps

1. **Test the payment flow** following the Test Flow section above
2. **Configure production wallet address** when ready to go live
3. **Set up real Coinbase facilitator** for production payments
4. **Add USDC token support** for ERC-20 payments (if needed)
5. **Implement subscription plans** to offer different payment tiers

## Support

For issues:
1. Check browser console for errors (F12)
2. Check MetaMask network and account selection
3. Verify Base Sepolia RPC is accessible
4. Check API logs at port 4000

---

**Environment**: Development with local file storage and mocked payments
**Network**: Base Sepolia Testnet (Free)
**Payment**: ETH (Testnet - Free ETH available)
