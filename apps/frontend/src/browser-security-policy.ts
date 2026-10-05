// Exact CSS emitted by the pinned Player. Its API has no CSP nonce option.
// The regression compares this hash with the installed producer on upgrades.
export const REMOTION_PLAYER_STYLE_HASH =
  "sha256-gv/jBVmnD9LQSRVG0n8AQ31cGwpFmZCCHvcOF0Z+Em8=";

// The only environment-dependent browser permission is development tooling.
export function browserSecurityPolicy(nonce: string, development: boolean) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com${development ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' ${development ? "'unsafe-inline'" : `'nonce-${nonce}' '${REMOTION_PLAYER_STYLE_HASH}'`}`,
    // React/Remotion's fixed geometry uses style attributes.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    // Player initializes its shared audio pool with a fixed inline silent WAV.
    "media-src 'self' blob: data:",
    "worker-src 'self' blob:",
    `connect-src 'self' https://storage.googleapis.com https://challenges.cloudflare.com${development ? " ws://localhost:3000" : ""}`,
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join("; ");
}
