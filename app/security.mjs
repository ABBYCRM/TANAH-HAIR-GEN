import { randomBytes } from 'node:crypto';

// Short URL-safe identifier for tracking generated artifacts.
// 12 random bytes → 16-character base64url string (collision-safe up to
// ~10^19 per the standard birthday bound; we don't need that many).

export function randomId(bytes = 12) {
  return randomBytes(bytes).toString('base64url');
}
