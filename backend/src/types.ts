export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface CheckoutDetails {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

// Stored and returned with sensitive card data removed
export interface SafeCheckoutDetails {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  maskedCardNumber: string;
}

export interface Order {
  id: string;
  cartId: string;
  checkoutDetails: SafeCheckoutDetails;
  totalAmount: number;
  createdAt: Date;
}
