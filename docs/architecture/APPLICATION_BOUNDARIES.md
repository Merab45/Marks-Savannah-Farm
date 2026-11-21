# Application Boundaries and Migration Map

**Status:** Proposed; no files moved  
**Decision:** One repository initially, with explicit logical boundaries. Consider app directories after API/auth contracts are stable and before growing the staff feature set.

## Current applications and ownership

| Logical area | Current files and code | Responsibility | Proposed owner later |
|---|---|---|---|
| Public website | index.html, about-us.html, products-and-services.html, contact.html, gallery.html, blog.html, auctions.html, shop.html, privacy-policy.html, terms-and-conditions.html | Public marketing, product information, editorial content, enquiries, shop and public auction views | apps/website |
| PWA entry and customer onboarding | app.html, manifest.webmanifest, page-app logic in JS/site.js | Install identity, splash, onboarding, auth entry, PWA launch | apps/customer-pwa shell, reusing customer features |
| Customer dashboard | customer-account.html, sign-in.html, create-account.html, buyer logic in JS/site.js | Home, marketplace, bids, saved items, profile, order history, support | Customer application feature screens; retain old URLs as compatibility aliases |
| Second customer dashboard | Dashboard rendered in app.html by JS/farm-home.js | App home, products/details, auctions/details, saved, cart handoff, More/profile | Merge unique behaviors into canonical customer experience; keep route behavior during transition |
| Farm management | herdbook.html and page-herdbook branch in JS/site.js | Overview, animal records, photo uploads, listing statuses and sales summary | apps/farm-management; Herdbook remains the product foundation |
| Shared frontend | CSS/site.css, shared utilities/page branches in JS/site.js, JS/auction-core.js, JS/commerce.js | Common styles, customer contact, auction rules, shop cart behavior | packages/shared for carefully chosen pure utilities/tokens; domain logic belongs to its owning app/API |
| Shared assets | Assets/ | Logos, editorial and product photos, app imagery | packages/brand-assets or per-app public assets with aliases during transition |
| PWA runtime | service-worker.js | Current single root service worker and cache policy | One documented customer PWA worker; explicitly bypass staff/private API data |
| Backend | None found | No current API/database | apps/api or managed Supabase functions plus migrations |

## Customer dashboard consolidation decision

Use **app.html as the PWA entry and launch shell** because the manifest starts there and it contains the existing splash, onboarding and authentication flows. Use the screen map and customer-account capabilities as the **canonical dashboard experience**, because it carries the richer customer profile, orders, enquiries and the most explicit account-oriented screen set. Neither file is to be deleted.

Carry forward unique capabilities from farm-home.js: product detail specifications and gallery, app marketplace sorting, auction lot detail and bid review, saved auctions, cart handoff, More links, current bottom navigation, and the app’s established visual shell. Carry forward unique customer-account capabilities: profile edit, purchase history, marketplace search/filter, app notifications entry, enquiries, and its public support/contact sections. Reconcile duplicate home/marketplace/auction/saved/profile screens against the approved mobile design before coding.

After consolidation, app.html should take a successful authenticated customer into one canonical dashboard state. customer-account.html, sign-in.html and create-account.html remain stable entry URLs during migration; they can redirect or load the shared account state only after route, back-button, and existing-link behavior is verified. Do not have both dashboard renderers independently own the same state long-term.

## Logical boundaries before physical moves

Define public, customer, and staff routes and permissions first, while files remain in the root. This minimizes broken links and preserves today’s static deployment. Page-specific JS can be separated incrementally behind the existing selectors. Shared utilities should remain small and have clear owners; do not move the entire page-aware site.js into a generic shared package.

Recommended later monorepo layout:

~~~text
apps/
  website/                 existing public HTML pages and public styles
  customer-pwa/             app shell, canonical customer screens, PWA manifest/worker
  farm-management/          Herdbook shell and staff-only screens
  api/                      server functions/routes, validation and domain commands
packages/
  shared-domain/            shared identifiers, enums, money/date rules and API contracts
  brand-assets/             approved logos and shared farm artwork
  web-ui/                   only components that genuinely share behavior and presentation
database/
  migrations/               ordered SQL migrations, seeds, RLS and database tests
docs/architecture/          this architecture set
```

This is a monorepo proposal, not three repositories. Customer PWA and public website remain the customer surface and reuse relevant content/API contracts. The staff workspace is an independently navigable private application. The API/database is shared.

## URL and deployment continuity

Keep current root URLs as the public compatibility contract. Existing internal links, bookmarks, search results, QR codes and the manifest depend on them.

| Existing URL | Future logical route | Migration rule |
|---|---|---|
| / and /index.html | Public homepage | Keep both resolving; canonical redirect may be added only after host behavior is verified |
| /about-us.html, /products-and-services.html, /contact.html, /gallery.html, /blog.html | Website content | Preserve direct links; route to new application without losing anchors/query parameters |
| /shop.html, /auctions.html | Customer commerce | Keep URLs; ownership may move to customer application while retaining public navigation |
| /app.html | Customer PWA launch | Preserve as manifest start_url until a tested replacement is released |
| /customer-account.html | Customer dashboard compatibility route | Keep route as an alias/redirect to the canonical dashboard; preserve authenticated return path |
| /sign-in.html, /create-account.html | Customer auth compatibility routes | Keep links and finish OAuth redirects/password recovery through the same identity service |
| /herdbook.html | Staff management compatibility route | Do not expose as a private app until the edge/API and every data endpoint enforce staff authorization; preserve a controlled redirect if path changes |
| /service-worker.js, /manifest.webmanifest | PWA runtime | Keep scope/start_url/icon URLs consistent; coordinate cache version with each release |

If physical paths change under the same origin, rewrite old URLs to new app paths and retain anchors/query parameters. If apps move to separate subdomains/origins, browser localStorage and service-worker caches do not automatically move or share. Use an explicit, tested, user-consented migration; do not assume existing local records are recoverable centrally.

## Build and migration order

1. Establish baseline URL and workflow checks; do not change the current route tree.
2. Agree customer dashboard screen ownership and the canonical API/domain model.
3. Implement backend contracts and secure roles while the existing frontend remains intact.
4. Add adapters incrementally: first Herdbook read/write of its current animal records, then customer account and public reads.
5. Organize files into app folders only after old routes can be served as aliases and service-worker behavior has tests.
6. Migrate local data from export files or explicit browser-side export tools with a dry run, duplicate report, photo transfer report, and rollback copy.

## Shared versus separate

Share stable contracts and non-sensitive utilities: IDs, category enums, money formatting rules, date handling, published public content components, brand tokens and API schemas. Do not share or expose private animal health data, finance rules, authentication decisions, privileged keys, or staff navigation through a client-side shared package. The backend remains the source of authorization and data ownership.
