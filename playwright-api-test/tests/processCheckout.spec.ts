import { test, expect } from '@playwright/test';
import { createCartWithProduct } from '../utils/api-helpers';
import { orderSchema } from '../schemas/order.schema';
import { errorSchema, errorsArraySchema } from '../schemas/error.schema';
import { expectSchema } from '../utils/schemaValidator';

// ---------------------------------------------------------------------------
// Feature: Process Checkout API tests
// ---------------------------------------------------------------------------

// Ideally we want to randomize these details too, but for now...
function buildCheckoutPayload(cartId: string): {
  cartId: string;
  checkoutDetails: Record<string, string>;
} {
  return {
    cartId,
    checkoutDetails: {
      firstName: 'jytjtyj',
      lastName: 'jtyjyt',
      email: 'jtyjyt@htrshtr.htr',
      address: 'htrdhrthtr',
      city: 'htrhtrshr',
      zipCode: 'H1H 1H1',
      country: 'htrshtrhs',
      cardNumber: '1234567890123456',
      cardExpiry: '12/25',
      cardCvv: '123',
    },
  };
}

test.describe('Process Checkout', () => {
  // -------------------------------------------------------------------------
  // @positive
  // -------------------------------------------------------------------------

  test('Checkout with valid details', { tag: '@positive' }, async ({ request }) => {
    const { cartId } = await createCartWithProduct(request);
    const startTime = Date.now();

    const response = await request.post('checkout', {
      data: buildCheckoutPayload(cartId),
    });

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');

    const body = await response.json();
    expectSchema(body, orderSchema);

    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();

    // Verify createdAt is within 1 second of order request time
    const createdAtTime = new Date(body.createdAt).getTime();
    const timeDifference = Math.abs(createdAtTime - startTime);
    expect(timeDifference).toBeLessThan(1000);
  });

  // -------------------------------------------------------------------------
  // @negative — Missing checkout detail fields (parameterized)
  // -------------------------------------------------------------------------

  const missingFieldCases = [
    { field: 'firstName', error: 'First name is required' },
    { field: 'lastName', error: 'Last name is required' },
    { field: 'email', error: 'Email is required' },
    { field: 'address', error: 'Address is required' },
    { field: 'city', error: 'City is required' },
    { field: 'zipCode', error: 'Postal code is required' },
    { field: 'country', error: 'Country is required' },
    { field: 'cardNumber', error: 'Card number is required' },
    { field: 'cardExpiry', error: 'Card expiry is required' },
    { field: 'cardCvv', error: 'Card CVV is required' },
  ];

  for (const testCase of missingFieldCases) {
    test(`Checkout with missing details (field: ${testCase.field})`, { tag: '@negative' }, async ({ request }) => {
      const { cartId } = await createCartWithProduct(request);
      const payload = buildCheckoutPayload(cartId);
      delete payload.checkoutDetails[testCase.field];

      const response = await request.post('checkout', { data: payload });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expectSchema(body, errorsArraySchema);

      expect(body.errors).toHaveLength(1);
      expect(body.errors[0]).toBe(testCase.error);
    });
  }

  // -------------------------------------------------------------------------
  // @negative — Missing cartId
  // -------------------------------------------------------------------------

  test('Checkout with missing cartId', { tag: '@negative' }, async ({ request }) => {
    const { cartId } = await createCartWithProduct(request);
    const payload = buildCheckoutPayload(cartId);
    const { checkoutDetails } = payload;

    const response = await request.post('checkout', {
      data: { checkoutDetails },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expectSchema(body, errorSchema);
    expect(body.error).toBe('Cart ID and checkout details are required');
  });

  // TODO: Add negative tests for invalid data types,
  // but I don't think the API is checking for those properly
});
