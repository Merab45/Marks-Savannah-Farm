# Domain Model and Language

**Status:** Proposed domain language and invariants  
**Scope:** Shared business concepts for the website, customer PWA, Herdbook, and future API/database.

## Product contexts

- **Public catalogue:** products, services, approved livestock listings, public content and published auctions.
- **Customer commerce:** customer profile, saved items, enquiry, order request, order, fulfilment and payment.
- **Farm operations:** farm, location, animal, husbandry records, inventory, suppliers, purchases and financial records.
- **Auctions:** auction, lot, bidder identity, bid amounts, close result and winner.
- **Platform security:** identity, farm membership, permission, session, file metadata, notification and audit event.

One managed identity may participate as a customer and also have a staff membership. A customer role never grants access to staff records. Staff membership is scoped to a farm and can be disabled without deleting the person’s customer identity.

## Glossary

| Term | Meaning | Avoid confusing it with |
|---|---|---|
| Farm | The organization that owns or operates the records; current deployment has Mark’s Savannah Farm | A physical site or a browser account |
| Farm location | A named operating/pickup region such as Laikipia, Narok or Nakuru | Database region or hosting location |
| User identity | Authenticated person managed by the identity provider | Customer profile or staff role |
| Farm membership | Active relationship between a user and a farm, with one or more permissions | Customer registration |
| Animal | A privately managed individual with stable identity and lifetime records | Public livestock listing |
| Animal identifier | Tag, microchip, brand, ear mark or other identifier with type and issuing scope | Display name, which may be duplicated |
| Ownership history | Time-bounded record of who owned/managed an animal during a period | A listing or a sale attempt |
| Livestock listing | An explicitly approved public offer derived from a farm animal | The private animal record |
| Product | A saleable non-animal item or service with catalogue data | Stock quantity or purchase lot |
| Inventory item | A trackable supply/equipment item whose balance is derived from stock movements | Product availability shown to customers |
| Order | Customer request recorded by the server, with item snapshots and explicit status | Email draft or cart |
| Payment transaction | Provider-backed payment attempt/result; never inferred from an order status | Cashbook entry |
| Auction | Scheduled sale event with one or more lots and rules | A public bid list |
| Auction lot | One independently timed and valued auction item; may reference an animal or equipment | Whole auction event |
| Bid | Immutable server-accepted offer amount by a verified bidder identity | A local preview or an unconfirmed request |
| Bidder record | Private registration/eligibility state for one user and auction | Public bidder name |
| Auction result | Final server-determined outcome after close | Current highest bid while live |
| Financial transaction | Posted financial event supported by one or more source records | A quote, cart, or unverified payment callback |
| Public projection | A curated set of approved public fields | Direct access to operational tables |
| Audit event | Append-only record of a sensitive action and actor | Debug log or mutable activity summary |

## Ownership and source-of-truth rules

1. The managed identity provider owns credential verification, password recovery and authentication sessions. Application tables own farm roles and profile/business data.
2. The farm owns operational animal, health, breeding, feeding, inventory, purchase, auction and finance records.
3. A customer owns their own profile, saved items, orders and bid history. The farm may access those records only through authorized business roles and approved workflows.
4. The server owns order, payment, bid acceptance and auction close state. Client storage is a draft/cache only.
5. Public listing records are explicit publications. Animal health, precise ownership, customer/bidder identifiers, staff notes, supplier terms and finance never appear in public projections.
6. Media objects have a declared classification: public approved content or private operational evidence. Changing a listing to public does not make its entire animal folder public.

## Core invariants

### Animals and pedigree

- Each animal belongs to exactly one farm record scope. A recognized identifier is unique by farm and identifier type while it is active; historical aliases are retained rather than silently reused.
- Animal display name is not an identity key.
- Dam and sire references must point to different existing animals in the same farm, must not point to the animal itself, and must not create a pedigree cycle.
- Birth dates and event times are stored as dates/timestamps with a documented timezone policy. Records are corrected through an audit trail, not silently overwritten.
- An animal sale does not erase its identity, parent links, health history, or prior owners. Ownership transitions are recorded as history.
- Retired/deceased/sold animals remain available to authorized history/report queries, while a separate status prevents new sale publication.

### Public livestock publication

- A private animal is not public by default.
- A listing has a draft → review → approved/published → paused/withdrawn/expired lifecycle.
- Only a manager or content-publisher permission may approve/publish.
- The public API returns only explicitly listed fields, approved media, public location granularity, price/availability labels and a publication timestamp.
- Public clients cannot read raw animal or health tables, even if the UI hides fields.

### Orders and money

- Every order item snapshots product/listing name, unit, quantity, displayed price basis and relevant terms at order time. Catalog edits do not rewrite historical order lines.
- The server recalculates totals and availability. It ignores client-supplied totals.
- Money uses integer minor units plus ISO currency code; display rounds/formats separately. Store KES explicitly for current Kenya operations.
- Posted financial records are append-only. Corrections use a linked reversal/adjustment; an audit event explains the change.
- An order request, payment authorization, payment settlement and fulfilment are separate facts and statuses.
- An order is not paid because a browser wrote it to localStorage or navigated to a payment URL.

### Auctions and bids

- Auction and lot times are UTC timestamps; display uses Africa/Nairobi.
- The backend uses its own current time and authoritative transaction when determining whether bidding is open.
- A bid is accepted only while the lot is live, bidder eligibility is satisfied, amount meets the current minimum/increment and the lot has not closed.
- Bid acceptance is atomic with the current-highest check. Two concurrent bids cannot both win from the same stale highest amount without correct ordering.
- Accepted bids are immutable. Corrections are exceptional, permissioned, audited events; no silent edit/delete.
- A bidder identity is private. Public views expose only amount, timestamp rounded to a chosen granularity, and a non-identifying sequence/alias if necessary.
- Closing computes one result from eligible accepted bids and is idempotent. Contacting the winner/farm happens only after the server marks the lot closed and stores a result.

## State transitions

### Order

draft request → submitted → accepted/quoted → awaiting payment → paid/confirmed → preparing → dispatched/ready for collection → fulfilled. Cancellation/refund and rejection paths carry actor, reason and timestamp. A payment event can arrive late or be retried; provider reference and idempotency key prevent duplicates.

### Auction lot

draft → scheduled → live → closing → closed. A lot can be cancelled before close only by an authorized manager with a recorded reason. Once closed, bids are rejected. The winning/unsold result is recorded once. Browser countdown is informational; server state decides.

### Animal listing

private record → draft listing → submitted for review → approved/published → paused/withdrawn/expired. Marking animal sold creates an ownership/sales event and closes or withdraws active listings; it does not erase the listing history.

### Inventory

Stock changes are immutable movements: received, issued/consumed, sold, returned, adjusted, transferred, or counted. Available balance is calculated from movements; a correction is another movement with a reason.

## Ambiguities to resolve before detailed implementation

- Whether several independent farms/business entities will use this deployment or farm_id is tenant-ready but initially one farm.
- Whether customer product amounts are fixed prices or request-for-quote values; current site explicitly confirms many prices with the farm.
- Which exact currency granularity and cash-rounding policy will be used for finance and mobile-money settlement.
- Whether a user may bid without verified phone/email or must be approved by staff for a given auction.
- What animal identifiers are mandatory by species and the treatment of imported animals with duplicate legacy tags.
- Retention and correction rules for financial, animal-health, customer, and auction records.
