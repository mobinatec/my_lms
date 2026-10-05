# Codesazan v6.1.4.19

## Contract save 500 fix
- Fixed `contract_events.actor_id` receiving the synthetic `admin-env` identifier.
- The environment/admin token is not a UUID and must be stored as NULL in UUID foreign-key columns.
- This affected successful contract INSERTs because the contract was created and then event logging failed, causing the API to return HTTP 500.
- The same normalization is used for contract create/assign/send/sign lifecycle events.

## Verification
- `node --check` passed for `contracts.service.js` and `contracts.routes.js`.
- PostgreSQL migrations remain unchanged and no database volume/data is removed.
