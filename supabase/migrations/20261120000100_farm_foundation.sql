-- First local-only domain slice for farms and animal identity.
-- Authentication is provided by Supabase Auth; application tables never store passwords.

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(trim(slug)) and length(slug) between 2 and 80),
  legal_name text not null check (length(trim(legal_name)) > 0),
  display_name text not null check (length(trim(display_name)) > 0),
  currency_code text not null default 'KES' check (currency_code ~ '^[A-Z]{3}$'),
  timezone text not null default 'Africa/Nairobi',
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.farm_locations (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  county text,
  address text,
  public_label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, id)
);
create index farm_locations_active_idx on public.farm_locations (farm_id, is_active);

-- A profile is descriptive application data. Identity and credentials remain in auth.users.
create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (length(display_name) <= 160),
  phone text check (phone is null or length(phone) <= 40),
  preferred_language text not null default 'en' check (length(preferred_language) between 2 and 16),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.farm_memberships (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  role_code text not null check (role_code in ('owner', 'manager', 'employee')),
  status text not null default 'invited' check (status in ('invited', 'active', 'disabled')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, user_id),
  unique (farm_id, id),
  check ((status = 'active' and accepted_at is not null and disabled_at is null)
      or (status = 'invited' and disabled_at is null)
      or (status = 'disabled' and disabled_at is not null))
);
create index farm_memberships_user_status_idx on public.farm_memberships (user_id, status);
create index farm_memberships_farm_role_status_idx on public.farm_memberships (farm_id, role_code, status);

-- This is a controlled permission catalog. Client roles have no write access to it.
create table public.role_permissions (
  role_code text not null check (role_code in ('owner', 'manager', 'employee')),
  permission_code text not null,
  primary key (role_code, permission_code)
);

insert into public.role_permissions (role_code, permission_code) values
  ('owner', 'farm.read'),
  ('owner', 'animal.read'),
  ('owner', 'animal.create'),
  ('owner', 'animal.update'),
  ('owner', 'animal.archive'),
  ('owner', 'animal.identifier.create'),
  ('owner', 'location.manage'),
  ('owner', 'membership.read_all'),
  ('manager', 'farm.read'),
  ('manager', 'animal.read'),
  ('manager', 'animal.create'),
  ('manager', 'animal.update'),
  ('manager', 'animal.archive'),
  ('manager', 'animal.identifier.create'),
  ('manager', 'location.manage'),
  ('employee', 'farm.read'),
  ('employee', 'animal.read'),
  ('employee', 'animal.create'),
  ('employee', 'animal.identifier.create');

create table public.species (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(trim(code)) and length(code) between 2 and 40),
  name text not null check (length(trim(name)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index species_name_ci_idx on public.species (lower(name));

create table public.breeds (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references public.species(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (species_id, id)
);
create unique index breeds_species_name_ci_idx on public.breeds (species_id, lower(name));

create table public.animals (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete restrict,
  current_location_id uuid,
  species_id uuid not null references public.species(id) on delete restrict,
  breed_id uuid,
  display_name text check (display_name is null or length(display_name) <= 160),
  sex text not null default 'unknown' check (sex in ('female', 'male', 'unknown')),
  birth_date date,
  acquisition_date date,
  acquisition_type text check (acquisition_type is null or acquisition_type in ('born_on_farm', 'purchased', 'transferred', 'other')),
  status text not null default 'active' check (status in ('active', 'sold', 'deceased', 'transferred', 'archived')),
  private_notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (farm_id, id),
  foreign key (farm_id, current_location_id)
    references public.farm_locations(farm_id, id) on delete restrict,
  foreign key (species_id, breed_id)
    references public.breeds(species_id, id) on delete restrict,
  check (birth_date is null or acquisition_date is null or birth_date <= acquisition_date),
  check ((status = 'archived') = (archived_at is not null))
);
create index animals_farm_status_idx on public.animals (farm_id, status);
create index animals_farm_species_status_idx on public.animals (farm_id, species_id, status);
create index animals_created_at_idx on public.animals (farm_id, created_at desc);

create table public.animal_identifiers (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null,
  animal_id uuid not null,
  identifier_type text not null check (identifier_type in ('ear_tag', 'rfid', 'brand', 'ear_mark', 'other')),
  normalized_value text not null check (normalized_value = upper(trim(normalized_value)) and length(normalized_value) between 1 and 100),
  issued_at date not null default current_date,
  retired_at date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (farm_id, animal_id)
    references public.animals(farm_id, id) on delete restrict,
  check (retired_at is null or retired_at >= issued_at)
);
create unique index animal_identifiers_active_unique_idx
  on public.animal_identifiers (farm_id, identifier_type, normalized_value)
  where retired_at is null;
create index animal_identifiers_animal_idx on public.animal_identifiers (farm_id, animal_id);

-- Membership lookup is isolated in fixed-search-path SECURITY DEFINER functions to avoid
-- recursive membership RLS. They return booleans only and cannot expose membership rows.
create function public.has_farm_permission(p_farm_id uuid, p_permission_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.farm_memberships as membership
    join public.role_permissions as permission
      on permission.role_code = membership.role_code
    where membership.farm_id = p_farm_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and permission.permission_code = p_permission_code
  );
$$;
revoke all on function public.has_farm_permission(uuid, text) from public, anon;
grant execute on function public.has_farm_permission(uuid, text) to authenticated;

create function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.set_profile_updated_at() from public, anon, authenticated;

create function public.protect_animal_tenant_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if (select auth.uid()) is not null then
      new.created_by := (select auth.uid());
    end if;
    return new;
  end if;

  if new.farm_id is distinct from old.farm_id then
    raise exception using errcode = '42501', message = 'Animal farm ownership cannot be changed';
  end if;
  if new.created_by is distinct from old.created_by then
    raise exception using errcode = '42501', message = 'Animal creator cannot be changed';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.protect_animal_tenant_fields() from public, anon, authenticated;

create trigger user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_profile_updated_at();
create trigger animals_protect_tenant_fields
before insert or update on public.animals
for each row execute function public.protect_animal_tenant_fields();

alter table public.farms enable row level security;
alter table public.farm_locations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.farm_memberships enable row level security;
alter table public.role_permissions enable row level security;
alter table public.species enable row level security;
alter table public.breeds enable row level security;
alter table public.animals enable row level security;
alter table public.animal_identifiers enable row level security;

create policy farms_read_member on public.farms
  for select to authenticated using (public.has_farm_permission(id, 'farm.read'));

create policy farm_locations_read_member on public.farm_locations
  for select to authenticated using (public.has_farm_permission(farm_id, 'farm.read'));

create policy profiles_read_self on public.user_profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy profiles_insert_self on public.user_profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy profiles_update_self on public.user_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy memberships_read_self_or_manager on public.farm_memberships
  for select to authenticated
  using (user_id = (select auth.uid()) or public.has_farm_permission(farm_id, 'membership.read_all'));

create policy species_read_catalogue on public.species
  for select to anon, authenticated using (is_active);
create policy breeds_read_catalogue on public.breeds
  for select to anon, authenticated using (is_active);

create policy animals_read_permitted_farm on public.animals
  for select to authenticated using (public.has_farm_permission(farm_id, 'animal.read'));
create policy animals_create_permitted_farm on public.animals
  for insert to authenticated
  with check (
    public.has_farm_permission(farm_id, 'animal.create')
    and status = 'active'
    and archived_at is null
  );
create policy animals_update_permitted_farm on public.animals
  for update to authenticated
  using (public.has_farm_permission(farm_id, 'animal.update'))
  with check (public.has_farm_permission(farm_id, 'animal.update'));

create policy animal_identifiers_read_permitted_farm on public.animal_identifiers
  for select to authenticated using (public.has_farm_permission(farm_id, 'animal.read'));
create policy animal_identifiers_create_permitted_farm on public.animal_identifiers
  for insert to authenticated
  with check (
    public.has_farm_permission(farm_id, 'animal.identifier.create')
    and retired_at is null
  );

-- Default deny plus explicit least-privilege grants. In particular, no client role can
-- create/change memberships, grant permissions, delete animals, or modify taxonomy.
revoke all on public.farms, public.farm_locations, public.user_profiles,
  public.farm_memberships, public.role_permissions, public.animals,
  public.animal_identifiers, public.species, public.breeds
from anon, authenticated;

grant select on public.farms, public.farm_locations to authenticated;
grant select on public.user_profiles to authenticated;
grant insert (user_id, display_name, phone, preferred_language) on public.user_profiles to authenticated;
grant update (display_name, phone, preferred_language) on public.user_profiles to authenticated;
grant select on public.farm_memberships to authenticated;
grant select on public.species, public.breeds to anon, authenticated;
grant select on public.animals, public.animal_identifiers to authenticated;
grant insert (farm_id, current_location_id, species_id, breed_id, display_name, sex,
  birth_date, acquisition_date, acquisition_type, status, private_notes)
  on public.animals to authenticated;
grant update (current_location_id, species_id, breed_id, display_name, sex, birth_date,
  acquisition_date, acquisition_type, status, private_notes, archived_at)
  on public.animals to authenticated;
grant insert (farm_id, animal_id, identifier_type, normalized_value, issued_at, retired_at)
  on public.animal_identifiers to authenticated;
