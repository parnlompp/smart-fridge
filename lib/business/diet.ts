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
  if (preference === "Halal") return recipe.dietaryCategory !== "Other";
  return true;
}
