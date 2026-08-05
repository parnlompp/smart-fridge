import { z } from "zod";

export const inventorySchema = z
  .object({
    ingredientId: z.string().min(1, "Choose an ingredient."),
    quantity: z.coerce.number().positive("Quantity must be greater than zero."),
    unit: z.enum(["g", "kg", "ml", "L", "pieces", "packs", "cans"]),
    storageLocation: z.enum(["Refrigerator", "Freezer", "Pantry"]),
    addedDate: z.string().min(1, "Added date is required."),
    expiryDate: z.string().optional(),
    notes: z.string().max(300).optional(),
  })
  .refine((data) => !data.expiryDate || data.expiryDate >= data.addedDate, {
    message: "Expiry date cannot be earlier than the added date.",
    path: ["expiryDate"],
  });
