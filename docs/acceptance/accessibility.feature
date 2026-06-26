Feature: Accessibility and Inclusive Design
  In order to ensure the platform is usable by all fans, including those with disabilities
  As a front-end developer
  We want to verify semantic HTML and ARIA compliance across critical flows

  Scenario: Navigating past header via "skip to content" link
    Given the user is on any main page (e.g., Homepage, Dashboard)
    When the user presses the "Tab" key as their first action
    Then a visually hidden "Skip to content" link should become visible and focused
    And pressing "Enter" should move focus directly to the main content area `<main>`
    And the header navigation should be bypassed

  Scenario: Announcing dynamic UI changes via aria-live
    Given the user is interacting with a dynamic component like the "Shopping Cart"
    When an item is added to the cart without a page reload
    Then an `aria-live` region should assertively announce the update to screen readers
    And the announcement should state exactly what was added (e.g., "Official Jersey added to cart")

  Scenario: Highlighting focused elements with distinct visual indicators
    Given the user is navigating the "Signup" form using only the keyboard
    When focus moves between input fields and buttons
    Then a high-contrast focus ring should surround the currently focused element
    And the focus ring must meet WCAG 2.1 contrast ratio requirements
    And the default browser outline should be overridden for consistency
