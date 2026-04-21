// Input sanitization utilities to prevent XSS and injection attacks

/**
 * Sanitize string input - remove HTML tags, scripts, and dangerous characters
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>'"`;()]/g, '') // Remove dangerous chars
    .trim()
    .substring(0, 500); // Max length limit
}

/**
 * Validate and sanitize wallet address
 */
export function sanitizeWalletAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  
  const cleaned = address.trim().toLowerCase();
  
  // EVM address validation (0x + 40 hex chars)
  const evmPattern = /^0x[a-f0-9]{40}$/;
  if (evmPattern.test(cleaned)) {
    return cleaned;
  }
  
  // Solana address validation (32-44 base58 chars)
  const solanaPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  if (solanaPattern.test(address.trim())) {
    return address.trim();
  }
  
  return null;
}

/**
 * Validate and sanitize mission ID
 */
export function sanitizeMissionId(missionId: string | null | undefined): string | null {
  if (!missionId) return null;
  
  const cleaned = missionId.trim();
  
  // Only allow alphanumeric and underscore
  if (!/^[a-z0-9_]{1,50}$/.test(cleaned)) {
    return null;
  }
  
  // Whitelist of valid mission IDs
  const validMissions = [
    'node_provider',
    'node_validator', 
    'node_worker',
    'node_delegate',
    'social_twitter',
    'social_telegram',
    'social_post',
    'social_daily'
  ];
  
  return validMissions.includes(cleaned) ? cleaned : null;
}

/**
 * Validate and sanitize verification code
 */
export function sanitizeVerificationCode(code: string | null | undefined): string | null {
  if (!code) return null;
  
  const cleaned = code.trim().toUpperCase();
  
  // Only allow alphanumeric, 6-20 chars
  if (!/^[A-Z0-9]{6,20}$/.test(cleaned)) {
    return null;
  }
  
  return cleaned;
}

/**
 * Validate and sanitize chain type
 */
export function sanitizeChainType(chain: string | null | undefined): 'evm' | 'solana' | null {
  if (!chain) return null;
  
  const cleaned = chain.trim().toLowerCase();
  
  if (cleaned === 'evm' || cleaned === 'solana') {
    return cleaned;
  }
  
  return null;
}

/**
 * Validate and sanitize referral code
 */
export function sanitizeReferralCode(code: string | null | undefined): string | null {
  if (!code) return null;
  
  const cleaned = code.trim().toUpperCase();
  
  // Format: PZR_XXXXXX (10 chars total)
  if (!/^PZR_[A-Z0-9]{6}$/.test(cleaned)) {
    return null;
  }
  
  return cleaned;
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number | null {
  const num = Number(input);
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  if (num < min || num > max) {
    return null;
  }
  
  return num;
}

/**
 * Generate cryptographically secure random code
 */
export function generateSecureCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  // Use crypto.getRandomValues for better randomness
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}
