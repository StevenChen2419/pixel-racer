# Security controls and deployment

Last reviewed: 2026-10-02. This is an anonymous, casual multiplayer game. The controls below are implemented and tested; deployment requirements still depend on the hosting environment.

## Request and connection boundaries

- Production startup requires an exact HTTPS `ALLOWED_ORIGIN`, without credentials, a path, or a trailing slash. Development permits same-host browser origins for local/network previews.
- HTTP API requests and initial Socket.IO handshakes reject foreign browser origins, including WebSocket upgrades. CORS alone does not protect WebSockets. Cross-site Fetch Metadata and opaque `null` origins are rejected.
- Native clients without an Origin header remain supported. Origin checks are a browser boundary, not authentication; native clients can forge headers.
- POST API requests require `application/json`. JSON bodies and Socket.IO messages are limited to 16 KiB. JSON parser errors return generic 400/413 responses without stack traces.
- Analysis payloads validate every field and timing record, finite numbers, lengths, ranges, and array size. Socket handlers reject null, array, and primitive payloads before destructuring. Invalid numeric race updates are discarded.
- Player names are normalized and bounded; client templates escape player names and passage/source text. Stored leaderboard records are validated before being sent to the browser.
- Sprite/category/modifier/power-up IDs have allowlists. Only room players can buy modifiers or vote for rematches; only the host can change the passage category. Spectators cannot perform player actions.

## Abuse and resource limits

All limits are fixed windows in one process. The bounded rate-limit store expires entries and fails closed when full.

| Control | Limit |
| --- | --- |
| Leaderboard requests | 60/minute per IP |
| Room-list requests | 30/minute per IP |
| Analysis requests | 10/minute per IP |
| API requests before JSON parsing | 180/minute per IP per path, separate from route quotas |
| Initial socket handshakes | 30/minute per IP |
| Concurrent connected sockets | 10 per IP; initial handshakes stop at 1,000 server connections |
| All incoming events, including unknown events | 300/minute per socket; 1,800/minute per IP |
| Individual gameplay events | Per-socket quotas, plus persistent per-IP quotas at six times the per-socket allowance |
| Room storage | 500 rooms; six racers and 20 spectators per room |
| All AI completion calls | 30/minute server-wide; at most four in flight |

Per-socket event allowances: create 5, join 10, ready 10, progress 120, finish/give-up/rematch/spectate 5, appearance/category/modifier/grant 20, use power-up 10 per minute. IP event quotas survive reconnects. Power-up grants validate integer counts from zero to three. HTTP 429 responses include `Retry-After`.

AI requests time out after five seconds without retries. Generated passages and coaching output have length caps. Failures use built-in passages or generic coaching errors; upstream error text and credentials are not returned or logged. Anonymous AI access can still consume the configured quota: use provider spend limits and consider disabling AI for a public demo.

Node sets request/header/keepalive timeouts and a header-count limit. Empty rooms, race timers, expired reconnect slots, and per-socket counters are cleaned up by the game lifecycle. The reverse proxy must also enforce connection, timeout, and traffic limits to handle distributed abuse.

## Browser security

Responses served by Express include a Content Security Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and a Permissions Policy disabling camera, microphone, and geolocation. Express's identifying header is disabled. Production adds HSTS with a one-year duration and `includeSubDomains`; use a domain whose subdomains also support HTTPS.

CSP uses `script-src 'self'`, `object-src 'none'`, `base-uri 'none'`, and `frame-ancestors 'none'`. There is no inline executable script, inline event attribute, or eval allowance. Game and UI listener code is served in local files. Connection sources are restricted to the same origin and the configured WebSocket origin. Images are local/data/blob; fonts are local or Google Fonts.

Inline CSS remains allowed because the existing UI uses inline styles and dynamic presentation. This is a deliberate compatibility limit, not permission for inline JavaScript.

## Secrets, dependencies, and ongoing checks

- Groq credentials are server-only environment variables. `.env` and environment variants are ignored; `.env.example` is the tracked template. Ignoring files does not erase credentials already committed: rotate any previously exposed key.
- Use `npm ci` with the lockfile. Dependencies were updated within their existing version ranges; `npm audit` reported zero known vulnerabilities on the review date. Audits identify known advisories, not every possible vulnerability.
- `npm test` includes hostile HTTP/socket payloads, origin rejection, forged forwarding headers, separate route quotas, spectator permissions, production configuration, strict script policy, and existing race/recovery behavior.
- GitHub Actions runs installation, tests, and dependency auditing on pushes/PRs. Dependabot checks npm and Actions updates weekly once the repository is on GitHub.

## Production setup

1. Use a maintained Node.js version (22 or newer is required for the test client's built-in WebSocket support).
2. Terminate HTTPS at a trusted hosting service/reverse proxy. Set `NODE_ENV=production` and `ALLOWED_ORIGIN=https://your-domain.example`. Put secrets in the host's environment settings.
3. Leave `TRUSTED_PROXIES` empty for direct access. Behind a proxy, list only its actual IPs/CIDRs, for example `127.0.0.1/32,::1/128` for a same-machine proxy. Restrict access to Node so requests arrive only through those proxies. The proxy must overwrite untrusted forwarded headers.
4. Run `npm ci`, `npm test`, and `npm audit --omit=dev`. Keep the lockfile, artwork notices, and updated dependencies.
5. Configure provider budgets, host traffic limits, monitoring, backups, and a persistent disk for leaderboard data. Do not expose runtime data or environment files through the static public directory.
6. For multiple server instances, replace in-process quotas and room storage with shared infrastructure and configure the appropriate Socket.IO adapter. This implementation targets one instance.

## Remaining trust limits

Scores, progress, and accuracy still originate from the client. Finite-value validation and membership checks prevent malformed state and spectator actions, but do not prove that someone typed a passage honestly. Coins and cosmetic purchases live in browser storage and are editable. They are not real-money balances. Do not present the leaderboard as verified competitive results or introduce prizes/payments without server-authoritative progression and identity controls.

The app has no accounts or authentication cookies, so login/session protections are not currently applicable. Room codes are invitations, not private authenticated access. If accounts or personal data are introduced, add authentication, authorization, secure session cookies, CSRF defenses appropriate to those sessions, and a retention policy.

## References

- Express production security: https://expressjs.com/en/advanced/best-practice-security/
- Express trusted-proxy configuration: https://expressjs.com/en/guide/behind-proxies/
- Socket.IO CORS and handshake origin checks: https://socket.io/docs/v4/handling-cors/
