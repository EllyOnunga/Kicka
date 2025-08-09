import { OrderStatus } from "@/types/order";

const statusSteps: OrderStatus[] = [
    'pending',
    'processing',
    'shipped',
    'delivered'
];

interface OrderStatusTimelineProps {
    status: OrderStatus;
}

export default function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
    const currentIndex = statusSteps.indexOf(status);
    const isCancelled = status === 'cancelled';

    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
                <h2 className="card-title mb-4">Order Status</h2>

                {isCancelled ? (
                    <div className="alert alert-error">
                        <span>This order has been cancelled.</span>
                    </div>
                ):(
                    <ul className="steps steps-vertical md:steps-horizontal">
                        {statusSteps.map((step, index) => (
                            <li key={step}
                            className={`step ${index <= currentIndex ? 'step-primary' : ''}
                            ${index === currentIndex ? 'font-bold' : ''}`}
                            >
                                {step.charAt(0).toUpperCase() + step.slice(1)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}