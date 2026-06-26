Feature: Delinquency UX and Retention
  In order to recover failed payments without permanently alienating the user
  As a retention manager
  We want to apply escalating behavioral nudges based on the days of delinquency

  Scenario: Showing the D1 (Grace Period) informative banner
    Given the user's latest invoice is 1 day overdue
    When the user logs into the "Dashboard"
    Then an informative, non-blocking banner should be displayed
    And the banner text should politely remind them of the pending payment
    And the banner should include a "Pay Now" CTA button

  Scenario: Showing the D7 (Warning) banner emphasizing risk of suspension
    Given the user's latest invoice is 7 days overdue
    When the user logs into the "Dashboard"
    Then a prominent warning banner should be displayed
    And the banner text should emphasize the impending loss of membership benefits
    And the banner color should be an alerting color (e.g., yellow or orange)

  Scenario: Showing the D15 (Suspended) banner with restricted access messaging
    Given the user's latest invoice is 15 days overdue
    When the user logs into the "Dashboard"
    Then the user's account status should show as "Suspended"
    And access to member-only sections (Store, Voting) should be blocked
    And a high-urgency banner should instruct them to regularize their situation to regain access
    
  Scenario: Resolving delinquency and showing the reactivation confirmation
    Given the user has a "Suspended" account status
    When the user successfully pays their outstanding balance
    Then their account status should immediately return to "Active"
    And a success message should welcome them back and confirm their benefits are restored
