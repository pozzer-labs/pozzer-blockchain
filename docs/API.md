# Pozzer API Documentation

Complete reference for all public and protected API endpoints.

**Base URL**: `https://pozzer.io`  
**API Version**: 2.0  
**Last Updated**: March 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Public Endpoints](#public-endpoints)
3. [Testnet Endpoints](#testnet-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Rate Limits](#rate-limits)
6. [Error Codes](#error-codes)
7. [Examples](#examples)

---

## Authentication

### Wallet-Based (Users)

**Step 1**: Request a nonce

```http
POST /api/auth/request-nonce
Content-Type: application/json

{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response**:
```json
{
  "nonce": "a1b2c3d4e5f6...",
  "message": "Sign to verify ownership: 0x742d35...\nNonce: a1b2c3d4e5f6..."
}
```

**Step 2**: Sign the message with your wallet and verify

```http
POST /api/auth/verify-signature
Content-Type: application/json

{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x1234567890abcdef...",
  "nonce": "a1b2c3d4e5f6...",
  "chain_type": "evm"
}
```

**Response**:
```json
{
  "success": true,
  "verified": true,
  "wallet_address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "chain_type": "evm"
}
```

---

### JWT-Based (Admin)

Include JWT token in `Authorization` header:

```http
GET /api/admin/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get token via `/api/admin/login` (see Admin Endpoints below).

---

## Public Endpoints

No authentication required. Open to all origins.

### GET /api/network-stats

Get real-time network statistics.

**Response**:
```json
{
  "id": 1,
  "total_blocks": 0,
  "total_transactions": 0,
  "active_nodes": 67,
  "active_devices": 210,
  "network_uptime": 99.88,
  "consensus_votes_current": 11,
  "consensus_votes_required": 13,
  "current_block": 0,
  "nodes_online": 67,
  "avg_block_time": 1.0,
  "tps": 0,
  "active_validators": 13,
  "created_at": "2025-03-15T10:30:00Z",
  "updated_at": "2025-03-15T10:30:00Z"
}
```

**Cache**: 30 seconds

---

### GET /api/validators

Get list of active validators.

**Response**:
```json
[
  {
    "id": 1,
    "name": "Pozzer Validator BR-SP-01",
    "validator_address": "0xabcd1234...",
    "location": "São Paulo, Brazil",
    "city": "São Paulo",
    "country": "Brazil",
    "status": "active",
    "is_active": 1,
    "total_blocks_validated": 0,
    "uptime_percentage": 99.9,
    "stake_amount": 0,
    "created_at": "2025-03-01T00:00:00Z",
    "updated_at": "2025-03-01T00:00:00Z"
  },
  ...
]
```

**Cache**: 60 seconds

---

## Testnet Endpoints

Public access with rate limiting. Used for the gamified testnet program.

### GET /api/testnet/lock-status

Check if testnet is locked by countdown.

**Response** (locked):
```json
{
  "locked": true,
  "unlockDate": "2025-04-01T00:00:00Z"
}
```

**Response** (unlocked):
```json
{
  "locked": false
}
```

---

### POST /api/testnet/check-password

Verify early access password.

**Request**:
```json
{
  "password": "your_password_here"
}
```

**Response** (success):
```json
{
  "success": true
}
```

**Response** (failure):
```json
{
  "error": "Incorrect password"
}
```

**Status Codes**: `200` (correct), `401` (incorrect), `500` (not configured)

---

### POST /api/testnet/connect

Connect wallet and register user. **Rate limit**: 5 requests/minute per IP.

**Request**:
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain_type": "evm",
  "signature": "0x1234567890abcdef...",
  "nonce": "a1b2c3d4e5f6...",
  "referred_by": "PZR_ABC123"  // Optional referral code
}
```

**Response** (new user):
```json
{
  "user": {
    "id": 1,
    "wallet_address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "chain_type": "evm",
    "pzr_balance": 0,
    "node_rewards": 0,
    "invite_rewards": 0,
    "social_rewards": 0,
    "referral_code": "PZR_XYZ789",
    "referred_by": "PZR_ABC123",
    "total_missions_completed": 0,
    "created_at": "2025-03-15T10:30:00Z"
  },
  "isNew": true
}
```

**Response** (existing user):
```json
{
  "user": { ... },
  "isNew": false
}
```

**Error** (missing signature):
```json
{
  "error": "Signature required. Please sign the message to verify wallet ownership."
}
```

---

### GET /api/testnet/user/:wallet

Get user data by wallet address.

**Example**: `GET /api/testnet/user/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

**Response**:
```json
{
  "user": {
    "id": 1,
    "wallet_address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "pzr_balance": 1500,
    "total_missions_completed": 5,
    ...
  },
  "missions": [
    {
      "id": 1,
      "mission_id": "node_provider",
      "mission_type": "node",
      "is_completed": 1,
      "reward_amount": 1000,
      "completed_at": "2025-03-10T14:20:00Z"
    },
    ...
  ],
  "nodes": [
    {
      "id": 1,
      "node_type": "provider",
      "node_name": "My Node",
      "is_active": 1,
      ...
    }
  ],
  "referral_count": 3  // Users who used your code AND completed 1+ mission
}
```

**Status Codes**: `200` (success), `404` (user not found), `400` (invalid wallet)

---

### POST /api/testnet/mission/complete

Complete a mission and claim XP. **Rate limit**: 10 requests/minute per IP + wallet.

**Request**:
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "mission_id": "social_twitter",
  "mission_type": "social"
}
```

**Mission IDs**:
- **Node**: `node_provider`, `node_validator`, `node_worker`, `node_delegate`
- **Social**: `social_twitter`, `social_telegram`, `social_post`, `social_daily`

**Response** (success):
```json
{
  "success": true,
  "user": {
    "pzr_balance": 1550,  // +50 XP
    "social_rewards": 50,
    "total_missions_completed": 6,
    ...
  }
}
```

**Response** (manual review required):
```json
{
  "success": true,
  "status": "pending",
  "message": "Mission submitted for review. You'll be notified when approved."
}
```

**Error** (already completed):
```json
{
  "error": "Mission already completed"
}
```

**Error** (max nodes reached):
```json
{
  "error": "Maximum 3 node missions allowed per wallet"
}
```

---

### GET /api/testnet/leaderboard

Get top users ranked by XP. **Minimum 200 XP** to appear.

**Query Parameters**:
- `limit` (optional): Number of users to return (default: 100)

**Example**: `GET /api/testnet/leaderboard?limit=50`

**Response**:
```json
[
  {
    "rank": 1,
    "wallet_address": "0x1234...",
    "chain_type": "evm",
    "pzr_balance": 8500,
    "node_rewards": 6000,
    "invite_rewards": 1500,
    "social_rewards": 1000,
    "total_missions_completed": 15,
    "created_at": "2025-03-01T10:00:00Z"
  },
  ...
]
```

**Cache**: 5 minutes

---

### GET /api/testnet/stats

Get overall testnet statistics.

**Response**:
```json
{
  "total_users": 1234,
  "total_pzr_distributed": 456789,
  "total_missions_completed": 5678,
  "total_active_nodes": 89
}
```

**Cache**: 2 minutes

---

## Admin Endpoints

All admin endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### POST /api/admin/login

Authenticate as admin. **Rate limit**: 5 attempts/15 minutes per IP.

**Request**:
```json
{
  "username": "admin@example.com",
  "password": "your_password"
}
```

**Response** (success):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin@example.com",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response** (failure):
```json
{
  "error": "Invalid credentials"
}
```

**Token Expiry**: 24 hours

---

### GET /api/admin/check-setup

Check if admin account exists (public endpoint).

**Response**:
```json
{
  "admin_exists": true
}
```

---

### POST /api/admin/send-verification-code

Send 6-digit verification code to authorized email. **Rate limit**: 5 requests/15 minutes per IP.

**Request**:
```json
{
  "email": "pozzerinc@gmail.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

**Authorized Emails**:
- `pozzerinc@gmail.com`
- `henriquesmbc@gmail.com`

**Code Expiry**: 10 minutes

---

### POST /api/admin/verify-and-create

Create admin account using verification code.

**Request**:
```json
{
  "email": "pozzerinc@gmail.com",
  "code": "123456",
  "password": "SecurePassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Admin account created successfully"
}
```

---

### GET /api/admin/stats

Get dashboard statistics. **Requires JWT**.

**Response**:
```json
{
  "total_users": 1234,
  "total_pzr_distributed": 456789,
  "pending_verifications": 5,
  "today_users": 12,
  "top_referrers": [
    {
      "wallet_address": "0x1234...",
      "referral_code": "PZR_ABC123",
      "pzr_balance": 8500,
      "invite_rewards": 1500,
      "referral_count": 7
    },
    ...
  ],
  "security": {
    "last_24h": {
      "total_requests": 1234,
      "suspicious_requests": 5,
      "blocked_requests": 2,
      "unique_ips": 567
    },
    "suspicious_ips": [
      {
        "ip_address": "123.45.67.89",
        "request_count": 45,
        "suspicious_count": 12,
        "last_seen": "2025-03-15T10:30:00Z"
      },
      ...
    ]
  }
}
```

---

### GET /api/admin/verifications/pending

Get missions awaiting manual approval. **Requires JWT**.

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 5,
    "wallet_address": "0x1234...",
    "mission_id": "social_post",
    "mission_type": "social",
    "status": "pending",
    "proof_url": null,
    "reward_amount": 150,
    "created_at": "2025-03-15T09:00:00Z",
    "pzr_balance": 1200,
    "total_missions_completed": 8
  },
  ...
]
```

---

### POST /api/admin/verifications/:id/review

Approve or reject a mission verification. **Requires JWT**.

**Request**:
```json
{
  "action": "approve"  // or "reject"
}
```

**Response**:
```json
{
  "success": true,
  "action": "approve"
}
```

**Effects** (on approve):
- Creates `user_missions` record
- Credits XP to user
- Triggers referral bonus if first mission

---

### GET /api/admin/users

Get paginated list of users. **Requires JWT**.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Users per page (default: 50)

**Example**: `GET /api/admin/users?page=2&limit=100`

**Response**:
```json
{
  "users": [...],
  "total": 1234,
  "page": 2,
  "limit": 100,
  "total_pages": 13
}
```

---

### POST /api/admin/users/:wallet/adjust-xp

Manually adjust user XP. **Requires JWT**.

**Request**:
```json
{
  "amount": 500,  // Can be negative
  "reason": "Compensation for bug"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Adjusted 0x1234... by 500 XP. Reason: Compensation for bug"
}
```

---

### POST /api/admin/users/:wallet/ban

Ban or unban a user. **Requires JWT**.

**Request**:
```json
{
  "banned": true  // or false
}
```

**Response**:
```json
{
  "success": true,
  "banned": true
}
```

**Effect**: Sets `is_whitelisted` to 0 (banned) or 1 (active)

---

### GET /api/admin/security/logs

Get security request logs. **Requires JWT**.

**Query Parameters**:
- `limit` (optional): Number of logs (default: 100)
- `filter` (optional): `all`, `suspicious`, `errors` (default: `all`)

**Example**: `GET /api/admin/security/logs?filter=suspicious&limit=50`

**Response**:
```json
[
  {
    "id": 1,
    "ip_address": "123.45.67.89",
    "endpoint": "/api/testnet/mission/complete",
    "method": "POST",
    "status_code": 429,
    "user_agent": "Mozilla/5.0...",
    "country": "BR",
    "reason": "Rate limit exceeded",
    "created_at": "2025-03-15T10:30:00Z"
  },
  ...
]
```

---

### GET /api/admin/security/dashboard

Get comprehensive security overview. **Requires JWT**.

**Response**:
```json
{
  "stats_24h": {
    "total_requests": 1234,
    "suspicious_requests": 15,
    "blocked_requests": 5,
    "unique_ips": 567
  },
  "stats_7d": {
    "total_requests": 8765,
    "suspicious_requests": 87,
    "blocked_requests": 23,
    "unique_ips": 1234
  },
  "suspicious_ips": [...],
  "top_endpoints": [
    {
      "endpoint": "/api/testnet/connect",
      "hit_count": 345,
      "suspicious_count": 5
    },
    ...
  ]
}
```

---

## Rate Limits

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| Global (all endpoints) | 60 requests | 1 minute | Per IP |
| `/api/testnet/connect` | 5 requests | 1 minute | Per IP |
| `/api/testnet/mission/complete` | 10 requests | 1 minute | Per IP + wallet |
| `/api/admin/login` | 5 attempts | 15 minutes | Per IP |
| `/api/admin/send-verification-code` | 5 requests | 15 minutes | Per IP |

**Rate Limit Response**:
```json
{
  "error": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

**Status Code**: `429 Too Many Requests`

---

## Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `400` | Bad Request | Invalid input, missing fields |
| `401` | Unauthorized | Invalid credentials, signature failed |
| `403` | Forbidden | API key invalid, unauthorized email |
| `404` | Not Found | User/resource doesn't exist |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Database error, configuration issue |

**Error Response Format**:
```json
{
  "error": "Human-readable error message"
}
```

---

## Examples

### Complete Mission Flow (Node.js)

```javascript
const axios = require('axios');
const { ethers } = require('ethers');

const wallet = new ethers.Wallet('your_private_key');
const baseURL = 'https://pozzer.io';

async function completeMission() {
  // Step 1: Request nonce
  const nonceRes = await axios.post(`${baseURL}/api/auth/request-nonce`, {
    wallet_address: wallet.address
  });
  
  const { nonce, message } = nonceRes.data;
  
  // Step 2: Sign message
  const signature = await wallet.signMessage(message);
  
  // Step 3: Connect wallet (if not already connected)
  const connectRes = await axios.post(`${baseURL}/api/testnet/connect`, {
    wallet_address: wallet.address,
    chain_type: 'evm',
    signature,
    nonce
  });
  
  console.log('User registered:', connectRes.data.user);
  
  // Step 4: Complete mission
  const missionRes = await axios.post(`${baseURL}/api/testnet/mission/complete`, {
    wallet_address: wallet.address,
    mission_id: 'social_twitter',
    mission_type: 'social'
  });
  
  console.log('Mission completed! New balance:', missionRes.data.user.pzr_balance);
}

completeMission();
```

---

### Admin Dashboard Access (cURL)

```bash
# Login
TOKEN=$(curl -s -X POST https://pozzer.io/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"your_password"}' \
  | jq -r '.token')

# Get stats
curl -H "Authorization: Bearer $TOKEN" \
  https://pozzer.io/api/admin/stats

# Approve verification
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}' \
  https://pozzer.io/api/admin/verifications/1/review
```

---

## Changelog

### v2.0 (March 2025)
- Added wallet signature verification
- Implemented rate limiting on all endpoints
- Added admin security dashboard
- Introduced mission verification system

### v1.0 (January 2025)
- Initial API release
- Basic testnet endpoints
- Admin authentication

---

**Support**: [pozzerinc@gmail.com](mailto:pozzerinc@gmail.com)  
**Documentation**: [https://pozzer.io/docs](https://pozzer.io/docs)
