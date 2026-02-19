import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { Product, Cart, CheckoutDetails, Order } from './types';
import { api } from './api';
import ProductList from './components/ProductList';
import CartView from './components/CartView';
import CheckoutForm from './components/CheckoutForm';
import OrderSuccess from './components/OrderSuccess';

type View = 'products' | 'cart' | 'checkout' | 'order-success';

function App() {
  const [view, setView] = useState<View>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const withCart = useCallback(async (action: () => Promise<Cart>, fallback: string) => {
    try {
      const updatedCart = await action();
      setCart(updatedCart);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : fallback);
    }
  }, []);

  // Keep a stable ref to the current cartId so the refresh effect can read
  // it without listing `cart` as a dependency (which would cause an infinite loop).
  const cartIdRef = useRef<string | null>(null);
  useEffect(() => {
    cartIdRef.current = cart?.id ?? null;
  }, [cart]);

  const initializeApp = useCallback(async () => {
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
        } catch {
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
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    // Refresh cart from backend when navigating to cart view
    if (view === 'cart' && cartIdRef.current) {
      withCart(() => api.getCart(cartIdRef.current!), 'Failed to refresh cart');
    }
  }, [view, withCart]);

  const addToCart = (productId: string) => {
    if (!cart) return;
    withCart(() => api.addToCart(cart.id, productId, 1), 'Failed to add to cart');
  };

  const removeFromCart = (productId: string) => {
    if (!cart) return;
    withCart(() => api.removeFromCart(cart.id, productId), 'Failed to remove from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!cart) return;
    withCart(() => api.updateCartItem(cart.id, productId, quantity), 'Failed to update quantity');
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

export default App;
