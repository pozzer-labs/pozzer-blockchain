/**
 * Simple in-memory cache manager for Cloudflare Workers
 * Reduces database reads for frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store data in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear specific cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const cache = new CacheManager();

// Cache TTLs (in milliseconds)
export const CACHE_TTL = {
  NETWORK_STATS: 30 * 1000,      // 30 seconds
  VALIDATORS: 60 * 1000,          // 1 minute
  LEADERBOARD: 5 * 60 * 1000,    // 5 minutes
  TESTNET_STATS: 2 * 60 * 1000,  // 2 minutes
  USER_PROFILE: 30 * 1000,        // 30 seconds
} as const;

// Note: Don't use setInterval in global scope for Cloudflare Workers
// Call cache.cleanup() manually in handlers when needed
