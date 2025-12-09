#---------------------------------------------------------------------------------------------------
Feature: Process Checkout API tests
#---------------------------------------------------------------------------------------------------

#---------------------------------------------------------------------------------------------------
Background:
#---------------------------------------------------------------------------------------------------

  * callonce read(`file:${root}/utils/addProduct.feature`)

  * call read(`file:${root}/utils/createCart.feature`)
  * call read(`file:${root}/utils/addToCart.feature`)

  * url `${baseUrl}/checkout`

  * def utils = call read(`file:${root}/utils/utils.js`)
  # Ideally we want to randomize these details too, but for now...
  * def checkoutDetails =
    """
    {
      "cartId": "#(cartId)",
      "checkoutDetails": {
        "firstName": "jytjtyj",
        "lastName": "jtyjyt",
        "email": "jtyjyt@htrshtr.htr",
        "address": "htrdhrthtr",
        "city": "htrhtrshr",
        "zipCode": "H1H 1H1",
        "country": "htrshtrhs",
        "cardNumber": "1234567890123456",
        "cardExpiry": "12/25",
        "cardCvv": "123"
      }
    }
    """

#---------------------------------------------------------------------------------------------------
@positive
Scenario: Checkout with valid details
#---------------------------------------------------------------------------------------------------

  * def startTime = new Date().getTime()

  Given request checkoutDetails
  When method POST
  Then status 201
  And match header Content-Type == "application/json; charset=utf-8"
  And match response.id == "#present"
  And match response.createdAt == "#present"

  # Verify createdAt is within 1 seconds of order request time
  * def createdAtTime = new Date(response.createdAt).getTime()
  * def timeDifference = Math.abs(createdAtTime - startTime)
  * assert timeDifference < 1000

#---------------------------------------------------------------------------------------------------
@negative
Scenario Outline: Checkout with missing details (field: <field>)
#---------------------------------------------------------------------------------------------------

  * remove checkoutDetails.checkoutDetails.<field>

  Given request checkoutDetails
  When method POST
  And status 400
  And match response.errors == "#[1]"
  And match response.errors[0] == "<error> required"

Examples:
  | field      | error          |
  | firstName  | First name is  |
  | lastName   | Last name is   |
  | email      | Email is       |
  | address    | Address is     |
  | city       | City is        |
  | zipCode    | Postal code is |
  | country    | Country is     |
  | cardNumber | Card number is |
  | cardExpiry | Card expiry is |
  | cardCvv    | Card CVV is    |

#---------------------------------------------------------------------------------------------------
@negative
Scenario: Checkout with missing cartId
#---------------------------------------------------------------------------------------------------

  * remove checkoutDetails.cartId

  Given request checkoutDetails
  When method POST
  And status 400
  And match response.error == "Cart ID and checkout details are required"

# TODO: Add negative tests for invalid data types, but I don't think the API is checking for those properly
