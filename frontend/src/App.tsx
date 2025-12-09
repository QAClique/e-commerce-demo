import { useState, useEffect } from 'react';
import './App.css';
import { Product, Cart, CheckoutDetails, Order } from './types';
import { api } from './api';

type View = 'products' | 'cart' | 'checkout' | 'order-success';

function App() {
  const [view, setView] = useState<View>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Refresh cart from backend when navigating to cart view
    if (view === 'cart' && cart) {
      refreshCart();
    }
  }, [view]);

  const initializeApp = async () => {
    try {
      setLoading(true);

      // Check if we have a persisted cart ID
      const savedCartId = sessionStorage.getItem('cartId');

      const productsData = await api.getProducts();
      setProducts(productsData);

      let cartData: Cart;
      if (savedCartId) {
        // Try to retrieve the existing cart
        try {
          cartData = await api.getCart(savedCartId);
        } catch (err) {
          // If cart doesn't exist anymore, create a new one
          cartData = await api.createCart();
          sessionStorage.setItem('cartId', cartData.id);
        }
      } else {
        // No saved cart, create a new one
        cartData = await api.createCart();
        sessionStorage.setItem('cartId', cartData.id);
      }

      setCart(cartData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize app');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    if (!cart) return;
    try {
      const updatedCart = await api.addToCart(cart.id, productId, 1);
      setCart(updatedCart);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!cart) return;
    try {
      const updatedCart = await api.removeFromCart(cart.id, productId);
      setCart(updatedCart);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from cart');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!cart) return;
    try {
      const updatedCart = await api.updateCartItem(cart.id, productId, quantity);
      setCart(updatedCart);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
    }
  };

  const refreshCart = async () => {
    if (!cart) return;
    try {
      const updatedCart = await api.getCart(cart.id);
      setCart(updatedCart);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh cart');
    }
  };

  const handleCheckout = async (checkoutDetails: CheckoutDetails) => {
    if (!cart) return;
    try {
      const orderData = await api.checkout(cart.id, checkoutDetails);
      setOrder(orderData);
      setView('order-success');
      setError(null);
      // Reinitialize cart for next order
      const newCart = await api.createCart();
      sessionStorage.setItem('cartId', newCart.id);
      setCart(newCart);
    } catch (err) {
      throw err; // Let checkout form handle the error
    }
  };

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 onClick={() => setView('products')}>E-Commerce Store</h1>
          <div
            className="cart-icon"
            onClick={() => setView('cart')}
            data-cart-id={cart?.id}
            data-testid="cart-button"
          >
            🛒
            {cartItemCount > 0 && (
              <span className="cart-count">{cartItemCount}</span>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {error && <div className="error-display">{error}</div>}

        {view === 'products' && (
          <ProductList products={products} onAddToCart={addToCart} />
        )}

        {view === 'cart' && cart && (
          <CartView
            cart={cart}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onCheckout={() => setView('checkout')}
            onContinueShopping={() => setView('products')}
          />
        )}

        {view === 'checkout' && cart && (
          <CheckoutForm
            cart={cart}
            onSubmit={handleCheckout}
            onCancel={() => setView('cart')}
          />
        )}

        {view === 'order-success' && order && (
          <OrderSuccess order={order} onContinueShopping={() => setView('products')} />
        )}
      </main>
    </div>
  );
}

interface ProductListProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

function ProductList({ products, onAddToCart }: ProductListProps) {
  return (
    <div className="products-grid">
      {products.map(product => (
        <div key={product.id} className="product-card" data-testid={`product-${product.id}`}>
          <img src={product.imageUrl} alt={product.name} className="product-image" />
          <h3 className="product-name" data-testid={`product-name-${product.id}`}>{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div className="product-footer">
            <div>
              <div className="product-price" data-testid={`product-price-${product.id}`}>${product.price.toFixed(2)}</div>
              <div className="product-stock" data-testid={`product-stock-${product.id}`}>Stock: {product.stock}</div>
            </div>
            <button
              className="btn btn-primary"
              data-testid={`add-to-cart-${product.id}`}
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface CartItemProps {
  item: Cart['items'][0];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
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

interface CartViewProps {
  cart: Cart;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

function CartView({ cart, onRemove, onUpdateQuantity, onCheckout, onContinueShopping }: CartViewProps) {
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
    <div className="cart-view" data-cart-id={cart.id} data-testid="cart-view">
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
          data-cart-id={cart.id}
          data-testid="checkout-button"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

interface CheckoutFormProps {
  cart: Cart;
  onSubmit: (details: CheckoutDetails) => Promise<void>;
  onCancel: () => void;
}

function CheckoutForm({ cart, onSubmit, onCancel }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutDetails>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCardNumber = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
  };

  const validateCardExpiry = (expiry: string): boolean => {
    return /^\d{2}\/\d{2}$/.test(expiry);
  };

  const validateCVV = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validatePostalCode = (postalCode: string): boolean => {
    // Canadian postal code format: A1A 1A1 (with or without space)
    const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
    return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleaned);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && !validateEmail(formData.email)) {
      setFieldErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address (e.g., user@example.com)'
      }));
    }
  };

  const handleCardNumberBlur = () => {
    if (formData.cardNumber && !validateCardNumber(formData.cardNumber)) {
      setFieldErrors(prev => ({
        ...prev,
        cardNumber: 'Card number must be 16 digits'
      }));
    }
  };

  const handleCardExpiryBlur = () => {
    if (formData.cardExpiry && !validateCardExpiry(formData.cardExpiry)) {
      setFieldErrors(prev => ({
        ...prev,
        cardExpiry: 'Expiry must be in MM/YY format (e.g., 12/25)'
      }));
    }
  };

  const handleCVVBlur = () => {
    if (formData.cardCvv && !validateCVV(formData.cardCvv)) {
      setFieldErrors(prev => ({
        ...prev,
        cardCvv: 'CVV must be 3 or 4 digits'
      }));
    }
  };

  const handlePostalCodeBlur = () => {
    if (formData.zipCode && !validatePostalCode(formData.zipCode)) {
      setFieldErrors(prev => ({
        ...prev,
        zipCode: 'Postal code must be in Canadian format (e.g., A1A 1A1)'
      }));
    }
  };

  // Check if form is valid and all required fields are filled
  const isFormValid = (): boolean => {
    // Check all required fields are filled
    const allFieldsFilled =
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.zipCode.trim() !== '' &&
      formData.country.trim() !== '' &&
      formData.cardNumber.trim() !== '' &&
      formData.cardExpiry.trim() !== '' &&
      formData.cardCvv.trim() !== '';

    // Check no field errors exist
    const noFieldErrors = Object.keys(fieldErrors).length === 0;

    // Validate special format fields
    const validFormats =
      validateEmail(formData.email) &&
      validateCardNumber(formData.cardNumber) &&
      validateCardExpiry(formData.cardExpiry) &&
      validateCVV(formData.cardCvv) &&
      validatePostalCode(formData.zipCode);

    return allFieldsFilled && noFieldErrors && validFormats;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      if (err instanceof Error) {
        setErrors(err.message.split(', '));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="checkout-form"
      onSubmit={handleSubmit}
      data-cart-id={cart.id}
      data-testid="checkout-form"
    >
      <h2>Checkout</h2>

      {errors.length > 0 && (
        <div className="error-display">
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-section">
        <h2>Personal Information</h2>
        <div className="form-row">
          <div className="form-group" data-testid="field-firstName">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" data-testid="field-lastName">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group" data-testid="field-email">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailBlur}
            className={fieldErrors.email ? 'error' : ''}
            required
          />
          {fieldErrors.email && (
            <div className="error-message" data-testid="error-email">{fieldErrors.email}</div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h2>Shipping Address</h2>
        <div className="form-group" data-testid="field-address">
          <label htmlFor="address">Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group" data-testid="field-city">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" data-testid="field-zipCode">
            <label htmlFor="zipCode">Postal Code *</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              onBlur={handlePostalCodeBlur}
              className={fieldErrors.zipCode ? 'error' : ''}
              placeholder="A1A 1A1"
              maxLength={7}
              required
            />
            {fieldErrors.zipCode && (
              <div className="error-message" data-testid="error-zipCode">{fieldErrors.zipCode}</div>
            )}
          </div>
        </div>
        <div className="form-group" data-testid="field-country">
          <label htmlFor="country">Country *</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-section">
        <h2>Payment Information</h2>
        <div className="form-group" data-testid="field-cardNumber">
          <label htmlFor="cardNumber">Card Number *</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            onBlur={handleCardNumberBlur}
            className={fieldErrors.cardNumber ? 'error' : ''}
            placeholder="1234567890123456"
            maxLength={16}
            required
          />
          {fieldErrors.cardNumber && (
            <div className="error-message" data-testid="error-cardNumber">{fieldErrors.cardNumber}</div>
          )}
        </div>
        <div className="form-row">
          <div className="form-group" data-testid="field-cardExpiry">
            <label htmlFor="cardExpiry">Expiry (MM/YY) *</label>
            <input
              type="text"
              id="cardExpiry"
              name="cardExpiry"
              value={formData.cardExpiry}
              onChange={handleChange}
              onBlur={handleCardExpiryBlur}
              className={fieldErrors.cardExpiry ? 'error' : ''}
              placeholder="12/25"
              maxLength={5}
              required
            />
            {fieldErrors.cardExpiry && (
              <div className="error-message" data-testid="error-cardExpiry">{fieldErrors.cardExpiry}</div>
            )}
          </div>
          <div className="form-group" data-testid="field-cardCvv">
            <label htmlFor="cardCvv">CVV *</label>
            <input
              type="text"
              id="cardCvv"
              name="cardCvv"
              value={formData.cardCvv}
              onChange={handleChange}
              onBlur={handleCVVBlur}
              className={fieldErrors.cardCvv ? 'error' : ''}
              placeholder="123"
              maxLength={4}
              required
            />
            {fieldErrors.cardCvv && (
              <div className="error-message" data-testid="error-cardCvv">{fieldErrors.cardCvv}</div>
            )}
          </div>
        </div>
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <span>Order Total:</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
        {!isFormValid() && !submitting && (
          <div className="form-hint">
            Please fill all required fields correctly to proceed
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Back to Cart
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={submitting || !isFormValid()}
            style={{ flex: 1 }}
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </form>
  );
}

interface OrderSuccessProps {
  order: Order;
  onContinueShopping: () => void;
}

function OrderSuccess({ order, onContinueShopping }: OrderSuccessProps) {
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

export default App;
