# Pozzer — DePIN Protocol

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Live](https://img.shields.io/badge/Testnet-Live-brightgreen)](https://www.pozzer.io/explorer)

Full-stack Web3 DePIN (Decentralized Physical Infrastructure Network) protocol built on edge-native architecture. Users participate in decentralized infrastructure through wallet-based authentication, mission validation, and on-chain reward distribution.

🔗 **Live testnet:** [pozzer.io/explorer](https://www.pozzer.io/explorer)

---

## What this is

Most blockchain projects simulate decentralization on top of centralized infrastructure. Pozzer takes a different approach — it's designed around actual participation, where users contribute real resources and are rewarded based on verifiable on-chain actions.

The current testnet has an active whitelist of early participants validating the core protocol mechanics before public launch.

---

## Architecture

```
Frontend (React + TypeScript)
  └── Web3Modal / WalletConnect (multi-chain)
        └── Cloudflare Workers (edge API)
              └── Cloudflare D1 (SQLite at edge)
              └── Cloudflare R2 (asset storage)
              └── Solidity contracts (on-chain reward logic)
```

**Why edge-first:** DePIN networks need low-latency validation. Running the backend on Cloudflare Workers means API responses from the closest geographic node to the user — no cold starts, no region-locked infrastructure.

**Why D1 over a traditional database:** The validation and reward logic doesn't require complex joins or heavy write throughput. D1 gives us relational structure with zero operational overhead at the edge, which matches the scale of a testnet well.

---

## Core systems

**Wallet authentication**
Nonce-based EVM signature verification. No passwords, no email — the wallet is the identity. The flow: server generates a nonce → user signs with wallet → server verifies signature against the claimed address. Replay attacks are prevented by invalidating the nonce on first use.

**Mission and reward system**
Users complete on-chain and off-chain missions that are validated server-side before triggering reward state changes. Rewards are calculated based on participation tier (Explorer → Genesis Operator) with multipliers that align user behavior with network growth goals.

**Multi-chain support**
Unified UX across Ethereum, Polygon, BSC, and Arbitrum via Web3Modal. Chain-specific logic is abstracted behind a single interaction layer so users don't need to think about which network they're on.

**Smart contracts**
Solidity contracts handle token logic and on-chain reward distribution. Contract interactions are triggered by backend validation — we don't trust client-side state for anything that affects balances.

**Admin and monitoring**
Rate limiting per IP and wallet address, request logging, suspicious activity tracking, and a moderation dashboard for reviewing participation anomalies.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS, React Router |
| Backend | Cloudflare Workers, Hono |
| Database | Cloudflare D1 (SQLite at edge) |
| Storage | Cloudflare R2 |
| Web3 | Ethers.js, Web3Modal, WalletConnect |
| Contracts | Solidity |
| Auth | Nonce-based wallet signature + JWT (admin) |
| Security | Rate limiting (IP + wallet), bcrypt, input validation |

---

## Security

- Wallet authentication via EVM signature verification — server never touches private keys
- JWT + bcrypt for admin routes
- Multi-layer rate limiting: per IP and per wallet address
- Nonce invalidation on use — prevents replay attacks
- Input sanitization and strict endpoint validation across all routes

---

## Project scope

| Item | Count |
|------|-------|
| REST API endpoints | 20+ |
| Database tables | 13 |
| React components | 25+ |
| Supported chains | 4 (Ethereum, Polygon, BSC, Arbitrum) |

---

## Status

**Testnet — active whitelist phase.**

Core protocol mechanics are live and being validated by early participants. The whitelist phase exists to stress-test reward logic, validate the mission system, and catch edge cases before public launch.

Not production-ready for open participation yet. Smart contract audits and mainnet deployment are next milestones.

---

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Windows:
```powershell
npm install
copy .env.example .env
npm run dev
```

### Environment variables

```bash
VITE_WALLETCONNECT_PROJECT_ID=   # WalletConnect project ID
ADMIN_JWT_SECRET=                # JWT secret for admin routes
AUTHORIZED_ADMIN_EMAILS=         # Comma-separated admin emails
TESTNET_UNLOCK_DATE=             # ISO date for testnet unlock
TESTNET_EARLY_ACCESS_PASSWORD=   # Early access password
API_KEY=                         # Internal API key
```

---

## Documentation

Technical docs in `docs/`:

- `docs/ARCHITECTURE.md` — service boundaries and design decisions
- `docs/SECURITY.md` — security model and threat considerations
- `docs/routes.md` — full API route reference

---

## Contact

Twitter: [@pozzer_depin](https://x.com/pozzer_depin)
Telegram: [t.me/pozzerpt](https://t.me/pozzerpt)
Email: contato@pozzer.io
