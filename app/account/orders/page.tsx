"use client"

import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import OrderCard from "@/components/orders/OrderCard";
import Link from "next/link";
import { Order, OrderStatus } from "@/types/order";
import { FiFilter, FiSearch} from "react-icons/fi";
import ProductsPage from "@/app/products/page";

export default function OrdersPage() {
    const { session } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!session) {
            router.push("/login");
            return;
        }

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            let query = supabase
            .from("orders")
            .select("*, items:order_items(*, product:ProductsPage(*), variant:product_variants(*))")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

            if (filterStatus !== 'all') {
                query = query.eq("status", filterStatus);
            }

            if (searchQuery) {
                query = query.or(`
                    order_number:ilike.%${searchQuery}%,
                    customer_info->>firstName:ilike.%${searchQuery}%,
                    customer_info->>lastName.ilike.%${searchQuery}%`
                );
            }

            const { data, error } = await query;

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error("Error fetching orders:", error)
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    fetchOrders();
}, [session, router, filterStatus, searchQuery]);


if (!session) {
    return (
        <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );
}

return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold">Your Orders</h1>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="join">
                    <div className="form-control">
                        <div className="input-group input-group-sm">
                            <input
                            type="text"
                            placeholder="Search orders..."
                            className="input input-bordered input-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-square btn-sm">
                                <FiSearch />
                            </button>
                        </div>
                    </div>
                    <select
                    className="select select-sm select-bordered join-item"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
        </div>

        {isLoading ? (
            <div className="flext justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        ) : orders.length === 0 ? (
            <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                    <h2 className="text xl font-medium mb-4">No orders found</h2>
                    <p className="mb-6">
                        {filterStatus === 'all'
                        ? "You haven't placed any orders yet."
                        : `You don't have any ${filterStatus} orders.`
                        }
                    </p>
                    <Link href="/products" className="btn btn-primary">
                    Browse Products
                    </Link>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        )}
    </div>
);
}