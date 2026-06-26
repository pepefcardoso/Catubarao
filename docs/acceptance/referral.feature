Feature: Referral System and Viral Growth
  In order to leverage the existing fan base to acquire new members
  As a growth marketer
  We want to provide an easy-to-use referral system that rewards both parties

  Scenario: Generating and displaying unique referral code
    Given the user is an active member
    When the user navigates to the "Referrals" page
    Then their unique, alphanumeric referral code should be displayed
    And a "Copy Link" button should be available to copy their personalized referral URL
    And a summary of their past successful referrals should be visible

  Scenario: Applying a valid referral code during a new checkout
    Given a new user is on the "Checkout" page
    When they enter a valid referral code into the "Promo/Referral Code" field
    And they click "Apply"
    Then a success message should confirm the code is applied
    And the expected benefit (e.g., first month discount) should be reflected in the order total

  Scenario: Automatically crediting the referrer when the referee's payment succeeds
    Given a new user has applied "USER_A_CODE" during checkout
    When the new user's initial payment is successfully processed
    Then "USER_A" should receive an automated email notifying them of the successful referral
    And "USER_A" should receive the predefined referral reward (e.g., store credit or points)
    And the referral should be logged as "Completed" in both users' history
