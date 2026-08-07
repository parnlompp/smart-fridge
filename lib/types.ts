export type ExpirySource = "entered" | "estimated";
export type ExpiryStatus = "expired" | "today" | "soon" | "fresh";
export type StorageLocation = "Refrigerator" | "Freezer" | "Pantry";
export type Unit = "g" | "kg" | "ml" | "L" | "pieces" | "packs" | "cans";
export type DietaryPreference =
  "No restriction" | "Vegetarian" | "Vegan" | "Pescatarian" | "Halal" | "Other";

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  allergens?: string[];
}
export interface InventoryItem {
  id: string;
  ingredientId: string;
  name: string;
  category: string;
  quantity: number;
  unit: Unit;
  storageLocation: StorageLocation;
  addedDate: string;
  expiryDate: string;
  expirySource: ExpirySource;
  notes?: string;
}
export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  requiredQuantity: number;
  unit: Unit;
  isOptional?: boolean;
  allergens?: string[];
}
export interface Recipe {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  preparationTime: number;
  difficulty: "Easy" | "Medium";
  defaultServings: number;
  dietaryCategory: DietaryPreference | "Vegetarian";
  healthGoals?: string[];
  emoji: string;
  ingredients: RecipeIngredient[];
  source?: {
    dataset: string;
    rowIndex: number;
    reviewStatus: "unreviewed" | "machine-classified" | "reviewed";
    classificationReasons?: string[];
    halalCompatibility?: "compatible" | "incompatible" | "needs-review";
  };
}
export interface Profile {
  displayName: string;
  dietaryPreference: DietaryPreference;
  healthGoal: string;
  religiousRestriction?: string;
  setupCompleted: boolean;
  allergies: string[];
}
export interface ShoppingItem {
  id: string;
  ingredientId?: string;
  name: string;
  quantity: number;
  unit: Unit;
  relatedRecipeId?: string;
  isPurchased: boolean;
}
export interface HistoryItem {
  id: string;
  recipeId: string;
  recipeName: string;
  cookedAt: string;
  servings: number;
  summary: Record<string, number>;
}
export interface RecipeAnalysis {
  recipe: Recipe;
  percentage: number;
  availableCount: number;
  totalRequired: number;
  missing: RecipeIngredient[];
  nearExpiry: RecipeIngredient[];
  expiryPriorityScore: number;
  quantityMatchScore: number;
  preferenceScore: number;
  expiryPriorityPoints: number;
  quantityMatchPoints: number;
  preferencePoints: number;
  score: number;
}
