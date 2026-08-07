import { z } from "zod";

export const inventorySchema = z
  .object({
    ingredientId: z.string().min(1, "กรุณาเลือกวัตถุดิบ"),
    quantity: z.coerce.number().positive("ปริมาณต้องมากกว่าศูนย์"),
    unit: z.enum(["g", "kg", "ml", "L", "pieces", "packs", "cans"]),
    storageLocation: z.enum(["Refrigerator", "Freezer", "Pantry"]),
    addedDate: z.string().min(1, "กรุณาระบุวันที่เพิ่มวัตถุดิบ"),
    expiryDate: z.string().optional(),
    notes: z.string().max(300).optional(),
  })
  .refine((data) => !data.expiryDate || data.expiryDate >= data.addedDate, {
    message: "วันหมดอายุต้องไม่อยู่ก่อนวันที่เพิ่มวัตถุดิบ",
    path: ["expiryDate"],
  });
