begin;
create extension if not exists pgtap with schema extensions;
select plan(64);

-- Anonymous access is blocked at the table grant layer; no anonymous private-data policy exists.
set local role anon;
select throws_ok(
  $$select * from public.animals$$,
  '42501', null,
  'anonymous role has no table privilege to read animals'
);
select throws_ok(
  $$select * from public.animal_identifiers$$,
  '42501', null,
  'anonymous role has no table privilege to read animal identifiers'
);
select throws_ok(
  $$select * from public.user_profiles$$,
  '42501', null,
  'anonymous role cannot read customer profiles'
);
select throws_ok(
  $$select public.has_farm_permission('10000000-0000-4000-8000-000000000001', 'farm.read')$$,
  '42501', null,
  'anonymous role cannot invoke the membership helper'
);
reset role;

-- A customer identity without a staff membership has no private farm access.
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000005', true);
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000005","role":"authenticated"}', true);
select is(auth.uid(), '20000000-0000-4000-8000-000000000005'::uuid, 'customer context resolves the authenticated Auth user id');
select is((select count(*)::integer from public.animals), 0, 'customer cannot read staff animal records');
select is((select count(*)::integer from public.farm_memberships), 0, 'customer cannot enumerate staff memberships');
select is((select count(*)::integer from public.user_profiles where user_id = auth.uid()), 1, 'customer can read only their own profile');
select results_eq(
  $$with changed as (
    update public.user_profiles
    set display_name = 'Impersonation Attempt'
    where user_id = '20000000-0000-4000-8000-000000000001'
    returning user_id
  ) select count(*)::integer from changed$$,
  $$values (0)$$,
  'customer cannot update another user profile by supplying its id'
);
select throws_ok(
  $$update public.user_profiles set user_id = '20000000-0000-4000-8000-000000000001' where user_id = '20000000-0000-4000-8000-000000000005'$$,
  '42501', null,
  'customer cannot change the identity attached to their profile'
);
select throws_ok(
  $$insert into public.user_profiles (user_id, display_name) values ('20000000-0000-4000-8000-000000000001', 'Impersonated Owner')$$,
  '42501', null,
  'customer cannot create a profile for another Auth identity'
);
select throws_ok(
  $$insert into public.farm_memberships (farm_id, user_id, role_code, status) values ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005', 'owner', 'invited')$$,
  '42501', null,
  'customer cannot add themselves to a farm'
);
select throws_ok(
  $$select * from public.role_permissions$$,
  '42501', null,
  'customer cannot read the internal permission catalog'
);
select throws_ok(
  $$insert into public.animals (farm_id, species_id, display_name) values ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Customer Attempt')$$,
  '42501', null,
  'customer cannot create farm animals'
);
reset role;

-- Active Farm A employee sees only Farm A records and cannot elevate privileges.
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
select is(auth.uid(), '20000000-0000-4000-8000-000000000003'::uuid, 'employee context resolves the authenticated Auth user id');
select is((select count(*)::integer from public.animals), 3, 'employee reads animals at own farm');
select is((select count(*)::integer from public.animals where farm_id = '10000000-0000-4000-8000-000000000002'), 0, 'employee cannot read another farm by changing farm id');
select is((select count(*)::integer from public.animals where id = '40000000-0000-4000-8000-000000000004'), 0, 'employee cannot read a foreign animal by direct record id');
select is((select count(*)::integer from public.farms), 1, 'employee sees only own farm');
select is((select count(*)::integer from public.farm_memberships), 1, 'employee can see only own membership');
select is((select count(*)::integer from public.farm_memberships where farm_id = '10000000-0000-4000-8000-000000000002'), 0, 'employee cannot enumerate another farm memberships');
select throws_ok(
  $$insert into public.animals (farm_id, species_id, display_name) values ('10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'Cross Farm Insert Attempt')$$,
  '42501', null,
  'employee cannot insert into another farm'
);
select lives_ok(
  $$insert into public.animals (id, farm_id, species_id, display_name)
    values ('40000000-0000-4000-8000-000000000099', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Policy Test Animal')$$,
  'employee can create an animal in their farm'
);
select lives_ok(
  $$insert into public.animal_identifiers (farm_id, animal_id, identifier_type, normalized_value)
    values ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000099', 'ear_tag', 'POLICY-TEST-99')$$,
  'employee can add an identifier to an animal at their farm'
);
select results_eq(
  $$with changed as (
    update public.animals set private_notes = 'unauthorized edit'
    where id = '40000000-0000-4000-8000-000000000001'
    returning id
  ) select count(*)::integer from changed$$,
  $$values (0)$$,
  'employee cannot update animals without animal.update permission'
);
select results_eq(
  $$with changed as (
    update public.animals
    set private_notes = 'cross-farm edit'
    where id = '40000000-0000-4000-8000-000000000004'
    returning id
  ) select count(*)::integer from changed$$,
  $$values (0)$$,
  'employee cannot update another farm record by direct id'
);
select throws_ok(
  $$update public.animals set farm_id = '10000000-0000-4000-8000-000000000002' where id = '40000000-0000-4000-8000-000000000001'$$,
  '42501', null,
  'employee cannot reassign an animal to another farm'
);
select throws_ok(
  $$delete from public.animals where id = '40000000-0000-4000-8000-000000000001'$$,
  '42501', null,
  'employee cannot delete an animal'
);
select throws_ok(
  $$update public.farm_memberships set role_code = 'owner' where user_id = '20000000-0000-4000-8000-000000000003'$$,
  '42501', null,
  'employee cannot change own staff role'
);
select throws_ok(
  $$update public.farm_memberships set status = 'active', accepted_at = now(), disabled_at = null where user_id = '20000000-0000-4000-8000-000000000006'$$,
  '42501', null,
  'employee cannot reactivate a disabled membership'
);
select throws_ok(
  $$insert into public.farm_memberships (farm_id, user_id, role_code, status) values ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', 'owner', 'active')$$,
  '42501', null,
  'employee cannot promote themselves by inserting a new membership'
);
select throws_ok(
  $$update public.farm_memberships set role_code = 'owner' where user_id = '20000000-0000-4000-8000-000000000002'$$,
  '42501', null,
  'employee cannot modify another staff member role'
);
select throws_ok(
  $$insert into public.role_permissions (role_code, permission_code) values ('employee', 'membership.manage')$$,
  '42501', null,
  'employee cannot grant themselves permissions'
);
select throws_ok(
  $$delete from public.animals where id = '40000000-0000-4000-8000-000000000004'$$,
  '42501', null,
  'employee cannot delete a foreign animal by direct id'
);
reset role;

-- A disabled membership fails closed even when the identity is authenticated.
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000006', true);
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000006","role":"authenticated"}', true);
select is((select count(*)::integer from public.animals), 0, 'disabled membership provides no animal access');
reset role;

-- Farm A manager has operational animal permissions but cannot enumerate memberships or cross farms.
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
select is((select count(*)::integer from public.animals), 4, 'manager reads own-farm animals including the employee-created record');
select is((select count(*)::integer from public.animals where id = '40000000-0000-4000-8000-000000000004'), 0, 'manager cannot read another farm record');
select is((select count(*)::integer from public.farm_memberships), 1, 'manager without membership permission sees only their own membership');
select lives_ok(
  $$update public.animals set private_notes = 'Manager update policy test' where id = '40000000-0000-4000-8000-000000000001'$$,
  'manager can update an animal at their farm'
);
reset role;

-- Farm B owner has access to B only, despite knowing Farm A record ids.
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000004', true);
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000004","role":"authenticated"}', true);
select is((select count(*)::integer from public.animals), 2, 'Farm B owner reads Farm B animals');
select is((select count(*)::integer from public.animals where id = '40000000-0000-4000-8000-000000000001'), 0, 'Farm B owner cannot read Farm A by direct id');
select is((select count(*)::integer from public.farm_memberships), 1, 'Farm B owner sees Farm B membership only');
reset role;

-- An owner can perform authorized updates. Tenant ownership still cannot be changed.
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select lives_ok(
  $$update public.animals set private_notes = 'Owner update policy test' where id = '40000000-0000-4000-8000-000000000001'$$,
  'owner can update an animal at their farm'
);
select is((select count(*)::integer from public.farm_memberships), 4, 'Farm A owner can review all Farm A memberships');
select throws_ok(
  $$update public.farm_memberships set role_code = 'manager' where user_id = '20000000-0000-4000-8000-000000000003'$$,
  '42501', null,
  'owner browser client cannot change staff roles outside trusted administration'
);
reset role;
select throws_ok(
  $$update public.animals set farm_id = '10000000-0000-4000-8000-000000000002' where id = '40000000-0000-4000-8000-000000000001'$$,
  '42501', 'Animal farm ownership cannot be changed',
  'even owner cannot silently reassign an animal across farms'
);

-- Database-level integrity checks run with the privileged test connection.
select throws_ok(
  $$insert into public.animal_identifiers (farm_id, animal_id, identifier_type, normalized_value)
    values ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 'ear_tag', 'DEMO-A-001')$$,
  '23505', null,
  'duplicate active farm identifier is rejected'
);
select throws_ok(
  $$insert into public.animals (farm_id, species_id, breed_id, display_name)
    values ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', '31000000-0000-4000-8000-000000000001', 'Invalid Breed Link')$$,
  '23503', null,
  'breed must belong to the selected species'
);
select throws_ok(
  $$insert into public.animal_identifiers (farm_id, animal_id, identifier_type, normalized_value)
    values ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000004', 'other', 'CROSS-FARM-ID')$$,
  '23503', null,
  'identifier cannot associate a farm with another farm animal'
);
select throws_ok(
  $$insert into public.animals (farm_id, species_id, display_name)
    values ('10000000-0000-4000-8000-000000000099', '30000000-0000-4000-8000-000000000001', 'Invalid Farm Link')$$,
  '23503', null,
  'animal must reference an existing farm'
);
select throws_ok(
  $$insert into public.animals (farm_id, species_id, display_name)
    values (null, '30000000-0000-4000-8000-000000000001', 'Missing Farm')$$,
  '23502', null,
  'animal farm is required'
);
select throws_ok(
  $$insert into public.animals (farm_id, current_location_id, species_id, display_name)
    values ('10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'Wrong Farm Location')$$,
  '23503', null,
  'animal location must belong to the same farm'
);
select throws_ok(
  $$insert into public.animals (farm_id, species_id, status, display_name)
    values ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'unexpected', 'Invalid Status')$$,
  '23514', null,
  'animal status must be one of the allowed values'
);
select throws_ok(
  $$insert into public.user_profiles (user_id, display_name)
    values ('20000000-0000-4000-8000-000000000099', 'Unknown Auth User')$$,
  '23503', null,
  'profile must reference an existing Auth identity'
);
select throws_ok(
  $$insert into public.farm_memberships (farm_id, user_id, role_code, status, accepted_at)
    values ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', 'employee', 'active', now())$$,
  '23505', null,
  'a user cannot have duplicate memberships at one farm'
);
select throws_ok(
  $$delete from public.farms where id = '10000000-0000-4000-8000-000000000001'$$,
  '23503', null,
  'referenced farm deletion is restricted'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.animals'::regclass),
  'row level security is enabled on animal records'
);
select is(
  (select count(*)::integer from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' and relrowsecurity),
  9,
  'RLS is enabled on all nine foundation tables'
);
select ok(
  (select prosecdef from pg_proc where oid = 'public.has_farm_permission(uuid,text)'::regprocedure),
  'membership helper uses SECURITY DEFINER'
);
select ok(
  (select proconfig @> array['search_path=""'] from pg_proc where oid = 'public.has_farm_permission(uuid,text)'::regprocedure),
  'membership helper has an empty fixed search_path'
);
select ok(
  not has_function_privilege('anon', 'public.has_farm_permission(uuid,text)', 'EXECUTE'),
  'anonymous role cannot execute the membership helper'
);
select ok(
  has_function_privilege('authenticated', 'public.has_farm_permission(uuid,text)', 'EXECUTE'),
  'authenticated role can execute the boolean membership helper'
);
select ok(
  not has_function_privilege('authenticated', 'public.set_profile_updated_at()', 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.protect_animal_tenant_fields()', 'EXECUTE'),
  'authenticated role cannot execute trigger functions directly'
);
select ok(
  (select pg_get_userbyid(proowner) not in ('anon', 'authenticated') from pg_proc where oid = 'public.has_farm_permission(uuid,text)'::regprocedure),
  'membership helper is owned by a privileged migration role'
);

select * from finish();
rollback;
