# Pozzer Platform Architecture

## System Overview

Pozzer is a full-stack Web3 DePIN platform built on modern edge computing infrastructure, combining decentralized identity (wallet-based authentication), gamification mechanics, and real-time network monitoring.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Web Browser │  │ Mobile Wallet│  │ External APIs│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Edge Network (Cloudflare)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CDN (200+ locations) → Static Assets (React SPA)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Workers (Serverless) → API Logic (Hono Framework)       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data & Storage Layer                       │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  D1 Database   │  │  R2 Storage    │  │  Email Service  │  │
│  │  (SQLite)      │  │  (Objects)     │  │  (Transactional)│  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Blockchain Networks                  │
│   Ethereum  │  Polygon  │  BSC  │  Arbitrum  (via WalletConnect)│
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture (React)

### 2.1 Component Hierarchy

```
App.tsx
├── Web3ModalProvider (wallet context)
├── Router
│   ├── Home (landing page)
│   ├── Explorer (DePIN monitoring)
│   │   ├── ConsensusVisualization (real-time votes)
│   │   ├── Globe3D (validator map with Three.js)
│   │   └── InteractiveValidatorMap (geographic distribution)
│   ├── Testnet (gamification hub)
│   │   ├── WalletConnectionOverlay (signature flow)
│   │   ├── TestnetCountdown (time-locked access)
│   │   ├── MainnetRewards (tier benefits)
│   │   └── DpossAICube (3D particle animation)
│   ├── Tokenomics (distribution charts)
│   ├── Roadmap (development timeline)
│   └── Admin (management dashboard)
│       ├── Dashboard (stats overview)
│       ├── Verifications (mission approval queue)
│       └── Security (logs & monitoring)
└── Footer + Navigation
```

### 2.2 Key Frontend Technologies

| Technology | Purpose | Files |
|------------|---------|-------|
| **React 19** | UI framework | All `src/react-app/**/*.tsx` |
| **TypeScript** | Type safety | `*.tsx`, `*.ts` |
| **Tailwind CSS** | Styling | `index.css`, component styles |
| **shadcn/ui** | Component library | `src/react-app/components/ui/*` |
| **Three.js** | 3D graphics | `Globe3D.tsx`, `DpossAICube.tsx` |
| **Web3Modal** | Wallet connection | `Web3ModalProvider.tsx` |
| **Ethers.js** | Blockchain interactions | `useWallet.tsx` |
| **React Router** | Client routing | `App.tsx` |

### 2.3 State Management

- **Web3Modal Context**: Global wallet state (address, chain, connection status)
- **React Query / Polling**: Network data refresh (`useTestnetPolling`, `useNetworkData`)
- **localStorage**: Theme preference, admin tokens (sessionStorage for security)
- **URL State**: Route parameters, query strings

---

## 3. Backend Architecture (Cloudflare Workers)

### 3.1 API Structure

```
worker/index.ts (Hono router)
├── Middleware Stack
│   ├── CORS (origin whitelist)
│   ├── Rate Limiting (IP + wallet)
│   ├── Request Logging (security monitoring)
│   └── API Key Validation (legacy)
│
├── Public Endpoints
│   ├── GET /api/network-stats (cached 30s)
│   ├── GET /api/validators (cached 1min)
│   └── GET /api/testnet/lock-status
│
├── Authentication Endpoints
│   ├── POST /api/auth/request-nonce
│   ├── POST /api/auth/verify-signature
│   └── POST /api/testnet/connect (5 req/min)
│
├── Testnet Endpoints
│   ├── GET /api/testnet/user/:wallet
│   ├── POST /api/testnet/mission/complete (10 req/min)
│   ├── GET /api/testnet/leaderboard (cached 5min)
│   └── GET /api/testnet/stats (cached 2min)
│
└── Admin Endpoints (JWT protected)
    ├── POST /api/admin/login (5 req/15min)
    ├── POST /api/admin/send-verification-code
    ├── GET /api/admin/stats
    ├── GET /api/admin/verifications/pending
    ├── POST /api/admin/verifications/:id/review
    └── GET /api/admin/security/logs
```

### 3.2 Security Middleware Layers

1. **CORS Policy**
   - Whitelist: `pozzer.io`, preview domain, localhost
   - Blocks unauthorized origins at browser level

2. **Rate Limiting** (`rate-limiter.ts`)
   - IP-based: 60 req/min global
   - Wallet-based: 10 req/min for missions
   - Admin login: 5 req/15min
   - Database-backed sliding window

3. **Request Logging** (`utils/log-cleaner.ts`)
   - Logs suspicious patterns (SQL injection, bot UAs)
   - Automatic cleanup after 30 days
   - Provides `/api/admin/security` dashboard

4. **Input Sanitization** (`utils/sanitizer.ts`)
   - `sanitizeWalletAddress()`: Regex validation
   - `sanitizeMissionId()`: Alphanumeric + underscore only
   - Prevents SQL injection via parameterized queries

### 3.3 Authentication Systems

#### User Authentication (Wallet Signature)
```typescript
// Flow:
1. Client requests nonce → GET /api/auth/request-nonce
   - Server generates random nonce
   - Stores in wallet_nonces table (expires 5min)

2. Client signs message → wallet.signMessage(message)
   - Message format: "Sign to verify ownership: {wallet}\nNonce: {nonce}"

3. Client submits signature → POST /api/testnet/connect
   - Server verifies signature using ethers.verifyMessage()
   - Consumes nonce (prevents replay attacks)
   - Creates/updates user in testnet_users

// Files: utils/signature-verifier.ts, useWallet.tsx
```

#### Admin Authentication (JWT)
```typescript
// Flow:
1. Email verification:
   - POST /api/admin/send-verification-code
   - Sends 6-digit code via email service
   - Code expires in 10 minutes

2. Account creation:
   - POST /api/admin/verify-and-create
   - Validates code, creates admin_users record
   - Password hashed with bcrypt (10 rounds)

3. Login:
   - POST /api/admin/login
   - Verifies bcrypt hash
   - Issues JWT (24h expiry, HS256 signature)

4. Protected routes:
   - requireAdmin middleware validates JWT
   - Injects admin user into context

// Files: admin-auth.ts, Admin.tsx
```

---

## 4. Database Schema (D1 / SQLite)

### 4.1 Core Tables

#### testnet_users
Primary user table linking wallets to XP/missions.

```sql
CREATE TABLE testnet_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet_address TEXT NOT NULL UNIQUE,      -- 0x... or Solana address
  chain_type TEXT NOT NULL,                 -- 'evm' or 'solana'
  pzr_balance REAL DEFAULT 0,               -- Total XP earned
  node_rewards REAL DEFAULT 0,              -- XP from node missions
  invite_rewards REAL DEFAULT 0,            -- XP from referrals
  social_rewards REAL DEFAULT 0,            -- XP from social missions
  referral_code TEXT UNIQUE,                -- PZR_ABC123
  referred_by TEXT,                         -- Referrer's code
  total_missions_completed INTEGER DEFAULT 0,
  is_whitelisted BOOLEAN DEFAULT 0,         -- Ban flag
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_testnet_users_wallet ON testnet_users(wallet_address);
CREATE INDEX idx_testnet_users_referral ON testnet_users(referral_code);
CREATE INDEX idx_testnet_users_pzr ON testnet_users(pzr_balance DESC);
```

#### user_missions
Tracks individual mission completions.

```sql
CREATE TABLE user_missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  mission_id TEXT NOT NULL,                 -- 'node_provider', 'social_twitter', etc.
  mission_type TEXT NOT NULL,               -- 'node', 'social', 'invite'
  is_completed BOOLEAN DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT 0,
  reward_amount REAL DEFAULT 0,             -- XP value
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Composite index for uniqueness check
CREATE INDEX idx_user_missions_user_mission ON user_missions(user_id, mission_id);
```

#### validators
Network validator registry (seeded data).

```sql
CREATE TABLE validators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  validator_address TEXT NOT NULL UNIQUE,
  location TEXT,                            -- City, Country
  city TEXT,
  country TEXT,
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT 1,
  total_blocks_validated INTEGER DEFAULT 0,
  uptime_percentage REAL DEFAULT 99.9,
  stake_amount REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Security Tables

- **wallet_nonces**: Nonce storage for signature verification
- **rate_limits**: Sliding window counters
- **request_logs**: Security monitoring (suspicious IPs, failed requests)
- **admin_users**: Admin accounts (bcrypt hashes)
- **admin_verification_codes**: Email 2FA codes

### 4.3 Performance Optimization

**Indexes:**
- `wallet_address` lookups
- `pzr_balance DESC` for leaderboard sorting
- `referral_code` for invite tracking
- Composite indexes on foreign keys

**Caching Strategy** (`utils/cache-manager.ts`):
```typescript
{
  network_stats: 30s TTL,
  validators: 60s TTL,
  leaderboard: 300s TTL,
  testnet_stats: 120s TTL
}
```

---

## 5. Security Architecture

### 5.1 Threat Model & Mitigations

| Threat | Mitigation | Implementation |
|--------|------------|----------------|
| **Wallet Spoofing** | Signature verification | `signature-verifier.ts` |
| **Replay Attacks** | Nonce consumption | `wallet_nonces` table |
| **Brute Force** | Rate limiting | `rate-limiter.ts` |
| **SQL Injection** | Parameterized queries | D1 `.bind()` |
| **XSS** | React auto-escaping | JSX rendering |
| **CSRF** | CORS whitelist | Hono cors middleware |
| **DDoS** | Cloudflare WAF + rate limits | Edge infrastructure |
| **Sybil Attacks** | Max 3 nodes/wallet | `user_missions` validation |

### 5.2 Data Flow Security

```
User Request
    ↓
[Cloudflare WAF] → DDoS protection
    ↓
[CORS Middleware] → Origin validation
    ↓
[Rate Limiter] → Throttle abuse
    ↓
[Auth Verification] → JWT or signature
    ↓
[Input Sanitization] → Prevent injection
    ↓
[Business Logic] → Execute safely
    ↓
[Logging] → Audit trail
    ↓
Response
```

---

## 6. Deployment Architecture

### 6.1 Cloudflare Workers Configuration

```json
// wrangler.json
{
  "name": "pozzer-depin",
  "main": "./src/worker/index.ts",
  "compatibility_date": "2025-06-17",
  "d1_databases": [
    { "binding": "DB", "database_id": "..." }
  ],
  "r2_buckets": [
    { "binding": "R2_BUCKET", "bucket_name": "..." }
  ],
  "services": [
    { "binding": "EMAILS", "service": "emails-service" }
  ]
}
```

### 6.2 Build Process

1. **TypeScript Compilation**: `tsc -b` (3 tsconfig files: app, worker, node)
2. **Vite Build**: Bundles React SPA → `/dist`
3. **Worker Build**: Hono API → bundled with dependencies
4. **Asset Upload**: Static files → Cloudflare CDN
5. **Migration Apply**: D1 schema updates

### 6.3 Environment Separation

- **Development**: `localhost:5173` (Vite dev server + local Workers)
- **Production**: `pozzer.io` (Cloudflare Pages + Workers)
- **Databases**: Separate D1 instances (dev vs prod)

---

## 7. Scalability Considerations

### 7.1 Current Limits (Free Tier)

- D1 Database: 500MB storage
- R2 Storage: 10GB
- Workers: 100k requests/day
- **Estimated capacity**: 1,000-5,000 users

### 7.2 Paid Tier Scaling ($5/month)

- D1: 100k reads/day, 1k writes/day
- Workers: Unlimited requests (CPU time-based billing)
- **Estimated capacity**: 50,000-100,000 users

### 7.3 Bottleneck Analysis

| Component | Bottleneck | Solution |
|-----------|------------|----------|
| Leaderboard queries | Full table scan | Caching (5min TTL) |
| Mission completion | Write-heavy | Rate limiting |
| Network stats | Frequent reads | Aggressive caching (30s) |
| Admin dashboard | Complex joins | Denormalization |

---

## 8. Future Architecture Enhancements

### 8.1 Planned Improvements

1. **Blockchain Integration**
   - Deploy smart contracts for PZR token
   - On-chain reward distribution
   - NFT minting for tier rewards

2. **Real DePIN Node Integration**
   - Hardware device verification
   - Actual compute task assignment
   - Proof-of-work validation

3. **Enhanced Monitoring**
   - Grafana dashboards
   - Real-time alerting (Sentry)
   - Performance metrics (Web Vitals)

4. **Microservices Split**
   - Separate Workers for admin vs public API
   - Dedicated caching layer (Redis/KV)
   - Event-driven architecture (Queues)

---

## 9. Technology Decisions Rationale

| Choice | Rationale |
|--------|-----------|
| **Cloudflare Workers** | Global edge deployment, sub-100ms latency, auto-scaling |
| **React 19** | Latest features (server components ready), huge ecosystem |
| **Hono** | Fastest edge framework, TypeScript-first, 100% CF Workers compatible |
| **D1 (SQLite)** | Relational data model, serverless, integrated with Workers |
| **Web3Modal** | Industry standard, 300+ wallets, multi-chain support |
| **Tailwind CSS** | Rapid prototyping, consistent design tokens, production-ready |
| **Three.js** | WebGL 3D, immersive visualizations, DePIN branding alignment |

---

**Last Updated**: March 2025  
**Version**: 2.0  
**Maintainer**: Pozzer Team
