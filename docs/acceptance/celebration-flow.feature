Feature: Post-Signup Celebration Flow
  In order to reward users for their commitment and encourage viral sharing
  As a product designer
  We want to provide a celebratory and shareable experience immediately after signup

  Scenario: Triggering confetti animation upon successful signup
    Given the user has just completed the checkout process successfully
    When the "Welcome" page loads
    Then a confetti animation should trigger across the screen
    And the animation should last for at least 3 seconds
    And the page title should display "Welcome to the Family"

  Scenario: Displaying the newly assigned sequential member number
    Given the user is on the "Welcome" page
    When the user views their digital membership card
    Then their unique, sequential member number should be prominently displayed
    And the number should be formatted to emphasize its uniqueness (e.g., "#00420")

  Scenario: Clicking share buttons to post the achievement on social media
    Given the user is on the "Welcome" page
    When the user clicks the "Share on X" button
    Then a pre-populated draft should open
    And the draft text should include their member number and the hashtag "#OperacaoResgate"
    And a custom Open Graph image of their membership card should be attached
