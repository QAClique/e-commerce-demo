import { APIRequestContext, expect } from '@playwright/test';
import { getRndAlphaString, getRandomNumber } from './random';

export interface ProductData {
  productId: string;
  productName: string;
  description: string;
  price: number;
  stock: number;
}

export interface CartData {
  cartId: string;
}

export interface CartWithProductData {
  cartId: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  price: number;
  stock: number;
}

/**
 * Creates a product with random name, description, price, and stock.
 */
export async function createProduct(request: APIRequestContext): Promise<ProductData> {
  const productName = getRndAlphaString();
  const description = getRndAlphaString();
  const price = getRandomNumber(10000, 1) / 100;
  const stock = getRandomNumber(1000, 1);

  const response = await request.post('products', {
    data: { name: productName, description, price, stock },
  });
  expect(response.status(), 'Product creation failed during test setup').toBe(201);

  const body = await response.json();
  return {
    productId: body.id,
    productName,
    description,
    price,
    stock,
  };
}

/**
 * Creates an empty cart.
 */
export async function createCart(request: APIRequestContext): Promise<CartData> {
  const response = await request.post('cart');
  expect(response.status(), 'Cart creation failed during test setup').toBe(201);

  const body = await response.json();
  return { cartId: body.id };
}

/**
 * Adds a product to a cart with the given quantity.
 */
export async function addProductToCart(
  request: APIRequestContext,
  cartId: string,
  productId: string,
  quantity: number,
): Promise<void> {
  const response = await request.post(`cart/${cartId}/items`, {
    data: { productId, quantity },
  });
  expect(response.status(), 'Add product to cart failed during test setup').toBe(200);
}

/**
 * Creates a product, creates a cart, and adds the product to the cart
 * with a random quantity (between 1 and stock).
 */
export async function createCartWithProduct(
  request: APIRequestContext,
): Promise<CartWithProductData> {
  const product = await createProduct(request);
  const cart = await createCart(request);
  const quantity = getRandomNumber(product.stock, 1);

  await addProductToCart(request, cart.cartId, product.productId, quantity);

  return {
    cartId: cart.cartId,
    productId: product.productId,
    productName: product.productName,
    description: product.description,
    quantity,
    price: product.price,
    stock: product.stock,
  };
}
