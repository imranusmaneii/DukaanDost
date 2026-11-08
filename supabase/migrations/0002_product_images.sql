-- Multiple photos per product
alter table public.products
  add column if not exists image_urls text[] not null default array[]::text[];

update public.products
set image_urls = array[image_url]
where image_url is not null
  and coalesce(cardinality(image_urls), 0) = 0;

-- Include every product photo in order snapshots
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
  v_images text[];
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

    v_images := coalesce(v_product.image_urls, array[]::text[]);
    if cardinality(v_images) = 0 and v_product.image_url is not null then
      v_images := array[v_product.image_url];
    end if;

    v_items := v_items || jsonb_build_object(
      'productId', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'qty', v_item.qty,
      'emoji', v_product.emoji,
      'theme', v_product.theme,
      'imageUrl', coalesce(v_images[1], v_product.image_url),
      'imageUrls', to_jsonb(v_images)
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

notify pgrst, 'reload schema';
