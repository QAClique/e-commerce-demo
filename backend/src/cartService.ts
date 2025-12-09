import { Cart, CartItem } from './types';
import { v4 as uuidv4 } from 'uuid';
import { productService } from './productService';

// In-memory storage for carts
const carts = new Map<string, Cart>();

export const cartService = {
  createCart(): Cart {
    const cart: Cart = {
      id: uuidv4(),
      items: []
    };
    carts.set(cart.id, cart);
    return cart;
  },

  getCart(cartId: string): Cart | undefined {
    return carts.get(cartId);
  },

  addItemToCart(cartId: string, productId: string, quantity: number): Cart | null {
    const cart = carts.get(cartId);
    if (!cart) return null;

    // Verify product exists
    const product = productService.getProductById(productId);
    if (!product) return null;

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      // Check stock availability
      if (existingItem.quantity + quantity > product.stock) {
        return null;
      }
      existingItem.quantity += quantity;
    } else {
      // Check stock availability
      if (quantity > product.stock) {
        return null;
      }
      cart.items.push({ productId, quantity });
    }

    return cart;
  },

  removeItemFromCart(cartId: string, productId: string): Cart | null {
    const cart = carts.get(cartId);
    if (!cart) return null;

    cart.items = cart.items.filter(item => item.productId !== productId);
    return cart;
  },

  updateItemQuantity(cartId: string, productId: string, quantity: number): Cart | null {
    const cart = carts.get(cartId);
    if (!cart) return null;

    if (quantity <= 0) {
      return this.removeItemFromCart(cartId, productId);
    }

    const item = cart.items.find(item => item.productId === productId);
    if (!item) return null;

    // Verify stock availability
    const product = productService.getProductById(productId);
    if (!product || quantity > product.stock) {
      return null;
    }

    item.quantity = quantity;
    return cart;
  },

  clearCart(cartId: string): Cart | null {
    const cart = carts.get(cartId);
    if (!cart) return null;

    cart.items = [];
    return cart;
  },

  getCartWithProducts(cartId: string) {
    const cart = carts.get(cartId);
    if (!cart) return null;

    const itemsWithProducts = cart.items.map(item => {
      const product = productService.getProductById(item.productId);
      return {
        ...item,
        product
      };
    });

    const total = itemsWithProducts.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    return {
      ...cart,
      items: itemsWithProducts,
      total
    };
  }
};
