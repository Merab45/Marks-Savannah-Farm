# Platform Workflows

**Status:** Proposed end-to-end behavior; current browser prototypes are not authoritative  
**Rule:** The backend persists business transitions and validates permissions. The browser displays the server result; local state is only a draft/cache.

## WF-01 — Staff registers and publishes livestock

1. An authenticated employee creates an animal in Herdbook with species, identifiers, breed, sex, birth/source data, location and permitted photos. The API checks animal.create for the active farm and enforces unique identifiers.
2. The employee adds private health, vaccination, veterinary, breeding or feeding records as allowed. Files upload to private storage by default.
3. The employee creates a draft public livestock listing from the animal. Only the draft’s explicitly public fields and selected photos are copied to the listing projection.
4. A manager/content publisher reviews the listing, pricing mode, availability, public location and media. Approval and publication are audited.
5. Public website and PWA read only the published listing projection. Changes to the animal’s private health record do not alter public responses.
6. If the animal sells or becomes unavailable, an authorized staff action changes status and withdraws the listing atomically. History remains retained.

~~~mermaid
sequenceDiagram
  participant Staff as Herdbook staff
  participant API as Shared API
  participant DB as PostgreSQL
  participant Manager as Approver
  participant Public as Website/PWA
  Staff->>API: Create animal and private records
  API->>DB: Validate farm role and save
  Staff->>API: Submit draft listing
  API->>DB: Store allow-listed publication fields
  Manager->>API: Approve and publish
  API->>DB: Audit approval and activate listing
  Public->>API: Read approved listings only
  API->>DB: Query public projection
~~~

## WF-02 — Customer places an order from website or PWA

1. Customer browses the same published catalogue from either surface; price modes clearly distinguish fixed price, quote required and farm-confirmed pricing.
2. The customer submits product IDs, quantities, fulfilment choice and optional note with an idempotency key. Client-supplied total, stock and availability are ignored.
3. The API validates identity/anonymous policy, item state, quantity, fulfilment location and current price rules. In one transaction it creates order + item snapshots + initial status event.
4. The response says “request received” or “quote required”; a durable server order number is shown only after the write commits.
5. Authorized staff see the order in Herdbook, review stock/price/delivery and accept, quote, reject or request information. Each transition is recorded.
6. Payment starts only after confirmed amount/terms. A provider webhook is signature-verified and idempotently applied. Order status changes to paid only from a verified provider event or an audited authorized offline-payment entry.
7. Fulfilment is tracked separately; customer sees only their own order and safe status details.

If connectivity drops before the server response, the client queries by idempotency key. It never reports an order as placed merely because the button was tapped or a localStorage row was saved.

## WF-03 — Auction from publishing through result

1. Staff creates an auction and lots with start/end time, starting amount, increment, reserve policy, specifications and approved media.
2. An authorized publisher approves it; public APIs return only the auction rules, listing-safe lot details, countdown source time and anonymized bid amounts.
3. A customer signs in and, if required, completes bidder eligibility. The customer submits amount + idempotency key; identity is taken from Auth, not request JSON.
4. The API uses server time and a transaction/lock to validate lot is live, bidder eligible, minimum/increment, reserve/business rules and current high bid; it inserts immutable bid and updates current high amount atomically.
5. Public list shows amount-only history. Owner/customer can see their own bid status; only authorized manager/owner can inspect bidder identity for post-close operations.
6. At close, a scheduled or request-triggered idempotent close operation rechecks server time, rejects new bids, determines winning/unsold result, stores result and creates an audit event.
7. The farm contacts the winner/participants only after the lot is closed and result exists. Payment, collection, and ownership transfer are separate records.

Concurrent bid outcome is determined by committed transaction ordering. A client countdown is advisory; it cannot extend or shorten the server’s closing time.

## WF-04 — Farm operations and reporting

1. Staff signs into the private Herdbook surface and receives permissions from an active farm membership.
2. Staff updates animal, health, breeding, feed, inventory or activity records through domain-specific routes.
3. Each write checks role, farm scope, state and required fields; sensitive updates create audit events.
4. Stock changes create movements; finance changes create balanced postings/reversals; reports aggregate posted server records.
5. Manager reviews reports filtered by farm/location/time period. Customer/public APIs cannot read these source rows.

## WF-05 — Offline customer experience

1. Before going offline, the PWA may have shell assets and approved public content cached.
2. Offline, it renders only cached public information and labels it as cached/stale. It can retain an optional enquiry draft that is visibly “not sent.”
3. Orders, bids, payments and staff changes require connection. Their controls are disabled or show a clear connection requirement.
4. On reconnection, public caches refresh. The user reviews and explicitly submits any saved enquiry draft.
5. No sensitive API response or personal record is replayed from a shared-device cache. A server-confirmed response remains the only evidence of accepted state.

## Cross-workflow failure cases

| Condition | Required result |
|---|---|
| Request retried after timeout | Same idempotency key returns original resource/result, not a duplicate |
| User loses permission between screen load and save | API denies write; UI refreshes access state and explains the action is unavailable |
| Listing approved while source animal becomes sold | Transaction/state check prevents publishing stale availability |
| Payment webhook delivered twice/out of order | Signature check, provider event ID and state-transition rules prevent duplicate settlement |
| Two bids arrive concurrently | Atomic comparison and immutable order; no stale overwrite |
| Auction close job runs more than once | Close/result operation is idempotent |
| Storage upload completes but DB save fails | Orphan object cleanup/reconciliation; no public URL until metadata/approval is committed |
| Cached public listing is outdated | Clear last-updated timestamp and refresh; do not promise current stock/price |
