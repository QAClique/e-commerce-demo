import axios from 'axios';
import Utils from '../utils/utils.js';


export default class Page {
  baseUrl = "http://localhost:3000";

  get cartButton()        { return $('[data-testid="cart-button"]'); }
  get cartIconItemCount() { return $('span.cart-count'); }


  /**
   * Opens the specified page
   *
   * @param path to open
   */
  async open(path = '') {
    await browser.setWindowSize(1440, 1024);
    await browser.url(path);
  }

  /**
   * Adds a product to the "DB" via API call
   *
   * @returns {string} - The ID of the added product
   */
  async addProduct() {
    const productName = Utils.getRandomString(20, true);
    const productDescription = Utils.getRandomString(50, true);
    const productPrice = Utils.getRandomNumber(500, 1) / 100;
    const productStock = Utils.getRandomNumber(100, 1);

    const response = await axios.post(`${this.baseUrl}/api/products`, {
      name: productName,
      description: productDescription,
      price: productPrice,
      stock: productStock
    });

    return response.data.id;
  }

  /**
   * Adds a product to the cart via API call
   *
   * @param {string} productId of the product to add
   */
  async addProductToCart(productId) {
    const cartId = await this.getCartId();
    const response = await axios.post(`${this.baseUrl}/api/cart/${cartId}/items`, {
      productId: productId,
      quantity: 1
    });
   }

  /**
   * Gets the cart Id from the cart button attribute to use with API calls
   *
   * @returns {string} - The cart Id
   */
  async getCartId() {
    return this.cartButton.getAttribute('data-cart-id');
  }

  /**
   * Gets the number of items in the cart from the cart icon
   *
   * @returns {number} - The number of items in the cart
   */
  async getCartIconItemsCount() {
    if (await this.cartIconItemCount.isExisting() === false) {
      return 0;
    }
    const countText = await this.cartIconItemCount.getText();
    return parseInt(countText, 10);
  }
}
