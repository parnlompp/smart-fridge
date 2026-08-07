import { hasAllergenConflict } from "./allergies";
import { isDietCompatible, isReligiousRestrictionCompatible } from "./diet";
import type { DietaryPreference, Recipe } from "@/lib/types";

export const recipeAllergens = (recipe: Recipe) =>
  recipe.ingredients.flatMap((item) => item.allergens ?? []);
export function filterRecipes(
  recipes: Recipe[],
  allergies: string[],
  diet: DietaryPreference,
  religiousRestriction?: string,
) {
  return recipes
    .filter(
      (recipe) => !hasAllergenConflict(recipeAllergens(recipe), allergies),
    )
    .filter((recipe) => isDietCompatible(recipe, diet))
    .filter((recipe) =>
      isReligiousRestrictionCompatible(recipe, religiousRestriction),
    );
}

export function exclusionReasons(
  recipe: Recipe,
  allergies: string[],
  diet: DietaryPreference,
  religiousRestriction?: string,
) {
  const reasons: string[] = [];
  if (hasAllergenConflict(recipeAllergens(recipe), allergies))
    reasons.push("มีสารก่อภูมิแพ้ที่เลือกไว้");
  if (!isDietCompatible(recipe, diet))
    reasons.push(`ไม่เหมาะกับรูปแบบอาหาร ${diet}`);
  if (!isReligiousRestrictionCompatible(recipe, religiousRestriction))
    reasons.push(`ไม่เหมาะกับข้อจำกัด ${religiousRestriction}`);
  return reasons;
}
