# Point GitHub sync at red-pay-joseph and publish the latest frontend

## Goal
Get this project's code (red-pay-2026) into the `red-pay-joseph` GitHub repository, and ship the pending frontend fixes to the live site.

## Part 1 — Repointing GitHub sync (you do this in the editor)
Repo connection changes can only be made from the Lovable editor UI, not from the chat agent. Steps:

1. Open the Plus (+) menu in the chat input, choose GitHub.
2. Disconnect the currently connected repository.
3. Choose GitHub > Connect project again and authorize if prompted.
4. Select the account/organization that owns `red-pay-joseph`.

Important: Lovable creates a fresh repo on connect and does not import into or merge with an existing repo. Two ways to end up with the code in `red-pay-joseph`:

- Option A (recommended): let Lovable create a new repo, then in GitHub either rename it to `red-pay-joseph` (after renaming/archiving the old one) or push its contents into `red-pay-joseph` from a local clone.
- Option B: clone `red-pay-joseph` locally, copy in the code from the Lovable-created repo (or the Download codebase export), commit and push. Sync afterwards flows through whichever repo Lovable is connected to.

Tell me which option you want and I'll walk you through it precisely.

## Part 2 — Publish the pending frontend (I do this)
1. Run a fresh security scan; if a critical finding blocks publishing, report it and stop before deploying.
2. Publish the app so the currently unshipped frontend changes go live at https://red-pay-2026.lovable.app — these include:
   - Orphaned-profile self-healing and hardened signup in the auth hook
   - Dashboard loading/error-state handling with retry
   - Admin login/register self-grant of the admin role
3. Confirm the deploy was scheduled and state what shipped.

Backend/database changes (grants, RLS, admin role) are already live and unaffected by this step.
