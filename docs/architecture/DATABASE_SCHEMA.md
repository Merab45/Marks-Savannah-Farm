# Proposed Database Schema

**Status:** Logical target schema; its first local foundation slice is implemented in `supabase/migrations/20261120000100_farm_foundation.sql`, with local execution/pgTAP verification pending
**Database:** PostgreSQL, recommended through Supabase
**Scope:** Central record for website, customer PWA and private Herdbook. Every mutable farm-owned business table carries farm_id either directly or through an explicitly constrained parent. Names and examples are proposals, not current production data.

The first migration implements only farms, farm locations, Auth-linked user profiles, farm memberships, a fixed role-permission catalog, species, breeds, animals, and animal identifiers. The remaining entities and fields below are still design proposals. In the implemented subset, membership status is `invited | active | disabled`; farm/animal status and role grants are constrained in SQL. Role changes are trusted-server-only and no role-administration API exists yet.

## Conventions

- Primary IDs: UUID generated server-side. Auth identity IDs use the UUID issued by Supabase Auth and are not passwords.
- Tenant scope: farm_id is included on farm-owned tables for consistent authorization and possible multi-farm growth, even if the first installation has one farm.
- Time: timestamptz in UTC for event time; date for calendar-only facts; display in Africa/Nairobi.
- Money: BIGINT amount_minor plus CHAR(3) currency; current farm records use KES. Never use floating point for money.
- Change history: status histories and business ledgers are append-only. A correction uses a new record/reversal.
- Referential deletion: restrict deletion of financial, sale, bid, ownership, health, order and audit history. Use archived_at or status for operational retirement. Cascade only transient children such as draft upload parts where safe.
- RLS: enable on every app table. Public clients must not receive direct SELECT on private operational rows. A security-definer function or API query must be narrowly scoped, search_path-fixed, and reviewed.

## Farm, identity and authorization

| Table | Purpose and important fields | Relationships, constraints and indexes |
|---|---|---|
| farms | Farm account: id, slug, legal_name, display_name, currency, timezone, settings_json, created_at, archived_at | Unique slug; currency ISO code; default timezone Africa/Nairobi. Parent for all farm records. |
| farm_locations | Operating/pickup locations: id, farm_id, name, county, address, public_label, contact data, active | FK farm; public_label controls precise public exposure; index (farm_id, active). Laikipia/Narok/Nakuru are records, not schema constants. |
| user_profiles | App profile joined 1:1 to auth.users: user_id PK, display_name, phone, preferred_language, created_at, updated_at, deleted_at | Identity FK; normalized phone index only if lookup is required; never store credentials or provider secrets here. |
| customer_profiles | Customer-only extension: user_id PK, marketing_consent_at, default_delivery_contact/address reference, created_at | FK user_profiles; address/contact data is private. Do not duplicate email/password owned by Auth. |
| farm_memberships | Staff roles per farm: id, farm_id, user_id, role_code, active, invited_by, accepted_at, disabled_at | Unique active (farm_id,user_id,role_code); indexes (user_id,active), (farm_id,role_code,active). Role assignments are server-managed and audited. |
| role_permissions | Optional explicit permission map: role_code, permission_code, scope | PK (role_code,permission_code); seed controlled roles. Changes require migration and audit. RLS/API policy remains authoritative. |

## Farm records and animal history

| Table | Purpose and important fields | Relationships, constraints and indexes |
|---|---|---|
| species | Controlled taxonomy: id, code, name, active | Unique code and normalized name. Examples: cattle, goat, sheep, pig, chicken, duck, turkey. |
| breeds | Breed taxonomy: id, species_id, name, origin/description, active | FK species; unique (species_id, normalized_name). |
| animals | Private animal master: id, farm_id, current_location_id, species_id, breed_id nullable, display_name, sex, birth_date, status, dam_id, sire_id, purchase/source metadata, private_notes, created_by, timestamps, archived_at | FKs to farm/species/breed/location and self-reference parents; checks dam_id != id, sire_id != id, dam_id != sire_id. Index (farm_id,status), (farm_id,species_id,status), (farm_id,created_at DESC), (farm_id,dam_id), (farm_id,sire_id). Cycle prevention is checked in a transaction function/trigger. |
| animal_identifiers | Tag, microchip, brand or ear-mark history: id, farm_id, animal_id, identifier_type, normalized_value, issued_at, retired_at, issuer | FK animal; unique active identifier by (farm_id,identifier_type,normalized_value) using a partial unique index where retired_at IS NULL; index animal_id. Preserve retired identifiers. |
| animal_ownership_history | Ownership/management chain: id, farm_id, animal_id, owner_type, owner_reference, starts_at, ends_at, source_transaction_id, notes, recorded_by | FK animal; check ends_at > starts_at; one active ownership row per animal via partial unique index; index (animal_id,starts_at DESC). Closing/sale records the prior period and inserts the successor atomically. |
| health_records | Private dated health event: id, farm_id, animal_id, event_type, occurred_at, symptoms/diagnosis, observations, outcome, vet_visit_id, recorded_by | FK animal and optional visit; index (animal_id,occurred_at DESC), (farm_id,event_type,occurred_at DESC). Never available from public listing APIs. |
| treatments | Vaccination/medication/treatment detail: id, farm_id, animal_id, health_record_id, product, batch_number, dose, unit, route, administered_at, next_due_at, provider, cost_minor, currency | FK animal/health record; dose positive if present; index (animal_id,next_due_at), (farm_id,administered_at DESC). Treat credentials/medical notes as restricted operational data. |
| veterinary_visits | Visit header: id, farm_id, animal_id nullable for herd visit, vet_name/provider, scheduled_at, visited_at, location_id, summary, cost_minor, currency, status | FK farm/location/animal; index (farm_id,scheduled_at), (animal_id,visited_at DESC). Visit attachments reference media files. |
| breeding_events | Mating/insemination: id, farm_id, dam_id, sire_id nullable, event_type, occurred_at, method, outcome, notes, recorded_by | FKs animals; dam and sire must be compatible species and not same animal; index (dam_id,occurred_at DESC), (sire_id,occurred_at DESC). |
| pregnancies | Pregnancy observations: id, farm_id, dam_id, breeding_event_id, confirmed_at, expected_birth_date, status, outcome_at, recorded_by | FK dam/event; expected date not before confirmation; index (farm_id,status,expected_birth_date), (dam_id,confirmed_at DESC). |
| birth_records | Birth/litter header: id, farm_id, dam_id, sire_id nullable, breeding_event_id nullable, born_at, location_id, outcome_summary, assistance, recorded_by | FKs animals/event/location; index (dam_id,born_at DESC). |
| birth_offspring | Connect birth record to offspring: birth_record_id, animal_id, outcome_at_birth, notes | Composite PK (birth_record_id,animal_id); offspring animal FK; checks link farm and dam/sire where applicable. Animal dam_id/sire_id remain pedigree source. |
| feeding_records | Feed event: id, farm_id, animal_id nullable, group_label nullable, feed_item, quantity, unit, fed_at, cost_minor, recorded_by | Must specify animal or group; index (farm_id,fed_at DESC), (animal_id,fed_at DESC). Group feeding can later be normalized to animal groups. |
| farm_activities | Operational event: id, farm_id, location_id, activity_type, title, details, starts_at, ends_at, status, recorded_by | Index (farm_id,starts_at DESC), (farm_id,activity_type,starts_at DESC). This is a general log, not a substitute for structured health/breeding records. |

## Inventory, suppliers and purchasing

| Table | Purpose and important fields | Relationships, constraints and indexes |
|---|---|---|
| inventory_items | Trackable stock: id, farm_id, sku, name, category, unit, reorder_level, active, product_id nullable | Unique (farm_id,sku); FK optional product; index (farm_id,category,active). Current quantity is derived from stock movements, not independently edited. |
| stock_movements | Immutable quantity changes: id, farm_id, inventory_item_id, movement_type, quantity_delta, unit_cost_minor, currency, source_type/source_id, occurred_at, location_id, recorded_by, reversal_of_id | Quantity nonzero; FK item; reversal unique; indexes (inventory_item_id,occurred_at DESC), (farm_id,source_type,source_id). Receive/issue/return/adjust/transfer must have a reason and actor. |
| suppliers | Vendor profile: id, farm_id, legal/display name, contacts, tax/reference fields, payment_terms, active, notes | Index (farm_id,normalized_name); private to purchasing/finance roles. Encrypt or minimize sensitive fields as required. |
| purchases | Purchase header/order: id, farm_id, supplier_id, purchase_number, status, ordered_at, received_at, currency, subtotal/tax/total minor, created_by, approved_by | Unique (farm_id,purchase_number); status history; index (farm_id,status,ordered_at DESC), (supplier_id,ordered_at DESC). Receiving creates stock movements transactionally. |
| purchase_items | Purchase lines: id, purchase_id, inventory_item_id, description_snapshot, quantity_ordered, quantity_received, unit_cost_minor, tax_minor | FK purchase/item; check received between 0 and ordered; index purchase_id. |

## Public catalogue and customer commerce

| Table | Purpose and important fields | Relationships, constraints and indexes |
|---|---|---|
| product_categories | Catalogue taxonomy: id, farm_id, slug, name, parent_id nullable, display_order, active | Unique (farm_id,slug); parent FK; index active/display order. Categories can include livestock, crops, poultry, dairy, equipment and farm inputs. |
| products | Non-animal goods/services: id, farm_id, category_id, sku, slug, name, public_description, private_description, price_mode, price_minor nullable, currency, unit, active, publication_state, created_by, approved_by, timestamps | Unique farm slug/SKU; price_mode fixed/quote/confirmed; nonnegative amount; index (farm_id,publication_state,category_id). Public reads only approved fields. |
| livestock_listings | Explicit animal publication: id, farm_id, animal_id, public_title, public_description, public_location_id nullable, price_mode, price_minor nullable, currency, availability_state, approval_state, published_at, expires_at, approved_by, withdrawn_at | FK animal/location; ensure active published listing cannot conflict with sold/archived animal; index (farm_id,approval_state,published_at DESC), (animal_id,approval_state). Public API uses a safe view, not animals directly. |
| content_pages | Optional managed public content: id, farm_id, slug, title, body, content_type, publication_state, published_at, authored_by, approved_by, updated_at | Unique farm/slug; public index (publication_state,published_at DESC). Existing HTML can stay static until CMS ownership is wanted. |
| orders | Customer order/request: id, farm_id, customer_user_id, order_number, status, currency, subtotal_minor, delivery_minor, total_minor, fulfilment_method, fulfilment_location_id, customer_note, idempotency_key, submitted_at, accepted_at, created_at | Unique farm/order_number; unique (customer_user_id,idempotency_key); index (farm_id,status,created_at DESC), (customer_user_id,created_at DESC). Server computes all totals. |
| order_items | Historical item snapshot: id, order_id, source_type, source_id nullable, name_snapshot, unit_snapshot, quantity, unit_price_minor nullable, line_total_minor nullable, price_status, item_details_snapshot | FK order; quantity positive; index order_id. Quote/confirmed prices represented explicitly; client values are never trusted. |
| order_status_history | Append-only state transitions: id, order_id, from_status, to_status, actor_user_id, reason, created_at | FK order; index (order_id,created_at). Transition graph validated by API/domain function. |
| payment_transactions | Provider interaction: id, farm_id, order_id, provider, provider_reference, idempotency_key, amount_minor, currency, status, initiated_at, settled_at, raw_event_reference | Unique provider/reference where present; unique idempotency; indexes (order_id,created_at DESC), (status,created_at). Raw webhook payloads are minimized/redacted; signature verification required. |
| fulfilments | Delivery/collection: id, farm_id, order_id, method, status, location_id, scheduled_at, completed_at, proof_media_id nullable, handled_by, notes | FK order/location/media; index (farm_id,status,scheduled_at). Delivery address/private customer data is not public. |
| enquiries | Customer contact request: id, farm_id, customer_user_id nullable, name, email, phone, category, message, location/count, status, assigned_to, created_at, consent | Rate-limit and retain under policy; index (farm_id,status,created_at DESC), customer_user_id. Anonymous form has abuse controls. |

## Auctions

| Table | Purpose and important fields | Relationships, constraints and indexes |
|---|---|---|
| auctions | Event: id, farm_id, slug, title, description, status, starts_at, closes_at, timezone_display, terms_version, created_by, approved_by, published_at | Unique farm slug; closes_at > starts_at; index (farm_id,status,starts_at), published listings only. All times are timestamptz UTC. |
| auction_lots | Independently bid lot: id, farm_id, auction_id, animal_id or product/equipment reference, title/description snapshot, starting_bid_minor, current_high_bid_minor, increment_minor, reserve_minor nullable, quantity, specifications_json, status, starts_at, closes_at, version | Require exactly one source type/reference; starting bid and increment positive; index (auction_id,status,closes_at), public live filter; close version for atomic updates. |
| auction_bidders | Private eligibility record: id, farm_id, auction_id, user_id, status, approved_by, approved_at, private_reference | Unique (auction_id,user_id); index (farm_id,auction_id,status); never exposed to public API. |
| bids | Immutable accepted offers: id, farm_id, auction_lot_id, bidder_user_id, bidder_record_id, amount_minor, currency, accepted_at, idempotency_key, sequence_number, status | Unique (bidder_user_id,idempotency_key); unique (auction_lot_id,sequence_number); amount positive; indexes (auction_lot_id,accepted_at DESC), (auction_lot_id,amount_minor DESC), (bidder_user_id,accepted_at DESC). Public projection omits bidder fields. |
| auction_results | One close outcome per lot: id, farm_id, auction_lot_id, outcome, winning_bid_id nullable, winner_user_id nullable, final_amount_minor nullable, closed_at, closed_by/system, contact_status | Unique auction_lot_id; winner and bid must correspond to that lot; private winner fields protected. Close operation and result insert are atomic/idempotent. |

## Finance and reporting

| Table | Purpose and important fields | Relationships, constraints and indexes |
|---|---|---|
| finance_categories | Income/expense classification: id, farm_id, code, name, direction, active | Unique (farm_id,code); controlled edits; index (farm_id,direction,active). |
| finance_accounts | Cash/bank/mobile-money/receivable/payable account: id, farm_id, code, name, account_type, currency, active | Unique (farm_id,code); no credentials/token data. |
| financial_transactions | Posted cashbook/ledger event: id, farm_id, transaction_number, kind, status, occurred_at, description, source_type/source_id, currency, created_by, posted_at, reverses_transaction_id | Unique farm transaction number; reversal link unique; index (farm_id,occurred_at DESC), (farm_id,kind,occurred_at DESC), (source_type,source_id). Posted record is immutable. |
| financial_transaction_lines | Balanced posting: id, transaction_id, account_id, category_id, debit_minor, credit_minor, memo | Exactly one of debit/credit positive; balanced sum validated in posting transaction/deferred constraint trigger; indexes (transaction_id), (account_id,created_at), (category_id,created_at). Reports aggregate posted lines; reports are not independently editable facts. |

## Files, events and operational platform

| Table | Purpose and important fields | Relationships, constraints and indexes |
|---|---|---|
| media_files | Object metadata: id, farm_id, object_key, bucket, classification, mime_type, byte_size, sha256, scan_status, owner_user_id, related_type/id, public_approved_at, created_at, deleted_at | Unique bucket/object_key; size/MIME allowlist; index related entity and classification. File bytes live in Storage, not Postgres. |
| notifications | In-app notification: id, recipient_user_id, farm_id nullable, type, title, body, payload_safe_json, read_at, created_at, delivery_status | Index (recipient_user_id,read_at,created_at DESC), (farm_id,created_at). Payload contains no private data beyond recipient need. |
| audit_events | Append-only security/business trail: id, farm_id nullable, actor_user_id nullable, action, entity_type/id, before_json, after_json, request_id, source_ip_hash, created_at | Index (farm_id,created_at DESC), (entity_type,entity_id,created_at DESC), (actor_user_id,created_at DESC). Exclude passwords, tokens, payment credentials and unnecessary PII. Restrict updates/deletes. |
| idempotency_records | Mutation deduplication: id, actor_user_id nullable, route_scope, key, request_hash, response_status, result_resource_type/id, expires_at, created_at | Unique (actor_user_id,route_scope,key); key reuse with different payload is conflict; index expires_at for cleanup. Needed for order, bid and payment command retries. |

## Index and integrity policy

- Add indexes for foreign keys used in joins, list screens, filters and policy predicates, then validate with real query plans. Do not index every field by default.
- Composite indexes begin with farm/tenant and common filter/status fields where that matches actual queries.
- Unique constraints are the final protection for IDs, idempotency, order numbers, provider references, active animal tags, one result per auction lot, and one active owner record.
- Use database transactions for order total snapshots, stock movement receipt, bid acceptance/high-water update, auction close/result, and balanced finance posting.
- Validate cross-row invariants in server functions or database functions, not a plain CHECK constraint. Specifically: pedigree cycle, matching farm IDs, amount increments relative to current bid, balanced finance, state transitions and publication authorization.
- Store dates as UTC instants and make local business date derivation explicit. Do not use client time for auction close, sales date, or financial period.
- Public views must be explicit column lists. Never use SELECT * in public API views.

## Migration notes from the prototype

- Auth accounts currently exist only in individual browser storage. Do not import local password hashes as valid centralized credentials. Create identities through a new verified signup/reset flow; optionally transfer a customer profile after identity is proven.
- Herdbook records are stored under herdbook-animals and may include seeded demo rows. A future export/import must label demos, validate identifiers, keep a source mapping, upload compressed base64 photos to Storage, produce a dry-run conflict report, and retain a source backup until reconciliation is accepted.
- Existing local carts, favorites, bids and order previews are not authoritative records. Treat them as drafts or ask users to recreate them; never convert local accepted bids/payments into official history.
