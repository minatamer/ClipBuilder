# Bundled caption font

League Spartan is a geometric font from The League of Moveable Type, distributed
under the included [SIL OFL 1.1](League-Spartan-OFL.txt). It is a close geometric
choice for the owner's uppercase caption references, not a claim to identify
their exact typeface. Existing fonts remain available.

The unmodified Latin variable WOFF2 (weights 100–900, 24,020 bytes) came from the
[Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/leaguespartan)
and its official Google Fonts CDN, retrieved 2026-11-11:
`https://fonts.gstatic.com/s/leaguespartan/v15/kJEqBuEW6A0lliaV_m88ja5TwvZwLZk.woff2`.
SHA-256: `7d843a9fa4dcd050da68405d9093f8ab8298f8f60a97155e85ab84c9ed3040e2`.

The license text is preserved with upstream trailing whitespace removed.
This directory owns the single committed font and license. The fixed build copy
module copies them into the frontend public directory and local/hosted raster
bundles. Those generated copies stay ignored. Runtime rendering uses only the
self-hosted fixed font URL, with no CDN request, account, installation, API key
or change to CSP. The native page waits for fonts before capture.
