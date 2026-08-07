export const normaliseAllergy = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export function validateNewAllergy(
  value: string,
  existing: string[],
): { ok: true; value: string } | { ok: false; error: string } {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return { ok: false, error: "กรุณาระบุชื่ออาหารที่แพ้" };
  if (
    existing.some(
      (item) => normaliseAllergy(item) === normaliseAllergy(cleaned),
    )
  ) {
    return { ok: false, error: "เพิ่มรายการอาหารที่แพ้นี้ไว้แล้ว" };
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
