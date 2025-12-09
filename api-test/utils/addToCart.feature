#---------------------------------------------------------------------------------------------------
@ignore
Feature: Add Product to Cart Util
#---------------------------------------------------------------------------------------------------

#---------------------------------------------------------------------------------------------------
Scenario: Add product to cart utility
#---------------------------------------------------------------------------------------------------

  * call read(`file:${root}/utils/addProduct.feature`)

  * def utils = call read(`file:${root}/utils/utils.js`)
  * def randomQuantity = utils.getRandomNumber(stock, 1)

  Given url `${baseUrl}/cart/${cartId}/items`
  And request
    """
    {
      "productId": #(productId),
      "quantity":  #(randomQuantity)
    }
    """
  When method POST
  Then status 200
