import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/config";

// Plain, serialisable shapes returned by the services (ids are strings).

export type Category = { id: string; name: string; slug: string };

export type Material = { id: string; name: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  material: string;
  image: string | null;
  imagePublicId: string | null;
  inStock: boolean;
  featured: boolean;
  categoryId: string;
  createdAt: Date;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  address: string | null;
  city: string | null;
};

export type OrderItem = { productId: string; name: string; price: number; quantity: number };

export type Receipt = { publicId: string; format: string; uploadedAt: Date };

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  receipt: Receipt | null;
  paymentNote: string | null;
  userId: string | null;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  notes: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: Date;
};

export type BankAccount = {
  id: string;
  bank: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  active: boolean;
};
