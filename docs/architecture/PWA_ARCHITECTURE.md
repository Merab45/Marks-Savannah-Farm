# Customer PWA Architecture

**Status:** Proposed evolution of current PWA; no second worker or production change made  
**Current entry:** app.html  
**Current runtime:** manifest.webmanifest and root service-worker.js

## 1. Product boundary

The PWA is the installable customer experience and a continuation of the public customer journey. It is not a third independent customer frontend and it is not the staff management application. Keep the public website’s content and navigation reachable, and share customer identity, catalogue, order and auction APIs with browser customers.

Keep app.html as the PWA launch/branding shell. Consolidate its customer dashboard with customer-account.html by using the latter’s broader account and dashboard screen map while carrying forward farm-home.js’s unique product/auction details and cart interactions. Do not delete either route during this task or before redirect/compatibility behavior is tested.

## 2. Installation and manifest

- Preserve the current app name, approved farm logo/icon, standalone display mode, language, theme/background colors and Android install flow unless a deliberate brand change is approved.
- Keep one manifest whose start_url and scope match the served app path. When folder/URL moves are eventually made, update start_url, scope, icon paths, theme and all install links together.
- Use platform install prompts where supported. Offer platform-specific instructions when beforeinstallprompt or equivalent is unavailable; do not promise installation on unsupported browsers.
- Confirm app identity, icon maskability, Android install, standalone launch, update prompt and start URL on supported Android browsers before release.

## 3. One service worker

Keep the existing root service-worker.js as the only service worker for the current same-origin site. It currently controls the origin root and contains website, customer and Herdbook shell paths. Do not introduce a second worker. Make route classes explicit in its strategy and remove Herdbook/private application content from public shell precaching once it is behind real authentication. If the apps later use separate origins, reconsider worker ownership as a documented deployment decision rather than silently adding another registration.

### Cache classes

| Class | Examples | Offline policy |
|---|---|---|
| Versioned application shell | CSS, JS, manifest, logo/icon and app-shell HTML | Cache-first for static hashed/versioned assets; network-first with valid cached fallback for navigation |
| Public catalogue/content | Approved public product and listing responses, public images, public guides | Cache-first or stale-while-revalidate with clear cached/as-of label and bounded retention |
| Private customer data | Profile, orders, saved items, bid history | Network-only by default; never Cache API or service-worker precache. Clear in-memory data on sign-out/account switch. |
| Private staff data | Herdbook animal, health, finance, inventory and supplier APIs | Network-only; no offline cache in the initial secured version. Do not precache the staff HTML as if private access were enforced by its URL. |
| Irreversible/authoritative mutations | Orders, payment actions, auction bids, finance postings, publication | Require live server connectivity; server response is the only confirmed success. No blind Background Sync replay. |

The existing worker’s offline fallback should be generic and contain no personal data. Cache only same-origin static assets and intentionally approved public responses. Use cache versioning and scoped cleanup; never delete unrelated origin caches or application storage.

## 4. Offline customer behavior

- Public pages, already-cached public product/listing data and selected guides may render offline with a visible “Saved on this device / last updated” indicator.
- An enquiry may be saved as an explicitly unsent local draft only if the user is told it is not delivered. On reconnection, ask the user to review and submit.
- Do not accept bids, confirm orders, mark a payment as paid, or claim a listing is available based only on local storage. These actions require an online API response and durable server ID.
- Do not persist personal data in Background Sync queues. If a later feature proposes queued requests, it needs account binding, expiry, idempotency, cancellation, shared-device handling and a visible pending status.
- A disconnected user can view cached public information but should see clear contact/refresh guidance and no false order/auction availability guarantee.

## 5. Connectivity, synchronization and conflict handling

Expose online/offline and stale-data states without blocking the app shell. For public catalogue cache refresh, use last-modified/version or ETag; tolerate stale reads but identify them. For future staff offline support, first define record ownership, encrypted storage, device binding, edit-version conflict resolution, audit actor/time, revocation, and duplicate-submit behavior. Staff operational writes are not part of initial offline scope.

Server-side conflict policy:

- Catalog/public copy: latest approved server version wins; a pending offline copy is a draft.
- Animal record edits: optimistic version check; return conflict with current server values for staff review; do not silently last-write-wins.
- Inventory: append movements; never overwrite balance.
- Orders/bids/payments: no offline commit; use idempotent online command and server confirmation.

## 6. Updates and cache invalidation

- Bump worker cache version with any shell change, keep static asset references consistent, and install the new cache fully before activation.
- Activate only after successful core cache population; if install fails, leave the current worker usable.
- Delete only prior caches with this farm application’s prefix after the new worker activates.
- Prompt/announce updates when the worker has a new version; do not reload while a customer is writing a form without a draft warning.
- Test first install, warm update, failed install rollback, offline navigation, stale public data, missing image fallback, logout/cache cleanliness, and old route aliases.

## 7. Push notifications and browser limits

Push is optional and requires explicit consent, a browser/device that supports Push API, a service-worker registration and server-side subscription storage. Provide email/SMS or in-app refresh alternatives where push is unsupported or denied. Notifications must not expose private animal, financial or bidder data on a lock screen. Auction countdown is visual; server close and notification delivery are independent. Do not promise exact notification timing.

## 8. Current implementation gaps to track

- One root worker is already present; preserve it, but verify its public/private path policies as APIs are added.
- Current localStorage accounts, orders, carts, and bids are prototypes and cannot be treated as synchronized data.
- Current installable web app has no real shared API synchronization.
- Any later public-cache policy must avoid accidentally caching authenticated API responses through the current network-first navigation path.
