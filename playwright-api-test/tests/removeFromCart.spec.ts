import { test, expect } from '@playwright/test';
import { createCartWithProduct } from '../utils/api-helpers';
import { emptyCartSchema } from '../schemas/cart.schema';
import { expectSchema } from '../utils/schemaValidator';

// ---------------------------------------------------------------------------
// Feature: Remove Product from Cart API tests
// ---------------------------------------------------------------------------

test.describe('Remove Product from Cart', () => {
  // -------------------------------------------------------------------------
  // @positive
  // -------------------------------------------------------------------------

  test('Remove product from cart', { tag: '@positive' }, async ({ request }) => {
    const { cartId, productId } = await createCartWithProduct(request);

    const response = await request.delete(`cart/${cartId}/items/${productId}`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');

    const body = await response.json();
    expectSchema(body, emptyCartSchema);

    expect(body.items).toHaveLength(0);
    expect(body.total).toBe(0);
  });

  // -------------------------------------------------------------------------
  // @negative — Invalid productId (parameterized)
  // -------------------------------------------------------------------------

  // Seemingly the API does not check to see if the product exists
  // A non-existing productId would also return 200 successfully

  test('Remove product from cart with empty productId', { tag: '@negative' }, async ({ request }) => {
    const { cartId } = await createCartWithProduct(request);

    const response = await request.delete(`cart/${cartId}/items/`);

    expect(response.status()).toBe(404);
  });

  // -------------------------------------------------------------------------
  // @negative
  // -------------------------------------------------------------------------

  test('Remove product from cart twice', { tag: '@negative' }, async ({ request }) => {
    const { cartId, productId } = await createCartWithProduct(request);

    const firstResponse = await request.delete(`cart/${cartId}/items/${productId}`);
    expect(firstResponse.status()).toBe(200);

    // Same issue as above test, API does not check if the product exists/is in the cart
    const secondResponse = await request.delete(`cart/${cartId}/items/${productId}`);
    expect(secondResponse.status()).toBe(200);
  });

  // -------------------------------------------------------------------------
  // @negative — Invalid HTTP methods (parameterized)
  // -------------------------------------------------------------------------

  const invalidMethods = ['GET', 'PATCH', 'POST', 'TRACE'];

  for (const method of invalidMethods) {
    test(`Invalid method ${method} for Delete Product from Cart Endpoint`, { tag: '@negative' }, async ({ request }) => {
      const { cartId, productId } = await createCartWithProduct(request);
      const url = `cart/${cartId}/items/${productId}`;

      const response = await request.fetch(url, { method });

      expect(response.status()).toBe(404);

      const text = await response.text();
      expect(text).toContain(`Cannot ${method} /api/cart/${cartId}/items/${productId}`);
    });
  }
});
