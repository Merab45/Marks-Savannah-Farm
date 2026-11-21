# Architecture Decisions

**Status:** Proposed decisions for human review  
**Date:** 2026-11-20  
**Scope:** Platform boundaries, provider direction, identity, PWA and business correctness

## DEC-001 — Keep one repository during the first backend phases

**Status:** Proposed  
**Decision:** Keep the current static repository and routes while establishing API, database and authorization contracts. Organize into app directories later as a controlled monorepo migration.

**Context:** The current project has 15 root HTML routes, shared CSS/JS, a root manifest and one root worker. Moving paths immediately risks broken links, start_url/scope changes and offline cache regressions. No build workspace currently exists.

**Consequences:** Explicit logical ownership is introduced before file movement. Old URLs remain compatibility routes. A later move must include route rewrite, static asset, CORS, worker, manifest, redirects and local data migration checks.

## DEC-002 — Use a modular monolith and recommend Supabase as the initial managed backend

**Status:** Adopted for local development; hosted production remains blocked on region/privacy review  
**Decision:** Use PostgreSQL as the central system of record; recommend Supabase-managed Postgres, Auth, Storage and Edge Functions for the first implementation. Keep app domains in one API/database deployment rather than splitting into microservices.

**Context:** Existing frontend is static vanilla code. Domain relationships, transactions, auditability, and shared customer/staff data strongly favor relational storage. A managed integrated service lowers initial operations. Provider comparison and current pricing evidence are in PLATFORM_ARCHITECTURE.md.

**Consequences:** Use SQL migrations and RLS. Use server functions for privileged domain commands. Current Supabase region list has no Africa region; the farm must review cross-border safeguards and latency before hosted personal data. AWS Cape Town is the documented alternative if African placement is required; it is not automatically compliant with Kenya transfer obligations.

**Revisit if:** Legal review rejects the region/processor, measured latency is unacceptable, or operations/team needs justify a different provider.

## DEC-003 — app.html is the PWA entry; customer-account.html supplies the canonical dashboard screen map

**Status:** Proposed, owner screen-map confirmation required  
**Decision:** Keep app.html as install/splash/onboarding/auth entry and consolidate a single customer dashboard using customer-account.html’s broader account/navigation experience. Preserve unique farm-home.js flows and both URLs during migration.

**Context:** Manifest starts at app.html. The second dashboard includes customer profile, order display, enquiry, support and notifications; farm-home.js includes product/auction detail, bid review, saved auction and cart handoff. Replacing either would discard approved work.

**Consequences:** One source owns customer state and page navigation after cutover. Compatibility aliases remain until URL and PWA upgrade tests pass. The screen map needs owner review before UI implementation.

## DEC-004 — One central identity, with separate customer and farm-membership authorization

**Status:** Proposed  
**Decision:** Use provider-managed identity for both audiences; app_profiles/customer_profiles store customer information; farm_memberships and permissions authorize staff. Do not use a second staff credential store or trust client-editable roles.

**Context:** Website/PWA should share accounts. Herdbook is currently open static HTML and browser storage; it is not private.

**Consequences:** RLS and API checks use identity plus farm membership and permission. Local passwords are not migrated; users verify/set a central account. Staff role changes are audited and applied server-side.

## DEC-005 — Separate public projections from operational records

**Status:** Proposed  
**Decision:** Keep animal, health, owner, bidder, customer, supplier, and finance records private. Publish separate approved listing/product/content projections with allow-listed fields.

**Context:** Public listings originate from private farm work, and customers must not see confidential health or bidder identity.

**Consequences:** Public endpoints query explicit views/functions. Publication requires a permission and audit entry. The public API never returns raw operational rows.

## DEC-006 — Keep one service worker and cache public data only

**Status:** Proposed  
**Decision:** Continue the existing root service worker for the customer website/PWA. Do not add a second worker. Exclude private responses and sensitive app data from caches. Do not treat local mutation queues as successful orders, payments or bids.

**Context:** The current manifest uses app.html and service worker scope is root. Offline access exists, but no secure server sync exists.

**Consequences:** Public content can degrade to labeled stale cache. Private operations and financially binding actions need live server confirmation. Staff offline support is out of initial scope.

## DEC-007 — Server-side idempotent transactions own commerce and auction outcomes

**Status:** Proposed  
**Decision:** Orders, bids, payment transitions, inventory postings and finance writes are server commands with idempotency keys, database transactions and audit records.

**Context:** Local browser previews can be edited, retried or lost; bids and money need concurrency and replay safety.

**Consequences:** Countdown display remains advisory. Server time/current state governs bids and close. Order status is distinct from payment and fulfilment. Retry after timeout looks up the original result.

## Open decisions

| ID | Question | Proposed owner | Latest stage |
|---|---|---|---|
| OPN-001 | Is the selected data region/provider acceptable under Kenya transfer requirements and measured latency? | Farm owner + data-protection reviewer | Before hosted personal data |
| OPN-002 | Existing cloud account and approved recurring budget? | Farm owner | Before hosted project creation |
| OPN-003 | One farm tenant now or multiple independent farm organizations? | Farm owner | Before initial production schema |
| OPN-004 | Approve canonical customer dashboard screen map and legacy route behavior? | Product owner | Before consolidation implementation |
| OPN-005 | Which email, Google/Facebook/Apple OAuth, and optional SMS provider will be configured? | Farm owner | Before launch auth integration |
| OPN-006 | Which payment provider/M-Pesa workflow, settlement/reconciliation and refund rules? | Farm owner/finance owner | Before taking payments |
| OPN-007 | Who can approve animal publication, inventory adjustment, auction results and finance posting? | Farm owner | Before staff production access |
| OPN-008 | Retention periods, data export/deletion policy, backup RPO/RTO? | Farm owner + reviewer | Before production operation |

No decision in this file authorizes cloud-resource creation, deployment, payment activation, or the migration of live personal/financial records.
