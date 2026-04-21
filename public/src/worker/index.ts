import { Hono } from "hono";
import { cors } from "hono/cors";
import { RATE_LIMITS } from "./rate-limiter";
import { hashPassword, verifyPassword, generateToken, requireAdmin, AdminUser } from "./admin-auth";
import {
  sanitizeWalletAddress,
  sanitizeMissionId,
  sanitizeChainType,
  sanitizeReferralCode
} from "./utils/sanitizer";
import {
  generateNonce,
  createSignMessage,
  verifyEVMSignature,
  verifySolanaSignature,
  storeNonce,
  verifyAndConsumeNonce,
  cleanupExpiredNonces
} from "./utils/signature-verifier";
import { generateDynamicCode } from "./endpoints/dynamic-codes";
import { cleanupOldLogs, getSecurityStats, getSuspiciousIPs } from "./utils/log-cleaner";
import { cache, CACHE_TTL } from "./utils/cache-manager";

type Variables = {
  adminUser: AdminUser;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS policy - only allow specific trusted domains
app.use("/*", cors({
  origin: (origin) => {
    const allowedOrigins = [
      "https://pozzer.io",
      "https://www.pozzer.io",
      "http://localhost:5173",
      "http://localhost:4173"
    ];
    
    // Allow same-origin requests (no Origin header)
    if (!origin) {
      return "*";
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    
    // For production: allow requests without origin (direct API calls)
    // Block unauthorized origins from browsers
    if (!origin) {
      return allowedOrigins[0];
    }
    
    console.log(`[SECURITY] Blocked request from unauthorized origin: ${origin}`);
    return null;
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
}));

// Testnet lock status check (public endpoint)
app.get("/api/testnet/lock-status", async (c) => {
  const unlockDate = c.env.TESTNET_UNLOCK_DATE;
  
  if (!unlockDate) {
    return c.json({ locked: false });
  }
  
  const unlockTime = new Date(unlockDate).getTime();
  const now = new Date().getTime();
  
  if (now >= unlockTime) {
    return c.json({ locked: false });
  }
  
  return c.json({ 
    locked: true, 
    unlockDate: unlockDate 
  });
});

// Testnet password check (public endpoint)
app.post("/api/testnet/check-password", async (c) => {
  try {
    const { password } = await c.req.json();
    const correctPassword = c.env.TESTNET_EARLY_ACCESS_PASSWORD;
    
    if (!correctPassword) {
      return c.json({ error: "Password not configured" }, 500);
    }
    
    if (password === correctPassword) {
      return c.json({ success: true });
    }
    
    return c.json({ error: "Incorrect password" }, 401);
  } catch (error) {
    return c.json({ error: "Invalid request" }, 400);
  }
});

// IP-based rate limiting for public endpoints
app.use("/api/*", async (c, next) => {
  const path = c.req.path;
  const method = c.req.method;
  
  // Admin login endpoints have their own specific rate limiting (applied below)
  // Skip general rate limit for admin endpoints (they have their own JWT protection)
  if (path.startsWith("/api/admin")) {
    return next();
  }
  
  // Apply IP-based rate limiting
  const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown';
  const userAgent = c.req.header('User-Agent') || 'unknown';
  const country = c.req.header('CF-IPCountry') || 'unknown';
  
  const db = c.env.DB;
  const rateCheck = await RATE_LIMITS.IP_BASED_PUBLIC.checkLimit(db, ipAddress, 'global_ip_limit');
  
  if (!rateCheck.allowed) {
    // Log suspicious activity
    await db.prepare(`
      INSERT INTO request_logs (ip_address, endpoint, method, status_code, user_agent, country, reason)
      VALUES (?, ?, ?, 429, ?, ?, 'Rate limit exceeded')
    `).bind(ipAddress, path, method, userAgent, country).run();
    
    return c.json({ 
      error: "Too many requests from your IP address. Please try again later.",
      retry_after: 60 
    }, 429);
  }
  
  return next();
});

// Comprehensive request logging and security monitoring
app.use("/api/*", async (c, next) => {
  const path = c.req.path;
  const method = c.req.method;
  const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown';
  const userAgent = c.req.header('User-Agent') || 'unknown';
  const country = c.req.header('CF-IPCountry') || 'unknown';
  const origin = c.req.header('Origin') || '';
  const db = c.env.DB;
  
  // Detect suspicious patterns
  let suspicious = false;
  let reason = '';
  
  // Pattern 1: No user agent (likely bot)
  if (userAgent === 'unknown' || userAgent.length < 10) {
    suspicious = true;
    reason = 'Missing or invalid user agent';
  }
  
  // Pattern 2: Known bot patterns in user agent (exclude legitimate bots)
  const maliciousBotPatterns = ['scraper', 'harvester', 'collector'];
  if (maliciousBotPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
    suspicious = true;
    reason = 'Malicious bot pattern detected';
  }
  
  // Pattern 3: Suspicious SQL injection attempts in query params
  const queryString = c.req.url.split('?')[1] || '';
  const sqlPatterns = ['union', 'select', 'drop', 'delete', 'insert', 'update', '--', ';'];
  if (sqlPatterns.some(pattern => queryString.toLowerCase().includes(pattern))) {
    suspicious = true;
    reason = 'SQL injection attempt detected';
  }
  
  // Pattern 4: Unauthorized origin attempting to access protected endpoints
  const allowedOrigins = [
    "https://pozzer.io",
    "https://www.pozzer.io",
    "http://localhost:5173",
    "http://localhost:4173"
  ];
  
  const isAllowedOrigin = !origin || 
    allowedOrigins.some(allowed => origin.startsWith(allowed));
  
  if (origin && !isAllowedOrigin) {
    suspicious = true;
    reason = reason ? `${reason}; Unauthorized origin: ${origin}` : `Unauthorized origin: ${origin}`;
  }
  
  // Pattern 5: Excessive request frequency from same IP (basic check)
  const recentRequests = await db.prepare(`
    SELECT COUNT(*) as count FROM request_logs 
    WHERE ip_address = ? AND created_at > datetime('now', '-1 minute')
  `).bind(ipAddress).first();
  
  if ((recentRequests as any)?.count > 30) {
    suspicious = true;
    reason = reason ? `${reason}; High request frequency` : 'High request frequency';
  }
  
  // Execute the request
  await next();
  
  const statusCode = c.res.status;
  
  // Log all requests to protected endpoints or suspicious requests
  const shouldLog = suspicious || statusCode >= 400 || path.includes('/admin') || path.includes('/mission');
  
  if (shouldLog) {
    try {
      await db.prepare(`
        INSERT INTO request_logs (ip_address, endpoint, method, status_code, user_agent, country, reason)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        ipAddress, 
        path, 
        method, 
        statusCode,
        userAgent.substring(0, 200), // Limit length
        country, 
        reason || (statusCode >= 400 ? `HTTP ${statusCode} Error` : 'Normal request')
      ).run();
    } catch (err) {
      // Don't let logging errors break the request
      console.error('[LOGGING ERROR]', err);
    }
  }
  
  // Console log suspicious activity
  if (suspicious) {
    console.log(`[SECURITY ALERT] ${reason} | IP: ${ipAddress} | Path: ${path} | Status: ${statusCode}`);
  }
});

// API Key authentication middleware
// Protects /api/testnet/* routes from external access
// Public endpoints (/api/network-stats, /api/validators) are open to everyone
app.use("/api/*", async (c, next) => {
  const path = c.req.path;
  
  // Public endpoints - no authentication required
  const publicEndpoints = [
    "/api/network-stats",
    "/api/validators"
  ];
  
  // Testnet, admin, and auth endpoints are also public (have their own protection)
  const isPublicEndpoint = publicEndpoints.includes(path) || path.startsWith("/api/testnet") || path.startsWith("/api/admin") || path.startsWith("/api/auth");
  
  if (isPublicEndpoint) {
    return next();
  }
  
  // For other endpoints, check origin or API key
  const apiKey = c.req.header("X-API-Key");
  const origin = c.req.header("Origin") || "";
  const referer = c.req.header("Referer") || "";
  
  // Allow requests from the same site (internal calls from frontend)
  const allowedOrigins = [
    "https://pozzer.io",
    "https://www.pozzer.io",
    "http://pozzer.io",
    "http://www.pozzer.io",
    "http://localhost:5173",
    "http://localhost:4173"
  ];
  
  const isInternalRequest = allowedOrigins.some(allowed => 
    origin.startsWith(allowed) || referer.startsWith(allowed)
  );
  
  // If internal request, allow without API key
  if (isInternalRequest) {
    return next();
  }
  
  // External requests to protected endpoints require valid API key
  const validApiKey = c.env.API_KEY;
  
  if (!validApiKey) {
    // If no API key is configured, block external requests
    return c.json({ error: "API access not configured" }, 503);
  }
  
  if (!apiKey) {
    return c.json({ error: "API key required. Include X-API-Key header." }, 401);
  }
  
  if (apiKey !== validApiKey) {
    return c.json({ error: "Invalid API key" }, 403);
  }
  
  return next();
});

// ========== SIGNATURE VERIFICATION ENDPOINTS ==========

// Get nonce for wallet signature
app.post("/api/auth/request-nonce", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const { wallet_address } = body;
  
  // Sanitize wallet address
  const cleanWallet = sanitizeWalletAddress(wallet_address);
  if (!cleanWallet) {
    return c.json({ error: "Invalid wallet address" }, 400);
  }
  
  // Generate nonce
  const nonce = generateNonce();
  
  // Store nonce
  await storeNonce(db, cleanWallet, nonce);
  
  // Create message to sign
  const message = createSignMessage(cleanWallet, nonce);
  
  // Clean up old nonces
  await cleanupExpiredNonces(db);
  
  return c.json({ nonce, message });
});

// Verify signature and authenticate wallet
app.post("/api/auth/verify-signature", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const { wallet_address, signature, nonce, chain_type } = body;
  
  // Sanitize inputs
  const cleanWallet = sanitizeWalletAddress(wallet_address);
  const cleanChain = sanitizeChainType(chain_type);
  
  if (!cleanWallet || !signature || !nonce || !cleanChain) {
    return c.json({ error: "Missing or invalid parameters" }, 400);
  }
  
  // Verify nonce is valid and not used
  const nonceValid = await verifyAndConsumeNonce(db, cleanWallet, nonce);
  if (!nonceValid) {
    return c.json({ error: "Invalid or expired nonce" }, 400);
  }
  
  // Recreate the message
  const message = createSignMessage(cleanWallet, nonce);
  
  // Verify signature based on chain type
  let signatureValid = false;
  if (cleanChain === 'evm') {
    signatureValid = await verifyEVMSignature(message, signature, cleanWallet);
  } else if (cleanChain === 'solana') {
    signatureValid = await verifySolanaSignature(message, signature, cleanWallet);
  }
  
  if (!signatureValid) {
    return c.json({ error: "Invalid signature" }, 401);
  }
  
  // Signature is valid - wallet ownership proven
  return c.json({ 
    success: true, 
    verified: true,
    wallet_address: cleanWallet,
    chain_type: cleanChain
  });
});

// Generate dynamic verification code for social missions
app.post("/api/testnet/generate-code", async (c) => {
  return generateDynamicCode(c);
});

// ========== NETWORK STATISTICS ENDPOINTS ==========

// Get network statistics (cached)
app.get("/api/network-stats", async (c) => {
  const db = c.env.DB;
  
  // Check cache first
  const cacheKey = 'network_stats';
  const cached = cache.get(cacheKey);
  if (cached) {
    return c.json(cached);
  }
  
  const stats = await db.prepare(
    "SELECT * FROM network_stats ORDER BY id DESC LIMIT 1"
  ).first();
  
  const active_validators = await db.prepare("SELECT COUNT(*) as count FROM validators WHERE is_active = 1").first();
  
  const result = {
    ...stats,
    tps: 0,
    active_validators: active_validators?.count || 0
  };
  
  // Cache for 30 seconds
  cache.set(cacheKey, result, CACHE_TTL.NETWORK_STATS);
  
  return c.json(result);
});

// Get validators (cached)
app.get("/api/validators", async (c) => {
  const db = c.env.DB;
  
  // Check cache first
  const cacheKey = 'validators';
  const cached = cache.get(cacheKey);
  if (cached) {
    return c.json(cached);
  }
  
  const validators = await db.prepare(
    "SELECT * FROM validators WHERE is_active = 1 ORDER BY total_blocks_validated DESC"
  ).all();
  
  const result = validators.results || [];
  
  // Cache for 1 minute
  cache.set(cacheKey, result, CACHE_TTL.VALIDATORS);
  
  return c.json(result);
});

// ========== TESTNET USER ENDPOINTS ==========

// Generate unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PZR_';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Connect wallet / Register user
app.post("/api/testnet/connect", async (c) => {
  const db = c.env.DB;
  
  // Rate limiting by IP
  const ipAddress = c.req.header('CF-Connecting-IP') || 'unknown';
  const ipRateCheck = await RATE_LIMITS.CONNECT_WALLET.checkLimit(db, ipAddress, '/api/testnet/connect');
  if (!ipRateCheck.allowed) {
    return c.json({ error: "Rate limit exceeded. Please try again later." }, 429);
  }
  
  const body = await c.req.json();
  const { wallet_address, chain_type, referred_by, signature, nonce } = body;
  
  // Sanitize inputs
  const cleanWallet = sanitizeWalletAddress(wallet_address);
  const cleanChain = sanitizeChainType(chain_type);
  const cleanReferral = referred_by ? sanitizeReferralCode(referred_by) : null;
  
  if (!cleanWallet || !cleanChain) {
    return c.json({ error: "Invalid wallet address or chain type" }, 400);
  }
  
  // CRITICAL: Verify wallet ownership with signature (ENFORCED)
  if (!signature || !nonce) {
    return c.json({ error: "Signature required. Please sign the message to verify wallet ownership." }, 400);
  }
  
  // Verify nonce
  const nonceValid = await verifyAndConsumeNonce(db, cleanWallet, nonce);
  if (!nonceValid) {
    return c.json({ error: "Invalid or expired nonce. Please request a new signature." }, 400);
  }
  
  // Verify signature
  const message = createSignMessage(cleanWallet, nonce);
  let signatureValid = false;
  
  if (cleanChain === 'evm') {
    signatureValid = await verifyEVMSignature(message, signature, cleanWallet);
  } else if (cleanChain === 'solana') {
    signatureValid = await verifySolanaSignature(message, signature, cleanWallet);
  }
  
  if (!signatureValid) {
    return c.json({ error: "Invalid signature. Wallet ownership verification failed." }, 401);
  }
  
  // Check if user already exists
  const existingUser = await db.prepare(
    "SELECT * FROM testnet_users WHERE wallet_address = ?"
  ).bind(cleanWallet).first();
  
  if (existingUser) {
    // Update last connection
    await db.prepare(
      "UPDATE testnet_users SET updated_at = CURRENT_TIMESTAMP WHERE wallet_address = ?"
    ).bind(cleanWallet).run();
    
    return c.json({ user: existingUser, isNew: false });
  }
  
  // Create new user
  const referralCode = generateReferralCode();
  
  // Check if referred_by code is valid
  let referredByUser = null;
  if (cleanReferral) {
    referredByUser = await db.prepare(
      "SELECT id, wallet_address FROM testnet_users WHERE referral_code = ?"
    ).bind(cleanReferral).first();
  }
  
  await db.prepare(`
    INSERT INTO testnet_users 
    (wallet_address, chain_type, referral_code, referred_by, pzr_balance, is_whitelisted)
    VALUES (?, ?, ?, ?, 0, 1)
  `).bind(
    cleanWallet,
    cleanChain,
    referralCode,
    referredByUser ? cleanReferral : null
  ).run();
  
  const newUser = await db.prepare(
    "SELECT * FROM testnet_users WHERE wallet_address = ?"
  ).bind(cleanWallet).first();
  
  // Note: Referral bonus (200 XP) is only given when the referred user completes their first mission
  // This prevents abuse from people just connecting wallets
  
  return c.json({ user: newUser, isNew: true });
});

// Get user by wallet address
app.get("/api/testnet/user/:wallet", async (c) => {
  const db = c.env.DB;
  const wallet = c.req.param("wallet");
  
  // Sanitize wallet address
  const cleanWallet = sanitizeWalletAddress(wallet);
  if (!cleanWallet) {
    return c.json({ error: "Invalid wallet address" }, 400);
  }
  
  const user = await db.prepare(
    "SELECT * FROM testnet_users WHERE wallet_address = ?"
  ).bind(cleanWallet).first();
  
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  
  // Get user's missions
  const missions = await db.prepare(
    "SELECT * FROM user_missions WHERE user_id = ?"
  ).bind(user.id).all();
  
  // Get user's nodes
  const nodes = await db.prepare(
    "SELECT * FROM user_nodes WHERE user_id = ?"
  ).bind(user.id).all();
  
  // Count referrals (only those who completed at least 1 mission)
  const referrals = await db.prepare(
    "SELECT COUNT(*) as count FROM testnet_users WHERE referred_by = ? AND total_missions_completed >= 1"
  ).bind(user.referral_code).first();
  
  return c.json({
    user,
    missions: missions.results || [],
    nodes: nodes.results || [],
    referral_count: referrals?.count || 0
  });
});

// Complete a mission
app.post("/api/testnet/mission/complete", async (c) => {
  const db = c.env.DB;
  
  // Rate limiting by IP
  const ipAddress = c.req.header('CF-Connecting-IP') || 'unknown';
  const ipRateCheck = await RATE_LIMITS.MISSION_COMPLETE.checkLimit(db, ipAddress, '/api/testnet/mission/complete');
  if (!ipRateCheck.allowed) {
    return c.json({ error: "Too many mission attempts. Please slow down." }, 429);
  }
  
  const body = await c.req.json();
  const { wallet_address, mission_id, mission_type } = body;
  
  // Sanitize inputs
  const cleanWallet = sanitizeWalletAddress(wallet_address);
  const cleanMissionId = sanitizeMissionId(mission_id);
  
  if (!cleanWallet || !cleanMissionId || !mission_type) {
    return c.json({ error: "Missing or invalid required fields" }, 400);
  }
  
  // Validate mission_type
  if (!['node', 'social', 'invite'].includes(mission_type)) {
    return c.json({ error: "Invalid mission type" }, 400);
  }
  
  // Get user
  const user = await db.prepare(
    "SELECT * FROM testnet_users WHERE wallet_address = ?"
  ).bind(cleanWallet).first();
  
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  
  // Rate limiting by wallet address
  const walletIdent = `wallet_${cleanWallet}`;
  const walletRateCheck = await RATE_LIMITS.WALLET_BASED.checkLimit(db, walletIdent, '/api/testnet/mission/complete');
  if (!walletRateCheck.allowed) {
    return c.json({ error: "Too many mission attempts from this wallet. Please try again later." }, 429);
  }
  
  // Define mission rewards on server-side (NEVER trust client)
  const MISSION_REWARDS: Record<string, number> = {
    node_provider: 1000,
    node_validator: 2000,
    node_worker: 700,
    node_delegate: 400,
    social_twitter: 50,
    social_telegram: 50,
    social_post: 150,
    social_daily: 10,
  };
  
  // Mission verification logic based on type
  let requiresManualApproval = false;
  let autoApproved = false;
  
  // Daily mission: auto-approve
  if (cleanMissionId === 'social_daily') {
    autoApproved = true;
  }
  // Twitter/Telegram: auto-approve (simplified - no verification code needed)
  else if (cleanMissionId === 'social_twitter' || cleanMissionId === 'social_telegram') {
    autoApproved = true;
  }
  // Post/Retweet: requires manual approval
  else if (cleanMissionId === 'social_post') {
    requiresManualApproval = true;
  }
  // Node missions: auto-approve
  else if (mission_type === 'node') {
    autoApproved = true;
  }
  
  // Get reward from server-side map (NEVER from client)
  const reward = MISSION_REWARDS[cleanMissionId] || 0;
  if (reward === 0) {
    return c.json({ error: "Unknown mission" }, 400);
  }
  
  // If requires manual approval, create verification request
  if (requiresManualApproval) {
    // Check if already submitted
    const existing = await db.prepare(
      "SELECT * FROM mission_verifications WHERE user_id = ? AND mission_id = ?"
    ).bind(user.id, cleanMissionId).first();
    
    if (existing) {
      const status = (existing as any).status;
      if (status === 'pending') {
        return c.json({ error: "Mission verification pending approval", status: 'pending' }, 400);
      } else if (status === 'approved') {
        return c.json({ error: "Mission already approved and completed" }, 400);
      } else if (status === 'rejected') {
        return c.json({ error: "Mission was rejected. Contact support." }, 400);
      }
    }
    
    await db.prepare(`
      INSERT INTO mission_verifications 
      (user_id, wallet_address, mission_id, mission_type, status, reward_amount)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `).bind(user.id, cleanWallet, cleanMissionId, mission_type, reward).run();
    
    return c.json({ 
      success: true, 
      status: 'pending',
      message: "Mission submitted for review. You'll be notified when approved." 
    });
  }
  
  if (!autoApproved) {
    return c.json({ error: "Mission type not recognized" }, 400);
  }
  
  // Anti-bot: Limit of 3 node missions per wallet
  if (mission_type === 'node') {
    const nodeCount = await db.prepare(
      "SELECT COUNT(*) as count FROM user_missions WHERE user_id = ? AND mission_type = 'node' AND is_completed = 1"
    ).bind(user.id).first();
    
    const count = (nodeCount as any)?.count || 0;
    if (count >= 3) {
      return c.json({ error: "Maximum 3 node missions allowed per wallet" }, 400);
    }
  }
  
  // Check if mission already completed (with daily reset for social_daily)
  let existingMission;
  if (cleanMissionId === 'social_daily') {
    // Daily mission: check if completed today
    existingMission = await db.prepare(
      "SELECT * FROM user_missions WHERE user_id = ? AND mission_id = ? AND DATE(completed_at) = DATE('now')"
    ).bind(user.id, cleanMissionId).first();
  } else {
    // Regular mission: check if ever completed
    existingMission = await db.prepare(
      "SELECT * FROM user_missions WHERE user_id = ? AND mission_id = ?"
    ).bind(user.id, cleanMissionId).first();
  }
  
  if (existingMission?.is_completed) {
    return c.json({ error: "Mission already completed" }, 400);
  }
  
  // Create or update mission record
  if (existingMission) {
    await db.prepare(`
      UPDATE user_missions SET 
        is_completed = 1, 
        reward_claimed = 1,
        reward_amount = ?,
        completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND mission_id = ?
    `).bind(reward, user.id, cleanMissionId).run();
  } else {
    await db.prepare(`
      INSERT INTO user_missions 
      (user_id, mission_id, mission_type, is_completed, reward_claimed, reward_amount, completed_at)
      VALUES (?, ?, ?, 1, 1, ?, CURRENT_TIMESTAMP)
    `).bind(user.id, cleanMissionId, mission_type, reward).run();
  }
  
  // Update user's PZR balance based on mission type (validate type to prevent SQL injection)
  const REWARD_COLUMNS: Record<string, string> = {
    node: 'node_rewards',
    social: 'social_rewards',
    invite: 'invite_rewards'
  };
  
  const rewardColumn = REWARD_COLUMNS[mission_type];
  if (!rewardColumn) {
    return c.json({ error: "Invalid mission type" }, 400);
  }
  
  await db.prepare(`
    UPDATE testnet_users SET 
      pzr_balance = pzr_balance + ?,
      ${rewardColumn} = ${rewardColumn} + ?,
      total_missions_completed = total_missions_completed + 1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(reward, reward, user.id).run();
  
  // Check if this is user's first mission AND they were referred
  // If so, give 200 XP bonus to the referrer
  const userRecord = user as { total_missions_completed: number; referred_by: string | null };
  if (userRecord.total_missions_completed === 0 && userRecord.referred_by) {
    // This is first mission completion for a referred user - reward the referrer
    await db.prepare(`
      UPDATE testnet_users SET 
        invite_rewards = invite_rewards + 200, 
        pzr_balance = pzr_balance + 200 
      WHERE referral_code = ?
    `).bind(userRecord.referred_by).run();
  }
  
  // Get updated user
  const updatedUser = await db.prepare(
    "SELECT * FROM testnet_users WHERE id = ?"
  ).bind(user.id).first();
  
  return c.json({ success: true, user: updatedUser });
});

// Get leaderboard (cached)
app.get("/api/testnet/leaderboard", async (c) => {
  const db = c.env.DB;
  const limit = Number(c.req.query("limit")) || 100;
  
  // Check cache first
  const cacheKey = `leaderboard_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return c.json(cached);
  }
  
  const leaders = await db.prepare(`
    SELECT 
      wallet_address,
      chain_type,
      pzr_balance,
      node_rewards,
      invite_rewards,
      social_rewards,
      total_missions_completed,
      created_at
    FROM testnet_users 
    WHERE pzr_balance >= 200
    ORDER BY pzr_balance DESC 
    LIMIT ?
  `).bind(limit).all();
  
  // Add rank to each user
  const rankedLeaders = (leaders.results || []).map((user: any, index: number) => ({
    ...user,
    rank: index + 1
  }));
  
  // Cache for 5 minutes
  cache.set(cacheKey, rankedLeaders, CACHE_TTL.LEADERBOARD);
  
  return c.json(rankedLeaders);
});

// Get testnet stats (cached)
app.get("/api/testnet/stats", async (c) => {
  const db = c.env.DB;
  
  // Check cache first
  const cacheKey = 'testnet_stats';
  const cached = cache.get(cacheKey);
  if (cached) {
    return c.json(cached);
  }
  
  const totalUsers = await db.prepare(
    "SELECT COUNT(*) as count FROM testnet_users"
  ).first();
  
  const totalPZR = await db.prepare(
    "SELECT SUM(pzr_balance) as total FROM testnet_users"
  ).first();
  
  const totalMissions = await db.prepare(
    "SELECT COUNT(*) as count FROM user_missions WHERE is_completed = 1"
  ).first();
  
  const totalNodes = await db.prepare(
    "SELECT COUNT(*) as count FROM user_nodes WHERE is_active = 1"
  ).first();
  
  const result = {
    total_users: totalUsers?.count || 0,
    total_pzr_distributed: totalPZR?.total || 0,
    total_missions_completed: totalMissions?.count || 0,
    total_active_nodes: totalNodes?.count || 0
  };
  
  // Cache for 2 minutes
  cache.set(cacheKey, result, CACHE_TTL.TESTNET_STATS);
  
  return c.json(result);
});

// ========== ADMIN ENDPOINTS ==========

// Admin login
app.post("/api/admin/login", async (c) => {
  const db = c.env.DB;
  
  // SECURITY: Rate limit admin login attempts to prevent brute force
  const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown';
  const loginRateCheck = await RATE_LIMITS.ADMIN_LOGIN.checkLimit(db, ipAddress, '/api/admin/login');
  
  if (!loginRateCheck.allowed) {
    return c.json({ 
      error: "Too many login attempts. Please try again in 15 minutes.",
      retry_after: 900
    }, 429);
  }
  
  const body = await c.req.json();
  const { username, password } = body;
  
  if (!username || !password) {
    return c.json({ error: "Username and password required" }, 400);
  }
  
  // Get admin user
  const admin = await db.prepare(
    "SELECT * FROM admin_users WHERE username = ? AND is_active = 1"
  ).bind(username).first();
  
  if (!admin) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  
  // Verify password
  const validPassword = await verifyPassword(password, (admin as any).password_hash);
  if (!validPassword) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  
  // Update last login
  await db.prepare(
    "UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind((admin as any).id).run();
  
  // Generate token
  const token = generateToken({
    id: (admin as any).id,
    username: (admin as any).username,
    email: (admin as any).email,
    role: (admin as any).role
  }, c.env.ADMIN_JWT_SECRET);
  
  return c.json({ 
    token,
    user: {
      id: (admin as any).id,
      username: (admin as any).username,
      email: (admin as any).email,
      role: (admin as any).role
    }
  });
});

// Check if admin exists
app.get("/api/admin/check-setup", async (c) => {
  const db = c.env.DB;
  const adminExists = await db.prepare("SELECT id FROM admin_users LIMIT 1").first();
  return c.json({ admin_exists: !!adminExists });
});

// Send verification code to authorized email
app.post("/api/admin/send-verification-code", async (c) => {
  const db = c.env.DB;
  
  // SECURITY: Rate limit verification code requests to prevent spam
  const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown';
  const codeRateCheck = await RATE_LIMITS.ADMIN_LOGIN.checkLimit(db, ipAddress, '/api/admin/send-code');
  
  if (!codeRateCheck.allowed) {
    return c.json({ 
      error: "Too many verification code requests. Please try again in 15 minutes.",
      retry_after: 900
    }, 429);
  }
  
  const body = await c.req.json();
  const { email } = body;
  
  // Check if email is authorized (from environment variable)
  const authorizedEmailsStr = c.env.AUTHORIZED_ADMIN_EMAILS || '';
  const AUTHORIZED_EMAILS = authorizedEmailsStr.split(',').map(e => e.trim().toLowerCase());
  
  if (!AUTHORIZED_EMAILS.includes(email.toLowerCase())) {
    return c.json({ error: "This email is not authorized for admin access" }, 403);
  }
  
  // Check if admin already exists
  const existing = await db.prepare("SELECT id FROM admin_users WHERE email = ?").bind(email).first();
  if (existing) {
    return c.json({ error: "Admin account already exists for this email" }, 400);
  }
  
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
  
  // Save code to database
  await db.prepare(`
    INSERT INTO admin_verification_codes (email, code, expires_at)
    VALUES (?, ?, ?)
  `).bind(email, code, expiresAt).run();
  
  // Send email with code
  let emailResult;
  try {
    emailResult = await c.env.EMAILS.send({
      to: email,
      subject: "Pozzer Admin - Verification Code",
      html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #0a0a0a; font-family: Arial, Helvetica, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 8px; border: 1px solid #10b981;">
    <div style="padding: 32px 40px 24px 40px; border-bottom: 1px solid #10b981;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #10b981;">Pozzer Admin Setup</h1>
    </div>
    <div style="padding: 32px 40px;">
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #e5e5e5;">
        Your admin verification code is:
      </p>
      <div style="background-color: #0a0a0a; border: 2px solid #10b981; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #10b981; font-family: 'Courier New', monospace;">
          ${code}
        </div>
      </div>
      <p style="margin: 16px 0 0 0; font-size: 14px; line-height: 20px; color: #a3a3a3;">
        This code will expire in 10 minutes. Do not share this code with anyone.
      </p>
    </div>
    <div style="padding: 24px 40px; border-top: 1px solid #333333;">
      <p style="margin: 0; font-size: 12px; color: #737373; text-align: center;">© 2025 Pozzer. Admin Access Only.</p>
    </div>
  </div>
</body>
</html>
    `,
      text_body: `Your Pozzer admin verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
    });
  } catch (error: any) {
    console.error("Email send failed", error);
    // In development, email might fail due to restrictions - provide the code in the response
    return c.json({ 
      success: true, 
      message: "Verification code generated",
      dev_code: code, // Only for development - will be removed in production
      warning: "Email service restricted in development. Use the code provided below."
    });
  }
  
  if (!emailResult?.success) {
    console.error("Failed to send email:", emailResult?.error);
    // Fallback: return code in response for development
    return c.json({ 
      success: true, 
      message: "Verification code generated",
      dev_code: code,
      warning: "Email delivery failed. Use the code provided below."
    });
  }
  
  return c.json({ success: true, message: "Verification code sent to your email" });
});

// Verify code and create admin account
app.post("/api/admin/verify-and-create", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const { email, code, password } = body;
  
  if (!email || !code || !password) {
    return c.json({ error: "Email, code, and password are required" }, 400);
  }
  
  // Find valid verification code
  const verification = await db.prepare(`
    SELECT * FROM admin_verification_codes 
    WHERE email = ? AND code = ? AND is_used = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).bind(email, code).first();
  
  if (!verification) {
    return c.json({ error: "Invalid or expired verification code" }, 400);
  }
  
  // Mark code as used
  await db.prepare(
    "UPDATE admin_verification_codes SET is_used = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind((verification as any).id).run();
  
  // Check if admin already exists (race condition check)
  const existing = await db.prepare("SELECT id FROM admin_users WHERE email = ?").bind(email).first();
  if (existing) {
    return c.json({ error: "Admin account already exists" }, 400);
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create admin user
  await db.prepare(`
    INSERT INTO admin_users (username, password_hash, email, role)
    VALUES (?, ?, ?, 'admin')
  `).bind(email, passwordHash, email).run();
  
  return c.json({ success: true, message: "Admin account created successfully" });
});

// Get dashboard stats (protected)
app.get("/api/admin/stats", requireAdmin, async (c) => {
  const db = c.env.DB;
  
  const totalUsers = await db.prepare("SELECT COUNT(*) as count FROM testnet_users").first();
  const totalPZR = await db.prepare("SELECT SUM(pzr_balance) as total FROM testnet_users").first();
  const pendingVerifications = await db.prepare("SELECT COUNT(*) as count FROM mission_verifications WHERE status = 'pending'").first();
  const todayUsers = await db.prepare("SELECT COUNT(*) as count FROM testnet_users WHERE DATE(created_at) = DATE('now')").first();
  const topReferrers = await db.prepare(`
    SELECT wallet_address, referral_code, pzr_balance, invite_rewards,
           (SELECT COUNT(*) FROM testnet_users WHERE referred_by = t.referral_code AND total_missions_completed >= 1) as referral_count
    FROM testnet_users t
    WHERE invite_rewards > 0
    ORDER BY invite_rewards DESC
    LIMIT 10
  `).all();
  
  // Get security stats
  const securityStats = await getSecurityStats(db, 24);
  const suspiciousIPs = await getSuspiciousIPs(db, 5);
  
  // Run automatic log cleanup (keeps last 30 days)
  await cleanupOldLogs(db, 30);
  
  return c.json({
    total_users: totalUsers?.count || 0,
    total_pzr_distributed: totalPZR?.total || 0,
    pending_verifications: pendingVerifications?.count || 0,
    today_users: todayUsers?.count || 0,
    top_referrers: topReferrers.results || [],
    security: {
      last_24h: securityStats,
      suspicious_ips: suspiciousIPs
    }
  });
});

// Get pending mission verifications (protected)
app.get("/api/admin/verifications/pending", requireAdmin, async (c) => {
  const db = c.env.DB;
  
  const verifications = await db.prepare(`
    SELECT v.*, u.wallet_address, u.pzr_balance, u.total_missions_completed
    FROM mission_verifications v
    JOIN testnet_users u ON v.user_id = u.id
    WHERE v.status = 'pending'
    ORDER BY v.created_at ASC
  `).all();
  
  return c.json(verifications.results || []);
});

// Approve/reject mission verification (protected)
app.post("/api/admin/verifications/:id/review", requireAdmin, async (c) => {
  const db = c.env.DB;
  const verificationId = c.req.param("id");
  const body = await c.req.json();
  const { action } = body; // 'approve' or 'reject'
  const adminUser = c.get('adminUser') as { username: string };
  
  if (!action || !['approve', 'reject'].includes(action)) {
    return c.json({ error: "Invalid action. Must be 'approve' or 'reject'" }, 400);
  }
  
  // Get verification
  const verification = await db.prepare(
    "SELECT * FROM mission_verifications WHERE id = ?"
  ).bind(verificationId).first();
  
  if (!verification) {
    return c.json({ error: "Verification not found" }, 404);
  }
  
  const v = verification as any;
  
  if (v.status !== 'pending') {
    return c.json({ error: "Verification already reviewed" }, 400);
  }
  
  if (action === 'approve') {
    // Mark mission as completed and give rewards
    const reward = v.reward_amount || 0;
    const missionType = v.mission_type;
    const rewardColumn = missionType === 'node' ? 'node_rewards' 
      : missionType === 'social' ? 'social_rewards' 
      : 'invite_rewards';
    
    // Create mission record
    await db.prepare(`
      INSERT INTO user_missions 
      (user_id, mission_id, mission_type, is_completed, reward_claimed, reward_amount, completed_at)
      VALUES (?, ?, ?, 1, 1, ?, CURRENT_TIMESTAMP)
    `).bind(v.user_id, v.mission_id, v.mission_type, reward).run();
    
    // Update user balance
    await db.prepare(`
      UPDATE testnet_users SET 
        pzr_balance = pzr_balance + ?,
        ${rewardColumn} = ${rewardColumn} + ?,
        total_missions_completed = total_missions_completed + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(reward, reward, v.user_id).run();
    
    // Check for referral bonus
    const user = await db.prepare("SELECT referred_by, total_missions_completed FROM testnet_users WHERE id = ?").bind(v.user_id).first();
    if (user && (user as any).total_missions_completed === 0 && (user as any).referred_by) {
      await db.prepare(`
        UPDATE testnet_users SET 
          invite_rewards = invite_rewards + 200, 
          pzr_balance = pzr_balance + 200 
        WHERE referral_code = ?
      `).bind((user as any).referred_by).run();
    }
  }
  
  // Update verification status
  await db.prepare(`
    UPDATE mission_verifications SET 
      status = ?,
      reviewed_by = ?,
      reviewed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(action === 'approve' ? 'approved' : 'rejected', adminUser.username, verificationId).run();
  
  return c.json({ success: true, action });
});

// Get all users (protected, paginated)
app.get("/api/admin/users", requireAdmin, async (c) => {
  const db = c.env.DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 50;
  const offset = (page - 1) * limit;
  
  const users = await db.prepare(`
    SELECT * FROM testnet_users 
    ORDER BY pzr_balance DESC 
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();
  
  const totalCount = await db.prepare("SELECT COUNT(*) as count FROM testnet_users").first();
  const total = (totalCount as any)?.count || 0;
  
  return c.json({
    users: users.results || [],
    total: total,
    page,
    limit,
    total_pages: Math.ceil(total / limit)
  });
});

// Adjust user XP manually (protected)
app.post("/api/admin/users/:wallet/adjust-xp", requireAdmin, async (c) => {
  const db = c.env.DB;
  const wallet = c.req.param("wallet");
  const body = await c.req.json();
  const { amount, reason } = body;
  
  if (!amount || typeof amount !== 'number') {
    return c.json({ error: "Valid amount required" }, 400);
  }
  
  const user = await db.prepare(
    "SELECT * FROM testnet_users WHERE wallet_address = ?"
  ).bind(wallet).first();
  
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  
  await db.prepare(`
    UPDATE testnet_users SET 
      pzr_balance = pzr_balance + ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE wallet_address = ?
  `).bind(amount, wallet).run();
  
  return c.json({ 
    success: true, 
    message: `Adjusted ${wallet} by ${amount} XP. Reason: ${reason || 'Manual adjustment'}` 
  });
});

// Ban/unban user (protected)
app.post("/api/admin/users/:wallet/ban", requireAdmin, async (c) => {
  const db = c.env.DB;
  const wallet = c.req.param("wallet");
  const body = await c.req.json();
  const { banned } = body;
  
  await db.prepare(`
    UPDATE testnet_users SET 
      is_whitelisted = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE wallet_address = ?
  `).bind(banned ? 0 : 1, wallet).run();
  
  return c.json({ success: true, banned });
});

// Get security logs (protected)
app.get("/api/admin/security/logs", requireAdmin, async (c) => {
  const db = c.env.DB;
  const limit = Number(c.req.query("limit")) || 100;
  const filter = c.req.query("filter") || 'all'; // 'all', 'suspicious', 'errors'
  
  let query = `
    SELECT * FROM request_logs 
    WHERE created_at > datetime('now', '-7 days')
  `;
  
  if (filter === 'suspicious') {
    query += ` AND (reason IS NOT NULL AND reason != '' AND reason != 'Normal request')`;
  } else if (filter === 'errors') {
    query += ` AND status_code >= 400`;
  }
  
  query += ` ORDER BY created_at DESC LIMIT ?`;
  
  const logs = await db.prepare(query).bind(limit).all();
  
  return c.json(logs.results || []);
});

// Get security dashboard (protected)
app.get("/api/admin/security/dashboard", requireAdmin, async (c) => {
  const db = c.env.DB;
  
  const stats24h = await getSecurityStats(db, 24);
  const stats7d = await getSecurityStats(db, 168); // 7 days
  const suspiciousIPs = await getSuspiciousIPs(db, 20);
  
  // Get most attacked endpoints
  const endpoints = await db.prepare(`
    SELECT 
      endpoint,
      COUNT(*) as hit_count,
      COUNT(CASE WHEN reason != '' AND reason IS NOT NULL THEN 1 END) as suspicious_count
    FROM request_logs
    WHERE created_at > datetime('now', '-24 hours')
    GROUP BY endpoint
    ORDER BY hit_count DESC
    LIMIT 10
  `).all();
  
  return c.json({
    stats_24h: stats24h,
    stats_7d: stats7d,
    suspicious_ips: suspiciousIPs,
    top_endpoints: endpoints.results || []
  });
});

export default app;
