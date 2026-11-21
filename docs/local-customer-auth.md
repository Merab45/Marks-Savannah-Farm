# Local customer authentication

The public customer account pages and Android customer app use Supabase Auth at
`http://127.0.0.1:55421`. Auth sessions are stored by the Supabase client under
`marks-savannah-farm-customer-auth`. Profile reads and writes use the signed-in
user's Auth ID with the existing `user_profiles` RLS policies and column grants.

## Configure the local browser client

The browser configuration currently uses the public publishable key from the
existing local Supabase Studio container. If the local stack regenerates its
keys, run `npx.cmd --yes supabase status -o env` in PowerShell and replace only
`anonKey` in `JS/supabase-config.js` with `ANON_KEY` or a publishable key. Never
use `SERVICE_ROLE_KEY`, a secret key, or a hosted project's key.

Serve this project at `http://127.0.0.1:3000` to match `supabase/config.toml`.
The local Auth container was running with only the `http://localhost:3000`
redirect allowlist before the callback routes were added. Apply the updated
local redirect allowlist by running these commands from the project root in
PowerShell; the default stop keeps the Docker data volumes:

```powershell
npx.cmd --yes supabase stop
npx.cmd --yes supabase start
npx.cmd --yes supabase status
```

Do not pass `--no-backup`. Email confirmation and password reset links return to
`app.html` on Android or `sign-in.html` on desktop. Inspect local messages in
Inbucket at `http://127.0.0.1:54324`.

The browser currently loads the Supabase JS v2 UMD client from jsDelivr. Auth
requires that library and the local Supabase API to be reachable; the service
worker does not cache Auth/API responses. If the CDN is unavailable, account
forms report that the client is not configured/available rather than falling
back to the old device-only passwords.

## Data continuity

Legacy prototype account records and local identity strings are left untouched
for reference, but are never accepted as authentication. Customers create and
confirm a new account. Cart, onboarding preferences, saved items, and prototype
business records remain in their existing device storage and are not imported
or deleted. Saved items, orders, and preview bids are not synchronized yet.

Social provider buttons remain disabled until Google, Facebook, or Apple OAuth
credentials and redirect settings are configured. The staff-facing `herdbook`
page is excluded from precaching and served only while online; staff
authentication remains a separate follow-up task.
