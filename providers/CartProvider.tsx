"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { Cart, CartItem } from "@/types/cart";
import { toast } from "react-hot-toast";

type CartContextType = {
    cart: Cart | null;
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    isLoading: boolean;
    addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
    updateCartItem: (itemId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => void;
    updateShippingMethod: (method: {
        id: string;
        name: string;
        price: number;
    }) => Promise<void>;
};


const CartContext = createContext<CartContextType>({
    cart: null,
    cartItems: [],
    cartCount: 0,
    cartTotal: 0,
    isLoading: false,
    addToCart: async () => {},
    updateCartItem: async () => {},
    removeFromCart: async () => {},
    clearCart: async () => {},
    refreshCart: async () => {},
    applyCoupon: async () => {},
    removeCoupon: async () => {},
    updateShippingMethod: async () => {},
})

export function CartProvider({ children } : { children: React.ReactNode}) {
    const { session } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const cartTotal = cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity, 0
    );

    const fetchCart = async () => {
        if (!session?.user?.id) {
            setCart(null);
            setCartItems([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            //fetch cart for the logged-in user
            const { data: cartData, error: cartError } = await supabase
            .from("carts")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

            if (cartError && cartError.code !== "PGRST116") throw cartError;

            if (!cartData) {
                setCart(null);
                setCartItems([]);
                return;
            }

            setCart(cartData);

            // fetch cart items with product details

            const { data: itemsData, error: itemsError } = await supabase
            .from("cart_items")
            .select("*, product:products(*)")
            .eq("cart_id", cartData.id);

            if (itemsError) throw itemsError;

            setCartItems(itemsData || []);
        } catch (error) {
            console.error("Error fetching cart:", error);
            toast.error("Failed to load cart");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [session]);

    const addToCart = async (productId: string, quantity: number = 1, variantId?: string) => {
        if (!session) {
            toast.error("Please login to add items to cart");
            return;
        }

        setIsLoading(true);

        try {
            // get or create cart for the user

            let cartId = cart?.id;
            if (!cartId) {
                const { data: newCart, error: cartError } = await supabase
                .from("carts")
                .insert({ user_id: session.user.id })
                .select("*")
                .maybeSingle();

                if (cartError) throw cartError;
                cartId = newCart.id;
                setCart(newCart);
            }

            // check if the product already exists in the cart
            const existingItem = cartItems.find(
                (item) => item.product_id === productId && item.variant_id === variantId
            );

            if (existingItem) {
                // update the quantity of the existing item
                const newQuantity = existingItem.quantity + quantity;
                await updateCartItem(existingItem.id, newQuantity)
                toast.success("Product quantity updated in cart");
            } else {
                // Add a new item to the cart
                const { data: newItem, error } = await supabase 
                .from("cart_items")
                .insert({
                    cart_id: cartId,
                    product_id: productId,
                    variant_id: variantId,
                    quantity,
                })
                .select("*, product:products(*)")
                .maybeSingle();

                if (error) throw error;

                setCartItems([...cartItems, newItem]);
                toast.success("Product added to cart");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to add to cart");
        } finally {
            setIsLoading(false);
        }
    };

    const updateCartItem = async (itemId: string, quantity: number) => {

        if (quantity < 1) {
            await removeFromCart(itemId);
            return;
        } 
        setIsLoading(true);

        try {
            const { error } = await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("id", itemId);

            if (error) throw error;

            setCartItems(
                cartItems.map((item) =>
                    item.id === itemId ? { ...item, quantity } : item
                )
            );
        } catch ( error: any ) {
            toast.error(error.message || "Failed to update cart");
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (itemId: string) => {
        setIsLoading(true);

        try {
            const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("id", itemId);

            if (error) throw error;

            setCartItems(cartItems.filter((item) => item.id !== itemId));
            toast.success("Item removed from cart");

            // If this was the last item in the cart, delete the cart as well
            if (cartItems.length === 1 && cart) {
                const { error: cartError } = await supabase
                .from("carts")
                .delete()
                .eq("id", cart.id);

                if (cartError) throw cartError;
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to remove from cart");
        } finally {
            setIsLoading(false);
        }
    };

    const clearCart = async () => {
        if (!cart) return;

        setIsLoading(true);

        try {
            // delete all items in the cart
            const { error: itemsError } = await supabase
            .from("cart_items")
            .delete()
            .eq("cart_id", cart.id);

            if (itemsError) throw itemsError;

            // delete the cart itself
            const { error: cartError } = await supabase
            .from("carts")
            .delete()
            .eq("id", cart.id);

            if (cartError) throw cartError;

            setCart(null);
            setCartItems([]);
            toast.success("Cart cleared");
        } catch (error: any) {
            toast.error(error.message || "Failed to clear cart");
        } finally {
            setIsLoading(false);
        }
    };

    const applyCoupon = async (code: string) => {
        if (!cart) return;

        setIsLoading(true);

        try {
            const { data: coupon, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", code)
            .gte("valid_from", new Date().toISOString())
            .lte("valid_until", new Date().toISOString())
            .single();

            if (error) throw error;
            if (!coupon) throw new Error("Invalid coupon code");

            const { error: updateError } = await supabase
            .from("carts")
            .update({
                discount_code: coupon.code,
                discount_amount: coupon.discount_type === "percentage"
                    ? cartTotal * (coupon.discount_value / 100)
                    : coupon.discount_value
            })
            .eq("id", cart.id);

            if (updateError) throw updateError;

            setCart({
                ...cart,
                discount_code: coupon.code,
                discount_amount: coupon.discount_type === "percentage"
                ? cartTotal * (coupon.discount_value / 100)
                : coupon.discount_value
            });

            toast.success("Coupon applied successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to apply coupon");
        } finally {
            setIsLoading(false);
        }
    };

    const removeCoupon = async () => {
        if (!cart) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
            .from("carts")
            .update({
                discount_code: null,
                discount_amount: 0
            })
            .eq("id", cart.id);

            if (error) throw error;
        

        setCart({
            ...cart,
            discount_code: null,
            discount_amount: 0,
        });
        toast.success("Coupon removed successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove coupon");
        } finally {
            setIsLoading(false);
        }
    };

    const updateShippingMethod = async (method: { id: string; name: string; price: number; }) => {
        if (!cart) return;

        setCart({
            ...cart,
            shipping_method: method.name,
            shipping_price: method.price,
        });
    };

    return (
        <CartContext.Provider
        value={({
            cart,
            cartItems,
            cartCount,
            cartTotal,
            isLoading,
            addToCart,
            updateCartItem,
            removeFromCart,
            clearCart,
            refreshCart: fetchCart,
            applyCoupon,
            removeCoupon,
            updateShippingMethod
        })}
        >
            {children}
        </CartContext.Provider>
    );

}
export const useCart = () => useContext(CartContext);


