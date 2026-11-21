# Security, Performance and Deployment

**Implementation note (2026-11-21):** A local-only initial schema and RLS policy set exists under `supabase/`. Prior local-task reports state that both migrations were applied and the existing 64-assertion pgTAP suite passed after the employee animal INSERT grant fix. This verifies only the current nine-table foundation; the broader controls in this document and any future staff lifecycle remain design requirements until their own tests pass. No hosted project or production configuration has been created.

**Status:** Proposed controls for implementation planning; not a completed security audit
**As of:** 2026-11-20

## 1. Security boundaries

The public website and customer PWA can share public APIs and customer identity. Herdbook is the privileged staff client. The API/database is the trust boundary: frontend route hiding, noindex, localStorage and PWA cache are not authorization controls.

### Priority controls

| Risk area | Required control |
|---|---|
| Broken access control / IDOR | Deny by default; check current identity + farm membership + permission + record ownership on every route and RLS policy. Test with a second customer and another farm scope. |
| Injection | Parameterized SQL only; validate schemas, lengths, enum values and numeric ranges; escape any rendered user content. Never accept arbitrary filter/order SQL. |
| XSS | Avoid innerHTML for user-entered content; apply output encoding, strict CSP, safe image URLs and minimal third-party scripts. A stolen browser token can expose that user’s permitted records. |
| Authentication/session abuse | Central Auth, verified email, recovery limits, MFA for elevated staff, session expiry/revocation and audit of role changes. |
| Secrets exposure | Publishable browser key only with RLS; secret/service-role key only in server secrets. Keep env files out of Git; rotate on suspected leak. |
| Auction race/abuse | Server time, atomic bid validation, eligibility check, rate limits, immutable accepted bid, private bidder mapping, idempotent close and result. |
| Order/payment tampering | Recompute price/availability server-side, idempotency keys, verify payment webhook signatures, dedupe provider event ID, reconcile status; never trust a redirect or client total. |
| Upload abuse | Signed short-lived upload intent, authenticated owner/farm scope, MIME sniffing, size limits, random object names, malware scanning, private-by-default bucket, image re-encode, metadata stripping, safe download headers. |
| Sensitive data exposure | Separate public projections from animal/health, customer, bidder, supplier and finance data; minimize collection; use signed access to private files; redact logs. |
| Denial of service/cost abuse | Rate limits on auth, search, enquiries, bidding and uploads; payload limits, query limits, pagination caps, spend alerts, timeouts and bounded retries. |
| CSRF/CORS | Exact origin allowlist. If cookie sessions are used, set Secure/HttpOnly/SameSite and CSRF protection. Do not use wildcard credentialed CORS. |
| Insecure offline cache | Cache only static shell and approved public data; never cache authenticated API/private staff records; clear sensitive app memory on logout/account change. |

Use OWASP ASVS/API Security Top 10 as a verification checklist during implementation, particularly access control, authentication, resource consumption, sensitive business flows, misconfiguration, inventory and API consumption. This document does not claim a formal certification.

## 2. Kenya data handling

Customer names, contact details, employee records and account data are personal data. Before selecting a non-Kenyan storage region for production, map each data category and processor, review the provider DPA/subprocessors, assess cross-border transfer safeguards and determine the farm’s ODPC registration/other obligations. The ODPC’s cross-border transfer guidance describes appropriate safeguards, adequacy, necessity and consent as possible bases; the applicable route needs owner/counsel confirmation. [ODPC cross-border transfer guidance](https://odpc.go.ke/wp-content/uploads/2026/09/ODPC-%E2%80%93-Guidance-Notes-for-Cross-border-Data-Transfers.pdf), [ODPC laws and regulations](https://www.odpc.go.ke/data-protection-laws-kenya/), [ODPC FAQ](https://www.odpc.go.ke/faqs/).

Keep collection purpose-limited. Define retention for enquiries, inactive accounts, uploaded identity/support files, health records, bids and financial records. Provide access/correction/deletion request handling, with legal/financial retention exceptions decided by counsel. Do not collect government ID or payment credentials unless a documented business/provider requirement justifies it.

## 3. Database integrity and audit

- Apply least-privilege SQL grants and RLS to every exposed table. Test policies for anonymous, customer, staff and manager identities.
- Privileged Edge Functions use a server secret only for narrowly required work. Prefer caller-scoped clients where possible; if bypassing RLS, derive actor from verified claims and filter every query explicitly.
- Keep SQL migrations in version control, reviewed and ordered. Production changes are migrations, not manual schema drift.
- Record role grants, approvals, listing publication, animal sale, stock adjustments, finance posting/reversal, auction close and access to sensitive bidder/health records.
- Audit log is append-only to application roles, excludes secrets, and is retained according to a policy. Keep operational access to logs restricted.

## 4. Backups and disaster recovery

- Use a production plan with managed daily database backups. Current Supabase Pro pricing includes 7 days of daily database backups; Point-in-Time Recovery is a separate priced option. Confirm current configuration at purchase time.
- Supabase database backups do not include Storage objects. Back up or version media objects separately and reconcile database media metadata against objects.
- Maintain encrypted logical Postgres exports in a separate account/provider with restricted credentials and retention. Never store backup secrets in the repository.
- Define recovery point (maximum acceptable lost writes) and recovery time (maximum service outage) with the owner before production. Do not invent numeric objectives without business input.
- Run a restore rehearsal to an isolated staging project at least before production data import and after material schema/backup changes. Verify row counts, attachments, Auth references, RLS and app sign-in before declaring recovery successful.
- Preserve old prototype exports until imported records have been reconciled and approved. Do not automatically clear source localStorage during migration.

## 5. Environments and release flow

| Environment | Data and access | Deployment rule |
|---|---|---|
| Local development | Local Supabase stack/seeded synthetic data; no real customer/farm PII | Developer can reset; tests run on each migration |
| Staging | Separate project, separate Auth redirect URLs and secrets; synthetic or minimized de-identified data | Validate API contracts, OAuth callbacks, RLS, PWA updates, restore and payment sandbox |
| Production | Approved region, privacy/security settings, verified domain/email, restricted staff access, spend/alerts/backups enabled | Migrations reviewed, staged, smoke-tested, reversible where practical; no manual live key in source |

Deploy frontend and API independently only when contracts are stable. Keep current public site deployment intact until route aliases and service-worker migration are tested. Add API CORS for exact production/staging origins. Keep secrets in provider secret store; commit only variable names in an example file if a code implementation later requires one.

## 6. Monitoring and operations

- Capture request IDs, endpoint, status code, latency, rate-limit events, database error classes, webhook event IDs and worker/function failures.
- Alert on authentication spikes, repeated permission denials, failed backups, missing media, webhook backlog, auction close failures, payment reconciliation mismatches, and spend threshold.
- Never log passwords, raw access/refresh tokens, signed media URLs, card numbers, full personal notes, or complete medical records.
- Provide a documented emergency process to pause bidding/order writes, revoke a compromised user/session, disable public listing, rotate secrets and restore the database.
- Keep static public content readable if the API is temporarily unavailable, but show stale timestamps and avoid order/stock guarantees.

## 7. Performance and cost controls

The last asset measurement in the project audit was approximately 29.8 MiB in Assets, with several 2.5–4 MB PNG photos and a very large logo SVG. Preserve current artwork, but plan image resizing and WebP/AVIF derivatives for cards and mobile; keep high-resolution source files for appropriate zoom/download. Continue lazy-loading below-the-fold images and set explicit dimensions to prevent layout shift.

For Supabase, monitor database compute, storage, uncached/cached egress, Auth MAU, Edge Function usage and backups. Current published Pro starting price is $25/month, but compute/usage can increase the invoice. The Free plan pauses inactive projects and does not include automatic backups, so it is for local/staging exploration rather than production farm records. Set spend alerts and review actual usage after a pilot.

For Cloudflare alternatives, use Workers spending limits; estimate D1 read/write/storage and R2 operations with measured traffic. For AWS, quote instance/backup/transfer/CloudWatch costs for Cape Town and size against the farm’s recovery and availability needs. Do not present the $5 Workers minimum or a Supabase base plan as a complete monthly platform cost.

## 8. Deployment exit checks

- A customer cannot read another customer’s records; customer cannot read staff records.
- Staff without a specific permission cannot access that record through UI, API, REST, direct object path, or cached page.
- No privileged key is present in frontend bundles or repository history.
- Payment and bid lifecycle tests cover retry, duplicate, race, cancellation, close boundary and provider timeout.
- Backup restore is evidenced, media access policies are verified, and request/error dashboards are active.
- Cross-border transfer and applicable ODPC obligations have documented review; privacy policy lists processors and actual data categories.
- Current public URLs, PWA install path, single worker update and offline fallback all pass release checks.

