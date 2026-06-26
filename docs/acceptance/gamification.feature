Feature: Dashboard Gamification and Tier Progression
  In order to increase engagement and provide a sense of achievement
  As a product manager
  We want to display gamification elements to active members

  Scenario: Unlocking a new tier based on accumulated points
    Given the user has an "Active" membership
    And the user currently has 950 points
    When the user completes an action that awards 100 points
    Then the user's total points should update to 1050
    And a modal should appear celebrating their progression to the next tier
    And their digital membership card should reflect the new tier visually

  Scenario: Displaying the progress bar to the next tier
    Given the user is logged into the "Dashboard"
    When the user views their profile section
    Then a progress bar should be visible indicating their current points
    And the text should state exactly how many points are needed for the next tier
    And the next tier's benefits should be previewed nearby

  Scenario: Viewing and interacting with the member leaderboard
    Given the user is on the "Community" section of the "Dashboard"
    When the user views the monthly leaderboard
    Then the top 10 members by points should be listed
    And the user's own rank should be highlighted, even if outside the top 10
    And the user should be able to toggle between "Monthly" and "All-Time" rankings
