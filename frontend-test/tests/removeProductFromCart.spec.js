import assert from 'node:assert';
import MainStore from '../pages/mainStore.page.js';
import CartPage from '../pages/cart.page.js';

describe('Remove Product from Cart', () => {
  let cartId;
  let productId;

  before(async () => {
    productId = await CartPage.addProduct();
    cartId = await MainStore.open();
    await CartPage.addProductToCart(productId);
    await CartPage.open();
  });

  it('should fire proper API call to remove product', async () => {
    const mock = await browser.mock(`${CartPage.baseUrl}/api/cart/${cartId}/items/${productId}`, { method: 'delete' });
    await CartPage.getRemoveProductButton(productId).click();
    await mock.waitForResponse();
    assert(mock.calls[0].body.items.length === 0, `Expected: product has been removed from API, but was not`);
  });

  it('should not show any products in cart', async () => {
    const itemCount = await CartPage.getCartIconItemsCount();
    assert(itemCount === 0, `Expected: Cart item count to be 0, but got ${itemCount}`);
  });

  it('should update the cart icon with the correct item count', async () => {
    const itemCount = await CartPage.getCartIconItemsCount();
    assert(itemCount === 0, `Expected: Cart item count to be 0, but got ${itemCount}`);
  });
});
