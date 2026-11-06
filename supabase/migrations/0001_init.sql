-- DukaanDost initial schema
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  tagline text not null default '',
  description text not null default '',
  whatsapp_number text not null default '',
  logo_emoji text not null default '🏪',
  logo_color text not null default 'royal',
  logo_url text,
  is_open boolean not null default true,
  payment_methods text[] not null default array['cod']::text[],
  payment_accounts jsonb not null default '{}'::jsonb,
  delivery_note text not null default '',
  language text not null default 'en' check (language in ('en', 'ur')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shops_owner_idx on public.shops(owner_id);
create index if not exists shops_slug_idx on public.shops(slug);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  description text not null default '',
  emoji text not null default '🛍️',
  theme text not null default 'royal',
  image_url text,
  in_stock boolean not null default true,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_shop_idx on public.products(shop_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  order_number integer not null,
  customer_name text not null,
  customer_phone text not null,
  address text not null,
  items jsonb not null default '[]'::jsonb,
  total numeric(12, 2) not null default 0,
  payment_method text not null default 'cod' check (payment_method in ('cod', 'easypaisa', 'jazzcash', 'bank')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'paid', 'delivered', 'cancelled')),
  note text,
  created_at timestamptz not null default now(),
  unique (shop_id, order_number)
);
create index if not exists orders_shop_created_idx on public.orders(shop_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists shops_updated on public.shops;
create trigger shops_updated before update on public.shops
  for each row execute function public.set_updated_at();

drop trigger if exists products_updated on public.products;
create trigger products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New user profile
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists shops_public_read on public.shops;
create policy shops_public_read on public.shops for select using (true);

drop policy if exists shops_owner_insert on public.shops;
create policy shops_owner_insert on public.shops for insert with check (auth.uid() = owner_id);

drop policy if exists shops_owner_update on public.shops;
create policy shops_owner_update on public.shops for update
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists shops_owner_delete on public.shops;
create policy shops_owner_delete on public.shops for delete using (auth.uid() = owner_id);

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (true);

drop policy if exists products_owner_insert on public.products;
create policy products_owner_insert on public.products for insert with check (
  exists (
    select 1 from public.shops
    where shops.id = products.shop_id and shops.owner_id = auth.uid()
  )
);

drop policy if exists products_owner_update on public.products;
create policy products_owner_update on public.products for update
  using (
    exists (
      select 1 from public.shops
      where shops.id = products.shop_id and shops.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.shops
      where shops.id = products.shop_id and shops.owner_id = auth.uid()
    )
  );

drop policy if exists products_owner_delete on public.products;
create policy products_owner_delete on public.products for delete using (
  exists (
    select 1 from public.shops
    where shops.id = products.shop_id and shops.owner_id = auth.uid()
  )
);

drop policy if exists orders_owner_read on public.orders;
create policy orders_owner_read on public.orders for select using (
  exists (
    select 1 from public.shops
    where shops.id = orders.shop_id and shops.owner_id = auth.uid()
  )
);

drop policy if exists orders_owner_update on public.orders;
create policy orders_owner_update on public.orders for update
  using (
    exists (
      select 1 from public.shops
      where shops.id = orders.shop_id and shops.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.shops
      where shops.id = orders.shop_id and shops.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Place order (public RPC, atomic stock + order number)
-- ---------------------------------------------------------------------------
create or replace function public.place_order(
  p_shop_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_address text,
  p_items jsonb,
  p_payment_method text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop public.shops%rowtype;
  v_item record;
  v_product public.products%rowtype;
  v_items jsonb := '[]'::jsonb;
  v_total numeric := 0;
  v_number integer;
  v_order public.orders%rowtype;
begin
  select * into v_shop from public.shops where id = p_shop_id;
  if not found then raise exception 'SHOP_NOT_FOUND'; end if;
  if not v_shop.is_open then raise exception 'SHOP_CLOSED'; end if;
  if p_payment_method is null or not (p_payment_method = any(v_shop.payment_methods)) then
    raise exception 'PAYMENT_METHOD_NOT_AVAILABLE';
  end if;
  if p_customer_name is null or length(trim(p_customer_name)) < 2 then
    raise exception 'INVALID_NAME';
  end if;
  if p_customer_phone is null or length(trim(p_customer_phone)) < 7 then
    raise exception 'INVALID_PHONE';
  end if;
  if p_address is null or length(trim(p_address)) < 5 then
    raise exception 'INVALID_ADDRESS';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_shop_id::text));

  for v_item in
    select * from jsonb_to_recordset(p_items) as x(product_id uuid, qty integer)
  loop
    if v_item.qty is null or v_item.qty <= 0 then raise exception 'INVALID_QTY'; end if;

    select * into v_product
    from public.products
    where id = v_item.product_id and shop_id = p_shop_id
    for update;

    if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;
    if not v_product.in_stock or v_product.stock < v_item.qty then
      raise exception 'OUT_OF_STOCK:%', v_product.name;
    end if;

    v_items := v_items || jsonb_build_object(
      'productId', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'qty', v_item.qty,
      'emoji', v_product.emoji,
      'theme', v_product.theme,
      'imageUrl', v_product.image_url
    );
    v_total := v_total + (v_product.price * v_item.qty);

    update public.products
    set stock = stock - v_item.qty,
        in_stock = (stock - v_item.qty) > 0,
        updated_at = now()
    where id = v_product.id;
  end loop;

  select coalesce(max(order_number), 1000) + 1 into v_number
  from public.orders where shop_id = p_shop_id;

  insert into public.orders (
    shop_id, order_number, customer_name, customer_phone,
    address, items, total, payment_method, note
  )
  values (
    p_shop_id, v_number, trim(p_customer_name), trim(p_customer_phone),
    trim(p_address), v_items, v_total, p_payment_method,
    nullif(trim(coalesce(p_note, '')), '')
  )
  returning * into v_order;

  return to_jsonb(v_order);
end;
$$;

revoke all on function public.place_order(uuid, text, text, text, jsonb, text, text) from public;
grant execute on function public.place_order(uuid, text, text, text, jsonb, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for shop + product images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('shop-assets', 'shop-assets', true)
on conflict (id) do update set public = true;

drop policy if exists shop_assets_public_read on storage.objects;
create policy shop_assets_public_read on storage.objects
  for select using (bucket_id = 'shop-assets');

drop policy if exists shop_assets_auth_insert on storage.objects;
create policy shop_assets_auth_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'shop-assets' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists shop_assets_auth_update on storage.objects;
create policy shop_assets_auth_update on storage.objects
  for update to authenticated using (
    bucket_id = 'shop-assets' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists shop_assets_auth_delete on storage.objects;
create policy shop_assets_auth_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'shop-assets' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Grants (PostgREST roles)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.shops, public.products to anon, authenticated;
grant select, insert, update, delete on public.shops, public.products to authenticated;
grant select, update on public.orders to authenticated;
grant select, insert, update on public.profiles to authenticated;

-- Make sure the API can see new tables immediately.
notify pgrst, 'reload schema';
