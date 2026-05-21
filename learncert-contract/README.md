# LearnCert Contract

Gasless NFT certificate system. Students get on-chain certs without holding ETH.

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Deploy Contract
- Open Remix IDE: https://remix.ethereum.org
- Run `/deploy-guide` command in Claude for step-by-step instructions

### 3. Set Environment Variables
```bash
cp .env.example .env
# Edit .env and fill in:
# PRIVATE_KEY=your_wallet_private_key
# CONTRACT_ADDRESS=deployed_contract_address
```

### 4. Generate Code (via Claude commands)
```
/write-contract   → generates contracts/LearnCert.sol
/write-ugf        → generates scripts/ugf.js
/test-flow        → generates scripts/test.js
```

### 5. Run Test
```bash
node scripts/test.js
```

Expected output: minted NFT token ID + on-chain verification.

## Handoff to Person C
Run `/handoff` command to generate HANDOFF.md with everything Person C needs.
