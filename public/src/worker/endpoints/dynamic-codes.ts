// Dynamic verification codes endpoints
import { Context } from 'hono';
import { sanitizeWalletAddress, sanitizeMissionId, generateSecureCode } from '../utils/sanitizer';

/**
 * Generate dynamic verification code for a user's social mission
 * This creates a unique code per user per mission, preventing sharing
 */
export async function generateDynamicCode(c: Context) {
  const db = c.env.DB;
  const body = await c.req.json();
  const { wallet_address, mission_id } = body;
  
  // Sanitize inputs
  const cleanWallet = sanitizeWalletAddress(wallet_address);
  const cleanMissionId = sanitizeMissionId(mission_id);
  
  if (!cleanWallet || !cleanMissionId) {
    return c.json({ error: "Invalid wallet address or mission ID" }, 400);
  }
  
  // Only allow for twitter and telegram missions
  if (cleanMissionId !== 'social_twitter' && cleanMissionId !== 'social_telegram') {
    return c.json({ error: "Dynamic codes only available for Twitter and Telegram missions" }, 400);
  }
  
  // Check if user exists
  const user = await db.prepare(
    "SELECT id FROM testnet_users WHERE wallet_address = ?"
  ).bind(cleanWallet).first();
  
  if (!user) {
    return c.json({ error: "User not found. Please connect your wallet first." }, 404);
  }
  
  // Check if they already have an unused code
  const existingCode = await db.prepare(`
    SELECT code, verification_url, expires_at FROM dynamic_verification_codes 
    WHERE wallet_address = ? AND mission_id = ? AND is_used = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).bind(cleanWallet, cleanMissionId).first();
  
  if (existingCode) {
    return c.json({
      code: (existingCode as any).code,
      verification_url: (existingCode as any).verification_url,
      expires_at: (existingCode as any).expires_at,
      message: "You already have an active verification code for this mission"
    });
  }
  
  // Generate unique code
  const code = generateSecureCode(8);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  // Create verification URL based on mission type
  let verificationUrl = '';
  if (cleanMissionId === 'social_twitter') {
    verificationUrl = `https://twitter.com/intent/follow?screen_name=pozzer_depin`;
  } else if (cleanMissionId === 'social_telegram') {
    verificationUrl = `https://t.me/pozzerpt`;
  }
  
  // Store code
  await db.prepare(`
    INSERT INTO dynamic_verification_codes (wallet_address, mission_id, code, verification_url, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(cleanWallet, cleanMissionId, code, verificationUrl, expiresAt.toISOString()).run();
  
  return c.json({
    success: true,
    code,
    verification_url: verificationUrl,
    expires_at: expiresAt.toISOString(),
    message: `Your unique verification code is: ${code}. This code expires in 24 hours.`
  });
}

/**
 * Cleanup expired dynamic codes
 */
export async function cleanupExpiredCodes(db: any): Promise<void> {
  await db.prepare(`
    DELETE FROM dynamic_verification_codes 
    WHERE expires_at < datetime('now', '-7 days')
  `).run();
}
