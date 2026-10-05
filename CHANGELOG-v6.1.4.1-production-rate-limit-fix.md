# Codesazan v6.1.4.1 — Production Rate-Limit Proxy Fix

## Fix
- Changed Express `trust proxy` from unrestricted boolean trust to a single trusted proxy hop.
- Updated production setup and example environment files to use `TRUST_PROXY=1`.
- Updated Docker Compose to honor `TRUST_PROXY` with a safe default of `1`.
- This prevents `express-rate-limit` from accepting arbitrary forwarded client IPs and removes `ERR_ERL_PERMISSIVE_TRUST_PROXY` in the current one-proxy deployment topology.

## Scope
No business modules, database schema, authentication flows, or frontend behavior were changed.
