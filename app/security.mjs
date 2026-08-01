import { createHash, randomBytes } from 'node:crypto';

// Tiny self-contained security helpers for the image-gen service.
// - hashApiKey: SHA-256 of the key, used for the audit log only.
// - randomId: short URL-safe identifier for tracking generated artifacts.
// - constantTimeEqual: used to verify the admin token (if set).

export function hashApiKey(key) {
  return createHash('sha256').update(String(key)).digest('hex');
}

export function randomId(bytes = 12) {
  return randomBytes(bytes).toString('base64url');
}

export function constantTimeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}
