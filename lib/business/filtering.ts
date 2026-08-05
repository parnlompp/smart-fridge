import { hasAllergenConflict } from "./allergies";
import { isDietCompatible } from "./diet";
import type { DietaryPreference, Recipe } from "@/lib/types";

export const recipeAllergens = (recipe: Recipe) =>
  recipe.ingredients.flatMap((item) => item.allergens ?? []);
export function filterRecipes(
  recipes: Recipe[],
  allergies: string[],
  diet: DietaryPreference,
) {
  return recipes
    .filter(
      (recipe) => !hasAllergenConflict(recipeAllergens(recipe), allergies),
    )
    .filter((recipe) => isDietCompatible(recipe, diet));
}

export function exclusionReasons(
  recipe: Recipe,
  allergies: string[],
  diet: DietaryPreference,
) {
  const reasons: string[] = [];
  if (hasAllergenConflict(recipeAllergens(recipe), allergies))
    reasons.push("Contains a selected allergen");
  if (!isDietCompatible(recipe, diet))
    reasons.push(`Not compatible with ${diet}`);
  return reasons;
}
