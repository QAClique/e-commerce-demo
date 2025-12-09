import MainStore from '../pages/mainStore.page.js';
import CheckoutPage from '../pages/checkout.page.js';

describe('Bad checkout', () => {
  before(async () => {
    const productId = await CheckoutPage.addProduct();
    await MainStore.open();
    await CheckoutPage.addProductToCart(productId);
    await CheckoutPage.open();
  });

  it('should display error message when invalid email is entered', async () => {
    await CheckoutPage.placeOrder({ email: 'invalid-email' });
    await CheckoutPage.emailError.waitForDisplayed({ timeoutMsg: 'Expected: email error is displayed, but it was not' });
  });

  // And so on for all other field needing validation...
});
