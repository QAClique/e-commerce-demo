import { CheckoutDetails, Order } from './types';
import { v4 as uuidv4 } from 'uuid';
import { cartService } from './cartService';

// In-memory storage for orders
const orders = new Map<string, Order>();

export const checkoutService = {
  validateCheckoutDetails(details: CheckoutDetails): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!details.firstName || details.firstName.trim() === '') {
      errors.push('First name is required');
    }
    if (!details.lastName || details.lastName.trim() === '') {
      errors.push('Last name is required');
    }
    if (!details.email || details.email.trim() === '') {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      errors.push('Invalid email format');
    }
    if (!details.address || details.address.trim() === '') {
      errors.push('Address is required');
    }
    if (!details.city || details.city.trim() === '') {
      errors.push('City is required');
    }
    if (!details.zipCode || details.zipCode.trim() === '') {
      errors.push('Postal code is required');
    }
    if (!details.country || details.country.trim() === '') {
      errors.push('Country is required');
    }

    // Validate card details
    if (!details.cardNumber || details.cardNumber.trim() === '') {
      errors.push('Card number is required');
    } else if (!/^\d{16}$/.test(details.cardNumber.replace(/\s/g, ''))) {
      errors.push('Card number must be 16 digits');
    }
    if (!details.cardExpiry || details.cardExpiry.trim() === '') {
      errors.push('Card expiry is required');
    } else if (!/^\d{2}\/\d{2}$/.test(details.cardExpiry)) {
      errors.push('Card expiry must be in MM/YY format');
    }
    if (!details.cardCvv || details.cardCvv.trim() === '') {
      errors.push('Card CVV is required');
    } else if (!/^\d{3,4}$/.test(details.cardCvv)) {
      errors.push('Card CVV must be 3 or 4 digits');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  processCheckout(cartId: string, checkoutDetails: CheckoutDetails): { success: boolean; order?: Order; errors?: string[] } {
    // Validate checkout details
    const validation = this.validateCheckoutDetails(checkoutDetails);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    // Get cart with products
    const cartWithProducts = cartService.getCartWithProducts(cartId);
    if (!cartWithProducts) {
      return { success: false, errors: ['Cart not found'] };
    }

    if (cartWithProducts.items.length === 0) {
      return { success: false, errors: ['Cart is empty'] };
    }

    // Create order
    const order: Order = {
      id: uuidv4(),
      cartId,
      checkoutDetails,
      totalAmount: cartWithProducts.total,
      createdAt: new Date()
    };

    orders.set(order.id, order);

    // Clear cart after successful checkout
    cartService.clearCart(cartId);

    return { success: true, order };
  },

  getOrder(orderId: string): Order | undefined {
    return orders.get(orderId);
  }
};
