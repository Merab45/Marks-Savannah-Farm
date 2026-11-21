# Entity Relationship Diagrams

**Status:** Proposed diagrams matching DATABASE_SCHEMA.md  
**Notation:** Crow’s-foot cardinalities. These are logical relationships, not a generated SQL migration. Auth provider tables are external to the application schema.

## FIG-01 — Farm identity and animal history

This diagram shows the private animal record and its operational history. Public listings are a separate approved publication. Auth identity is managed by the selected provider and keyed by user_profiles.user_id.

~~~mermaid
erDiagram
  farms ||--o{ farm_locations : has
  farms ||--o{ farm_memberships : grants
  user_profiles ||--o{ farm_memberships : joins
  user_profiles ||--o| customer_profiles : extends
  farms ||--o{ animals : owns
  farm_locations ||--o{ animals : houses
  species ||--o{ breeds : classifies
  species ||--o{ animals : classifies
  breeds ||--o{ animals : identifies
  animals ||--o{ animal_identifiers : identified_by
  animals ||--o{ animal_ownership_history : ownership
  animals ||--o{ animals : parent_of
  animals ||--o{ health_records : has
  health_records ||--o{ treatments : includes
  animals ||--o{ veterinary_visits : receives
  animals ||--o{ breeding_events : participates
  breeding_events ||--o| pregnancies : may_create
  breeding_events ||--o| birth_records : may_result_in
  birth_records ||--o{ birth_offspring : records
  animals ||--o{ birth_offspring : is_offspring
  animals ||--o{ feeding_records : fed
  farms ||--o{ farm_activities : logs
  farms ||--o{ livestock_listings : publishes
  animals ||--o{ livestock_listings : may_be_listed
~~~

## FIG-02 — Customer catalogue, orders and auctions

Orders snapshot catalogue facts at submission. Bidder identity remains on the private bidder/bid rows; public API projections expose only permitted amount/timing fields.

~~~mermaid
erDiagram
  farms ||--o{ product_categories : defines
  product_categories ||--o{ products : groups
  farms ||--o{ products : offers
  user_profiles ||--o{ orders : places
  farms ||--o{ orders : receives
  orders ||--|{ order_items : contains
  orders ||--o{ order_status_history : transitions
  orders ||--o{ payment_transactions : paid_by
  orders ||--o{ fulfilments : fulfilled_by
  user_profiles ||--o{ enquiries : sends
  farms ||--o{ enquiries : receives
  farms ||--o{ auctions : schedules
  auctions ||--|{ auction_lots : contains
  auction_lots ||--o{ bids : receives
  user_profiles ||--o{ auction_bidders : registers
  auctions ||--o{ auction_bidders : qualifies
  auction_bidders ||--o{ bids : submits
  auction_lots ||--o| auction_results : closes_as
  bids ||--o| auction_results : may_win
~~~

## FIG-03 — Inventory, purchasing and finance

Stock is derived from movements rather than a mutable quantity field. Financial reports aggregate posted transaction lines and are not authoritative records themselves.

~~~mermaid
erDiagram
  farms ||--o{ inventory_items : tracks
  inventory_items ||--o{ stock_movements : changes
  farms ||--o{ suppliers : contracts
  suppliers ||--o{ purchases : supplies
  purchases ||--|{ purchase_items : contains
  inventory_items ||--o{ purchase_items : ordered_as
  purchases ||--o{ stock_movements : received_as
  farms ||--o{ finance_categories : classifies
  farms ||--o{ finance_accounts : holds
  farms ||--o{ financial_transactions : records
  financial_transactions ||--|{ financial_transaction_lines : posts
  finance_accounts ||--o{ financial_transaction_lines : booked_to
  finance_categories ||--o{ financial_transaction_lines : reports_as
  user_profiles ||--o{ audit_events : acts
  farms ||--o{ audit_events : records
  user_profiles ||--o{ notifications : receives
  user_profiles ||--o{ media_files : uploads
~~~

## Integrity notes

- The animals self-relationship represents dam/sire references; implementation stores the two roles separately and prevents self-parenting and pedigree cycles.
- A farm-owned row’s farm_id must match every referenced farm-owned parent. Enforce this in composite foreign keys where practical or transaction functions plus RLS tests.
- A published livestock listing references one private animal but presents an allow-listed projection only.
- A result has at most one winning bid and one result per lot. Winner identity remains staff-only; public result projection contains the final amount and public lot fields.
- Purchases create movements only on an accepted receiving operation. A canceled purchase must not leave positive stock.
- Financial transaction lines must balance at posting. Posted records are reversed rather than edited or deleted.
- Audit and media links can point to many domain record types; their polymorphic entity references are validated in API/domain code and protected by farm scoping.

The source of truth for fields, checks and indexes is DATABASE_SCHEMA.md. Static review of these Mermaid diagrams was performed; they were not rendered by a Mermaid engine in this task.
