export type OrderStatus =
  | "pending"
  | "no_answer"
  | "confirmed"
  | "cancelled_phone"
  | "delivering"
  | "delivered"
  | "cancelled_delivery";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "En attente",
  no_answer: "Il n'a pas répondu",
  confirmed: "Confirmé",
  cancelled_phone: "Annulé au téléphone",
  delivering: "En cours de livraison",
  delivered: "Livré",
  cancelled_delivery: "Annulé à la livraison",
};

export interface ApiProductColor {
  name?: string;
  hex?: string;
  value?: string;
}

export interface ApiProduct {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  price: number;
  promotion?: number | null;
  final_price: number;
  images: string[];
  sizes: string[];
  sheet_measures?: string[];
  measure_prices?: Array<{ measure: string; price: number }>;
  colors: Array<ApiProductColor | string>;
  stock?: number;
  status: boolean;
  masquer?: boolean;
  packs?: Array<{
    id: number;
    title: string;
    slug: string;
    pivot?: {
      sizes?: string[];
      colors?: ApiProductColor[];
      quantity?: number;
    };
  }>;
  sales_quantity?: number;
  created_at: string;
}

export interface ApiPackProductPivot {
  sizes?: string[];
  sheet_measures?: string[];
  colors?: ApiProductColor[] | string[];
  quantity?: number;
}

export interface ApiPack {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  promotion?: number | null;
  final_price: number;
  images: string[];
  availability: boolean;
  products?: Array<{
    id: number;
    title: string;
    slug: string;
    price?: number;
    final_price?: number;
    images?: string[];
    sizes?: string[];
    sheet_measures?: string[];
    colors?: Array<ApiProductColor | string>;
    pivot?: ApiPackProductPivot;
  }>;
  created_at: string;
}

export interface ApiOrderProduct {
  product_id: number;
  quantity: number;
  size?: string;
  color?: string;
  sheet_measure?: string;
  is_pack?: boolean;
  pack_items?: Array<{
    product_id: number;
    quantity: number;
    color?: string;
    sheet_measure?: string;
  }>;
}

export interface ApiOrder {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  address: string;
  products: ApiOrderProduct[];
  total: number;
  status: OrderStatus;
  created_at: string;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "superadmin";
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page?: number;
    per_page?: number;
    total?: number;
    [key: string]: unknown;
  };
  links?: Record<string, unknown>;
}
