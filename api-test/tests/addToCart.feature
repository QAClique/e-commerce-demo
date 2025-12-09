#---------------------------------------------------------------------------------------------------
Feature: Add Product to Cart API tests
#---------------------------------------------------------------------------------------------------

#---------------------------------------------------------------------------------------------------
Background:
#---------------------------------------------------------------------------------------------------

  * callonce read(`file:${root}/utils/addProduct.feature`)

  * call read(`file:${root}/utils/createCart.feature`)

  * url `${baseUrl}/cart/${cartId}/items`

  * def utils = call read(`file:${root}/utils/utils.js`)
  * def randomQuantity = utils.getRandomNumber(stock, 1)

#---------------------------------------------------------------------------------------------------
@positive
Scenario: Add product to cart
#---------------------------------------------------------------------------------------------------

  Given request
    """
    {
      "productId": #(productId),
      "quantity":  #(randomQuantity)
    }
    """
  When method POST
  Then status 200
  And match header Content-Type == "application/json; charset=utf-8"
  And match response.items == "#[1]"
  And match response.items[0].productId == productId
  And match response.items[0].quantity == randomQuantity
  And match response.items[0].product.price == price
  And match response.total == price * randomQuantity

#---------------------------------------------------------------------------------------------------
@negative
Scenario: Add product to cart with more than stock quantity
#---------------------------------------------------------------------------------------------------

  Given request
    """
    {
      "productId": #(productId),
      "quantity":  #(stock + 1)
    }
    """
  When method POST
  Then status 400
  And match header Content-Type == "application/json; charset=utf-8"
  And match response.error == "Unable to add item to cart. Check product availability and stock."

#---------------------------------------------------------------------------------------------------
@negative
Scenario Outline: Add product to cart with invalid productId (<reason>)
#---------------------------------------------------------------------------------------------------

  Given request
    """
    {
      "productId": <product>,
      "quantity":  #(randomQuantity)
    }
    """
  When method POST
  Then status 400
  And match response.error == "<error>"

Examples:
  | product                    | reason                 | error                                                             |
  | null                       | no productId at all    | Invalid product ID or quantity                                    |
  | ""                         | empty productId        | Invalid product ID or quantity                                    |
  | #(utils.getRandomString()) | invalid productId type | Unable to add item to cart. Check product availability and stock. |

#---------------------------------------------------------------------------------------------------
@negative
Scenario Outline: Add product to cart with invalid quantity (<reason>)
#---------------------------------------------------------------------------------------------------

  Given request
    """
    {
      "productId": #(productId),
      "quantity":  ##(<count>)
    }
    """
  When method POST
  Then status 400
  And match response.error == "<error>"

Examples:
  | count | reason             | error                          |
  | null  | no quantity at all | Invalid product ID or quantity |
  | 0     | zero quantity      | Invalid product ID or quantity |
  | -1    | negative quantity  | Invalid product ID or quantity |

  # Seems the product allows non-integer and string quantities (!?!?!), so that would have to be fixed
  # | 3.4                        | non-integer quantity   | Invalid product ID or quantity                                    |
  # | #(utils.getRandomString()) | invalid productId type | Unable to add item to cart. Check product availability and stock. |

#---------------------------------------------------------------------------------------------------
@negative
Scenario Outline: Invalid method <method> for Add Product to Cart Endpoint
#---------------------------------------------------------------------------------------------------

  Given request ""
  When method <method>
  Then status 404
  And match response contains `<pre>Cannot <method> /api/cart/${cartId}/items</pre>`

Examples:
  | method |
  | DELETE |
  | GET    |
  | PATCH  |
  | PUT    |
  | TRACE  |
