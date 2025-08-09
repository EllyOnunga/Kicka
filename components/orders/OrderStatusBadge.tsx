import { OrderStatus } from "@/types/order";

const statusColors: Record<OrderStatus, string> = {
    pending: "badge-warning",
    processing: "badge-info",
    shipped: "badge-primary",
    delivered: "badge-success",
    cancelled: "badge-error",
};

const statusText: Record<OrderStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    return (
        <span className={`badge badge-sm ${statusColors[status]}`}>
            {statusText[status]}
        </span>
    );
}