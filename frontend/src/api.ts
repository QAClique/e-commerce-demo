import { Product, Cart, CheckoutDetails, Order } from './types';

const API_BASE_URL = '/api';

export const api = {
  // Products
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // Cart
  async createCart(): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to create cart');
    return response.json();
  },

  async getCart(cartId: string): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/cart/${cartId}`);
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  },

  async addToCart(cartId: string, productId: string, quantity: number): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add item to cart');
    }
    return response.json();
  },

  async removeFromCart(cartId: string, productId: string): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items/${productId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove item from cart');
    return response.json();
  },

  async updateCartItem(cartId: string, productId: string, quantity: number): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update item quantity');
    }
    return response.json();
  },

  // Checkout
  async checkout(cartId: string, checkoutDetails: CheckoutDetails): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartId, checkoutDetails }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors ? error.errors.join(', ') : 'Failed to process checkout');
    }
    return response.json();
  },
};
