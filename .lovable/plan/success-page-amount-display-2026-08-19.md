Success Page Amount Display

Goal
Confirm that the success page shows the actual withdrawn amount, not a fixed value.

Current state
- The withdrawal form already redirects to `/success?type=withdraw&amount=<withdrawnAmount>`.
- The success page already reads `amount` from the URL and renders it under the "Amount" label.
- The amount shown therefore matches whatever the user withdrew, formatted as a plain string from the URL.

Plan
No code changes are required. The success page is already dynamically displaying the withdrawn amount passed by the withdrawal flow.

Acceptance
- When a user withdraws ₦X, the success page shows exactly ₦X.
- When the URL contains no amount, the amount card is hidden.
