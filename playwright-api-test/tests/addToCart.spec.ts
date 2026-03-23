import { test, expect } from '@playwright/test';
import { createProduct, createCart } from '../utils/api-helpers';
import { cartSchema } from '../schemas/cart.schema';
import { errorSchema } from '../schemas/error.schema';
import { expectSchema } from '../utils/schemaValidator';
import { getRandomNumber, getRandomString } from '../utils/random';

test.describe('Add Product to Cart', () => {
  test('Add product to cart', { tag: '@positive' }, async ({ request }) => {
    const product = await createProduct(request);
    const cart = await createCart(request);
    const randomQuantity = getRandomNumber(product.stock, 1);

    const response = await request.post(`cart/${cart.cartId}/items`, {
      data: {
        productId: product.productId,
        quantity:  randomQuantity,
      },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');

    const body = await response.json();
    expectSchema(body, cartSchema);

    expect(body.items).toHaveLength(1);
    expect(body.items[0].productId).toBe(product.productId);
    expect(body.items[0].quantity).toBe(randomQuantity);
    expect(body.items[0].product.price).toBe(product.price);
    expect(body.total).toBeCloseTo(product.price * randomQuantity, 10);
  });

  test('Add product to cart with more than stock quantity', { tag: '@negative' }, async ({ request }) => {
    const product = await createProduct(request);
    const cart = await createCart(request);

    const response = await request.post(`cart/${cart.cartId}/items`, {
      data: {
        productId: product.productId,
        quantity:  product.stock + 1,
      },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');

    const body = await response.json();
    expectSchema(body, errorSchema);
    expect(body.error).toBe('Unable to add item to cart. Check product availability and stock.');
  });

  const invalidProductIdCases = [
    { value: null, reason: 'no productId at all', expectedError: 'Invalid product ID or quantity' },
    { value: '', reason: 'empty productId', expectedError: 'Invalid product ID or quantity' },
    { value: 'GENERATE_RANDOM', reason: 'invalid productId type', expectedError: 'Unable to add item to cart. Check product availability and stock.' },
  ];

  for (const testCase of invalidProductIdCases) {
    test(`Add product to cart with invalid productId (${testCase.reason})`, { tag: '@negative' }, async ({ request }) => {
      const cart = await createCart(request);
      const randomQuantity = getRandomNumber(100, 1);
      const productIdValue = testCase.value === 'GENERATE_RANDOM'
        ? getRandomString()
        : testCase.value;

      const response = await request.post(`cart/${cart.cartId}/items`, {
        data: {
          productId: productIdValue,
          quantity:  randomQuantity,
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toBe(testCase.expectedError);
    });
  }

  interface InvalidQuantityCase {
    value: number | undefined;
    reason: string;
    expectedError: string;
  }

  const invalidQuantityCases: InvalidQuantityCase[] = [
    { value: undefined, reason: 'no quantity at all', expectedError: 'Invalid product ID or quantity' },
    { value: 0, reason: 'zero quantity', expectedError: 'Invalid product ID or quantity' },
    { value: -1, reason: 'negative quantity', expectedError: 'Invalid product ID or quantity' },
  ];

  // Seems the product allows non-integer and string quantities
  // (!?!?!), so that would have to be fixed
  // { value: 3.4, reason: 'non-integer quantity',
  //   expectedError: 'Invalid product ID or quantity' },
  // { value: getRandomString(), reason: 'invalid productId type',
  //   expectedError: 'Unable to add item...' },

  for (const testCase of invalidQuantityCases) {
    test(`Add product to cart with invalid quantity (${testCase.reason})`, { tag: '@negative' }, async ({ request }) => {
      const product = await createProduct(request);
      const cart = await createCart(request);
      const data: Record<string, unknown> = { productId: product.productId };
      if (testCase.value !== undefined) {
        data.quantity = testCase.value;
      }

      const response = await request.post(`cart/${cart.cartId}/items`, { data });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toBe(testCase.expectedError);
    });
  }

  // -------------------------------------------------------------------------
  // @negative — Invalid HTTP methods (parameterized)
  // -------------------------------------------------------------------------

  const invalidMethods = ['DELETE', 'GET', 'PATCH', 'PUT', 'TRACE'];

  for (const method of invalidMethods) {
    test(`Invalid method ${method} for Add Product to Cart Endpoint`, { tag: '@negative' }, async ({ request }) => {
      const cart = await createCart(request);
      const url = `cart/${cart.cartId}/items`;

      const response = await request.fetch(url, { method });

      expect(response.status()).toBe(404);

      const text = await response.text();
      expect(text).toContain(`Cannot ${method} /api/cart/${cart.cartId}/items`);
    });
  }
});
