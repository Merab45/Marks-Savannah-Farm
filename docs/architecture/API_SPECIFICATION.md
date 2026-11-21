# Shared API Specification

**Status:** Proposed contract; no endpoints are implemented  
**Version:** v1  
**Audience:** Website, customer PWA, Herdbook and backend implementers

## 1. Contract conventions

- Base path: /v1 for application endpoints. Supabase Auth endpoints remain provider-managed and are called through the supported client SDK.
- Request/response: JSON UTF-8. Dates/times use RFC 3339 UTC. Money is integer minor units and ISO currency code.
- Authentication: bearer access token from the central Auth provider. Public routes allow anonymous requests. Staff routes require an active farm membership and permission.
- Pagination: opaque cursor with bounded page size; default 20, maximum 100. Filters are allow-listed; do not accept raw SQL/sort clauses.
- Mutations that can be retried accept Idempotency-Key. Reuse with the same payload returns the original outcome; same key with different payload returns conflict.
- Server validates all identifiers, quantities, status transitions, current prices, visibility, ownership and timestamps. Client values never determine final order totals or auction validity.
- Use ETag/If-Match or explicit version fields for concurrent edits to animal/publication records. Never silently overwrite another staff member’s update.
- Every response includes request_id. Logs use the same ID and omit passwords, tokens, full payment data and unnecessary customer content.

## 2. Common success and error shapes

~~~json
{
  "data": { "id": "resource-id", "status": "submitted" },
  "meta": { "request_id": "uuid", "created_at": "2026-11-20T08:30:00Z" }
}
~~~

~~~json
{
  "error": {
    "code": "BID_TOO_LOW",
    "message": "Enter a bid at or above the current minimum.",
    "request_id": "uuid",
    "details": { "minimum_amount_minor": 8600000, "currency": "KES" }
  }
}
~~~

Expected codes include VALIDATION_ERROR (400/422), UNAUTHENTICATED (401), FORBIDDEN (403), NOT_FOUND (404), CONFLICT or VERSION_MISMATCH (409), RATE_LIMITED (429 with Retry-After), DEPENDENCY_UNAVAILABLE (503), and INTERNAL_ERROR (500). Do not return SQL errors, stack traces, policy expressions, object keys or provider secrets. A timeout with unknown mutation status is not reported as success; the client queries by idempotency key or resource ID.

## 3. Public routes — no login

| Method and route | Purpose and response boundary | Validation/cache |
|---|---|---|
| GET /v1/public/farm | Approved public name, contact, service regions and locations | Cacheable with short TTL and ETag |
| GET /v1/public/products | Published/active products and categories; excludes private procurement fields | Validate category, query length, cursor, page size; public cache |
| GET /v1/public/products/{slug} | One published product, public detail and approved media | 404 for draft/unpublished |
| GET /v1/public/livestock | Approved listings only; allow-listed animal details and public location label | Filters species/breed/status; no private animal or owner identifiers |
| GET /v1/public/livestock/{listingId} | Approved listing and public detail | 404 for withdrawn/expired/private |
| GET /v1/public/content/{slug} | Published editorial content | Drafts return 404 |
| GET /v1/public/auctions | Published event and lots, current public status and amounts | No bidder identities; status derived against server time |
| GET /v1/public/auctions/{auctionId}/lots/{lotId} | Public lot detail, specifications and anonymized amount history | Do not expose user_id, email, phone or eligibility notes |
| POST /v1/public/enquiries | Rate-limited enquiry from anonymous or signed-in visitor | Strict field lengths, honeypot/Turnstile option, consent and abuse controls |

All public catalogue endpoints must query curated views or domain functions that explicitly enumerate approved fields. Do not grant public SELECT on animals, treatment, customer, supplier, order, bid identity, finance, or staff tables.

## 4. Authentication and customer routes

Authentication operations—sign up, sign in, email verification, OAuth, recovery, refresh, sign out and session revocation—use the selected provider’s official Auth flow. The current Google/Facebook/Apple buttons are not connected; configuring them is a separate provider-console task.

| Method and route | Permission | Behavior |
|---|---|---|
| GET /v1/me | Customer or staff | Returns safe own profile and active role names; never returns password/provider secrets |
| PATCH /v1/me | Own authenticated user | Updates validated profile fields; audit phone/email changes as appropriate |
| GET /v1/me/orders | Own customer | Paginated order summaries and status history |
| POST /v1/orders | Customer | Creates order request; server reads current catalogue, stock/quote rules, validates items and writes order + snapshots in one transaction |
| GET /v1/orders/{orderId} | Owner or authorized staff | Owner gets own order only; staff permission is checked separately |
| POST /v1/enquiries | Anonymous or customer | Records an enquiry centrally; server assigns farm, validates, rate-limits and returns enquiry ID |
| GET /v1/me/saved-items | Customer | Own saved products/listings only |
| PUT /v1/me/saved-items/{type}/{id} | Customer | Idempotent save/upsert |
| DELETE /v1/me/saved-items/{type}/{id} | Customer | Removes only own save |
| GET /v1/me/bids | Customer | Own bid amounts and auction status; never other bidders’ details |
| POST /v1/auctions/{auctionId}/lots/{lotId}/bids | Eligible customer | Server accepts/rejects atomically as described below |

### Order request example

~~~http
POST /v1/orders
Authorization: Bearer <customer-access-token>
Idempotency-Key: 3f1e9c41-...
Content-Type: application/json
~~~

~~~json
{
  "items": [{ "product_id": "uuid", "quantity": 2 }],
  "fulfilment": { "method": "collection", "location_id": "uuid" },
  "customer_note": "Please confirm availability before payment."
}
~~~

Response is 201 with order ID, server-computed total or quote-required status, currency, current status and request ID. If availability or quote price must be confirmed, response is an order request, not a paid/confirmed sale. Payment completion requires a separately verified provider callback.

## 5. Auction bid contract

POST bid body: amount_minor, currency, and optional client-visible bid note only if explicitly approved by business policy. Authentication identifies bidder; do not accept bidder identity/contact fields from request. The transaction checks auction/lot status using server time, active bidder eligibility, currency, minimum increment, reserve policy, idempotency key, and current highest bid under row lock/serializable constraint. It inserts immutable bid, updates the lot’s high amount/version, and writes an audit event atomically.

Response 201 returns bid ID, accepted amount, currency, accepted_at, current public high amount and lot status. If the client loses connectivity after submitting, display “Checking bid status,” then query the idempotency result; do not call it accepted without the server response. Public bid history is a separate projection containing amount and allowed timestamp only.

## 6. Staff-only routes

Each route requires an active membership for the relevant farm plus its specific permission. A generic “staff” role is not sufficient for every route.

| Domain | Routes (method + path) | Permission family |
|---|---|---|
| Animals | GET/POST /v1/staff/animals; GET/PATCH /v1/staff/animals/{id}; POST /v1/staff/animals/{id}/archive | animal.read/create/update/archive |
| Identifiers | POST/DELETE /v1/staff/animals/{id}/identifiers/{identifierId} | animal.identifier.manage; deletion retires identifier rather than erasing history |
| Health | GET/POST /v1/staff/animals/{id}/health-records; POST /v1/staff/animals/{id}/treatments | animal.health.read/write; vet or manager |
| Vet/breeding/feeding | GET/POST /v1/staff/veterinary-visits; GET/POST /v1/staff/breeding-events; GET/POST /v1/staff/feeding-records | domain-specific read/write permissions |
| Publication | POST /v1/staff/animals/{id}/listings; POST /v1/staff/listings/{id}/submit; POST /v1/staff/listings/{id}/approve; POST /v1/staff/listings/{id}/withdraw | draft by stock staff; approval/publish by manager/content publisher |
| Products/content | GET/POST/PATCH /v1/staff/products; POST /v1/staff/products/{id}/approve; GET/POST /v1/staff/content | product.manage/content.edit; publish requires content.publish |
| Inventory | GET/POST /v1/staff/inventory-items; GET /v1/staff/inventory-items/{id}/movements; POST /v1/staff/stock-movements | inventory.read/receive/adjust; adjustment elevated and reason required |
| Suppliers/purchases | GET/POST/PATCH /v1/staff/suppliers; GET/POST /v1/staff/purchases; POST /v1/staff/purchases/{id}/receive; POST /v1/staff/purchases/{id}/approve | procurement roles; approval thresholds configurable |
| Finance | GET /v1/staff/finance/transactions; POST /v1/staff/finance/transactions; POST /v1/staff/finance/transactions/{id}/post; POST /v1/staff/finance/transactions/{id}/reverse; GET /v1/staff/reports/finance | finance.read/write/post/reverse; reports may be finance/owner only |
| Auctions | POST /v1/staff/auctions; PATCH /v1/staff/auctions/{id}; POST /v1/staff/auction-lots; POST /v1/staff/auction-lots/{id}/publish; POST /v1/staff/auction-lots/{id}/close; GET /v1/staff/auction-lots/{id}/bidders | auction.manage/publish/close; private bidder list requires auction.bidders.read |
| Staff | GET/POST/PATCH /v1/staff/memberships; POST /v1/staff/memberships/{id}/disable | owner/administrator only; all changes audited |
| Media | POST /v1/media/upload-intents; POST /v1/media/{id}/complete; POST /v1/staff/media/{id}/approve-public | owner-scoped upload; private by default; public approval separate |
| Notifications | GET /v1/me/notifications; PATCH /v1/me/notifications/{id}; POST /v1/staff/notifications | own notifications; sending requires dedicated permission and rate limit |

## 7. Validation, concurrency and recovery

- Validate request schemas at the API boundary; enforce critical constraints again in the database.
- Use server-side timestamps. Client clocks are display-only.
- Use optimistic version checks for ordinary edits and locked/serializable transactions for bids, inventory receiving, finance posting and order state changes.
- Retry only idempotent commands or requests with a valid idempotency key; use bounded exponential backoff with jitter for transient dependencies.
- Return 409 for stale object versions or duplicate business state, 422 for well-formed but invalid transitions, 429 with Retry-After for rate limits.
- Log request ID, authenticated actor ID, route, stable error code, duration and dependency status. Redact tokens, password fields, full private health details, payment secrets and signed URLs.
- Browser pending state must be visually different from server-confirmed status. Reconnection does not automatically replay bids, payments or orders without idempotency and explicit user confirmation.

## 8. API acceptance checks

- Anonymous requests cannot fetch draft/unapproved listings, private health/ownership, customer records, bidder identity, finance or staff memberships.
- Customer A cannot read or change customer B’s orders, profile, saved items or bids, even by substituting IDs.
- Staff without animal.health.read cannot fetch health details; staff without auction.bidders.read cannot fetch bidder identities.
- Repeating a successful order/bid request with the same key returns the same result, not duplicate rows. Reusing the key with changed data returns 409.
- Simultaneous bids are ordered by the transaction, not client timestamps; no bid succeeds at or after server close.
- Public output contains no raw private table serialization and includes only allow-listed fields.
