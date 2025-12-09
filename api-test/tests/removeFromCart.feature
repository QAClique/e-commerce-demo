#---------------------------------------------------------------------------------------------------
Feature: Remove Product from Cart API tests
#---------------------------------------------------------------------------------------------------

#---------------------------------------------------------------------------------------------------
Background:
#---------------------------------------------------------------------------------------------------

  * callonce read(`file:${root}/utils/addProduct.feature`)

  * call read(`file:${root}/utils/createCart.feature`)
  * call read(`file:${root}/utils/addToCart.feature`)

  * url `${baseUrl}/cart/${cartId}/items`

  * def utils = call read(`file:${root}/utils/utils.js`)

#---------------------------------------------------------------------------------------------------
@positive
Scenario: Remove product from cart
#---------------------------------------------------------------------------------------------------

  Given path productId
  When method DELETE
  Then status 200
  And match header Content-Type == "application/json; charset=utf-8"
  And match response.items == "#[]"
  And match response.total == 0

#---------------------------------------------------------------------------------------------------
@negative
Scenario Outline: Remove product from cart with invalid productId (<reason>)
#---------------------------------------------------------------------------------------------------

  Given path <product>
  When method DELETE
  Then status 404

Examples:
  | product | reason          | error                          |
  | ""      | empty productId | Invalid product ID or quantity |

  # Seemingly the API does not check to see if the product exists
  # | utils.getRandomString() | non-exiting productId  | Unable to add item to cart. Check product availability and stock. |

#---------------------------------------------------------------------------------------------------
@negative
Scenario: Remove product from cart twice
#---------------------------------------------------------------------------------------------------

  Given path productId
  When method DELETE
  Then status 200

  Given path productId
  When method DELETE
  Then status 200
  # Same issue as above test, API does not check if the product exists/is in the cart

#---------------------------------------------------------------------------------------------------
@negative
Scenario Outline: Invalid method <method> for Delete Product from Cart Endpoint
#---------------------------------------------------------------------------------------------------

  Given path productId
  When method <method>
  Then status 404
  And match response contains `<pre>Cannot <method> /api/cart/${cartId}/items/${productId}</pre>`

Examples:
  | method |
  | GET    |
  | PATCH  |
  | POST   |
  | TRACE  |
