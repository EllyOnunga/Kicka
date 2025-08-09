import { Product } from "./product"

export interface CartItem {
    id: string;
    cart_id : string;
    product_id : string;
    variant_id? : string;
    quantity : number;
    created_at : string;
    updated_at : string;
    product: Product
    variant?: {
        id: string;
        name: string;
    } | null
}

export interface Cart {
    id : string;
    user_id : string;
    created_at : string;
    updated_at : string;
    items : CartItem[];
    items_count: number;
    subtotal: number;
    discount_amount?: number;
    discount_code?: string | null;
    shipping_price?: number;
    tax_amount?: number;
    total?: number;
    payment_method?: string;
    payment_status?: "pending" | "paid" | "failed" | "refunded";
    shipping_method?: string;
    newCart?: boolean; // Flag to indicate if this is a new cart
}

export interface Coupon {
    id: string;
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    expires_at?: string | null;
    created_at: string;
    updated_at: string;
}