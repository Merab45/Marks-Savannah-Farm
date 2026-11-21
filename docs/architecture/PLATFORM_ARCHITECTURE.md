# Marks Savannah Farm — Platform Architecture

**Status:** Proposed architecture, ready for owner review  
**As of:** 2026-11-20  
**Decision summary:** Keep the current repository and URLs during the backend foundation. Use Supabase-managed PostgreSQL, Auth, Storage, and Edge Functions as the recommended first backend, subject to a cross-border data-transfer review and a measured Kenya-to-region latency check. Keep all application areas as one modular monolith initially; separate their route, data, and permission boundaries now, then organize frontend apps into directories after API/auth contracts are stable.

## 1. Scope and confirmed constraints

The project already has a public website, a customer PWA entry, a second customer dashboard, and Herdbook. It uses vanilla HTML/CSS/JavaScript and has no discovered backend or database. Existing customer and farm records live in browser storage. The repository’s current URLs and service-worker scope must remain functional during migration.

The platform needs a relational model for animals and pedigrees, health/breeding history, inventory and purchasing, customers and orders, auctions and immutable bids, finance records, staff roles, audit history, and image metadata. Order, payment, and bid acceptance require server-authoritative transactions. Public farm data must be explicitly approved and separated from private operations.

The current load, concurrency, availability target, operator budget, exact data residency requirement, and ownership of an existing cloud account are not known. This design avoids inventing scale targets. Cost figures below are provider list-price facts retrieved on 2026-11-20, not a usage quote.

## 2. Recommended topology

Use one managed PostgreSQL project as the system of record. Use its Auth service for customer and employee identities, PostgreSQL Row Level Security (RLS) as a second authorization boundary, protected object storage for private animal documents/photos, and server functions for sensitive domain commands. Keep static website/PWA hosting at the current host until URL and worker migration is planned. A provider publishable key may be used in browser code only with strict RLS; privileged service keys remain server-only.

~~~mermaid
flowchart LR
  Public[Public website] -->|published reads| API[Shared API and policies]
  PWA[Customer PWA] -->|customer session| API
  Herdbook[Private Herdbook] -->|staff session and role| API
  API --> Auth[Central identity]
  API --> DB[(PostgreSQL system of record)]
  API --> Media[Private and public media storage]
  DB --> Audit[Audit and status history]
~~~

The public site and PWA may use the same public read endpoints. Customer actions require a customer identity and ownership checks. Herdbook uses the same API/database but requires an active staff membership and a permission check on every protected read and write. Application code must not be the only enforcement layer.

## 3. Backend options compared

| Option | Fit for this project | Strengths | Material trade-offs |
|---|---|---|---|
| **A. Supabase: PostgreSQL + Auth + Storage + Edge Functions (recommended)** | Strong fit for a small team extending a static frontend into a relational platform | One Postgres database under Auth, Storage, Realtime and Functions; direct migration path from local records to relational tables; RLS can secure rows; standard SQL and export paths | Supabase currently lists no African project region; region and Kenya cross-border safeguards need review. Pro starts at $25/month and may add compute/usage costs. Storage media is not included in database backup. RLS policy mistakes can expose data. |
| **B. Cloudflare Workers + D1 + R2 + separate identity provider** | Viable for an edge-first application with compact data and Cloudflare operational preference | Existing static site can be hosted near Cloudflare; Workers Paid starts at $5/month; R2 has no egress charge; D1 has usage-based reads/writes and automatic time travel | Identity is a separate choice; D1 is SQLite rather than PostgreSQL, has a 10 GB per-database ceiling, and an individual database processes queries serially. D1 location hints do not support Africa. RLS-like authorization must be implemented and consistently tested in Worker code or SQL. More provider components must be operated together. |
| **C. AWS Cape Town: RDS PostgreSQL + Cognito + S3 + API Gateway/Lambda** | Strong option if African-region placement or AWS ownership is a hard requirement | RDS PostgreSQL is available in Africa (Cape Town); managed relational transactions; first-party identity, object storage, API runtime and operational controls | More AWS configuration, account/IAM work, environment wiring and cost modeling; database, auth, storage, API, logs and backups require deliberate integration. Cape Town is still outside Kenya; it does not remove cross-border compliance review. |

### Evidence used for the comparison

- Supabase documents that its project Postgres database underpins Auth, Storage, Realtime and Edge Functions; RLS is its row-level access mechanism. Its currently listed regions include Mumbai and Singapore but no African region. [Database overview](https://supabase.com/docs/guides/database/overview), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [regions](https://supabase.com/docs/guides/platform/regions).
- Supabase pricing currently lists Pro from $25/month, 8 GB included database disk, 100 GB file storage, 250 GB egress and 7 days of daily backups; compute and overages can change the total. [Pricing](https://supabase.com/pricing).
- Cloudflare Workers Paid has a $5/month minimum account charge; R2 lists $0.015/GB-month standard storage and no egress charges. D1 pricing depends on rows read/written; each database is limited to 10 GB on Paid and queries on an individual DB are serialized. D1 does not offer Africa location hints. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [D1 pricing and limits](https://developers.cloudflare.com/d1/platform/pricing/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [D1 data location](https://developers.cloudflare.com/d1/configuration/data-location/).
- AWS lists RDS for PostgreSQL in Africa (Cape Town). [RDS PostgreSQL regional availability](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RDS_Fea_Regions_DB-eng.Feature.MultiAZDBClusters.html).
- Kenya’s ODPC guidance describes conditions and safeguards for cross-border personal-data transfers. Provider region selection is not a substitute for legal review. [ODPC cross-border transfer guidance](https://odpc.go.ke/wp-content/uploads/2026/09/ODPC-%E2%80%93-Guidance-Notes-for-Cross-border-Data-Transfers.pdf).

### Why Supabase is the recommended first path

PostgreSQL fits the project’s relational and financial integrity requirements better than adopting a document store or a multi-service key/value design. Supabase bundles the parts this project currently lacks—managed Postgres, identity, storage access policies and server functions—without requiring a large infrastructure build before the first secure feature. It is compatible with the current frontend as a REST/API client; it does not require replacing HTML/CSS/JavaScript.

This is a recommendation with two gates before production personal data: (1) owner/legal review of the provider’s processing terms and cross-border safeguards and (2) measured page/API latency from Kenya for the available database regions. Supabase lists no African region. If lawful transfer safeguards or latency are unacceptable, choose the AWS Cape Town architecture before production data is loaded. Do not create a production project or import real data as part of this architecture task.

## 4. Application boundaries and shared data

~~~mermaid
flowchart TB
  subgraph Customer[Customer-facing experience]
    Web[Public site]
    Shell[PWA shell from app.html]
    Dashboard[Canonical customer dashboard based on customer-account.html]
  end
  subgraph Private[Farm operations]
    Herdbook[Herdbook evolved in place]
  end
  Web --> SharedAPI[Versioned API]
  Shell --> SharedAPI
  Dashboard --> SharedAPI
  Herdbook --> SharedAPI
  SharedAPI --> Identity[Central Auth]
  SharedAPI --> Database[(Central PostgreSQL)]
~~~

Keep the public website and customer PWA as related customer applications, not separate customer account systems. Use app.html for install identity, splash/onboarding and entry. Use customer-account.html’s fuller approved dashboard information architecture as the canonical customer dashboard foundation. Retain the app.html/farm-home.js features that are unique: app launch flow, product detail experience, auction lot detail/review, sort behavior, cart handoff and More/profile navigation. Preserve customer-account.html as a working compatibility URL during consolidation; do not delete it. Details are in APPLICATION_BOUNDARIES.md.

Keep Herdbook’s existing overview, animal records, animal photo workflow, filters, listing status and sales summary as the starting point for the private workspace. Extend its domain one module at a time; do not replace it with a generic dashboard.

## 5. Backend modularity

Start with a **modular monolith**: one Postgres database and one versioned API deployment organized into domains. Keep domain commands such as create order, submit bid, publish listing and post financial entry in server functions/transactions. Avoid microservices, a queue cluster, or separate databases before measured workload or team ownership requires them.

Suggested API domains: identity and memberships; public catalogue/content; animals and husbandry; inventory/procurement; customer commerce; auctions; finance; files; notifications/reporting. Each domain owns its schema, validation and authorization rules. Cross-domain writes use a transaction or an explicit, idempotent event/job rather than an uncoordinated client-side chain.

## 6. Deployment and operations shape

- Static website/customer frontend: keep the current host and public routes; use an exact origin allowlist for API CORS.
- Private workspace: use a separately identified route/host when the secure backend is ready. A route name or obscurity is not protection. Put an additional staff perimeter in front if operationally useful, but enforce application authorization in the API/database too.
- API: Supabase Edge Functions for server-only domain operations; PostgREST/direct client access only for narrowly authorized RLS-protected reads and simple user-owned data.
- Database: SQL migrations committed and applied through development, staging, and production; no schema edits solely through a production dashboard.
- Media: public, approved listing media in a public read path; veterinary/identity documents in private storage with short-lived access URLs.
- Backups: production plan with automatic DB backup, separate object/media recovery plan, encrypted off-provider logical backup, and a tested restore procedure.

## 7. Failure behavior and system truth

Public read pages may show clearly labeled cached/stale content during an outage. Customer profile or staff pages must show an unavailable state instead of silently presenting old private data. A cart can remain a draft. A bid, order submission, payment, listing publication or finance posting is complete only after a server response with a durable record ID/status. Mutations require idempotency keys and a status lookup for ambiguous timeouts. The server sets auction close time and validates every bid against the current state inside a transaction.

## 8. Open decisions and human audit

| ID | Decision/question | Impact | Required evidence or closure |
|---|---|---|---|
| OPN-001 | Is a non-African data region acceptable under the farm’s operational and legal requirements? | Blocks production personal data on the recommended provider | Owner and data-protection review of provider terms, transfer basis/safeguards, and data classes |
| OPN-002 | Which provider account and monthly budget already exist? | May change setup, region, and operating cost | Account inventory and approved budget range |
| OPN-003 | Which OAuth providers and email sender will be configured? | Customer onboarding and recovery | Owner confirms providers and verified sending domain |
| OPN-004 | Which payment provider and M-Pesa flow will be used? | Orders/payments, fees, webhooks and reconciliation | Provider API/commercial review; keep payment module unenabled until this is decided |
| OPN-005 | Is Herdbook single-farm only initially, or will more farms/business units require tenant isolation? | Membership and foreign-key rules | Confirm ownership/business model before migration; schema includes farm_id either way |
| OPN-006 | Which customer dashboard screens are approved as canonical? | UX consolidation | Owner validates merged screen map before frontend consolidation |

No cloud resources, project migrations, code changes, or deployments are part of this document set. Human review is still required for the open items above.
