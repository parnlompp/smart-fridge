import type {
  DietaryPreference,
  ExpiryStatus,
  StorageLocation,
  Unit,
} from "@/lib/types";

export const dietLabel: Record<DietaryPreference, string> = {
  "No restriction": "ไม่จำกัดอาหาร",
  Vegetarian: "มังสวิรัติ",
  Vegan: "วีแกน",
  Pescatarian: "มังสวิรัติแบบรับประทานปลา",
  Halal: "ฮาลาล",
  Other: "อื่น ๆ / รอตรวจสอบ",
};

export const healthGoalLabel: Record<string, string> = {
  "Balanced diet": "รับประทานอาหารสมดุล",
  "High protein": "โปรตีนสูง",
  "Lower calorie": "แคลอรีต่ำ",
  "Reduce sugar": "ลดน้ำตาล",
  "No specific goal": "ไม่มีเป้าหมายเฉพาะ",
};

export const storageLabel: Record<StorageLocation, string> = {
  Refrigerator: "ตู้เย็น",
  Freezer: "ช่องแช่แข็ง",
  Pantry: "ตู้เก็บอาหาร",
};

export const unitLabel: Record<Unit, string> = {
  g: "กรัม",
  kg: "กิโลกรัม",
  ml: "มิลลิลิตร",
  L: "ลิตร",
  pieces: "ชิ้น",
  packs: "แพ็ก",
  cans: "กระป๋อง",
};

export const expiryLabel: Record<ExpiryStatus, string> = {
  expired: "หมดอายุแล้ว",
  today: "หมดอายุวันนี้",
  soon: "ใกล้หมดอายุ",
  fresh: "ยังสดใหม่",
};

export const difficultyLabel = { Easy: "ง่าย", Medium: "ปานกลาง" } as const;

export const allergenLabel: Record<string, string> = {
  Peanuts: "ถั่วลิสง",
  "Tree nuts": "ถั่วเปลือกแข็ง",
  Milk: "นม",
  Eggs: "ไข่",
  Soy: "ถั่วเหลือง",
  Wheat: "ข้าวสาลี",
  Fish: "ปลา",
  Shellfish: "สัตว์น้ำมีเปลือก",
  Sesame: "งา",
};

export const categoryLabel: Record<string, string> = {
  Meat: "เนื้อสัตว์",
  Seafood: "อาหารทะเล",
  Dairy: "นมและผลิตภัณฑ์จากนม",
  Vegetables: "ผัก",
  Fruits: "ผลไม้",
  Grains: "ธัญพืช",
  Condiments: "เครื่องปรุง",
  "Frozen food": "อาหารแช่แข็ง",
  Other: "อื่น ๆ",
};
