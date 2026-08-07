import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";
import { isDietCompatible } from "./diet";
import { isUsable } from "./expiry";
import type {
  InventoryItem,
  Profile,
  Recipe,
  RecipeAnalysis,
} from "@/lib/types";

export const RECIPE_SCORE_WEIGHTS = {
  expiryPriority: 0.5,
  quantityMatch: 0.3,
  preference: 0.2,
} as const;

const roundScore = (value: number) => Math.round(value * 100) / 100;

/** Today scores 100, one day remaining scores 90, and so on to zero. */
export const calculateIngredientExpiryScore = (
  expiryDate: string,
  today = new Date(),
) => {
  const daysRemaining = differenceInCalendarDays(
    parseISO(expiryDate),
    startOfDay(today),
  );
  if (daysRemaining < 0) return 0;
  return Math.max(0, 100 - daysRemaining * 10);
};

/** Average urgency of the earliest usable lot for each owned recipe ingredient. */
export function calculateExpiryPriorityScore(
  recipe: Recipe,
  inventory: InventoryItem[],
  today = new Date(),
) {
  const scores = recipe.ingredients.flatMap((ingredient) => {
    const earliest = inventory
      .filter(
        (item) =>
          item.ingredientId === ingredient.ingredientId &&
          isUsable(item.expiryDate, today),
      )
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))[0];
    return earliest
      ? [calculateIngredientExpiryScore(earliest.expiryDate, today)]
      : [];
  });
  return scores.length === 0
    ? 0
    : roundScore(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/** 100 for diet + health, 80 for either one, and 60 when still suitable. */
export function calculatePreferenceScore(recipe: Recipe, profile: Profile) {
  const dietMatches = isDietCompatible(recipe, profile.dietaryPreference);
  const healthMatches =
    profile.healthGoal !== "No specific goal" &&
    (recipe.healthGoals ?? []).some(
      (goal) => goal.toLowerCase() === profile.healthGoal.toLowerCase(),
    );
  if (dietMatches && healthMatches) return 100;
  if (dietMatches || healthMatches) return 80;
  return 60;
}

export function calculateRecipeScore(
  expiryPriorityScore: number,
  quantityMatchScore: number,
  preferenceScore: number,
) {
  const expiryPriorityPoints = roundScore(
    expiryPriorityScore * RECIPE_SCORE_WEIGHTS.expiryPriority,
  );
  const quantityMatchPoints = roundScore(
    quantityMatchScore * RECIPE_SCORE_WEIGHTS.quantityMatch,
  );
  const preferencePoints = roundScore(
    preferenceScore * RECIPE_SCORE_WEIGHTS.preference,
  );
  return {
    expiryPriorityPoints,
    quantityMatchPoints,
    preferencePoints,
    score: roundScore(
      expiryPriorityPoints + quantityMatchPoints + preferencePoints,
    ),
  };
}

export const rankRecipes = (items: RecipeAnalysis[]) =>
  [...items].sort(
    (a, b) => b.score - a.score || a.recipe.name.localeCompare(b.recipe.name),
  );
