Adjust the Buy RPC and Withdraw screens to match the user's latest flow.

1. Show the issued RPC code in the Buy RPC page (`src/pages/BuyRPC.tsx`) when `profile.rpc_purchased` is true and `profile.rpc_code` is set — the same code card currently shown in the dashboard and withdrawal pages.
2. Change the withdrawal submit button text from `Continue to Support` to `Place Withdrawal` in `src/pages/Withdraw.tsx`.
3. Verify the existing post-submission redirect: after a withdrawal request is created, users who are not activated are redirected to `/activate` next; activated users proceed to `/support`. No changes needed here.
