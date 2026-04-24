-- Imagenes de galeria + bucket Storage "gallery"
-- Aplicar despues de la migracion de products.

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text,
  title_es text not null default '',
  title_en text not null default '',
  subtitle_es text not null default '',
  subtitle_en text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_published_sort_idx
  on public.gallery_images (published, sort_order, created_at);

alter table public.gallery_images enable row level security;

create policy "gallery_select_published"
  on public.gallery_images for select
  to anon, authenticated
  using (published = true);

create policy "gallery_select_admin"
  on public.gallery_images for select
  to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "gallery_insert_admin"
  on public.gallery_images for insert
  to authenticated
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "gallery_update_admin"
  on public.gallery_images for update
  to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin')
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "gallery_delete_admin"
  on public.gallery_images for delete
  to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "gallery_storage_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'gallery');

create policy "gallery_storage_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy "gallery_storage_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'gallery'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  )
  with check (
    bucket_id = 'gallery'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

create policy "gallery_storage_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );
