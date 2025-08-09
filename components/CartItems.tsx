"use client";

import { Cart, CartItem } from "@/types/cart";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartItemsProps {
    cart: Cart;
    setCart: (cart: Cart | null) => void;
}

export default function CartItems({
    cart,
    setCart,
} : CartItemsProps) {

    const router = useRouter();
    const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
    const [removingItems, setRemovingItems] = useState<Record<string, boolean>>({});
    const [quantities, setQuantities] = useState<Record<string, number>>({});


    //initialize quantities state
    useEffect(() => {
        const initialQuantities = cart.items.reduce((acc, item) => {
            acc[item.id] = item.quantity;
            return acc;
        }, {} as Record<string, number>);
        setQuantities(initialQuantities);
    }, [cart.items]);

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeItem(itemId);
            return;
        }

        setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

        try {
          const { error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", itemId);

          if (error) throw error;

          setCart({
            ...cart,
            items: cart.items.map((item) =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            ),
          });
        } catch (error: any) {
            toast.error(error.message || "Failed to update quantity");
        } finally {
            setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
        }
    };

    const removeItem = async (itemId: string) => {
        setRemovingItems((prev) => ({ ...prev, [itemId]: true }));

        try {
            const { error } = await supabase 
            .from("cart_items")
            .delete()
            .eq("id", itemId);

            if (error) throw error;

            const updatedItems = cart.items.filter((item) => item.id !== itemId);

            if (updatedItems.length === 0) {
                const { error: cartError } = await supabase
                .from("carts")
                .delete()
                .eq("id", cart.id);

                if (cartError) throw cartError;

                setCart(null);
            } else {
                setCart({
                    ...cart,
                    items: updatedItems,
                });
            }

            toast.success("Item removed from cart");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove item");
        } finally {
            setRemovingItems((prev) => ({ ...prev, [itemId]: false }));
        }
    };

    const calculateTotal = (price: number, quantity: number) => {
        return (price * quantity).toFixed(2);
    };

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
        updateQuantity(itemId, newQuantity);
    };

    const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
        if (e.key === "Enter") {
            const input = e.target as HTMLInputElement;
            const newQuantity = parseInt(input.value) || 1;
            handleQuantityChange(itemId, newQuantity);
        }
    };

    if (!cart || cart.items.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-4">Your Cart is Empty</h3>
                <p className="text-gray-600">Add some products to get started!</p>
                <Link href="/products" className="btn btn-primary">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="w-[50%]">Products</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.items.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <div className="flex items-center gap-4">
                                        <div className="avatar">
                                            <div className="w-16 h-16 rounded bg-base-200 relative">
                                                {item.product.image_url ? (
                                                    <Image
                                                        src={item.product.image_url}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-base-200 flex items-center justify-center text-gray-500">
                                                    No Image
                                            </div>
                                        )}
                                        <div></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-medium line-clamp-2">
                                            {item.product?.name || "Unknown Product"}
                                        </h3>
                                        { item.product?.stock_quantity !== undefined && (
                                            <p className={`text-xs ${item.quantity > item.product.stock_quantity? "text-error" : "text-gray-600"}`}>
                                                {item.quantity > item.product.stock_quantity ? "Only " + item.product.stock_quantity + " available"
                                                : item.product.stock_quantity + " in stock"}
                                            </p>
                                        )}
                                    </div>
                                    </div>
                                </td>
                                <td>
                                    Ksh. {item.product?.price.toFixed(2) || "0.00"}
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="btn btn-ghost btn-xs btn-square"
                                            onClick={() => handleQuantityChange(item.id, quantities[item.id] - 1)}
                                            disabled={updatingItems[item.id] || quantities[item.id] <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            <FiMinus size={14} />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantities[item.id] || 1}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value) || 1;
                                                setQuantities((prev) => ({ ...prev, [item.id]: value }));
                                            }}
                                            onBlur={() => updateQuantity(item.id, quantities[item.id] || 1)}
                                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                                            className="input input-xs w-12 text-center"
                                            min="1"
                                            disabled={updatingItems[item.id]}
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(item.id, quantities[item.id] + 1)}
                                            disabled={updatingItems[item.id] || 
                                                (item.product.stock_quantity !== undefined && 
                                                    quantities[item.id] >= item.product.stock_quantity)
                                            }
                                            className="btn btn-ghost btn-xs btn-square"
                                            aria-label="Increase quantity"
                                            
                                        >
                                            <FiPlus size={14}/>
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    Ksh. {calculateTotal(item.product?.price || 0, quantities[item.id] || 1)}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-ghost btn-xs text-error"
                                        onClick={() => removeItem(item.id)}
                                        disabled={removingItems[item.id]}
                                        aria-label="Remove item"
                                    >
                                        {removingItems[item.id] ? (
                                            <span className="loading loading-spinner loading-xs"></span>
                                        ) : (
                                            <FiTrash2 size={16} />
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between mt-6">
                <button
                onClick={() => router.push("/products")}
                className="btn btn-ghost"
                >
                    Continue Shopping
                </button>
                <button 
                onClick={async () => {
                    const promises = cart.items.map((item) => removeItem(item.id));
                    await Promise.all(promises);
                }}
                className="btn btn-ghost text-error"
                disabled={Object.values(removingItems).some(Boolean)}
                >
                    Clear Cart
                </button>
            </div>
        </div>

        <div className="md:w-1/3">
            <div className="card bg-base-100 shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Cart Summary</h2>
                <div  className="space-y-4">
                    <div className="flex justify-between">
                        <span className="font-medium">Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                       <span> Ksh. {cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0).toFixed(2)} </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-gray-600">Calculated at checkout</span>
                    </div>
                    <div className="divider"></div>
                    <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>Ksh. {cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0).toFixed(2)}</span>
                    </div>
                    <button
                        className="btn btn-primary w-full mt-4"
                        onClick={() => router.push("/checkout")}
                        disabled={cart.items.some(item => 
                            item.product.stock_quantity !== undefined && 
                            quantities[item.id] > item.product.stock_quantity
                        )}
                        >
                        Proceed to Checkout
                    </button>
                    {cart.items.some(item => 
                    item.product?.stock_quantity !== undefined && 
                    item.quantity > item.product.stock_quantity
                ) && (
                        <p className="text-error text-sm mt-2">
                            Some items in your cart exceeds available stock, please adjust quantities before checkout.
                        </p>
                    )}
                </div>
            </div>
        </div>
        </div>
    );
}
