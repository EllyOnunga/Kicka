import { Product } from './product';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    parent_id: string | null;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface CategoryWithChildren extends Category {
    children: Category[];
}

export interface CategoryWithProducts extends Category {
    products: Product[];
    product_count: number;
}