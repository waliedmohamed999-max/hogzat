# Labayh Frontend Upgrade Summary

## What Changed

- Reworked the Labayh homepage sections while preserving the existing routes and data flow.
- Kept the Next.js frontend connected to Laravel through the existing bridge endpoints.
- Added shared presentation helpers for listing cards: price formatting, badges, fallback images, metadata, and locations.
- Rebuilt the main listing card to support stable image sizing, wishlist state, listing badges, metadata, ratings, and clear CTAs.
- Connected urgent deals to real featured/offer listing data before falling back to structured static content.
- Improved the hero search experience while preserving the current `/home-search-result` query flow.
- Updated categories to link to real search routes instead of disconnected visual tiles.
- Refreshed dashboard shell navigation and dashboard overview UI while keeping all dashboard routes intact.
- Wired footer newsletter submission to the existing Laravel `subscribe-email` route.
- Added `subscribe-email` to Laravel CSRF exceptions so the modern frontend can submit to the legacy newsletter action.

## Verified

- `npm run build` completed successfully.
- `http://127.0.0.1:3000` returned `200 OK`.
- `http://127.0.0.1:3000/home-search-result?guests=2` returned `200 OK`.
- `http://127.0.0.1:8000/bridge/v1/products?type=home` returned `200 OK`.

## Notes

- `npm run lint` currently launches the deprecated interactive `next lint` setup because the project has no ESLint config. No automatic ESLint configuration was generated.
- Events and conferences currently reuse the experience search route because no separate bridge content type was exposed in the inspected API layer.
- Newsletter delivery still depends on valid Mailchimp settings in the Laravel dashboard.
