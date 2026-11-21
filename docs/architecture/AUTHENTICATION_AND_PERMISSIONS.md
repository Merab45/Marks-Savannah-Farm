# Authentication and Permissions

**Status:** Customer Supabase Auth is implemented locally; staff authentication and staff onboarding are not implemented
**Identity recommendation:** One managed Auth tenant for customers and staff, with separate customer profile and farm-membership authorization records.

## 1. Actors

| Actor | Authentication | Allowed surface |
|---|---|---|
| Anonymous visitor | None | Approved public website content, published products/listings/auctions, rate-limited enquiry submission |
| Registered customer | Verified central Auth identity | Public content plus own profile, saved items, orders, enquiries and bids; may bid only if auction eligibility rules pass |
| Farm employee | Auth identity plus active farm membership | Only assigned operational permissions for that farm |
| Farm manager | Auth identity plus manager membership | Operational records, review/approval, publishing, assigned reports and team coordination |
| Farm administrator/owner | Auth identity plus owner membership | Farm configuration, membership and role assignment, sensitive approval and oversight |

Authentication answers “who is this?” Authorization answers “may this actor do this to this farm record right now?” Both are checked on the server. A hidden button is not a permission check.

## 2. Identity and shared customer account

Use one Auth user identity across the marketing site and PWA. Link app data to that stable provider user ID, not to the customer’s email as a primary key. A customer who uses the website and later installs the PWA signs into the same account and sees the same centrally stored profile, orders, saved records and bid history.

The existing localStorage customer accounts cannot be treated as secure shared accounts. Do not copy local password hashes into the new identity system. Ask users to create/verify a central identity or use a secure password-recovery/set-password flow. Optional profile, saved-item or draft migration must be explicit and must not import demo records or represent local bids as accepted bids.

The PWA app.html remains the launch shell. The public site and PWA use approved public endpoints anonymously and account endpoints after central Auth. If deployed at separate origins later, configure exact redirect origins and preserve the return path; identity is shared, but browser sessions may require a fresh sign-in between origins.

## 3. Session model

- Use the provider’s supported OAuth/OIDC PKCE browser flow for public clients; configure allowed redirect and logout URLs exactly.
- Access tokens are short lived; refresh tokens are rotated/revocable under provider behavior. Apply configured idle and absolute session limits appropriate to customer versus staff risk.
- Customers may choose a remembered session on personal devices. On shared farm/field devices default to session-only sign-in, provide a visible sign-out, and clear private in-memory views on sign-out or account switch.
- Staff sessions require stronger controls: MFA enrollment for managers/owners (prefer mandatory before production), shorter idle timeout, prompt reauthentication for finance/role changes, and periodic membership review.
- Never put access/service-role credentials in JavaScript, HTML, the manifest, source maps, or local config committed to Git.
- If an HTTP-only cookie/BFF is selected during implementation, define CSRF and cookie SameSite/Secure/HttpOnly controls. If browser bearer tokens are used, harden against XSS with a strict CSP, no untrusted HTML injection, short token lifetime, and RLS.

## 4. Recovery, account lifecycle and abuse controls

- Email verification before enabling account actions; OAuth identity verification follows provider guarantees.
- Password recovery uses a short-lived, single-use provider token sent to a verified email. Do not disclose whether an account exists in public responses.
- Rate-limit sign-up, sign-in, recovery, OTP, enquiry and bid endpoints by account and source signals; use progressive delay/abuse checks without locking out legitimate rural/low-connectivity users permanently.
- Provide sign out of this device and sign out all sessions for password reset or suspected compromise.
- Account deletion/deactivation follows retention rules: revoke sessions, remove or de-identify profile where lawful, and retain legally required orders/finance/audit records with minimized personal identifiers.
- Staff invitation is owner/administrator-only; invitations expire, require verified acceptance, and do not grant access until membership is active.
- Deactivation must take effect on the API even if an already-issued token has not expired. Critical staff permission checks consult current membership or a short-lived trusted authorization state, not editable user metadata.

## 5. Role and permission model

Use roles as bundles of explicit permissions, scoped to farm_id. Store staff membership in application tables and assign role claims only from a trusted server-side source. Customer-editable user metadata is not a role source. For every request, check farm scope, record scope, action permission, and current state transition.

| Capability | Anonymous | Customer | Employee | Manager | Owner/admin |
|---|---:|---:|---:|---:|---:|
| Read approved public catalogue/content | Yes | Yes | Yes | Yes | Yes |
| Read private animal/health/finance records | No | No | Permission-specific | Yes where assigned | Yes |
| Read/edit own profile and own orders | No | Own only | Own customer identity only | Own customer identity only | Own customer identity only |
| Create animal and routine husbandry record | No | No | animal.create / husbandry.write | Yes | Yes |
| Edit/archive animal or identifiers | No | No | animal.update if granted; archive may be restricted | Yes, audited | Yes, audited |
| Read/write veterinary records | No | No | vet/health permission | Yes or delegated | Yes |
| Draft a public listing/product | No | No | listing.create/product.manage if granted | Yes | Yes |
| Approve/publish public data | No | No | No by default | listing.publish/content.publish | Yes |
| Receive stock or create purchase | No | No | inventory.receive/procurement.create | Yes | Yes |
| Approve purchase/stock adjustment | No | No | No by default | procurement.approve | Yes |
| Read/write/post/reverse finance | No | No | finance-specific role only | Assigned finance permissions | Yes; sensitive actions audited |
| Submit a bid and view own bids | No | Own | Own customer role only | Own customer role only | Own customer role only |
| View public bid amounts | Public amount view | Public amount view | Public amount view | Public amount view | Public amount view |
| View bidder identity/eligibility | No | Own eligibility only | No by default | auction.bidders.read | Yes |
| Manage auction schedule, lots, close | No | No | auction.manage if granted | Yes | Yes |
| Invite/disable staff and change roles | No | No | No | Limited only if delegated | Yes |
| Read audit trail | No | No | Own actions only if explicitly allowed | Farm-scoped | Farm-scoped |

The table is a default least-privilege proposal. A manager does not automatically need financial posting permission; a veterinarian does not need order or customer contact access. Owner/admin can grant narrow roles, but all grants and sensitive actions must be audited.

## 6. Enforcement layers

1. API middleware validates access token and maps it to an actor.
2. Authorization helper evaluates permission + farm + object ownership + state.
3. RLS applies a matching tenant/actor boundary to database access, including direct client-safe reads.
4. Database constraints/functions preserve invariants under concurrent requests.
5. Audit event records actor, permission-relevant action, target, timestamp and request ID.

Supabase RLS is defense in depth, not a replacement for service-level validation. Public tables/views receive only anonymous SELECT grants needed for approved projections. Every newly exposed table must have explicit grants and policies. Never call a service-role client for ordinary user reads; service role bypasses RLS.

### Initial database foundation status

The local foundation migration implements the Auth user-to-profile foreign key, farm membership lookup, and database permissions for the initial farm/animal tables. An owner can read all memberships for their farm, but membership and role-permission changes have no browser grants; a trusted server-side staff lifecycle is required before real staff onboarding. The current Herdbook remains a localStorage demo and is not protected as an authenticated staff application. Prior local-task reports state that the existing 64-assertion pgTAP suite passed after the employee animal INSERT permission fix; that suite covers the current foundation, not a future onboarding endpoint. See STAFF_AUTHENTICATION_AND_AUTHORIZATION.md for the staff design and coverage boundary.

## 7. Authorization verification

Required security tests include anonymous, customer A, customer B, staff without permission, staff for another farm, manager, and owner/admin identities. Every denied request must fail at the server, even if the UI is manipulated. Test disabled membership, revoked session, stale token, direct REST access, guessed IDs, alternate route, and concurrent state change. Log denied high-risk attempts without recording secrets.

