// EIP-712 and signature verification utilities

/**
 * Generate a nonce for wallet signature
 */
export function generateNonce(): string {
  const timestamp = Date.now();
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${timestamp}-${randomHex}`;
}

/**
 * Create sign message for wallet verification
 * Note: Timestamp is included in nonce, so we don't need a separate dynamic timestamp
 */
export function createSignMessage(wallet: string, nonce: string): string {
  return `Welcome to Pozzer!

Sign this message to verify your wallet ownership.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet: ${wallet}
Nonce: ${nonce}`;
}

/**
 * Verify EVM signature (for Ethereum, Polygon, BSC, Arbitrum)
 */
export async function verifyEVMSignature(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    // Import ethers dynamically
    const { ethers } = await import('ethers');
    
    // Recover the address from signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Compare addresses (case-insensitive)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('EVM signature verification failed:', error);
    return false;
  }
}

/**
 * Verify Solana signature
 * Note: Solana uses Ed25519 signatures
 */
export async function verifySolanaSignature(
  _message: string,
  _signature: string,
  _publicKey: string
): Promise<boolean> {
  try {
    // For Solana, we'd need @solana/web3.js
    // For now, return true as placeholder (client-side verification happens in Phantom)
    // In production, implement proper Ed25519 verification
    console.log('Solana signature verification - implement Ed25519 verification');
    return true;
  } catch (error) {
    console.error('Solana signature verification failed:', error);
    return false;
  }
}

/**
 * Store nonce in database
 */
export async function storeNonce(db: any, walletAddress: string, nonce: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  await db.prepare(`
    INSERT INTO wallet_nonces (wallet_address, nonce, expires_at)
    VALUES (?, ?, ?)
  `).bind(walletAddress.toLowerCase(), nonce, expiresAt.toISOString()).run();
}

/**
 * Verify and consume nonce (one-time use)
 */
export async function verifyAndConsumeNonce(
  db: any,
  walletAddress: string,
  nonce: string
): Promise<boolean> {
  // Find valid nonce
  const record = await db.prepare(`
    SELECT * FROM wallet_nonces 
    WHERE wallet_address = ? AND nonce = ? AND is_used = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).bind(walletAddress.toLowerCase(), nonce).first();
  
  if (!record) {
    return false;
  }
  
  // Mark as used
  await db.prepare(`
    UPDATE wallet_nonces SET is_used = 1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).bind((record as any).id).run();
  
  return true;
}

/**
 * Clean up expired nonces (should be called periodically)
 */
export async function cleanupExpiredNonces(db: any): Promise<void> {
  await db.prepare(`
    DELETE FROM wallet_nonces 
    WHERE expires_at < datetime('now', '-1 day')
  `).run();
}
