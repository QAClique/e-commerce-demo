#---------------------------------------------------------------------------------------------------
@ignore
Feature: Add Product to be purchased Utility
#---------------------------------------------------------------------------------------------------

#---------------------------------------------------------------------------------------------------
Scenario: Add Product Utility
#---------------------------------------------------------------------------------------------------

  * def utils = call read(`file:${root}/utils/utils.js`)
  * def productName = utils.getRndAlphaString()
  * def description = utils.getRndAlphaString()
  * def price = utils.getRandomNumber(10000, 1) / 100
  * def stock = utils.getRandomNumber(1000, 1)

  Given url `${baseUrl}/products`
  And request
    """
    {
      "name":        "#(productName)",
      "description": "#(description)",
      "price":       "#(price)",
      "stock":       "#(stock)"
    }
    """
  When method POST
  Then status 201
  And match header Content-Type == "application/json; charset=utf-8"
  And def productId = response.id
