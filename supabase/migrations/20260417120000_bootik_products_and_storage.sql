-- BOOTIK: catálogo en Postgres + Storage. Ejecutar con Supabase CLI o SQL Editor (rol postgres).
-- Tras aplicar: Auth > crea usuario admin y en "App metadata" pon {"role":"admin"} (o raw_app_meta_data vía SQL).

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id text primary key,
  name_es text not null,
  name_en text not null,
  price text not null default 'Consultar',
  image text not null default '',
  description_es text not null default '',
  description_en text not null default '',
  model_glb text,
  model_orientation text not null default '0deg 0deg 0deg',
  whatsapp_link text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_published_sort_idx
  on public.products (published, sort_order, id);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_products_updated_at();

alter table public.products enable row level security;

-- Lectura pública: solo publicados
create policy "products_select_published"
  on public.products for select
  to anon, authenticated
  using (published = true);

-- Admins: ver todo (incl. borradores)
create policy "products_select_admin"
  on public.products for select
  to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "products_insert_admin"
  on public.products for insert
  to authenticated
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "products_update_admin"
  on public.products for update
  to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin')
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "products_delete_admin"
  on public.products for delete
  to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

-- Buckets públicos (URLs directas para img/glb en la tienda estática)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product-models', 'product-models', true)
on conflict (id) do nothing;

-- Storage: lectura pública de ambos buckets
create policy "product_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "product_models_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'product-models');

-- Storage: admins suben / actualizan / borran
create policy "product_images_admin_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy "product_images_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  )
  with check (
    bucket_id = 'product-images'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy "product_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy "product_models_admin_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-models'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy "product_models_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-models'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  )
  with check (
    bucket_id = 'product-models'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy "product_models_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-models'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );
