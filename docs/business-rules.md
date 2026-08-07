# Business rules

- Allergy names are trimmed, internal whitespace is collapsed, and comparisons are case-insensitive. Blank or duplicate names are rejected.
- Allergen, dietary, and recognized religious filtering runs before scoring; excluded recipes never enter ordinary recommendations. Imported Thai recipes are machine-classified from their structured ingredient lists as Vegan, Vegetarian, Pescatarian, No restriction, or Other. Halal filtering uses separate ingredient-compatibility metadata: obvious prohibited ingredients are excluded, land-animal recipes require review, and compatible plant/egg/dairy/seafood recipes carry a non-certification warning.
- Expired means before today; today is distinct; “soon” means 1–3 days; fresh means more than 3 days. Estimated status is an overlay, never a safety claim.
- Recommendation match is required ingredients present / total required ingredients. Optional ingredients do not affect the denominator, and expired stock is unavailable.
- Recipe score is `(expiry priority × 50%) + (ingredient match × 30%) + (preference × 20%)`.
- Expiry priority averages the earliest usable lot for each owned recipe ingredient: today is 100, one day is 90, decreasing by 10 per day to zero. A recipe with no owned ingredients receives zero for this factor.
- Preference is 100 when diet and health goal both match, 80 when either matches, and 60 when a recipe remains suitable without a preference match.
- Cooking scales quantities by selected/default servings. All required ingredients must have matching units and sufficient non-expired stock.
- Production cooking locks inventory rows and validates all shortages before changing any quantity. It consumes earliest-expiring stock first and records history in the same transaction.
- Zero-balance inventory rows are deleted. Negative balances are impossible through constraints and transaction logic.
- Development signups receive a session immediately because email confirmation requires a configured SMTP provider. Production deployments must configure SMTP and re-enable confirmation.
- Automatic unit conversion, barcode scanning, cross-contamination advice, household sharing, and push notifications are outside the first release.
