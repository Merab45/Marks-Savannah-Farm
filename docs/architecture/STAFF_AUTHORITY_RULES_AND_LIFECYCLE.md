# Staff Authority Rules and Lifecycle

**Status:** Owner-only staff administration and multiple-active-owner policy are approved by the project owner; remaining lifecycle decisions and implementation details await approval. No staff authentication or lifecycle implementation is in place.
**Scope:** Staff invitation, activation, role changes, suspension, reinstatement, ownership, and audit. Design only; no staff authentication or application/database changes.
**Reviewed:** 2026-11-21
**Primary context:** `docs/architecture/STAFF_AUTHENTICATION_AND_AUTHORIZATION.md`

## 1. Current implementation facts

These are repository facts, not new business decisions:

- Customer Supabase Auth is implemented locally. A customer identity alone grants no staff authority.
- `herdbook.html` is a staff-oriented prototype. Its animal data is demo/localStorage-backed; it is not connected to real farm records and has no staff login or route authorization.
- `farm_memberships` has one row per `(farm_id, user_id)`, roles `owner`, `manager`, `employee`, and statuses `invited`, `active`, `disabled`. It stores `invited_by`, `accepted_at`, `disabled_at`. Multiple owners are possible, but no last-active-owner invariant is enforced.
- `role_permissions` is migration-managed with no browser write grants. Current owner permissions: `farm.read`, `animal.read`, `animal.create`, `animal.update`, `animal.archive`, `animal.identifier.create`, `location.manage`, `membership.read_all`. Managers receive the same except `membership.read_all`. Employees receive `farm.read`, `animal.read`, `animal.create`, `animal.identifier.create`.
- Authenticated users can read their own membership; `membership.read_all` permits farm membership oversight. Browser roles cannot create/update/delete memberships or edit role permissions. There is no staff invitation/administration API or audit table.
- `has_farm_permission` resolves current `auth.uid()` and requires an active membership for the requested farm/permission. RLS denies private farm data when membership is absent or disabled. Preserve live membership checks as the authorization boundary.
- Prior task reports say the existing 64 pgTAP assertions passed locally after the employee animal INSERT grant fix. They cover the current foundation, not the lifecycle proposed here.

## 2. Authority rules (approved policies and remaining proposals)

Rules 3, 9, and 10 record approved policy. Other rules and implementation details remain proposals subject to section 13.

1. **Identity is not authority.** One Auth identity may be customer and staff. Only an active farm membership grants staff access within that farm and its permissions.
2. **Ordinary invitations cannot appoint owners.** Invite accepts only employee or manager. Owner authority comes only from controlled bootstrap or a distinct owner appointment/transfer.
3. **APPROVED — Owner-only staff administration.** Only owners may invite, activate, reinstate, change roles, suspend, or otherwise administer staff accounts. Managers may manage day-to-day farm operations but cannot administer staff accounts; employees cannot administer staff accounts. Managers must not receive staff-administration permissions through database grants, trusted APIs, or frontend controls. Customer accounts do not automatically receive staff authority. Staff authority continues to require an active farm membership and the relevant database permissions. This approval does not approve owner bootstrap, exact ownership transfer/recovery procedures, invitation expiry, MFA, audit retention, or a server implementation choice.
4. **No self-service promotion.** Profile edits, Auth metadata, signup, URL parameters, localStorage, and customer claims never change role or membership status.
5. **Recheck live authority per operation.** Server derives actor from verified session, checks active membership and permission for target farm, then validates transition. Ignore body-supplied actor IDs and roles.
6. **Suspension is immediate at the data boundary.** Commit disabled membership first; `has_farm_permission` then denies private data even if a token remains valid. Session revocation is additional protection, not the RLS safety mechanism.
7. **Preserve history.** Departure disables membership rather than deleting identity or historical records. Retention/anonymization needs an approved policy.
8. **Audit authority transitions.** Record invite, accept, activation, role change, suspension, reinstatement, ownership transfer, and session revocation.
9. **APPROVED — Last-active-owner safeguard.** The system must transactionally prevent any operation from leaving a farm with zero active owners. Exact database mechanism and recovery procedure remain to be designed; break-glass recovery is not approved.
10. **APPROVED — Multiple active owners and controlled appointment.** Multiple active owners per farm are allowed. Additional owners require a separate, controlled ownership process; ordinary employee/manager invitations never grant owner authority. Ownership appointments and transfers must be audited. The exact appointment/transfer workflow and approvals remain undecided.

## 3. Owner bootstrap and ownership lifecycle (approved policy plus open implementation details)

### Initial bootstrap

**Recommendation:** Establish the first owner through a one-time operator-controlled bootstrap for a specified farm and an already verified Auth identity. Require environment confirmation, explicit farm/user IDs, a change record, and an audit event. The bootstrap is unavailable to browser roles and cannot be repeated after success. Never derive the first owner from signup or user metadata.

For local development, use synthetic identities and local Supabase only. A future production bootstrap requires out-of-band identity verification, a documented break-glass/secret-management procedure, and disabling the bootstrap capability after success. This design creates no owner account.

### Multiple owners and appointment

**APPROVED policy:** Multiple active owners per farm are allowed. Additional owners must be appointed through a separate, controlled ownership process; ordinary employee/manager invitations never grant owner authority. Ownership appointments and transfers must be audited, and all transitions must preserve at least one active owner through a transactional safeguard.

**Implementation details still require design/approval:** exact eligibility and approvals, target acceptance steps, required step-up authentication, and transaction/API mechanics. The current schema does not enforce these requirements.

### Transfer and last-owner invariant

**Proposed transfer procedure — not yet approved:** Treat transfer as a guarded transition:

1. Current active owner with required recent MFA requests either **add owner** or **transfer ownership**; make the difference explicit.
2. Target verifies identity and accepts.
3. One transaction locks the farm's owner state, validates both memberships, activates/appends the successor and audits the transition; only then demotes/disables the predecessor if transferring.
4. A DB-level transactional invariant prevents active owner count falling below one, including concurrent suspension/transfer requests.
5. Owner cannot bypass the transfer flow by directly suspending or demoting their own final owner membership.

### Recovery if the only owner loses access

**Unresolved proposal:** Break-glass recovery could require independent verification by project operator and farm leadership, two-person approval, a time-limited server action, and permanent audit. The approvers, evidence, process, and response target are not approved. Ordinary endpoints must not allow “make me owner,” email-only proof, or support-agent impersonation.

## 4. Proposed role matrix

“Current” columns record seeded database behavior. The final column is proposed, not a grant made by this document.

| Capability | Employee — current | Manager — current | Owner — current | Proposed rule |
|---|---|---|---|---|
| Read farm/locations | Yes, assigned farm | Yes, assigned farm | Yes, assigned farm | Preserve RLS scope |
| Read animals/identifiers | Yes | Yes | Yes | Preserve |
| Create animals/identifiers | Yes | Yes | Yes | Preserve |
| Update animals | No | Yes | Yes | No employee expansion without approval |
| Archive animals | No | Yes | Yes | Archive; no hard-delete grant |
| Manage locations | No | Yes | Yes | Preserve `location.manage` |
| Read all memberships | No | No | Yes | Preserve `membership.read_all`; manager excluded |
| Invite employee/manager | No | No | No browser path | **APPROVED policy:** owner-only trusted administration; implementation remains unbuilt |
| Appoint/invite owner | No | No | No browser path | **APPROVED policy:** separate controlled, audited ownership process; ordinary invites never appoint owners; transactional last-owner safeguard |
| Activate/reinstate/change/suspend staff | No | No | No browser path | **APPROVED policy:** owner-only; audit and final-owner safeguards still require design |
| Listings, auctions, orders | Not in foundation | Not in foundation | Not in foundation | Define separate permissions first |
| Finance read/post/reverse | Not in foundation | Not in foundation | Not in foundation | Do not infer from owner role; separate controls |

Current manager has animal update/archive and location management, but no membership read-all or administration. The owner-approved policy explicitly prohibits staff-administration permission for managers through database grants, trusted APIs, or frontend controls. Preserve this behavior. Do not automatically grant employee update/archive.

## 5. Invitation and activation lifecycle

### States and flow

Invitation state is distinct from membership status. Proposed states: `pending`, `sent`, `accepted`, `activated`, `revoked`, `expired`, `failed` (may be simplified during schema design). An `invited` membership is non-authorizing; only `active` plus permission allows access.

1. **Request:** Owner selects farm, recipient email, employee/manager role, and optional reason. Browser sends a narrow command with idempotency key; it never writes memberships.
2. **Authorize:** Server validates session, derives actor from verified Auth, confirms current active owner membership and proposed `staff.invite` permission for that farm, applies MFA/reauth policy, role allowlist, input bounds, rate limits, and farm scope.
3. **Create intent:** Persist invitation intent, idempotency reference, farm, role, inviter, creation/expiry times, and opaque provider reference. Do not persist the raw token. Ordinary role allowlist excludes owner.
4. **Send:** Server-side Supabase Auth Admin invitation flow sends a single-use link. Requester receives a generic response that does not disclose account existence.
5. **Verify:** Recipient completes Auth verification. Require verified email matching the invitation. Existing customer signs into that same Auth identity and accepts; do not create a duplicate account or link by unverified email text.
6. **Accept:** Server checks identity, invitation pending/unexpired/unrevoked, farm/role, and invitation reference. Acceptance alone does not grant authorization.
7. **Activate:** One transaction binds invite to verified `auth.users.id`, upserts the unique farm membership to active with `accepted_at`, records audit, and marks invite activated. Only after commit can RLS grant access.
8. **Enter staff app:** Client loads active memberships and selects an authorized farm if there are several. RLS scopes every call regardless of selected farm ID.

### Expiry, duplicates, revocation, retries

- Recommend expiry after seven calendar days, controlled by server policy (not client input); expired invites require a fresh owner request.
- Permit one live invitation per farm/normalized recipient/role intent. Same idempotency key returns the same outcome. Duplicate live request returns generic “already pending,” without disclosing whether an Auth account exists.
- Revocation is owner-authorized and idempotent. If already activated, return conflict; suspension is the correct action.
- Retry transient Auth/email failures with bounded backoff and same operation key; do not duplicate invites or memberships. Report “sent” only when provider accepts the send request; delivery cannot be known synchronously.
- If an email is already a customer account, the recipient authenticates that account and accepts. Do not disclose account existence or merge accounts based on email string alone.
- Rate-limit by actor, farm, and recipient signals. Return generic external errors; keep detailed redacted operational diagnostics under request ID.

## 6. Suspension, reinstatement, departure and sessions

### Employee/manager suspension

Owner supplies target membership and reason. Server rechecks authority, farm, membership state, and owner invariant. In one DB transaction set `status='disabled'`, `disabled_at`, membership version/audit data. On commit, current live RLS checks deny access immediately. UI refresh is not a security prerequisite.

### Owner suspension or departure

If another active owner exists, recommend allowing owner-only suspension/demotion with recent MFA, reason, and audit. If this is the last owner, only the accepted transfer flow may change it. Voluntary departure appoints/activates a successor before disabling the departing membership in the guarded transaction. Keep Auth identity and record attribution.

### Reinstatement

Not a browser status toggle. Owner request includes reason. Trusted service checks former identity, current role policy, farm and current state; require re-verification/MFA if policy says so. If identity or role policy changed, issue a fresh invite instead of silently restoring old authority. Enforce final-owner invariant and audit the transition.

### Session revocation and retention

After disabling membership, attempt Auth Admin sign-out/revoke as a separate operation. RLS denial holds even if Auth revocation fails; record and retry the revocation failure rather than reactivating access. For account compromise, consider revoking all sessions across farms. Never log bearer tokens.

Do not hard-delete membership history, animal/sale records, or audit events on departure. Retain Auth identity and actor IDs subject to a separately approved privacy/retention policy; anonymization is a separate workflow.

## 7. Append-only audit model

### Proposed event fields

Use a farm-scoped `staff_audit_events` table with: event UUID; `farm_id`; `actor_user_id` plus `actor_type` (`user`, `system`, `break_glass`); target user, membership and invitation references; allowlisted `action_code`; server `occurred_at`; bounded reason/code; request and idempotency/command IDs; outcome and stable failure code; allowlisted before/after role/status and safe provider operation reference.

Actions include invitation created/accepted/revoked/expired, membership activated/role changed/suspended/reinstated, owner appointed/transferred, and session revocation requested/completed/failed. Never store raw invitation tokens, passwords, access/refresh tokens, or unnecessary personal data. Prefer protected references over duplicate full email values.

### Protection and access

- Write the audit event in the same transaction as membership transitions. External Auth/email attempts and outcomes receive separate events so partial failures remain visible.
- Browser roles have no update/delete/truncate privilege. Farm-scoped audit reads are restricted to approved owners/auditors; employees have no default audit access. Manager audit access requires explicit approval.
- Enforce immutability with grants and database protections; reserve schema maintenance to a controlled migration role. A service-role credential can bypass RLS, so this is not tamper-proof against a compromised privileged backend. Secure secrets, alert on privileged access, and consider exporting audit to a separately controlled immutable sink before production.
- Retention is undecided; owner must approve duration, legal basis, access review, and deletion/anonymization handling.

## 8. Trusted server API design

**Recommendation:** Start with Supabase Edge Functions if they fit deployment/operations: they integrate with Supabase Auth and can keep Auth Admin secrets server-side. A separate backend is also reasonable if persistent workers, monitoring, or provider independence are needed. Choose after local architecture review; none is implemented here.

Every operation validates the bearer session and derives the actor from Auth; uses a user-scoped client to check current membership/permission; validates strict schemas, IDs, allowed roles, state transitions, farm/target relationship and reason; applies rate limits and idempotency; and keeps privileged credentials in server secrets. Use ordinary RLS-scoped Supabase requests for Herdbook reads/writes. Never expose service-role keys or use them for routine data access. Return stable request IDs and generic errors without account-existence or provider-secret leakage.

| Operation | Input (illustrative) | Authorization and effect | Retry/failure |
|---|---|---|---|
| `POST /staff/invitations` | farm, email, employee/manager role, reason, idempotency key | Active owner + `staff.invite` (proposed); create intent, enqueue send | Same key resolves same operation; unknown provider timeout is reconciled before retry |
| `POST /staff/invitations/{id}/accept` | invite ID, verified Auth session, idempotency key | Match verified identity; check pending/expiry/revocation; activate membership + audit transactionally | Same identity repeat is idempotent; other identity gets generic denial |
| `POST /staff/invitations/{id}/revoke` | reason, idempotency key | Active owner; pending only; audit | Idempotent if already revoked; conflict if activated |
| `PATCH /staff/memberships/{id}/role` | allowed non-owner role, reason, idempotency key, expected version | Active owner, same farm; no owner transition; audit before/after | Stale version conflicts; never silently overwrite |
| `POST /staff/memberships/{id}/suspend` | reason, revoke-sessions flag, idempotency key | Active owner; final-owner guard; disable + audit first | Disable idempotent; session revocation independently retried |
| `POST /staff/memberships/{id}/reinstate` | reason, idempotency key, expected version | Active owner; same identity/current policy, any required re-verification; audit | Stale state conflicts; repeated command idempotent |
| `POST /staff/ownership/appointments` | verified target, `add_owner`/`transfer`, reason, recent MFA, idempotency key | Active owner, dedicated permission, target acceptance; lock and protect owner invariant | Pending/accepted phases; query operation ID after timeout |
| `POST /staff/sessions/revoke` | membership/user reference, reason, idempotency key | Active owner and farm scope; elevated review for global revoke | Disable membership first; report Auth revocation partial status |

Avoid generic endpoints accepting arbitrary tables, role codes, SQL, or unvalidated farm IDs. For side effects outside PostgreSQL, use an outbox/reconciliation record. Never claim success while commit state is unknown.

## 9. Database changes required before implementation

No schema changes are made in this task. Likely additions, subject to design review:

1. **`staff_invitations`:** farm, normalized/protected recipient reference, intended role, inviter, state, expiry, provider reference (not token), accepted Auth user, timestamps, operation/idempotency key, and uniqueness for one live invitation.
2. **`staff_audit_events`:** append-only event data above with restricted RLS/grants.
3. **Membership version/audit linkage:** version or `updated_by`/reason strategy for optimistic concurrency; avoid redundant PII.
4. **Approved permission codes:** e.g. `staff.invite`, `staff.membership.manage`, `staff.owner.appoint`, `staff.audit.read`, mapped only after owner approval. Keep permission catalog migration-managed.
5. **Transactional functions/commands:** narrow membership and ownership transitions, last-owner lock/invariant, fixed search_path, explicit execute grants, and audit writes.
6. **Outbox:** invitation send and Auth Admin side-effect state for retries/reconciliation; possibly part of invitation table if sufficient.
7. **Policies/grants:** RLS on new tables; no browser writes to invitation/audit tables; deny anon/customer; expose only approved audit projections.

Current `(farm_id,user_id)` uniqueness means a disabled user cannot be represented by a duplicate membership. Re-invitation must resolve to the same identity and use an authorized reinstatement or fresh invitation transition.

## 10. Security and failure recovery

Auth Admin, email delivery, and PostgreSQL do not share an atomic transaction. Recommended sequence:

1. Commit invitation intent, idempotency reference, audit request, and outbox job.
2. Worker calls Auth/email, stores outcome/reference but never the token; retries boundedly.
3. Permanent send failure becomes visible `failed` state; owner may retry/cancel without deleting history.
4. Acceptance verifies identity and invitation state, then atomically activates membership, invitation, and audit.
5. Suspension commits membership disable and audit first; attempt Auth revocation afterward and record result separately.
6. Ownership appointment waits for target acceptance; lock owner state and atomically activate successor before demoting predecessor.
7. On unknown timeout, look up operation by idempotency key before retry; do not duplicate membership or claim success.
8. Reconciliation checks stuck invite/provider/membership state and alerts on contradictions.

Also require strict origin/CORS and CSRF controls appropriate to the chosen client model, CSP/XSS protections, rate limits, safe logs, secret access review, backups, and recovery drills. Concurrency safety must be tested, not assumed.

## 11. MFA and reauthentication policy

**Production recommendation:** Require MFA for every owner and manager. Require recent step-up authentication (example: MFA verified within 10 minutes; exact interval TBD) for ownership appointment/transfer, staff role changes, owner suspension/reinstatement, global session revocation, financial posting/reversal, and other high-impact approvals. Recommend owner plus a second approver for ownership transfer and break-glass recovery.

**Local development:** Use synthetic users and controlled test fixtures; do not require real phone/email identities or production MFA configuration. Any local bypass must be environment-gated and impossible in a production build.

Owner approval is required for mandatory enrollment deadline, recovery factors/grace period, freshness interval, manager access conditions, and two-person approvals.

## 12. Testing and acceptance matrix

Keep all 64 existing pgTAP assertions unchanged as regression coverage. Add synthetic identities/farms only; no real accounts or customer data.

| Scenario | Acceptance result | Test layer |
|---|---|---|
| Initial owner bootstrap | Only controlled operator path works; repeat safely rejected/idempotent; actor and farm audited | Integration/pgTAP |
| Multiple owners | Multiple active owners coexist; farm scope holds | pgTAP/API |
| Owner appointment | Ordinary invite rejects owner; distinct flow requires active owner, MFA, target acceptance | API/browser |
| Last owner | Concurrent demote/suspend/transfer never leaves zero active owners | DB concurrency/API |
| Employee/manager invite | Owner can invite each; seeded permissions preserved; manager cannot administer staff | API + pgTAP |
| Existing customer identity | Verified existing Auth user accepts without duplicate identity; other/unverified identity denied generically | API integration |
| Expired/revoked invite | Acceptance denied and no active membership created | API + pgTAP |
| Duplicate/retry | Same idempotency key creates one invitation/send job/membership; duplicate pending handled generically | API integration |
| Unauthorized invite | Customer, employee, manager, disabled owner, cross-farm actor, forged body actor denied | API + pgTAP |
| Role change | Only approved owner path; self-promotion/direct browser writes/stale update denied | API + pgTAP |
| Suspension | Current authenticated token immediately loses private data access after disable commit | pgTAP + API |
| Reinstatement | Owner-only, identity/policy checked, audit complete | API + pgTAP |
| Session revoke failure | Membership denial holds; Auth revoke failure is recorded/retried without access restoration | API integration |
| Cross-farm isolation | Changed farm ID/direct record ID cannot read or mutate foreign farm | pgTAP + browser/API |
| Audit completeness/immutability | Sensitive event fields present; no browser mutation; raw token absent | pgTAP/API/security review |
| Partial Auth/DB failure | Outbox/reconciliation converges without duplicate grants | API fault injection |
| Customer regression | Customer sign-in/account/PWA remain unchanged | Browser E2E |
| Direct Herdbook route | Anonymous/customer/disabled gets no private response; active member sees authorized farm only | Browser + API |

Test function grants/search_path, transaction rollback and concurrency constraints alongside endpoint flows. Client redirects/buttons alone do not prove authorization.

## 13. Decisions requiring project-owner approval

Decisions 1 and 3 are approved. Details listed under decision 1 and decisions 2 and 4–12 remain outstanding and require project-owner approval:

1. **APPROVED — Multiple active owners per farm.** Additional owners use a separate controlled ownership process, never ordinary staff invitations; appointments and transfers are audited; a transactional safeguard prevents zero active owners. Exact appointment eligibility/approvals, transfer workflow, and enforcement implementation remain unapproved.
2. First-owner identity verification, bootstrap operator, and break-glass approvers/evidence.
3. **APPROVED — Owner-only staff administration.** Only owners may administer staff accounts; managers and employees may not. Managers must not receive staff-administration permissions through database grants, trusted APIs, or frontend controls. Customer accounts do not automatically receive staff authority; staff authority requires active farm membership and relevant database permissions.
4. Seven-day invitation expiry; treatment of expired/disabled staff; reinstate versus fresh invitation.
5. Verified-email identity matching rules, existing customer account handling, changed email behavior.
6. Whether employee update/archive remain denied as currently seeded, any future employee permissions, and manager day-to-day operational permissions beyond current grants. Staff administration remains prohibited for managers.
7. Who may publish listings/products, manage auctions, access customer data, approve purchases, or perform finance actions. Current foundation grants none of these domain permissions.
8. Audit reasons, readership, retention duration/legal basis, PII minimization, and external immutable log storage.
9. Production MFA for owners/managers, enrollment deadline, allowed recovery, exact step-up freshness, and second approvers.
10. Supabase Edge Functions/outbox versus a dedicated backend for trusted staff APIs.
11. Session revocation scope and approval for global revocation.
12. Historical staff attribution retention and eventual localStorage reconciliation/import.

## 14. Recommended next implementation task

The owner-only staff administration and multiple-owner policies are approved; implementation is not. After approval of the remaining decisions relevant to the first slice, implement a **local-only staff lifecycle foundation** that enforces the separate appointment process, audit trail, and transactional last-owner safeguard:

1. Record approved policies and obtain decisions on bootstrap identity verification, transfer approvals, and recovery.
2. Design migrations for invitation state, append-only audit, outbox/idempotency, and transactional last-owner protection; review RLS, grants and concurrency.
3. Add synthetic pgTAP and Node integration/fault-injection tests; preserve all 64 existing assertions.
4. Implement the approved owner-only staff-administration boundary. Implement owner appointment/transfer only after its detailed eligibility, approval, acceptance, and recovery rules are separately approved.
5. After server/database checks pass, add staff sign-in and connect one Herdbook animal workflow through the user's RLS-scoped session.

Do not use hosted resources, create real staff accounts, change customer Auth, or import localStorage records unless separately authorized.

## 15. Change boundary

This document records the project-owner-approved owner-only staff-administration and multiple-owner policies and labels all other decisions and implementation details as proposals or outstanding. It is not an implementation: no staff accounts/resources, customer authentication, application code, schema, migrations, or database state were changed, and Herdbook is not connected to real farm data.







