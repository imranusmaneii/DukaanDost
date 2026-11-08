"use client";

import { getSupabase } from "./supabase/client";
import type {
  CheckoutDetails,
  Lang,
  Order,
  OrderItem,
  OrderStatus,
  PaymentAccounts,
  PaymentMethod,
  PaymentStatus,
  Product,
  Profile,
  Shop,
  ShopInput,
} from "./types";
import { slugify } from "./utils";

type Row = Record<string, any>;

function mapProfile(row: Row): Profile {
  return {
    id: row.id,
    fullName: row.full_name ?? "",
    phone: row.phone ?? "",
  };
}

function mapShop(row: Row, ownerName = ""): Shop {
  const accounts = (row.payment_accounts ?? {}) as Partial<PaymentAccounts>;
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    ownerName,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    whatsappNumber: row.whatsapp_number ?? "",
    logoEmoji: row.logo_emoji ?? "🏪",
    logoColor: row.logo_color ?? "royal",
    logoUrl: row.logo_url ?? null,
    isOpen: row.is_open ?? true,
    paymentMethods: (row.payment_methods ?? ["cod"]) as PaymentMethod[],
    paymentAccounts: {
      easypaisa: accounts.easypaisa ?? "",
      jazzcash: accounts.jazzcash ?? "",
      bank: accounts.bank ?? "",
    },
    deliveryNote: row.delivery_note ?? "",
    language: (row.language ?? "en") as Lang,
    createdAt: row.created_at,
  };
}

function mapProduct(row: Row): Product {
  const stored = Array.isArray(row.image_urls)
    ? (row.image_urls as string[]).filter(Boolean)
    : [];
  const imageUrls =
    stored.length > 0 ? stored : row.image_url ? [row.image_url as string] : [];
  return {
    id: row.id,
    shopId: row.shop_id,
    name: row.name,
    price: Number(row.price ?? 0),
    description: row.description ?? "",
    emoji: row.emoji ?? "🛍️",
    theme: row.theme ?? "royal",
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
    inStock: row.in_stock ?? true,
    stock: Number(row.stock ?? 0),
    createdAt: row.created_at,
  };
}

function mapOrder(row: Row): Order {
  return {
    id: row.id,
    shopId: row.shop_id,
    orderNumber: Number(row.order_number),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    address: row.address,
    items: (row.items ?? []) as OrderItem[],
    total: Number(row.total ?? 0),
    paymentMethod: row.payment_method as PaymentMethod,
    paymentStatus: row.payment_status as PaymentStatus,
    orderStatus: row.order_status as OrderStatus,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function updateProfile(
  userId: string,
  patch: { fullName?: string; phone?: string },
): Promise<void> {
  const supabase = getSupabase();
  const row: Row = {};
  if (patch.fullName !== undefined) row.full_name = patch.fullName;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...row }, { onConflict: "id" });
  if (error) throw error;
}

export async function getShopByOwner(userId: string): Promise<Shop | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const profile = await getProfile(userId);
  return mapShop(data, profile?.fullName ?? "");
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapShop(data) : null;
}

export async function getProducts(shopId: string): Promise<Product[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getOrders(shopId: string): Promise<Order[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOrder);
}

export interface DirectoryShop extends Shop {
  products: Product[];
}

export async function getAllShops(): Promise<DirectoryShop[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shops")
    .select("*, products(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: Row) => {
    const products = ((row.products ?? []) as Row[])
      .map(mapProduct)
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    return { ...mapShop(row), products };
  });
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = getSupabase();
  const root = slugify(base) || "shop";
  let candidate = root;
  for (let i = 2; i < 40; i += 1) {
    let query = supabase.from("shops").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now().toString(36).slice(-5)}`;
}

export async function createShop(
  ownerId: string,
  input: ShopInput,
): Promise<Shop> {
  const supabase = getSupabase();
  const slug = await uniqueSlug(input.slug || input.name);
  const { data, error } = await supabase
    .from("shops")
    .insert({
      owner_id: ownerId,
      name: input.name.trim(),
      slug,
      tagline: input.tagline.trim(),
      description: input.description.trim(),
      whatsapp_number: input.whatsappNumber.trim(),
      logo_emoji: input.logoEmoji,
      logo_color: input.logoColor,
      logo_url: input.logoUrl ?? null,
      is_open: input.isOpen ?? true,
      payment_methods: input.paymentMethods.length
        ? input.paymentMethods
        : ["cod"],
      payment_accounts: input.paymentAccounts,
      delivery_note: input.deliveryNote.trim(),
      language: input.language,
    })
    .select("*")
    .single();
  if (error) throw error;

  if (input.ownerName) {
    await updateProfile(ownerId, { fullName: input.ownerName.trim() });
  }
  return mapShop(data, input.ownerName ?? "");
}

function shopRow(patch: Partial<Shop>): Row {
  const row: Row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.slug !== undefined) row.slug = patch.slug;
  if (patch.tagline !== undefined) row.tagline = patch.tagline;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.whatsappNumber !== undefined)
    row.whatsapp_number = patch.whatsappNumber;
  if (patch.logoEmoji !== undefined) row.logo_emoji = patch.logoEmoji;
  if (patch.logoColor !== undefined) row.logo_color = patch.logoColor;
  if (patch.logoUrl !== undefined) row.logo_url = patch.logoUrl;
  if (patch.isOpen !== undefined) row.is_open = patch.isOpen;
  if (patch.paymentMethods !== undefined)
    row.payment_methods = patch.paymentMethods;
  if (patch.paymentAccounts !== undefined)
    row.payment_accounts = patch.paymentAccounts;
  if (patch.deliveryNote !== undefined) row.delivery_note = patch.deliveryNote;
  if (patch.language !== undefined) row.language = patch.language;
  return row;
}

export async function updateShop(
  shopId: string,
  patch: Partial<Shop> & { ownerName?: string },
): Promise<void> {
  const supabase = getSupabase();
  const row = shopRow(patch);
  if (patch.slug) {
    row.slug = await uniqueSlug(patch.slug, shopId);
  }
  if (Object.keys(row).length > 0) {
    const { error } = await supabase
      .from("shops")
      .update(row)
      .eq("id", shopId);
    if (error) throw error;
  }
  if (patch.ownerName !== undefined) {
    const { data, error } = await supabase
      .from("shops")
      .select("owner_id")
      .eq("id", shopId)
      .single();
    if (error) throw error;
    await updateProfile(data.owner_id, { fullName: patch.ownerName });
  }
}

function productRow(patch: Partial<Product>): Row {
  const row: Row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.price !== undefined) row.price = patch.price;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.emoji !== undefined) row.emoji = patch.emoji;
  if (patch.theme !== undefined) row.theme = patch.theme;
  if (patch.imageUrls !== undefined) {
    row.image_urls = patch.imageUrls;
    row.image_url = patch.imageUrls[0] ?? null;
  } else if (patch.imageUrl !== undefined) {
    row.image_url = patch.imageUrl;
  }
  if (patch.inStock !== undefined) row.in_stock = patch.inStock;
  if (patch.stock !== undefined) row.stock = patch.stock;
  return row;
}

export async function createProduct(
  shopId: string,
  input: Omit<Product, "id" | "shopId">,
): Promise<Product> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .insert({ shop_id: shopId, ...productRow(input) })
    .select("*")
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(
  productId: string,
  patch: Partial<Product>,
): Promise<void> {
  const supabase = getSupabase();
  const row = productRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase
    .from("products")
    .update(row)
    .eq("id", productId);
  if (error) throw error;
}

export async function deleteProduct(productId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
}

export async function updateOrder(
  orderId: string,
  patch: { paymentStatus?: PaymentStatus; orderStatus?: OrderStatus },
): Promise<void> {
  const supabase = getSupabase();
  const row: Row = {};
  if (patch.paymentStatus !== undefined)
    row.payment_status = patch.paymentStatus;
  if (patch.orderStatus !== undefined) row.order_status = patch.orderStatus;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase
    .from("orders")
    .update(row)
    .eq("id", orderId);
  if (error) throw error;
}

export interface CheckoutLine {
  product_id: string;
  qty: number;
}

export async function placeOrder(
  shopId: string,
  details: CheckoutDetails,
  lines: CheckoutLine[],
): Promise<Order> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("place_order", {
    p_shop_id: shopId,
    p_customer_name: details.customerName,
    p_customer_phone: details.customerPhone,
    p_address: details.address,
    p_items: lines,
    p_payment_method: details.paymentMethod,
    p_note: details.note ?? null,
  });
  if (error) throw new Error(error.message);
  return mapOrder(data as Row);
}

export async function uploadShopAsset(
  file: Blob,
  userId: string,
  folder: "shop" | "products",
): Promise<string> {
  const supabase = getSupabase();
  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${userId}/${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;
  const { error } = await supabase.storage
    .from("shop-assets")
    .upload(path, file, { contentType: file.type || "image/jpeg" });
  if (error) throw error;
  const { data } = supabase.storage.from("shop-assets").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteShopAsset(url: string): Promise<void> {
  const supabase = getSupabase();
  const marker = "/shop-assets/";
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = decodeURIComponent(url.slice(index + marker.length));
  await supabase.storage.from("shop-assets").remove([path]);
}
