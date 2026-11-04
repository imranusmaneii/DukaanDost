export type Lang = "en" | "ur";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "paid"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid";

export type PaymentMethod = "cod" | "easypaisa" | "jazzcash" | "bank";

export interface Shop {
  name: string;
  slug: string;
  ownerName: string;
  tagline: string;
  description: string;
  whatsappNumber: string;
  logoEmoji: string;
  logoColor: string;
  paymentMethods: PaymentMethod[];
  paymentAccounts: {
    easypaisa: string;
    jazzcash: string;
    bank: string;
  };
  language: Lang;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  emoji: string;
  theme: string;
  inStock: boolean;
  stock: number;
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
}

export interface Order {
  id: string;
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
