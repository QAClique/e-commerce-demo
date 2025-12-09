#---------------------------------------------------------------------------------------------------
Feature: Update Product in Cart API tests
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
Scenario: Update product quantity in cart
#---------------------------------------------------------------------------------------------------

  # 0 is an allowed value... which is weird, because it does not delete the item from the cart
  # Sounds more like a bug than a feature (0 is not allowed when adding product to cart)
  * def newRandomQuantity = utils.getRandomNumber(stock, 0)

  Given path productId
  And request { "quantity": #(newRandomQuantity) }
  When method PUT
  Then status 200
  And match header Content-Type == "application/json; charset=utf-8"
  And match response.items == "#[1]"
  And match response.items[0].productId == productId
  And match response.items[0].quantity == newRandomQuantity
  And match response.items[0].product.price == price
  And match response.total == price * newRandomQuantity

#---------------------------------------------------------------------------------------------------
@negative
Scenario: Update product in cart with more than stock quantity
#---------------------------------------------------------------------------------------------------

  * def newRandomQuantity = stock + 1

  Given path productId
  And request { "quantity": #(newRandomQuantity) }
  When method PUT
  Then status 400
  And match header Content-Type == "application/json; charset=utf-8"
  And match response.error == "Unable to add item to cart. Check product availability and stock."

  Given url `${baseUrl}/cart/${cartId}`
  When method GET
  Then status 200
  And match header Content-Type == "application/json; charset=utf-8"
  And match response.items == "#[1]"
  And match response.items[0].quantity == randomQuantity

#---------------------------------------------------------------------------------------------------
@negative
Scenario Outline: Update product in cart with invalid quantity (<reason>)
#---------------------------------------------------------------------------------------------------

  Given path productId
  And request { "quantity": ##(<count>) }
  When method PUT
  Then status 400
  And match response.error == "<error>"

Examples:
  | count | reason             | error            |
  | null  | no quantity at all | Invalid quantity |
  | -1    | negative quantity  | Invalid quantity |

  # Seems the product allows non-integer and string quantities (!?!?!), so that would have to be fixed
  # | 3.4                        | non-integer quantity   | Invalid product ID or quantity                                    |
  # | #(utils.getRandomString()) | invalid productId type | Unable to add item to cart. Check product availability and stock. |

# ** Invalid Methods test already covered in DeleteProductFromCart tests **
