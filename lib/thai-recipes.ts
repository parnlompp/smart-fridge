import thaiFoodRows from "@/data/thai-food-v1.json";
import type {
  DietaryPreference,
  Recipe,
  RecipeIngredient,
  Unit,
} from "@/lib/types";

interface ThaiFoodRow {
  rowIndex: number;
  name: string;
  text: string;
}

const allergenRules: Array<[RegExp, string]> = [
  [/ถั่วลิสง/, "Peanuts"],
  [/นม|เนย|ชีส/, "Milk"],
  [/ไข่/, "Eggs"],
  [/ซีอิ๊ว|ซีอิ้ว|เต้าเจี้ยว|ถั่วเหลือง/, "Soy"],
  [/แป้งสาลี|ขนมปัง|บะหมี่/, "Wheat"],
  [/ปลา/, "Fish"],
  [/กุ้ง|ปู|หอย/, "Shellfish"],
  [/งา/, "Sesame"],
];

const unitRules: Array<[RegExp, Unit]> = [
  [/กิโลกรัม|กก\./, "kg"],
  [/กรัม/, "g"],
  [/มิลลิลิตร|มล\./, "ml"],
  [/ลิตร/, "L"],
  [/กระป๋อง/, "cans"],
  [/ห่อ|ถุง|แพ็ค/, "packs"],
];

// Connect common Thai ingredient spellings to the selectable fridge inventory.
// Anything unknown keeps a stable Thai-specific ID and can be normalized later.
const inventoryIngredientRules: Array<[RegExp, string]> = [
  [/อกไก่|เนื้อไก่|ไก่/, "chicken"],
  [/บรอกโคลี/, "broccoli"],
  [/แครอท|หัวแครอท/, "carrot"],
  [/เห็ด/, "mushroom"],
  [/ไข่(?:ไก่|เป็ด|จืด)?(?:\s|$)/, "egg"],
  [/มะเขือเทศ/, "tomato"],
  [/พาสต้า|มักกะโรนี/, "pasta"],
  [/ข้าวสวย|ข้าวสาร/, "rice"],
  [/ผักโขม/, "spinach"],
  [/เนยแข็ง|ชีส/, "cheese"],
  [/ขนมปัง/, "bread"],
  [/หอมใหญ่|หอมหัวใหญ่/, "onion"],
  [/นมสด/, "milk"],
  [/ถั่วลิสง/, "peanut"],
  [/เส้นบะหมี่|บะหมี่|เส้นก๋วยเตี๋ยว/, "noodle"],
  [/ซีอิ๊ว|ซีอิ้ว/, "soy"],
  [/น้ำมันพืช|น้ำมันสำหรับทอด/, "oil"],
  [/กระเทียม|กะเทียม/, "garlic"],
];

const prohibitedHalalPattern =
  /หมู|สุกร|เบคอน|แฮม|กุนเชียง|ไส้กรอก|น้ำมันหมู|มันหมู|เลือด|เหล้า|ไวน์|บรั่นดี|เบียร์|เหล้ารัม/;
const landAnimalPattern =
  /ไก่|เป็ด|ห่าน|นก|เนื้อโค|เนื้อวัว|เนื้อควาย|เนื้อแพะ|เนื้อแกะ|กบ|ตับ|เครื่องใน|กระดูก|เนื้อสัตว์|เนื้อตามชอบ|เนื้อที่จะ/;
const seafoodPattern = /ปลา|กุ้ง|ปู|หอย|ปลาหมึก|กะปิ|น้ำปลา|น้ำเคย|เคย|ไข่ปลา/;
const vegetarianPattern =
  /ไข่|นม(?!มะพร้าว)|เนย(?!ถั่ว)|ชีส|ครีม|โยเกิร์ต|น้ำผึ้ง/;

type ThaiDietClassification = {
  category: DietaryPreference;
  reasons: string[];
  halalCompatibility: "compatible" | "incompatible" | "needs-review";
};

export function classifyThaiRecipe(text: string): ThaiDietClassification {
  const ingredientSection = text.match(
    /##\s*เครื่องปรุง([\s\S]*?)(?:##\s*วิธีทำ|$)/,
  )?.[1];
  if (!ingredientSection) {
    return {
      category: "Other",
      reasons: ["ไม่พบรายการเครื่องปรุงที่มีโครงสร้าง"],
      halalCompatibility: "needs-review",
    };
  }

  const hasProhibitedHalalIngredient =
    prohibitedHalalPattern.test(ingredientSection);
  const landAnimalText = ingredientSection.replace(
    /ไข่(?:ไก่|เป็ด|นกกระทา)/g,
    "ไข่",
  );
  const hasLandAnimal =
    hasProhibitedHalalIngredient || landAnimalPattern.test(landAnimalText);
  const hasSeafood = seafoodPattern.test(ingredientSection);
  const hasEggDairyOrHoney = vegetarianPattern.test(ingredientSection);

  let category: DietaryPreference = "Vegan";
  const reasons: string[] = [];
  if (hasLandAnimal) {
    category = "No restriction";
    reasons.push("พบเนื้อสัตว์บกหรือส่วนประกอบจากสัตว์");
  } else if (hasSeafood) {
    category = "Pescatarian";
    reasons.push("พบปลาหรืออาหารทะเล แต่ไม่พบเนื้อสัตว์บก");
  } else if (hasEggDairyOrHoney) {
    category = "Vegetarian";
    reasons.push("พบไข่ นม เนย หรือผลิตภัณฑ์จากสัตว์ที่ไม่ใช่เนื้อ");
  } else {
    reasons.push("ไม่พบเนื้อสัตว์ อาหารทะเล ไข่ นม หรือน้ำผึ้ง");
  }

  return {
    category,
    reasons,
    halalCompatibility: hasProhibitedHalalIngredient
      ? "incompatible"
      : hasLandAnimal
        ? "needs-review"
        : "compatible",
  };
}

const numericValue = (line: string) => {
  const mixed = line.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = line.match(/(\d+)\/(\d+)/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const number = line.match(/\d+(?:\.\d+)?/);
  return number ? Number(number[0]) : 1;
};

const ingredientName = (line: string) =>
  line
    .replace(/^[-•]\s*/, "")
    .split(/\s+\d/)[0]
    .replace(/\s+/g, " ")
    .trim();

const ingredientId = (name: string) =>
  `thai:${name.normalize("NFKC").toLocaleLowerCase("th-TH").replace(/\s+/g, "-")}`;

function parseIngredients(text: string, rowIndex: number): RecipeIngredient[] {
  const section = text.match(
    /##\s*เครื่องปรุง([\s\S]*?)(?:##\s*วิธีทำ|$)/,
  )?.[1];
  const lines = section
    ?.split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-•]\s*\S/.test(line));

  if (!lines?.length) {
    return [
      {
        ingredientId: `thai:unparsed:${rowIndex}`,
        name: "ส่วนผสมรอตรวจสอบ",
        requiredQuantity: 1,
        unit: "pieces",
      },
    ];
  }

  const seen = new Set<string>();
  return lines.flatMap((line) => {
    const name = ingredientName(line) || line.replace(/^[-•]\s*/, "").trim();
    const id =
      inventoryIngredientRules.find(([pattern]) => pattern.test(name))?.[1] ??
      ingredientId(name);
    if (seen.has(id)) return [];
    seen.add(id);
    const unit =
      unitRules.find(([pattern]) => pattern.test(line))?.[1] ?? "pieces";
    const allergens = allergenRules
      .filter(([pattern]) => pattern.test(line))
      .map(([, allergen]) => allergen);
    return [
      {
        ingredientId: id,
        name,
        requiredQuantity: numericValue(line),
        unit,
        allergens: allergens.length ? allergens : undefined,
      },
    ];
  });
}

function parseInstructions(text: string) {
  const method = text.match(/##\s*วิธีทำ([\s\S]*)/)?.[1]?.trim();
  if (!method) return ["รายละเอียดวิธีทำอยู่ระหว่างการตรวจสอบจากข้อมูลต้นฉบับ"];
  const steps = method
    .split(/\n{2,}|(?<=[.!?])\s+/)
    .map((step) => step.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
  return steps.length ? steps : [method];
}

export const thaiRecipes: Recipe[] = (thaiFoodRows as ThaiFoodRow[]).map(
  (row) => {
    const classification = classifyThaiRecipe(row.text);
    return {
      id: `thai-food-${row.rowIndex}`,
      name: row.name,
      description: "ตำรับอาหารไทยจากชุดข้อมูล PyThaiNLP thai_food_v1.0",
      instructions: parseInstructions(row.text),
      preparationTime: 30,
      difficulty: "Easy",
      defaultServings: 2,
      dietaryCategory: classification.category,
      emoji: "🍲",
      ingredients: parseIngredients(row.text, row.rowIndex),
      source: {
        dataset: "pythainlp/thai_food_v1.0",
        rowIndex: row.rowIndex,
        reviewStatus: "machine-classified",
        classificationReasons: classification.reasons,
        halalCompatibility: classification.halalCompatibility,
      },
    };
  },
);
