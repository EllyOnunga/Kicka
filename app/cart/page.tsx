"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";
import { FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const {
        cart,
        cartItems,
        cartCount,
        cartTotal,
        isLoading,
        updateCartItem,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        updateShippingMethod,
        refreshCart,
    } = useCart();

    const { session } = useAuth();
    const router = useRouter();
    const  [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
    const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});
    const [couponCode, setCouponCode] = useState("");
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [shippingMethod, setShippingMethod] = useState([
        { id: "standard", name: "Standard Shipping", price: 99, estimated: "3-5 business days" },
        { id: "express", name: "Express Shipping", price: 199, estimated: "1-2 business days" },
        { id: "free", name: "Free Shipping", price: 0, estimated: "5-7 business days", minOrder: 50 },
    ]);
    const [selectedShipping, setSelectedShipping] = useState("standard");

    // initialize local quantities
    useEffect(() => {
        if (cartItems.length > 0) {
            const quantities = cartItems.reduce((acc, item) => {
                acc[item.id] = item.quantity;
                return acc;
            }, {} as Record<string, number>);
            setLocalQuantities(quantities);
        }
    }, [cartItems]);

    // redirect if not logged in
    useEffect(() => {
        if (!session && !isLoading) {
            router.push("/login?/redirect=/cart");
        }
    }, [session, isLoading, router]);

    const handleQuantityChange = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }
        setIsUpdating((prev) => ({ ...prev, [itemId]: true }));
        setLocalQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));

        try {
            await updateCartItem(itemId, newQuantity);
        } catch (error) {
            toast.error("Failed to update item");
            // revert on error
            setLocalQuantities((prev) => ({ ...prev, [itemId]: 
                cartItems.find(i => i.id === itemId)?.quantity || 1 }));
        } finally {
            setIsUpdating((prev) => ({ ...prev, [itemId]: false }));
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setApplyingCoupon(true);

        try {
            await applyCoupon(couponCode);
            setCouponCode("");
            toast.success("Coupon applied successfully!");
        } catch (error) {
            toast.error("Invalid coupon code");
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        setIsRemoving((prev) => ({ ...prev, [itemId]: true }));

        try {
            await removeFromCart(itemId);
            toast.success("Item removed from cart");
        } catch (error) {
            toast.error("Failed to remove item");
        } finally {
            setIsRemoving((prev) => ({ ...prev, [itemId]: false }));
        }
    };

    const handleClearCart = async () => {
        if (confirm("Are you sure you want to clear the cart?")) {
            try {
                await clearCart();
                toast.success("Cart cleared successfully!");
            } catch (error) {
                toast.error("Failed to clear cart");
            }
        }
    };

    const handleRemoveCoupon = async () => {
        setApplyingCoupon(true);
        await removeCoupon();
        toast.success("Coupon removed successfully!");
    };

    const handleShippingChange = (methodId: string) => {
        const method = shippingMethod.find(m => m.id === methodId);
        if (method) {
            setSelectedShipping(methodId);
            updateShippingMethod(method);
        }
    };

    const calculateDiscount = () => {
        return cart?.discount_amount || 0;
    };

    const calculateShipping = () => {
        return cart?.shipping_price || 0;
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((
            sum, item) => sum + (item.product?.price || 0 ) * item.quantity, 0);
    };

    const calculateTax = () => {
        return (calculateSubtotal() - calculateDiscount()) * 0.16; // Assuming a 16% tax rate
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = calculateDiscount();
        const tax = calculateTax();
        const shipping = calculateShipping();
        return subtotal - discount + tax + shipping;
    };

    if (!session || isLoading) {
        return (
            <Layout>
                <div className="flex justify-center item-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </Layout>
        );
    }

    if (!cart || cartCount === 0) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8 text-center">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
                        <p className="mb-6">Looks like you haven't added anything to your cart yet. Let's get started!</p>
                        <Link href="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>
    
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* cart items */}
                        <div className="lg:w-2/3">
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th className="text-right">Price</th>
                                            <th>Quantity</th>
                                            <th className="text-right">Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="flex items-center gap-4">
                                                        <div className="avatar">
                                                        <div className="w-16 h-16 rounded bg-base-200 relative">
                                                            {item.product?.image_url ? (
                                                                <Image
                                                                    src={item.product.image_url}
                                                                    alt={item.product.name}
                                                                    fill
                                                                    sizes="64px"
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                                                            )}
                                                        </div>
                                                        </div>
                                                        <div>
                                                            <Link href={`/products/${item.product_id}`} 
                                                                className="font-medium hover:text-primary line-clamp-2">
                                                                {item.product?.name || "Unknown Product"}
                                                            </Link>
                                                            {item.variant_id && (
                                                                <p className="text-sm text-gray-500">
                                                                    {item.variant?.name}
                                                                </p>
                                                            )}
                                                            {item.product?.stock_quantity !== undefined && (
                                                                <p className={`text-xs ${
                                                                    item.quantity > item.product.stock_quantity
                                                                        ? "text-error"
                                                                        : "text-gray-500"
                                                                }`}
                                                                >
                                                                {item.quantity > item.product.stock_quantity
                                                                ? `Only ${item.product.stock_quantity} available`
                                                                : `${item.product?.stock_quantity} in stock`}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
    
                                                <td className="text-right">
                                                    Ksh {item.product?.price.toFixed(2) || "0.00"}
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="btn btn-xs btn-square btn-ghost"
                                                            onClick={() => handleQuantityChange(item.id, localQuantities[item.id] - 1)}
                                                            disabled={isUpdating[item.id] || localQuantities[item.id] <= 1}
                                                        >
                                                            {isUpdating[item.id] ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ):(
                                                            <FiMinus size={12} />
                                                            )}
                                                        </button>
                                                        <input
                                                        type="number"
                                                        min="1"
                                                        value={localQuantities[item.id] || 1}
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value) || 1;
                                                            setLocalQuantities(prev => ({ ...prev, [item.id]: value }));
                                                        }}
                                                        onBlur={() => handleQuantityChange(item.id, localQuantities[item.id])}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleQuantityChange(item.id, localQuantities[item.id])}
                                                        className="input input-xs w-12 text-center"
                                                        disabled={isUpdating[item.id]}
                                                        />
                                                    
                                                        <button
                                                            className="btn btn-xs btn-square btn-ghost"
                                                            onClick={() => handleQuantityChange(item.id, localQuantities[item.id] + 1)}
                                                            disabled={
                                                                isUpdating[item.id] ||
                                                                (item.product?.stock_quantity !== undefined &&
                                                                localQuantities[item.id] >= item.product?.stock_quantity)
                                                            }
                                                        >
                                                            <FiPlus size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    Ksh.{((item.product?.price || 0) * item.quantity).toFixed(2)}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-xs text-error btn-ghost"
                                                        onClick={() => removeFromCart(item.id)}
                                                        disabled={isRemoving[item.id]}
                                                    >
                                                        {isRemoving[item.id] ? (
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                        ):(
                                                        <FiTrash2 size={16} />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
    
                            <div className="mt-6 flex justify-between">
                                <Link className="btn btn-ghost" href="/products">
                                    Continue Shopping
                                </Link>
                                <button
                                    onClick={handleClearCart}
                                    className="btn btn-ghost text-error"
                                    disabled={Object.values(isRemoving).some(Boolean)}
                                >
                                    Clear Cart
                                </button>
                            </div>
    
                            {/* Coupon Section */}
                            <div className="card bg-base-100 shadow-sm mt-6">
                                <div className="card-body">
                                    <h3 className="font-bold mb-2">Coupon Code</h3>
                                    {cart.discount_code ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="badge badge-success mr-2">
                                                    Applied
                                                </span>
                                                <span>{cart.discount_code}</span>
                                            </div>
                                            <button
                                                className="btn btn-xs btn-ghost"
                                                onClick={handleRemoveCoupon}
                                                disabled={applyingCoupon}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter coupon code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="input input-bordered flex-1"
                                            />
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleApplyCoupon}
                                                disabled={!couponCode.trim() || applyingCoupon}
                                            >
                                                {applyingCoupon ? "Applying..." : "Apply Coupon"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
    
                            {/* Shipping Section */}
                            <div className="card bg-base-100 shadow-sm mt-4">
                                <div className="card-body">
                                    <h3 className="font-bold mb-2">Shipping Methods</h3>
                                    <div className="space-y-2">
                                        {shippingMethod.map((method) => {
                                            const isAvailable = !method.minOrder ||
                                                (method.minOrder && calculateSubtotal() >= method.minOrder);
    
                                            return (
                                                <div 
                                                    key={method.id} 
                                                    className={`flex items-center justify-between p-3 border rounded-lg ${
                                                        selectedShipping === method.id
                                                            ? "body-prtimary"
                                                            : "border-base-200"
                                                    } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""
                                                    }`}
                                                    onClick={() => isAvailable && handleShippingChange(method.id)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name="shipping-method"
                                                            checked={selectedShipping === method.id}
                                                            onChange={() => {}}
                                                            disabled={!isAvailable}
                                                            className="radio radio-primary"
                                                        />
                                                        <div>
                                                            <p className="font-medium">{method.name}</p>
                                                            <p className="text-sm text-gray-500">{method.estimated}</p>
    
                                                            {method.minOrder && (
                                                                <p className="text-xs text-gray-500">
                                                                    Free for orders over Ksh.{method.minOrder}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="font-medium">
                                                        {method.price === 0
                                                            ? "Free"
                                                            : `Ksh.${method.price.toFixed(2)}`}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        {/* order summary */}
                        <div className="lg:w-13">
                            <div className="card bg-base-100 shadow-md p-6 sticky top-4">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-bold mb-4">Order Summary</h2>
    
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Subtotal ({cartCount} items)</span>
                                            <span>Ksh {calculateSubtotal().toFixed(2)}</span>
                                        </div>
    
                                        {cart.discount_code && (
                                            <div className="flex justify-between text-success">
                                                <span>Discount ({cart.discount_code})</span>
                                                <span>-Ksh.{calculateDiscount().toFixed(2)}</span>
                                            </div>
                                        )}
    
                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span>
                                                {cart.shipping_price === 0
                                                    ? "Free"
                                                    : `Ksh.${calculateShipping().toFixed(2)}`}
                                            </span>
                                        </div>
    
                                        <div className="flex justify-between">
                                            <span>Tax (16%)</span>
                                            <span>Ksh.{calculateTax().toFixed(2)}</span>
                                        </div>
    
                                        <div className="divider"></div>
    
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span>Ksh.{calculateTotal().toFixed(2)}</span>
                                        </div>
    
                                        <Link 
                                            href="/checkout"
                                            className={`btn btn-primary w-full mt-4 ${cartItems.some(item =>
                                                item.product?.stock_quantity !== undefined &&
                                                item.quantity > item.product.stock_quantity
                                            ) ? " btn-disabled" : ""}`}
                                        >
                                            Proceed to Checkout
                                        </Link>

                                        {cartItems.some(item =>
                                            item.product?.stock_quantity !== undefined &&
                                            item.quantity > item.product.stock_quantity
                                        ) && (
                                            <p className="text-error text-sm mt-2">
                                                Some items exceed available stock. Please adjust quantities.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
