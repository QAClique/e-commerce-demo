import assert from 'node:assert';
import MainStore from '../pages/mainStore.page.js';

describe('Add Product to Cart', () => {
  let requestBody;
  let cartId;
  let productId;

  before(async () => {
    productId = await MainStore.addProduct();
    cartId = await MainStore.open();
  });

  it('should fire proper API call to add product', async () => {
    const mock = await browser.mock(`${MainStore.baseUrl}/api/cart/${cartId}/items`, { method: 'post' });
    await MainStore.getAddProductButton(productId).click();
    await mock.waitForResponse();
    requestBody = JSON.parse(mock.calls[0].postData);
    assert(requestBody.productId === productId,
      `Expected: API param productId to be ${productId}, but got ${requestBody.productId}`);
  });

  it('should add the right quantity (1) of product', async () => {
    assert(requestBody.quantity === 1,
      `Expected: API param quantity to be 1, but got ${requestBody.quantity}`);
  });

  it('should update the cart icon with the correct item count', async () => {
    const itemCount = await MainStore.getCartIconItemsCount();
    assert(itemCount === 1, `Expected: Cart item count to be 1, but got ${itemCount}`);
  });
});
