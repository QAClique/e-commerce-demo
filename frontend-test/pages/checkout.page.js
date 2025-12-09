import Page from './page.js';

class CheckoutPage extends Page {
  get checkoutButton()   { return $('[data-testid="checkout-button"]'); }
  get emailField()       { return $('[data-testid="field-email"] input'); }
  get emailError()       { return $('[data-testid="error-email"]'); }
  get placeOrderButton() { return $('[type="submit"]'); }

  /**
   * Opens the checkout page
   *
   * @param {string} path - The path to the page (if there is such a thing)
   */
  async open(path) {
    await super.open(path);
    await this.cartButton.click();
    await this.checkoutButton.click();
  }

  async placeOrder(details) {
    if (typeof details.email !== 'undefined') {
      await this.emailField.setValue(details.email);
    }
    // ... other fields would be filled here in the same way...
    await this.placeOrderButton.click();
  }
}

export default new CheckoutPage();
