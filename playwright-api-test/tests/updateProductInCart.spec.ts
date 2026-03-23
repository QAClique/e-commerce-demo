import { test, expect } from '@playwright/test';
import { createCartWithProduct } from '../utils/api-helpers';
import { cartSchema } from '../schemas/cart.schema';
import { errorSchema } from '../schemas/error.schema';
import { expectSchema } from '../utils/schemaValidator';
import { getRandomNumber } from '../utils/random';

// ---------------------------------------------------------------------------
// Feature: Update Product in Cart API tests
// ---------------------------------------------------------------------------

test.describe('Update Product in Cart', () => {
  // -------------------------------------------------------------------------
  // @positive
  // -------------------------------------------------------------------------

  test('Update product quantity in cart', { tag: '@positive' }, async ({ request }) => {
    const {
      cartId, productId, stock, price,
    } = await createCartWithProduct(request);

    // 0 is an allowed value... which is weird, because it does not delete the item from the cart
    // Sounds more like a bug than a feature (0 is not allowed when adding product to cart)
    const newRandomQuantity = getRandomNumber(stock, 0);

    const response = await request.put(`cart/${cartId}/items/${productId}`, {
      data: { quantity: newRandomQuantity },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');

    const body = await response.json();
    expectSchema(body, cartSchema);

    expect(body.items).toHaveLength(1);
    expect(body.items[0].productId).toBe(productId);
    expect(body.items[0].quantity).toBe(newRandomQuantity);
    expect(body.items[0].product.price).toBe(price);
    expect(body.total).toBeCloseTo(price * newRandomQuantity, 10);
  });

  // -------------------------------------------------------------------------
  // @negative
  // -------------------------------------------------------------------------

  test('Update product in cart with more than stock quantity', { tag: '@negative' }, async ({ request }) => {
    const {
      cartId, productId, stock, quantity,
    } = await createCartWithProduct(request);
    const newRandomQuantity = stock + 1;

    const response = await request.put(`cart/${cartId}/items/${productId}`, {
      data: { quantity: newRandomQuantity },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');

    const body = await response.json();
    expectSchema(body, errorSchema);
    expect(body.error).toBe('Unable to add item to cart. Check product availability and stock.');

    // Verify original quantity is unchanged
    const getResponse = await request.get(`cart/${cartId}`);
    expect(getResponse.status()).toBe(200);
    expect(getResponse.headers()['content-type']).toBe('application/json; charset=utf-8');

    const getBody = await getResponse.json();
    expect(getBody.items).toHaveLength(1);
    expect(getBody.items[0].quantity).toBe(quantity);
  });

  // -------------------------------------------------------------------------
  // @negative — Invalid quantity (parameterized)
  // -------------------------------------------------------------------------

  // Seems the product allows non-integer and string quantities
  // (!?!?!), so that would have to be fixed
  // { value: 3.4, reason: 'non-integer quantity',
  //   expectedError: 'Invalid quantity' },
  // { value: getRandomString(), reason: 'string quantity', expectedError: 'Invalid quantity' },

  const invalidQuantityCases: { value: number | null; reason: string; omitField: boolean }[] = [
    { value: null, reason: 'no quantity at all', omitField: true },
    { value: -1, reason: 'negative quantity', omitField: false },
  ];

  for (const testCase of invalidQuantityCases) {
    test(`Update product in cart with invalid quantity (${testCase.reason})`, { tag: '@negative' }, async ({ request }) => {
      const { cartId, productId } = await createCartWithProduct(request);

      const data: Record<string, unknown> = {};
      if (!testCase.omitField) {
        data.quantity = testCase.value;
      }

      const response = await request.put(`cart/${cartId}/items/${productId}`, { data });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('Invalid quantity');
    });
  }

  // ** Invalid Methods test already covered in DeleteProductFromCart tests **
});
