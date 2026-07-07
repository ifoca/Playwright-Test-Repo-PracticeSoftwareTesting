export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  is_location_offer: boolean;
  is_rental: boolean;
  in_stock: boolean;
  co2_rating: string;
  is_eco_friendly: boolean;
  brand?: Brand;
  category?: Category;
  product_image?: ProductImage;
  image_url?: string;
}

export interface ProductsResponse {
  current_page: number;
  data: Product[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface Brand {
  id: string;
  name: string;
  slug?: string;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  sub_categories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string;
  sub_categories: [];
}

export interface ProductImage {
  id: string;
  by_name: string;
  by_url: string;
  source_name: string;
  source_url: string;
  file_name: string;
  title: string;
}

// Authentication
export interface RegisterResponse {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  phone: string;
  email: string;
  created_at: string;
  address: {
    street: string;
    house_number: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  provider?: string | null;
  first_name: string;
  last_name: string;
  phone?: number | null;
  dob: string;
  email: string;
  totp_enabled: boolean;
  created_at: string;
  address: {
    street?: string;
    house_number?: string | null;
    city?: string;
    state?: string | null;
    country?: string;
    postal_code?: string | null;
  };
}

export interface NewCart {
  id: string;
}

export interface Cart {
  id: string;
  additional_discount_percentage?: number | null;
  lat?: number | null;
  lng?: number | null;
  cart_items: CartItem[];
}

export interface CartItem {
  id: string;
  quantity: number;
  discount_percentage: string | null;
  cart_id: string;
  product_id: string;
  product: Product;
}

// Generic API error
// export interface ApiError {
//   message: string;
//   status: number;
//   errors?: Record<string, string[]>;
// }
