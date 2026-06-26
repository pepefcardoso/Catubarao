Feature: Social Proof Design Levers
  In order to increase conversion and validate the user's decision to join
  As a marketing and product team
  We want to display social proof elements throughout the user journey

  Scenario: Displaying the live member counter on the homepage
    Given the user is on the "Homepage"
    When the page loads
    Then a live member counter should be visible above the fold
    And the counter should display the current number of active members
    And the counter should update periodically without a page refresh

  Scenario: Highlighting the Most Popular plan at checkout
    Given the user is on the "Plan Selection" page
    When the pricing tiers are displayed
    Then the middle tier should be visually distinct
    And the middle tier should display a "Most Popular" badge
    And the middle tier should be pre-selected by default

  # TODO: Paste scenario from strategic_analysis.md §4.5 here verbatim
  Scenario: Displaying recent subscriber notifications (Placeholder)
    Given the user is on the "Signup" page
    When a new user successfully subscribes in real-time
    Then a non-intrusive toast notification should appear
    And the notification should read "A new fan just joined Operação Resgate!"
