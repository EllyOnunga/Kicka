import { Product } from './product';

export type OrderStatus =
| 'pending'
|'processing'
|'shipped'
|'delivered'
|'cancelled';

export type PaymentStatus =
|'pending'
|'paid'
|'failed'
|'refunded';

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    price_at_purchase: number; // Price at the time of purchase
    created_at: string;
    product?: Product; // Include product details
    variant?: {
        id: string;
        name: string;
    } | null;
}

export interface Order {
    id: string;
    user_id: string;
    order_number: string;
    status: OrderStatus;
    subtotal: number;
    discount_amount: number;
    discount_code: string | null;
    shipping_price: number;
    tax_amount: number;
    total: number;
    payment_method: string;
    payment_status: PaymentStatus;
    shipping_method: string;
    tracking_number: string | null;
    customer_info: {
        email: string;
        firstName: string;
        lastName: string;
        address: string;
        apartment?: string;
        city: string;
        country: string;
        state: string;
        zip: string;
        phone: string;
    };
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}