import { Cart } from '../types';
import CartItem from './CartItem';

export interface CartViewProps {
  cart: Cart;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export default function CartView({
  cart,
  onRemove,
  onUpdateQuantity,
  onCheckout,
  onContinueShopping,
}: CartViewProps) {
  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
        <button className="btn btn-primary" onClick={onContinueShopping}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-view" data-testid="cart-view">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <button className="btn btn-secondary" onClick={onContinueShopping}>
          Continue Shopping
        </button>
      </div>

      <div className="cart-items">
        {cart.items.map(item => (
          <CartItem
            key={item.productId}
            item={item}
            onRemove={onRemove}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <span>Total:</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
        <button
          className="btn btn-success"
          onClick={onCheckout}
          data-testid="checkout-button"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
