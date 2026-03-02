import { Order } from '../types';

export interface OrderSuccessProps {
  order: Order;
  onContinueShopping: () => void;
}

export default function OrderSuccess({ order, onContinueShopping }: OrderSuccessProps) {
  return (
    <div className="order-success">
      <div className="success-icon">✓</div>
      <h2>Order Placed Successfully!</h2>
      <p className="order-id">Order ID: {order.id}</p>
      <p>Total: ${order.totalAmount.toFixed(2)}</p>
      <button className="btn btn-primary" onClick={onContinueShopping}>
        Continue Shopping
      </button>
    </div>
  );
}
