import type { RecipeAnalysis } from "@/lib/types";

// Match dominates: each near-expiry item adds 4, each missing item costs 8, and prep time only breaks close ties.
export const calculateRankScore = (
  match: number,
  nearExpiryCount: number,
  missingCount: number,
  prepMinutes: number,
) => match + nearExpiryCount * 4 - missingCount * 8 - prepMinutes * 0.03;

export const rankRecipes = (items: RecipeAnalysis[]) =>
  [...items].sort(
    (a, b) => b.score - a.score || a.recipe.name.localeCompare(b.recipe.name),
  );
