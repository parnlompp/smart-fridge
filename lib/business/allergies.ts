export const normaliseAllergy = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export function validateNewAllergy(
  value: string,
  existing: string[],
): { ok: true; value: string } | { ok: false; error: string } {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return { ok: false, error: "Enter an allergy name." };
  if (
    existing.some(
      (item) => normaliseAllergy(item) === normaliseAllergy(cleaned),
    )
  ) {
    return { ok: false, error: "That allergy has already been added." };
  }
  return { ok: true, value: cleaned };
}

export const hasAllergenConflict = (
  recipeAllergens: string[],
  userAllergies: string[],
) => {
  const user = new Set(userAllergies.map(normaliseAllergy));
  return recipeAllergens.some((allergen) =>
    user.has(normaliseAllergy(allergen)),
  );
};
