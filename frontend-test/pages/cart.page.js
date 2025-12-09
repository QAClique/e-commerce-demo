import Page from './page.js';

class CartPage extends Page {
  get cartItems()      { return $$('div.cart-item'); }
  get checkoutButton() { return $('[data-testid="checkout-button"]'); }

  getRemoveProductButton(productId) {
    return $(`button[data-testid="remove-from-cart-${productId}"]`);
  }

  /**
   * Opens the cart page
   *
   * @param {string} path - The path to the page (if there is such a thing)
   */
  async open(path) {
    await super.open(path);
    await this.cartButton.click();
  }

  /**
   * Gets the number of items in the cart directly on the cart screen
   *
   * @returns {string} the number of items in the cart
   */
  async getCartItemsCount() {
    if (await this.cartItems.isExisting() === false) {
      return 0;
    }
    return this.cartItems.length;
  }
}

export default new CartPage();
