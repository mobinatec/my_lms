# v6.1.4.23 — Ticket workflow + Contract card UI

## Ticket workflow
- Added authenticated user ticket API under `/api/tickets`.
- Logged-in users can create tickets with subject, category, priority and description.
- Users can list their own tickets and view the full public conversation.
- Added ticket event timeline (`ticket_events`) so status/assignment/reply/close changes are visible as a process.
- Added public authenticated category list for ticket creation.
- Added user replies; internal notes remain hidden unless the account has `tickets.internal_reply`.
- Added explicit `tickets.close` permission.
- Admin can close tickets through the admin ticket workflow.
- Employee/teacher/team members can close tickets when their account has `tickets.close` (or broader ticket-management access in admin).
- Staff access is scoped by permissions and/or assigned ticket ownership.

## Account UI
- Added a Support Center to `/account`.
- New ticket form for authenticated users.
- Ticket list, status, category, conversation, event timeline, reply and permitted close action.

## Contract UI
- Moved the contract-card readability fix into the active `global.css` stylesheet.
- Widened the contract list column and cards, increased padding/margins, and improved text contrast.
- This fixes the previous v6.1.4.21 issue where the CSS existed in `App.css` but was not imported by `main.jsx`.

## Data safety
- No PostgreSQL volume/data reset is required.
- Added migration `016_ticket_workflow.sql` only.
