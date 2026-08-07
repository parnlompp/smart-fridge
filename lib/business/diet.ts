import type { DietaryPreference, Recipe } from "@/lib/types";

export function isDietCompatible(
  recipe: Recipe,
  preference: DietaryPreference,
) {
  if (preference === "No restriction" || preference === "Other") return true;
  if (preference === "Vegetarian")
    return ["Vegetarian", "Vegan"].includes(recipe.dietaryCategory);
  if (preference === "Vegan") return recipe.dietaryCategory === "Vegan";
  if (preference === "Pescatarian")
    return ["Pescatarian", "Vegetarian", "Vegan"].includes(
      recipe.dietaryCategory,
    );
  if (preference === "Halal")
    return ["Halal", "Vegetarian", "Vegan", "Pescatarian"].includes(
      recipe.dietaryCategory,
    );
  return true;
}

export function isReligiousRestrictionCompatible(
  recipe: Recipe,
  restriction?: string,
) {
  const normalized = restriction?.trim().toLowerCase();
  if (!normalized) return true;
  if (["halal", "islam", "islamic", "muslim"].includes(normalized)) {
    return ["Halal", "Vegetarian", "Vegan", "Pescatarian"].includes(
      recipe.dietaryCategory,
    );
  }
  // Other free-text restrictions need explicit recipe metadata before the app
  // can safely claim compatibility.
  return true;
}
