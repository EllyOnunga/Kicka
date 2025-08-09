"use client";

import { Product } from "@/types/product";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";


export default function ProductCard({ product }: { product: Product }) {
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const addToCart = async () => {
        if (!session) {
            toast.error("Please login to add items to cart");
            return;
        }
        if (quantity < 1 ) {
            toast.error("Quantity must be atleast 1");
            return;
        }

        setLoading(true);

        try {
            const { data: cartData, error: cartError } = await supabase
            .from("carts")
            .select("id")
            .eq("user_id", session.user.id)
            .single();

            let cartId;

            if (cartError || !cartData) {
                const { data: newCartData, error: newCartError } = await supabase
                .from("carts")
                .insert({ user_id: session.user.id })
                .select("id")
                .single();

                if (newCartError) throw newCartError;
                cartId = newCartData.id;
            } else {
                cartId = cartData.id;
            }

            const { data: existingItem, error: existingItemError } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("cart_id", cartId)
            .eq("product_id", product.id)
            .maybeSingle();

            if (existingItemError) throw existingItemError;

            if (existingItem) {
                const { error: updateError } = await supabase
                .from("cart_items")
                .update({ quantity: existingItem.quantity + quantity })
                .eq("id", existingItem.id);

                if (updateError) throw updateError;
                toast.success("Product quantity updated in cart");
            } else {
                const { error: insertError } = await supabase.from("cart_items").insert({
                    cart_id: cartId,
                    product_id: product.id,
                    quantity: quantity,
                });

                if (insertError) throw insertError;
                toast.success("Product added to cart");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
                {product.image_url ? (
                    <img
                    src={product.image_url}
                    alt={product.name}
                    className="rounded-lg h-auto w-full max-h-96 object-cover"
                    />
                ) : (
                    <div className="rounded-lg bg-base-200 h-96 w-full flex items-center justify-center">
                        <span className="text-gray-500 text-lg">No image</span>
                    </div>
                )}
            </div>

            <div className="md:w-1/2">
                <h1 className="text-3x1 font-bold mb-4">{product.name}</h1>
                <p className="text-2xl font-semibold mb-6">
                    Ksh.{product.price.toFixed(2)}
                </p>
                <p className="text-gray-700 mb-6">{product.description}</p>
                <div className="flex items-center gap-4 mb-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Quantity</span>
                        </label>
                        <input
                        type="number"
                        min="1"
                        max="10"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1 )}
                        className="input input-bordered w-20"
                        />
                    </div>
                    <button
                    onClick={addToCart}
                    disabled={loading || product.stock_quantity <= 0 }
                    className="btn btn-primary mt-6"
                    >
                        {loading 
                        ? "Adding..."
                        : product.stock_quantity <= 0
                        ? "Out of stock"
                        : "Add to Cart"
                        }
                    </button>
                </div>
                {product.stock_quantity > 0 && (
                    <p className="text-sm text-gray-500">
                        {product.stock_quantity} available in stock
                    </p>
                )}
            </div>
        </div>
    );
}