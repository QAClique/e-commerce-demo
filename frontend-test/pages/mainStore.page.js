import Page from './page.js';

class MainStorePage extends Page {
  getAddProductButton(productId) {
    return $(`button[data-testid="add-to-cart-${productId}"]`);
  }

  /**
   * Opens the main store page
   *
   * @param {string} path - The path to the page (if there is such a thing)
   */
  async open(path) {
    await super.open(path);
    return this.getCartId();
  }
}

export default new MainStorePage();
