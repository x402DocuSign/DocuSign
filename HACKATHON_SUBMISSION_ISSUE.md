# GitHub Issue Submission Draft

Use this exact issue title after replacing the team number:

```text
Team #[number] - SignHere
```

Copy and paste the issue body below into the hackathon repository issue form.

```markdown
## Project Name
SignHere

## One-Line Description
SignHere is a secure electronic document signing platform with pay-per-sign blockchain payments on Base Sepolia and Stellar testnet.

## Track
Track 2 Financial Inclusion & Everyday Payments

## Problem It Solves
Small teams, freelancers, and digital-first businesses need a simple way to upload, sign, and verify documents without relying on expensive enterprise e-signature tools. SignHere combines document signing, audit trails, encrypted storage, and blockchain payment verification in one workflow. Users can pay only when they need to sign, making trusted digital agreements more accessible for teams that do not want a monthly subscription.

## How It Uses Stellar
SignHere uses Stellar testnet payments as one of its supported payment rails for document signing. The frontend integrates the Freighter wallet extension, builds a native XLM payment transaction with `@stellar/stellar-sdk`, asks Freighter to sign it, and submits it to Stellar Horizon testnet. The backend verifies the submitted transaction hash against Horizon by checking the sender wallet, destination wallet, native XLM amount, successful transaction status, and transaction freshness before marking the signing payment as completed.

## GitHub Repository
https://github.com/x402DocuSign/DocuSign

## Network & Deployment
- Network: testnet
- Live app URL (if any): https://docu-sign-web.vercel.app
- Contract IDs / asset issuers (if any): N/A - uses native XLM payments on Stellar testnet

## Team
- [Your Full Name] - @Pixeee

## Novelty Note (optional, for bonus points)
SignHere is different from a standard wallet checkout because the Stellar payment is tied directly to a document-signing action. The app verifies the payment on-chain through Horizon before allowing the protected signing workflow to complete, while also supporting Base Sepolia payment verification for users who prefer an EVM wallet.

## Anything Else
The current implementation runs on Stellar testnet and Base Sepolia. Next steps would include production-grade mainnet support, stronger organization billing controls, richer document collaboration, and optional stablecoin support on Stellar.
```
