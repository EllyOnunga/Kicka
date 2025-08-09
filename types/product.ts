

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price?: number;
  image_url: string | null;
  additional_images?: string[];
  stock_quantity: number;
  sku?: string;
  average_rating?: number;
  review_count?: number;
  specifications?: Record<string, string>;
  size_guide?: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  }[],
  variants?: {
    id: string;
    name: string;
    price_differences: number;
  }[];
  createdAt: string;
  updatedAt: string;

}

// Define the Review interface or import it from the appropriate module
export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductWithReviews extends Product {
  reviews?: Review[];
  related_products?: Product[];
}