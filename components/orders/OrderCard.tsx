import { Order } from "@/types/order";
import Link from "next/link";
import Image from "next/image"
import { format } from "date-fns";
import OrderStatusBadge from "./OrderStatusBadge";
import { FiChevronRight } from "react-icons/fi";

interface OrderCardProps {
    order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="card bg-base-100 shadow-sm border-base-200 hove:shadow-md transition-shadow">
            <Link
            href={`/account/orders/${order.id}`}
            className="card-body p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold">
                                Order #{order.order_number}
                            </h3>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-gray-500">
                            {format(new Date(order.created_at), "MM dd, yyyy")}
                        </p>
                    </div>

                    <div className="text-right">
                    <p className="font-bold">Ksh{order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </p>
                    </div>
                </div>

                <div className="divider my-2"></div>

                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex -space-x-2">
                        {order.items.slice(0, 4).map((item, index) => (
                            <div key={index} className="avatar">
                                <div className="w-10 h-10 rounded-full border-base-100">
                                    {item.product?.image_url ? (
                                        <Image
                                        src={item.product.image_url}
                                        alt={item.product.name}
                                        className="object-cover"
                                        />
                                    ) : (
                                        <div className="bg-base-200 w-full h-full flex items-center justify-center text-xs">
                                            {item.product?.name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {order.items.length > 4 && (
                            <div className="avatar placeholder">
                                <div className="w-10 h-10 rounded-full bg-base-200 text-xs">
                                    +{order.items.length - 4}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="md:ml-auto flex items-center gap-2">
                        <span className="text-sm">View Details</span>
                        <FiChevronRight className="text-gray-500" />
                    </div>
                </div>
            </Link>
        </div>
    );
}