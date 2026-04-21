// Simple rate limiter for API endpoints
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export class RateLimiter {
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig) {
    this.config = config;
  }
  
  async checkLimit(db: any, identifier: string, endpoint: string): Promise<{ allowed: boolean; remaining: number }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.windowMs);
    
    // Clean up old entries
    await db.prepare(
      "DELETE FROM rate_limits WHERE window_start < ?"
    ).bind(windowStart.toISOString()).run();
    
    // Get current count for this identifier + endpoint
    const record = await db.prepare(
      "SELECT request_count, window_start FROM rate_limits WHERE identifier = ? AND endpoint = ? AND window_start >= ?"
    ).bind(identifier, endpoint, windowStart.toISOString()).first();
    
    if (!record) {
      // First request in this window
      await db.prepare(
        "INSERT INTO rate_limits (identifier, endpoint, request_count, window_start) VALUES (?, ?, 1, ?)"
      ).bind(identifier, endpoint, now.toISOString()).run();
      
      return { allowed: true, remaining: this.config.maxRequests - 1 };
    }
    
    const count = (record as any).request_count || 0;
    
    if (count >= this.config.maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    // Increment counter
    await db.prepare(
      "UPDATE rate_limits SET request_count = request_count + 1, updated_at = CURRENT_TIMESTAMP WHERE identifier = ? AND endpoint = ? AND window_start >= ?"
    ).bind(identifier, endpoint, windowStart.toISOString()).run();
    
    return { allowed: true, remaining: this.config.maxRequests - count - 1 };
  }
}

// Preset configurations
export const RATE_LIMITS = {
  MISSION_COMPLETE: new RateLimiter({ windowMs: 60000, maxRequests: 10 }), // 10 per minute
  CONNECT_WALLET: new RateLimiter({ windowMs: 60000, maxRequests: 5 }), // 5 per minute
  GENERAL_API: new RateLimiter({ windowMs: 60000, maxRequests: 30 }), // 30 per minute
  IP_BASED_PUBLIC: new RateLimiter({ windowMs: 60000, maxRequests: 100 }), // 100 per minute per IP
  WALLET_BASED: new RateLimiter({ windowMs: 60000, maxRequests: 20 }), // 20 per minute per wallet
  ADMIN_LOGIN: new RateLimiter({ windowMs: 900000, maxRequests: 5 }), // 5 per 15 minutes per IP
};
