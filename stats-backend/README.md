# Worldwide lifetime statistics backend

GitHub Pages is static. Accurate shared lifetime counts require a separate server.
The game displays "awaiting shared server connection" until the service is deployed.

This Cloudflare Worker uses a D1 SQLite database. Visitors receive a persistent anonymous browser ID in localStorage. A UNIQUE key counts each browser once. The total level-start count increases for each attempted level or retry. These are unique browsers, not proven unique humans; cleared browser data or a second device counts again. Levels are counted only from when this backend is enabled, not retroactively.

## Setup
1. Create a Cloudflare account. Install Wrangler with: npm install -g wrangler. Run: wrangler login.
2. Run: wrangler d1 create gray-coyote-stats. Record the database UUID.
3. Replace REPLACE_WITH_D1_DATABASE_ID in stats-backend/wrangler.toml with the UUID.
4. Run from repository root: wrangler d1 execute gray-coyote-stats --remote --file=stats-backend/schema.sql
5. Run: wrangler deploy --config stats-backend/wrangler.toml. Copy the resulting HTTPS workers.dev address.
6. Set window.GCM_STATS_ENDPOINT in stats-config.js to that address (without trailing slash), commit, and allow GitHub Actions to test and publish.

Verify: GET /stats returns players and levels. Two POST requests to /stats with identical playerId and event "visit" count once. Each POST with event "level" increases the levels total.

Privacy: only random browser IDs, not names or emails, are stored. Scripted clients could inflate this friendly counter, so it is not fraud-resistant analytics.
