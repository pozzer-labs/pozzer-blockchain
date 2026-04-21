/**
 * Automatic log cleanup utility
 * Removes old logs to prevent database bloat
 */

export async function cleanupOldLogs(db: D1Database, daysToKeep: number = 30): Promise<number> {
  try {
    const result = await db.prepare(`
      DELETE FROM request_logs 
      WHERE created_at < datetime('now', '-${daysToKeep} days')
    `).run();
    
    const deleted = result.meta?.changes || 0;
    
    if (deleted > 0) {
      console.log(`[LOG CLEANUP] Removed ${deleted} old log entries`);
    }
    
    return deleted;
  } catch (error) {
    console.error('[LOG CLEANUP ERROR]', error);
    return 0;
  }
}

/**
 * Get security statistics from logs
 */
export async function getSecurityStats(db: D1Database, hours: number = 24) {
  const stats = await db.prepare(`
    SELECT 
      COUNT(*) as total_requests,
      COUNT(CASE WHEN reason LIKE '%injection%' THEN 1 END) as sql_injection_attempts,
      COUNT(CASE WHEN reason LIKE '%bot%' THEN 1 END) as bot_requests,
      COUNT(CASE WHEN reason LIKE '%Unauthorized origin%' THEN 1 END) as unauthorized_origins,
      COUNT(CASE WHEN status_code = 429 THEN 1 END) as rate_limited,
      COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_responses,
      COUNT(DISTINCT ip_address) as unique_ips
    FROM request_logs
    WHERE created_at > datetime('now', '-${hours} hours')
  `).first();
  
  return stats;
}

/**
 * Get top suspicious IPs
 */
export async function getSuspiciousIPs(db: D1Database, limit: number = 10) {
  const ips = await db.prepare(`
    SELECT 
      ip_address,
      country,
      COUNT(*) as request_count,
      COUNT(CASE WHEN reason != '' AND reason IS NOT NULL THEN 1 END) as suspicious_count,
      GROUP_CONCAT(DISTINCT reason) as reasons,
      MAX(created_at) as last_seen
    FROM request_logs
    WHERE created_at > datetime('now', '-24 hours')
    GROUP BY ip_address
    HAVING suspicious_count > 0
    ORDER BY suspicious_count DESC, request_count DESC
    LIMIT ?
  `).bind(limit).all();
  
  return ips.results || [];
}
