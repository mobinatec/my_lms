# Codesazan v5.6.24 — Customer Loyalty, Live Portfolio & Notification Center

## Added
- Portfolio live customer website URL and public "live site" link.
- Loyalty tiers, points balance, lifetime points and auditable points ledger.
- Admin customer club panel with manual point adjustment.
- Checkout preview with tier discount + redeemable loyalty points.
- Orders store subtotal, final amount, discount, redeemed points, tracking code and payment due date.
- Richer admin order list with payment/reference/tracking details.
- Persistent notification jobs for SMS/email.
- Notification worker with queued/sending/sent/failed states and retries.
- Generic console and webhook notification drivers; provider credentials remain environment configuration.
- Contact/consultation/collaboration submissions receive tracking-code notifications when phone/email exists.
- Pending-payment order notification event.
- Admin notification center showing status, attempts and provider errors.
- `orders.manage` permission and admin endpoint to finalize a pending order as paid.

## Important
- Existing PostgreSQL/Redis/media volumes are preserved.
- Do not run `docker compose down -v`.
- Default notification driver is `console`; production SMS/email should use `NOTIFY_DRIVER=webhook` and the corresponding provider URLs.
