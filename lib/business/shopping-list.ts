import type { RecipeIngredient, ShoppingItem } from "@/lib/types";

export const createShoppingItems = (
  missing: RecipeIngredient[],
  recipeId: string,
): ShoppingItem[] =>
  missing.map((item) => ({
    id: crypto.randomUUID(),
    ingredientId: item.ingredientId,
    name: item.name,
    quantity: item.requiredQuantity,
    unit: item.unit,
    relatedRecipeId: recipeId,
    isPurchased: false,
  }));
