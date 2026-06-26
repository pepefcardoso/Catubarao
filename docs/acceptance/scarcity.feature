Feature: Scarcity and Exclusivity Triggers
  In order to drive urgency and perceived value of membership
  As a product marketer
  We want to display scarcity indicators for inventory and time-sensitive offers

  Scenario: Blocking non-members from members-only products
    Given a user is not logged in or is not an active member
    When the user navigates to a product marked "Members Only" in the "Store"
    Then the "Add to Cart" button should be disabled
    And a prompt should encourage the user to sign up or log in to purchase the item
    And the item's price should be blurred or hidden

  Scenario: Displaying "Only X left" indicators for low-stock items
    Given an item in the "Store" has fewer than 5 units in stock
    When a user views the product details page
    Then a prominent visual indicator should state "Only [X] left in stock"
    And the indicator should use an urgent color (e.g., red or orange)
    And the stock count should update in real-time if another user purchases it

  Scenario: Showing a countdown timer for time-limited early-adopter benefits
    Given an active promotional campaign offers early-adopter benefits
    When a user visits the "Pricing" page
    Then a countdown timer should be displayed above the pricing tiers
    And the text should clearly state when the offer expires
    And the timer should format time as DD:HH:MM:SS
