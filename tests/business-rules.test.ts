import { describe, expect, it } from "vitest";
import { normaliseAllergy, validateNewAllergy } from "@/lib/business/allergies";
import { estimateExpiry, getExpiryStatus } from "@/lib/business/expiry";
import {
  calculateMatch,
  calculateMissingIngredients,
} from "@/lib/business/matching";
import {
  calculateExpiryPriorityScore,
  calculateIngredientExpiryScore,
  calculatePreferenceScore,
  calculateRecipeScore,
} from "@/lib/business/ranking";
import { calculateDeduction } from "@/lib/business/deduction";
import { filterRecipes, recipeAllergens } from "@/lib/business/filtering";
import { demoInventory, recipes } from "@/lib/demo-data";
import { classifyThaiRecipe, thaiRecipes } from "@/lib/thai-recipes";
import type { InventoryItem, Recipe } from "@/lib/types";

const today = new Date("2026-08-05T12:00:00Z");
const baseInventory: InventoryItem[] = [
  {
    id: "1",
    ingredientId: "rice",
    name: "Rice",
    category: "Grains",
    quantity: 500,
    unit: "g",
    storageLocation: "Pantry",
    addedDate: "2026-08-01",
    expiryDate: "2026-09-01",
    expirySource: "entered",
  },
];
const basic: Recipe = {
  id: "r",
  name: "Rice meal",
  description: "",
  instructions: [],
  preparationTime: 10,
  difficulty: "Easy",
  defaultServings: 2,
  dietaryCategory: "Vegan",
  emoji: "🍚",
  ingredients: [
    { ingredientId: "rice", name: "Rice", requiredQuantity: 200, unit: "g" },
    {
      ingredientId: "carrot",
      name: "Carrot",
      requiredQuantity: 100,
      unit: "g",
    },
  ],
};

describe("allergy management", () => {
  it("normalises case and whitespace", () =>
    expect(normaliseAllergy("  Tree   NUTS ")).toBe("tree nuts"));
  it("rejects blank values", () =>
    expect(validateNewAllergy("  ", []).ok).toBe(false));
  it("rejects normalised duplicates", () =>
    expect(validateNewAllergy(" peanuts ", ["Peanuts"]).ok).toBe(false));
});
describe("expiry", () => {
  it("classifies expired, today, soon and fresh", () => {
    expect(getExpiryStatus("2026-08-04", today).status).toBe("expired");
    expect(getExpiryStatus("2026-08-05", today).status).toBe("today");
    expect(getExpiryStatus("2026-08-08", today).status).toBe("soon");
    expect(getExpiryStatus("2026-08-09", today).status).toBe("fresh");
  });
  it("estimates using category and location", () =>
    expect(estimateExpiry("2026-08-01", "Meat", "Refrigerator")).toBe(
      "2026-08-03",
    ));
});
describe("recipe matching", () => {
  it("returns a partial match", () =>
    expect(calculateMatch(basic, baseInventory, today)).toMatchObject({
      percentage: 50,
      availableCount: 1,
      totalRequired: 2,
    }));
  it("returns 100% match", () =>
    expect(
      calculateMatch(
        { ...basic, ingredients: [basic.ingredients[0]] },
        baseInventory,
        today,
      ).percentage,
    ).toBe(100));
  it("returns 0% match", () =>
    expect(calculateMatch(basic, [], today).percentage).toBe(0));
  it("ignores optional ingredients in denominator", () =>
    expect(
      calculateMatch(
        {
          ...basic,
          ingredients: [
            basic.ingredients[0],
            { ...basic.ingredients[1], isOptional: true },
          ],
        },
        baseInventory,
        today,
      ),
    ).toMatchObject({ percentage: 100, totalRequired: 1 }));
  it("does not count expired inventory", () =>
    expect(
      calculateMatch(
        { ...basic, ingredients: [basic.ingredients[0]] },
        [{ ...baseInventory[0], expiryDate: "2026-08-04" }],
        today,
      ).percentage,
    ).toBe(0));
  it("defines recipes with no required ingredients as 100%", () =>
    expect(
      calculateMatch({ ...basic, ingredients: [] }, [], today),
    ).toMatchObject({ percentage: 100, totalRequired: 0 }));
  it("returns missing ingredient details", () =>
    expect(
      calculateMissingIngredients(basic, baseInventory, today).map(
        (x) => x.name,
      ),
    ).toEqual(["Carrot"]));
});
describe("filtering", () => {
  it("excludes every imported peanut recipe for Alex", () => {
    expect(
      recipes.some((recipe) => recipeAllergens(recipe).includes("Peanuts")),
    ).toBe(true);
    expect(
      filterRecipes(recipes, ["Peanuts"], "No restriction").some((recipe) =>
        recipeAllergens(recipe).includes("Peanuts"),
      ),
    ).toBe(false);
  });
  it("applies vegetarian filtering", () => {
    const candidates: Recipe[] = [
      { ...basic, id: "vegan", dietaryCategory: "Vegan" },
      { ...basic, id: "meat", dietaryCategory: "No restriction" },
    ];
    expect(
      filterRecipes(candidates, [], "Vegetarian").every((r) =>
        ["Vegetarian", "Vegan"].includes(r.dietaryCategory),
      ),
    ).toBe(true);
  });
  it("excludes recipes that are not verified halal", () => {
    const candidates: Recipe[] = [
      { ...basic, id: "unverified", dietaryCategory: "No restriction" },
      { ...basic, id: "halal", dietaryCategory: "Halal" },
      { ...basic, id: "vegan", dietaryCategory: "Vegan" },
    ];
    const shown = filterRecipes(candidates, [], "No restriction", "Halal");
    expect(shown.map((recipe) => recipe.id)).toEqual(["halal", "vegan"]);
  });
  it("applies the same rule to the Halal dietary preference", () => {
    const candidates: Recipe[] = [
      { ...basic, id: "unverified", dietaryCategory: "No restriction" },
      { ...basic, id: "halal", dietaryCategory: "Halal" },
    ];
    expect(
      filterRecipes(candidates, [], "Halal").map((recipe) => recipe.id),
    ).toEqual(["halal"]);
  });
});
describe("ranking", () => {
  it("scores expiry urgency in ten-point daily steps", () => {
    expect(calculateIngredientExpiryScore("2026-08-05", today)).toBe(100);
    expect(calculateIngredientExpiryScore("2026-08-06", today)).toBe(90);
    expect(calculateIngredientExpiryScore("2026-08-15", today)).toBe(0);
    expect(calculateIngredientExpiryScore("2026-08-04", today)).toBe(0);
  });
  it("averages the earliest usable recipe inventory", () => {
    const recipe = {
      ...basic,
      ingredients: [
        basic.ingredients[0],
        { ...basic.ingredients[1], ingredientId: "egg" },
      ],
    };
    const inventory = [
      { ...baseInventory[0], expiryDate: "2026-08-06" },
      {
        ...baseInventory[0],
        id: "2",
        ingredientId: "egg",
        name: "Egg",
        unit: "pieces" as const,
        quantity: 4,
        expiryDate: "2026-08-08",
      },
    ];
    expect(calculateExpiryPriorityScore(recipe, inventory, today)).toBe(80);
  });
  it("reproduces the documented 72 point example", () =>
    expect(calculateRecipeScore(80, 66.67, 60)).toEqual({
      expiryPriorityPoints: 40,
      quantityMatchPoints: 20,
      preferencePoints: 12,
      score: 72,
    }));
  it("scores matching diet and health goals", () =>
    expect(
      calculatePreferenceScore(
        { ...basic, healthGoals: ["Balanced diet"] },
        {
          displayName: "Alex",
          dietaryPreference: "Vegan",
          healthGoal: "Balanced diet",
          setupCompleted: true,
          allergies: [],
        },
      ),
    ).toBe(100));
  it("sorts are based on the weighted total", () =>
    expect(calculateRecipeScore(90, 30, 80).score).toBeGreaterThan(
      calculateRecipeScore(20, 100, 100).score,
    ));
});
describe("inventory deduction", () => {
  it("deducts sufficient inventory", () =>
    expect(
      calculateDeduction(
        { ...basic, ingredients: [basic.ingredients[0]] },
        baseInventory,
        2,
      ),
    ).toMatchObject({ ok: true, inventory: [{ quantity: 300 }] }));
  it("rejects insufficient inventory without mutation", () => {
    const result = calculateDeduction(
      {
        ...basic,
        ingredients: [{ ...basic.ingredients[0], requiredQuantity: 600 }],
      },
      baseInventory,
      2,
    );
    expect(result.ok).toBe(false);
    expect(result.inventory[0].quantity).toBe(500);
  });
  it("removes a zero-balance record", () =>
    expect(
      calculateDeduction(
        {
          ...basic,
          ingredients: [{ ...basic.ingredients[0], requiredQuantity: 500 }],
        },
        baseInventory,
        2,
      ).inventory,
    ).toHaveLength(0));
  it("deducts multiple ingredients", () => {
    const inv = [
      ...baseInventory,
      {
        ...baseInventory[0],
        id: "2",
        ingredientId: "carrot",
        name: "Carrot",
        quantity: 100,
      },
    ];
    expect(calculateDeduction(basic, inv, 2).inventory).toMatchObject([
      { quantity: 300 },
    ]);
  });
  it("scales servings", () =>
    expect(
      calculateDeduction(
        { ...basic, ingredients: [basic.ingredients[0]] },
        baseInventory,
        4,
      ).inventory[0].quantity,
    ).toBe(100));
  it("prevents partial updates when one item is short", () => {
    const inv = [
      ...baseInventory,
      {
        ...baseInventory[0],
        id: "2",
        ingredientId: "carrot",
        name: "Carrot",
        quantity: 50,
      },
    ];
    const result = calculateDeduction(basic, inv, 2);
    expect(result.ok).toBe(false);
    expect(result.inventory).toEqual(inv);
  });
});

describe("realistic demo fixture", () => {
  it("imports all 159 Thai recipes", () =>
    expect(thaiRecipes).toHaveLength(159));
  it("uses only imported Thai recipes in the active catalogue", () => {
    expect(recipes).toHaveLength(159);
    expect(recipes.every((recipe) => recipe.source?.dataset)).toBe(true);
  });
  it("machine-classifies every imported recipe with a reason", () =>
    expect(
      thaiRecipes.every(
        (recipe) =>
          recipe.source?.reviewStatus === "machine-classified" &&
          recipe.source.classificationReasons?.length,
      ),
    ).toBe(true));
  it("classifies the structured catalogue across dietary groups", () => {
    const counts = thaiRecipes.reduce<Record<string, number>>(
      (result, recipe) => {
        result[recipe.dietaryCategory] =
          (result[recipe.dietaryCategory] ?? 0) + 1;
        return result;
      },
      {},
    );
    expect(counts).toEqual({
      "No restriction": 84,
      Pescatarian: 43,
      Vegetarian: 7,
      Other: 9,
      Vegan: 16,
    });
  });
  it("uses machine classifications for restrictive diets", () => {
    const vegan = filterRecipes(thaiRecipes, [], "Vegan");
    const halal = filterRecipes(thaiRecipes, [], "Halal");
    expect(vegan).toHaveLength(16);
    expect(vegan.every((recipe) => recipe.dietaryCategory === "Vegan")).toBe(
      true,
    );
    expect(
      halal.every(
        (recipe) => recipe.source?.halalCompatibility === "compatible",
      ),
    ).toBe(true);
  });
  it("produces recommendations from seeded inventory", () =>
    expect(
      filterRecipes(recipes, ["Peanuts"], "No restriction").length,
    ).toBeGreaterThan(100));
  it("maps at least one Thai recipe ingredient to seeded inventory", () =>
    expect(
      recipes.some((r) => calculateMatch(r, demoInventory).percentage > 0),
    ).toBe(true));
});

describe("Thai dietary classification", () => {
  const recipeText = (ingredient: string) =>
    `# ทดสอบ\n## เครื่องปรุง\n- ${ingredient}\n## วิธีทำ\nปรุงให้สุก`;

  it("classifies plant-only ingredients as vegan", () =>
    expect(classifyThaiRecipe(recipeText("เต้าหู้ 100 กรัม")).category).toBe(
      "Vegan",
    ));
  it("classifies eggs and dairy as vegetarian", () =>
    expect(classifyThaiRecipe(recipeText("ไข่ไก่ 2 ฟอง")).category).toBe(
      "Vegetarian",
    ));
  it("classifies seafood as pescatarian", () =>
    expect(classifyThaiRecipe(recipeText("น้ำปลา 1 ช้อนโต๊ะ")).category).toBe(
      "Pescatarian",
    ));
  it("marks pork as unrestricted and Halal-incompatible", () =>
    expect(classifyThaiRecipe(recipeText("เนื้อหมู 200 กรัม"))).toMatchObject({
      category: "No restriction",
      halalCompatibility: "incompatible",
    }));
  it("leaves recipes without structured ingredients for review", () =>
    expect(classifyThaiRecipe("# หมายเหตุทั่วไป")).toMatchObject({
      category: "Other",
      halalCompatibility: "needs-review",
    }));
});
