# Business rules

- Allergy names are trimmed, internal whitespace is collapsed, and comparisons are case-insensitive. Blank or duplicate names are rejected.
- Allergen filtering runs before dietary filtering; excluded recipes never enter ordinary recommendations.
- Expired means before today; today is distinct; “soon” means 1–3 days; fresh means more than 3 days. Estimated status is an overlay, never a safety claim.
- Recommendation match is required ingredients present / total required ingredients. Optional ingredients do not affect the denominator, and expired stock is unavailable.
- Ranking score is `match + (near expiry × 4) - (missing × 8) - (minutes × 0.03)`. Match remains dominant.
- Cooking scales quantities by selected/default servings. All required ingredients must have matching units and sufficient non-expired stock.
- Production cooking locks inventory rows and validates all shortages before changing any quantity. It consumes earliest-expiring stock first and records history in the same transaction.
- Zero-balance inventory rows are deleted. Negative balances are impossible through constraints and transaction logic.
- Automatic unit conversion, barcode scanning, cross-contamination advice, household sharing, and push notifications are outside the first release.
