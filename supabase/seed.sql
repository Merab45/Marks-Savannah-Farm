-- SYNTHETIC LOCAL-ONLY fixtures. Every email uses the reserved .invalid domain.
-- Seeded Auth users have no usable password and are only for database policy tests.

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('20000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'owner-a@example.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Synthetic Farm A Owner"}', now(), now()),
  ('20000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'manager-a@example.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Synthetic Farm A Manager"}', now(), now()),
  ('20000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'employee-a@example.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Synthetic Farm A Employee"}', now(), now()),
  ('20000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'owner-b@example.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Synthetic Farm B Owner"}', now(), now()),
  ('20000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'customer@example.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Synthetic Customer"}', now(), now()),
  ('20000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'disabled-staff@example.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Synthetic Disabled Staff"}', now(), now())
on conflict (id) do nothing;

insert into public.user_profiles (user_id, display_name) values
  ('20000000-0000-4000-8000-000000000001', 'Synthetic Farm A Owner'),
  ('20000000-0000-4000-8000-000000000002', 'Synthetic Farm A Manager'),
  ('20000000-0000-4000-8000-000000000003', 'Synthetic Farm A Employee'),
  ('20000000-0000-4000-8000-000000000004', 'Synthetic Farm B Owner'),
  ('20000000-0000-4000-8000-000000000005', 'Synthetic Customer'),
  ('20000000-0000-4000-8000-000000000006', 'Synthetic Disabled Staff')
on conflict (user_id) do nothing;

insert into public.farms (id, slug, legal_name, display_name, status) values
  ('10000000-0000-4000-8000-000000000001', 'demo-acacia-farm-a', 'Synthetic Acacia Farm A', 'Acacia Farm A (Synthetic)', 'active'),
  ('10000000-0000-4000-8000-000000000002', 'demo-acacia-farm-b', 'Synthetic Acacia Farm B', 'Acacia Farm B (Synthetic)', 'active')
on conflict (id) do nothing;

insert into public.farm_locations (id, farm_id, name, county, public_label) values
  ('11000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Synthetic Farm A Main Yard', 'DEMO', 'Farm A demonstration location'),
  ('11000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Synthetic Farm B Main Yard', 'DEMO', 'Farm B demonstration location')
on conflict (id) do nothing;

insert into public.farm_memberships (
  id, farm_id, user_id, role_code, status, invited_by, accepted_at, disabled_at
) values
  ('12000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'owner', 'active', null, now(), null),
  ('12000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'manager', 'active', '20000000-0000-4000-8000-000000000001', now(), null),
  ('12000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', 'employee', 'active', '20000000-0000-4000-8000-000000000001', now(), null),
  ('12000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000004', 'owner', 'active', null, now(), null),
  ('12000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', 'employee', 'disabled', '20000000-0000-4000-8000-000000000001', null, now())
on conflict (id) do nothing;

insert into public.species (id, code, name) values
  ('30000000-0000-4000-8000-000000000001', 'cattle', 'Cattle'),
  ('30000000-0000-4000-8000-000000000002', 'goat', 'Goat'),
  ('30000000-0000-4000-8000-000000000003', 'sheep', 'Sheep'),
  ('30000000-0000-4000-8000-000000000004', 'poultry', 'Poultry')
on conflict (id) do nothing;

insert into public.breeds (id, species_id, name, description) values
  ('31000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Synthetic Boran', 'Fictional test breed label.'),
  ('31000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'Synthetic Dairy Cross', 'Fictional test breed label.'),
  ('31000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', 'Synthetic Boer Cross', 'Fictional test breed label.'),
  ('31000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000003', 'Synthetic Dorper Cross', 'Fictional test breed label.'),
  ('31000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000004', 'Synthetic Layer', 'Fictional test breed label.')
on conflict (id) do nothing;

insert into public.animals (
  id, farm_id, current_location_id, species_id, breed_id, display_name, sex,
  birth_date, acquisition_date, acquisition_type, status, private_notes, created_by
) values
  ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001', 'Demo Cow A1', 'female', '2022-04-01', '2022-04-01', 'born_on_farm', 'active', 'Synthetic fixture; no real animal record.', '20000000-0000-4000-8000-000000000003'),
  ('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', '31000000-0000-4000-8000-000000000003', 'Demo Goat A2', 'male', '2024-02-15', '2024-03-01', 'purchased', 'active', 'Synthetic fixture; no real animal record.', '20000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000004', '31000000-0000-4000-8000-000000000005', 'Demo Hen A3', 'female', '2023-07-10', '2023-07-10', 'born_on_farm', 'sold', 'Synthetic fixture; no real animal record.', '20000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', '11000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000002', 'Demo Cow B1', 'female', '2021-09-20', '2021-09-20', 'born_on_farm', 'active', 'Synthetic fixture; no real animal record.', '20000000-0000-4000-8000-000000000004'),
  ('40000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', '11000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', '31000000-0000-4000-8000-000000000004', 'Demo Sheep B2', 'unknown', null, '2025-01-05', 'purchased', 'deceased', 'Synthetic fixture; no real animal record.', '20000000-0000-4000-8000-000000000004')
on conflict (id) do nothing;

insert into public.animal_identifiers (
  id, farm_id, animal_id, identifier_type, normalized_value, issued_at, retired_at, created_by
) values
  ('41000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'ear_tag', 'DEMO-A-001', '2022-04-01', null, '20000000-0000-4000-8000-000000000003'),
  ('41000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 'rfid', 'DEMO-A-002', '2024-03-01', null, '20000000-0000-4000-8000-000000000002'),
  ('41000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000003', 'ear_tag', 'DEMO-A-003', '2023-07-10', null, '20000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000004', 'ear_tag', 'DEMO-B-001', '2021-09-20', null, '20000000-0000-4000-8000-000000000004'),
  ('41000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000005', 'ear_tag', 'DEMO-B-002', '2025-01-05', null, '20000000-0000-4000-8000-000000000004')
on conflict (id) do nothing;
