import { useState, useEffect } from 'react';
import { Cart } from '../types';

export interface CartItemProps {
  item: Cart['items'][0];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export default function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const [inputValue, setInputValue] = useState<string>(item.quantity.toString());

  // Update local state when cart quantity changes externally (e.g., from +/- buttons)
  useEffect(() => {
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow user to type freely, including clearing the field
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const newQty = parseInt(inputValue);
    const maxStock = item.product?.stock || 999;

    if (isNaN(newQty) || newQty < 1) {
      // Invalid input: reset to current quantity
      setInputValue(item.quantity.toString());
    } else if (newQty > maxStock) {
      // Exceeds stock: set to max available
      setInputValue(maxStock.toString());
      onUpdateQuantity(item.productId, maxStock);
    } else if (newQty !== item.quantity) {
      // Valid new quantity: update cart
      onUpdateQuantity(item.productId, newQty);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger blur to save
    }
  };

  return (
    <div className="cart-item" data-testid={`cart-item-${item.productId}`}>
      <img
        src={item.product?.imageUrl}
        alt={item.product?.name}
        className="cart-item-image"
      />
      <div className="cart-item-details">
        <h3 className="cart-item-name" data-testid={`cart-item-name-${item.productId}`}>{item.product?.name}</h3>
        <div className="cart-item-price" data-testid={`cart-item-price-${item.productId}`}>${item.product?.price.toFixed(2)}</div>
        <div className="cart-item-controls">
          <div className="quantity-control">
            <button
              className="quantity-btn"
              data-testid={`decrease-quantity-${item.productId}`}
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
            >
              -
            </button>
            <input
              type="number"
              className="quantity-input"
              data-testid={`quantity-input-${item.productId}`}
              value={inputValue}
              min="1"
              max={item.product?.stock || 999}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
            <button
              className="quantity-btn"
              data-testid={`increase-quantity-${item.productId}`}
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= (item.product?.stock || 0)}
            >
              +
            </button>
          </div>
          <button
            className="btn btn-danger"
            data-testid={`remove-from-cart-${item.productId}`}
            onClick={() => onRemove(item.productId)}
          >
            Remove
          </button>
        </div>
      </div>
      <div className="cart-item-subtotal" data-testid={`cart-item-subtotal-${item.productId}`}>
        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
      </div>
    </div>
  );
}
