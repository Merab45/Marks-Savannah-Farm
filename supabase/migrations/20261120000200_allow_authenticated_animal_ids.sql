-- Authenticated farm staff may provide an animal UUID during creation.
-- Farm ownership remains enforced by animals_create_permitted_farm.
grant insert (id) on public.animals to authenticated;
