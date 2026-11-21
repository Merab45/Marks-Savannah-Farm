# Implementation Roadmap

**Status:** Proposed sequence; no implementation begun in this architecture task  
**Principle:** Deliver vertical, testable slices on top of the existing website, customer PWA and Herdbook. Do not wait for public-site redesign or completion before the farm workspace can use the backend.

## Phase order and dependencies

| # | Workstream | Depends on | Observable outcome / acceptance |
|---:|---|---|---|
| 1 | Backend foundation and database | Architecture provider/region gate for cloud; local work can start | Local development stack, versioned migrations, synthetic seed, environment separation, health endpoint, backup plan. Tables and constraints from DATABASE_SCHEMA.md apply locally; migrations run from empty database and upgrade a previous version. |
| 2 | Authentication and permissions | 1 | Central customer/staff identities, email verification, recovery, logout/revoke, staff membership and role policy. Test anonymous/customer A/customer B/staff-other-farm/manager/owner access with direct API requests. No localStorage password authentication remains on the canonical flow after cutover. |
| 3 | Herdbook backend integration | 1, 2 | Existing overview, animal registration/photo, search/filter, listing state and sales view read/write central records. Existing screens and useful behavior remain. Real staff access requires server authorization. A tested export/import preserves non-demo records. |
| 4 | Customer account consolidation | 1, 2 and approved screen map | One canonical customer dashboard reached from app.html; customer-account.html remains a tested compatibility URL. Preserve unique features from both implementations and one shared account across public site/PWA. |
| 5 | Public website integration | 1 and public API contract; can run alongside 3/4 | Public pages retrieve only approved farm, product, listing, auction and editorial data. Static marketing pages and existing URLs remain. No private fields are exposed by direct URL/API access. |
| 6 | Customer PWA enhancement and integration | 2, 4, 5 | Existing install, splash, onboarding and navigation remain; real customer API flows, stale/offline labels, connection states and safe cache rules work. One service worker remains. |
| 7 | Livestock and animal-management modules | 3 | Extend Herdbook with identifier history, animal profiles, health/treatment, vet visits, breeding/pregnancy/birth, feeding and activities. Parent checks, history, staff permissions, photo access and reports are tested. |
| 8 | Inventory and purchasing | 1, 2, 3 foundation | Supplier and purchase workflows create stock movements and derived balances; receiving, adjustment, cancellation and approval are audited. Animal/stock pages need not block public website work. |
| 9 | Orders and commerce | 2, 4, 5, 8 availability contract | Website/PWA share order creation and status. Server calculates totals, stores item snapshots and makes authorized orders visible in Herdbook. Price-confirmation/quote flow precedes payment; idempotency and fulfillment are tested. |
| 10 | Auctions and bidding | 1, 2, 4, 5 | Staff publishes approved lots; website/PWA use shared server bids; concurrent bid/close tests pass; public bidder identity stays private; winner/contact only follows server close. Local preview bids are not imported as accepted bids. |
| 11 | Finance and reporting | 1, 2, 8, 9, 10 | Finance categories/accounts, balanced posting/reversal, source reconciliation and permissioned reports. Payment/purchase/order events reconcile without duplicate posting. |
| 12 | Security, testing and deployment | 1–11 at release scope; security checks start continuously | Threat model, RLS and role test suite, OWASP checks, backup restore, monitoring, performance budgets chosen with owner, privacy review, staging/release runbook, URL/PWA verification and rollback evidence. Production launch is a separate decision. |

## Critical path

The minimum safe path to a usable staff product is 1 → 2 → 3, followed by 7 and 8. The minimum customer commerce path is 1 → 2 → 4/5 → 6/9. Auctions can proceed as a separate feature branch after 1 and 2, with the same API contract and no dependence on completion of all website pages. Finance reporting follows reliable order, inventory and auction source records.

## Parallel work that does not duplicate ownership

- After the API/domain contracts stabilize, separate teams can deliver Herdbook integration and public read APIs in parallel; both use migration-owned schema and role policies.
- Customer dashboard reconciliation and public marketing/content cleanup may proceed in parallel if only one implementation owns customer state and both preserve old URLs.
- Inventory schema and approved catalogue reads can be designed while customer consolidation is underway; production writes wait for roles and audit.
- Security review, access-policy tests, image performance measurements and backup/restore design start with the foundation, not as a final cleanup stage.
- Order and auction interfaces may be built in parallel after shared authentication, current-price/status read contracts, idempotency and transaction boundaries are agreed.

## Data migration and continuity checklist

1. Freeze a copy/export of the existing browser records; never clear localStorage automatically.
2. Identify sample/demo rows and exclude them from real imports unless explicitly retained as labeled seed data.
3. Normalize animal tags and report duplicates before insertion. Preserve source record IDs in a migration mapping table or import manifest.
4. Extract base64 animal photos into files, resize/re-encode, scan, upload to a private staging bucket, and map storage IDs to animals.
5. Import into staging, compare record/photo counts and resolve each error before production.
6. Cut over one selected browser/workspace at a time; keep read-only export/rollback instructions until owner accepts reconciliation.
7. Require customer re-registration/verification or password reset; do not claim local hashes or bids establish server identity.

## Exact next implementation task

**Task 004 — Build the local backend foundation and first secure schema slice.** Initialize the chosen backend tooling for local development only; create the first migration for farms, locations, profiles, farm memberships, species/breeds, animals and animal identifiers; add seed data marked as synthetic; add RLS/grants and automated database tests for anonymous, customer and staff cross-scope denial. Do not create production cloud resources or import real localStorage data in this task.

Acceptance checks for Task 004:

- Fresh local database can apply every migration and seed successfully; rerun is deterministic.
- Unique active animal identifier and farm-scoped reads are enforced by database constraints/policies.
- Anonymous/client roles cannot read private animals; a staff membership sees only its farm; an inactive/other-farm membership is denied.
- Migration files and test commands are documented; no secret values are committed.
- Architecture OPN-001/002 are recorded as production gates, not silently assumed.

## Human audit gates

| Gate | Owner decision/evidence | Blocks |
|---|---|---|
| Provider, region and cross-border transfer | Owner/data-protection reviewer verifies provider terms, destination, safeguards and latency | Any real personal data in a hosted environment |
| Canonical customer screen map | Owner approves screen list and preserved features from both dashboards | Customer dashboard consolidation |
| Role/approval matrix | Farm owner validates who may publish, close auctions, adjust stock and post/reverse finance | Production staff access |
| Price/payment policy | Owner confirms quote versus fixed price, currency/rounding, M-Pesa/provider fees and reconciliation | Taking customer payment |
| Retention/restore objectives | Owner chooses retention and acceptable recovery time/data loss | Production operations |
