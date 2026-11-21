# Local Supabase database foundation

This is a local-only PostgreSQL foundation for farm, staff, taxonomy, animal, and identifier records. It does not connect the website, customer PWA, or Herdbook to Supabase. Do not use this seed or schema as a production environment without the review gates in `docs/architecture/`.

## Current environment check

Checked on 2026-11-20 from the Codex development session:

| Tool | Observed state | Needed? |
|---|---|---|
| Supabase CLI | Not found on PATH, in the project, in the global npm location, or in the standard Scoop/Local Programs paths checked | Required to start/reset/test the local stack |
| Docker Engine | Client and server 29.9.3; Docker API is accessible only when the command is run with elevated execution in this environment | Required by `supabase start`; no containers or Docker volumes were present |
| Local Supabase state | No `supabase/.temp`, `.branches`, or `.env`; no Supabase containers/volumes | Not initialized; no local database history exists here |
| Node.js / npm / npx | System Node 26.13.1, npm 11.20.0, npx 11.20.0 are present at `C:\Program Files\nodejs`; this session's PATH instead resolves Codex Node 24 and does not expose npm/npx | Supabase CLI package manager support is present by absolute path, but the CLI itself is missing |
| Python | Windows App execution alias was inaccessible; the claimed 3.15.2 was not independently verified and is not required for this SQL workflow | Optional |
| PostgreSQL client (`psql`) | Not available on PATH | Optional; Supabase CLI runs pgTAP tests in a container |
| Project dependencies | No `package.json` or lockfile exists | No application dependencies are required by this SQL foundation |

The database migration, seed, and pgTAP tests have **not** been executed in this session. The current blocker is the unavailable Supabase CLI; Docker itself is running and reports version 29.9.3 when inspected with elevated execution.

## Windows setup

1. Node.js 26.13.1 and npm/npx 11.20.0 are installed at `C:\Program Files\nodejs`. In this Codex session, the bare `node` command resolves to its bundled runtime and bare `npm`/`npx` are missing. Use a PowerShell session with the system Node directory on PATH, or invoke its tools by absolute path.
2. The task-provided Supabase CLI 3.2.0 was not discoverable from this session. Do not install a second copy or modify project dependencies just to bypass the mismatch; expose the existing CLI in the PowerShell/Codex environment, then confirm `supabase --version` reports `3.2.0`.

   ```powershell
   supabase --version
   ```

   The CLI is packaged with the user's development tooling, not declared by this repository. Do not create a second Supabase project or package installation to compensate for a PATH mismatch.
3. Docker Engine 29.9.3 is running and existing Docker containers/volumes were inspected; none were listed. No Docker volumes or containers were deleted. If the normal terminal cannot access the Docker pipe, resolve the local Docker permission/session issue without changing the Docker data root.
4. In the PowerShell session that will run the database, verify `supabase --version`, `docker version`, and `supabase status`. Do not print or share local service keys from status output.

`psql` is not required for the workflow below. If you want it for manual inspection, install PostgreSQL 17 client tools from the [official Windows installer page](https://www.postgresql.org/download/windows/) and use only the localhost database URL printed by `supabase status`.

## Start, reset, test, stop

Run from the repository root. Do not run `supabase link` or enter a hosted database URL.

```powershell
supabase start
supabase status
supabase test db --local
supabase stop
```

`supabase start` initializes the local stack and applies configured migrations/seed when needed. Confirm `status` shows localhost endpoints before testing. `supabase db reset --local` destroys the local database, reapplies every migration, then loads the configured seed. **Do not run that reset unless the user has explicitly approved losing local database contents; no reset was run for Task 007.** The CLI documents that its local reset replays local migrations and seed data; the pgTAP command requires the local stack to be running. [Local reset reference](https://supabase.com/docs/reference/cli/supabase-db-reset), [local pgTAP reference](https://supabase.com/docs/reference/cli/introduction).

The configured PostgreSQL major version is **17** in `config.toml`. If the CLI reports a port conflict, inspect the running local Supabase projects before changing ports. This project uses API port 55421, database port 55422, and shadow database port 55420.

## Supabase CLI 3 configuration note

Supabase CLI v3 deprecates `auth.email.enable_signup`; the email provider setting is now `auth.email.enabled`. `config.toml` uses `enabled = true` for the email provider and leaves the general `auth.enable_signup` default unchanged. This preserves the existing configuration intent. [CLI v3 migration notes](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3).

## Seeded test identities

`seed.sql` creates six Auth fixtures with deterministic UUIDs and reserved `.invalid` email addresses: Farm A owner, manager, employee; Farm B owner; a customer with no farm membership; and a disabled Farm A employee. The accounts have empty, unusable password hashes and are not intended for sign-in.

The pgTAP tests set the `authenticated` PostgreSQL role and local JWT claim settings for those fixture IDs, then call `auth.uid()` and issue ordinary SQL operations under those role contexts. The tests do not call the hosted Auth API and do not use a service-role key as evidence of RLS enforcement. Do not add personal information or usable passwords to the fixtures.

## Credentials and environment separation

- `config.toml` contains local ports and settings only. It has no project reference or secret.
- The CLI prints local URLs and keys after startup. A local publishable/anon key is intended for a local client; it is not a production credential.
- Database passwords and `service_role`/secret keys are privileged. Never place them in website/PWA JavaScript, HTML, public assets, or committed files. The local app has no Supabase configuration and no credentials have been added to the frontend.
- No environment variables are required by the migrations or tests. Keep any future local secret file under `supabase/.env`; `.gitignore` in this folder excludes it.
- Local fixtures and local Docker volumes are separate from production. This repository has not been linked to or deployed to a hosted Supabase project.

## Troubleshooting

- **`npm`/`npx` not found:** system Node/npm are present at `C:\Program Files\nodejs`; reopen PowerShell with that path available or invoke its commands by absolute path.
- **Supabase CLI not found:** expose the already-installed CLI 3.2.0 to this PowerShell session. This Codex session did not locate it, so no Supabase command ran.
- **Docker daemon unavailable:** start Docker Desktop and wait until its engine is ready; check both sections in `docker version`.
- **WSL backend will not start:** run `wsl --version`; verify the supported Windows build, WSL 2.1.5+ (this machine currently reports 3.0.5), virtualization, memory, and Docker Desktop configuration. Changing Windows features may need administrator assistance.
- **Port conflict:** inspect `supabase status` and other local stacks. Do not point this config at an unverified database to bypass the conflict.
- **Migration or seed failure:** save the complete local CLI output and fix forward. Do not reset or discard local database contents without explicit user approval.
- **Test failure:** run `supabase test db --local` against the verified local stack; keep the assertion output and exit code. Do not report an assertion as passed based on SQL inspection alone.

## Implemented boundary and limitations

- `user_profiles.user_id` references `auth.users.id`; application profiles do not store credentials.
- Farm access is derived from a current active membership and a migration-controlled role-permission catalog. Owners can read all memberships in their own farm; all browser roles are denied membership and permission mutations. Owner bootstrap, invitations, and role-administration APIs are not implemented.
- Owners/managers have animal read/create/update permissions; employees have animal read/create and identifier-create permissions. No browser role has animal delete permission.
- Active species and breeds are public read-only taxonomy. Farm, location, profile, membership, animal, and identifier data remain private.
- The initial schema does not include audit events, animal health/breeding, inventory, orders, auctions, or frontend integration.
- Hosted region, transfer/privacy review, provider account, budget, and Kenya latency remain production gates in `docs/architecture/ARCHITECTURE_DECISIONS.md`.
