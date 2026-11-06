export type Lang = "en" | "ur";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "paid"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid";

export type PaymentMethod = "cod" | "easypaisa" | "jazzcash" | "bank";

export interface Profile {
  id: string;
  fullName: string;
  phone: string;
}

export interface PaymentAccounts {
  easypaisa: string;
  jazzcash: string;
  bank: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  ownerName: string;
  tagline: string;
  description: string;
  whatsappNumber: string;
  logoEmoji: string;
  logoColor: string;
  logoUrl?: string | null;
  isOpen: boolean;
  paymentMethods: PaymentMethod[];
  paymentAccounts: PaymentAccounts;
  deliveryNote: string;
  language: Lang;
  createdAt: string;
}

export interface ShopInput {
  name: string;
  slug: string;
  ownerName?: string;
  tagline: string;
  description: string;
  whatsappNumber: string;
  logoEmoji: string;
  logoColor: string;
  logoUrl?: string | null;
  isOpen?: boolean;
  paymentMethods: PaymentMethod[];
  paymentAccounts: PaymentAccounts;
  deliveryNote: string;
  language: Lang;
}

export interface Product {
  id: string;
  shopId?: string;
  name: string;
  price: number;
  description: string;
  emoji: string;
  theme: string;
  imageUrl?: string | null;
  inStock: boolean;
  stock: number;
  createdAt?: string;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
  theme: string;
  imageUrl?: string | null;
}

export interface Order {
  id: string;
  shopId?: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface ShopState {
  shop: Shop;
  products: Product[];
  orders: Order[];
  cart: CartLine[];
  lang: Lang;
}

export interface CheckoutDetails {
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: PaymentMethod;
  note?: string;
}
