import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = resolve(root, "data", "thai-food-v1.json");
const outputPath = resolve(
  root,
  "supabase",
  "migrations",
  "004_import_thai_recipes.sql",
);
const classificationOutputPath = resolve(
  root,
  "supabase",
  "migrations",
  "005_classify_thai_recipes.sql",
);

const rows = JSON.parse(await readFile(inputPath, "utf8"));
if (!Array.isArray(rows) || rows.length !== 159) {
  throw new Error(`Expected 159 Thai recipes, received ${rows.length}`);
}

const allergenRules = [
  [/ถั่วลิสง/, "Peanuts"],
  [/นม|เนย|ชีส/, "Milk"],
  [/ไข่/, "Eggs"],
  [/ซีอิ๊ว|ซีอิ้ว|เต้าเจี้ยว|ถั่วเหลือง/, "Soy"],
  [/แป้งสาลี|ขนมปัง|บะหมี่/, "Wheat"],
  [/ปลา/, "Fish"],
  [/กุ้ง|ปู|หอย/, "Shellfish"],
  [/งา/, "Sesame"],
];

const unitRules = [
  [/กิโลกรัม|กก\./, "kg"],
  [/กรัม/, "g"],
  [/มิลลิลิตร|มล\./, "ml"],
  [/ลิตร/, "L"],
  [/กระป๋อง/, "cans"],
  [/ห่อ|ถุง|แพ็ค/, "packs"],
];

const canonicalIngredients = [
  [/อกไก่|เนื้อไก่|ไก่/, "Chicken breast", "Meat"],
  [/บรอกโคลี/, "Broccoli", "Vegetables"],
  [/แครอท|หัวแครอท/, "Carrot", "Vegetables"],
  [/เห็ด/, "Mushroom", "Vegetables"],
  [/ไข่(?:ไก่|เป็ด|จืด)?(?:\s|$)/, "Eggs", "Dairy"],
  [/มะเขือเทศ/, "Tomato", "Vegetables"],
  [/พาสต้า|มักกะโรนี/, "Pasta", "Grains"],
  [/ข้าวสวย|ข้าวสาร/, "Rice", "Grains"],
  [/ผักโขม/, "Spinach", "Vegetables"],
  [/เนยแข็ง|ชีส/, "Cheese", "Dairy"],
  [/ขนมปัง/, "Bread", "Grains"],
  [/หอมใหญ่|หอมหัวใหญ่/, "Onion", "Vegetables"],
  [/นมสด/, "Milk", "Dairy"],
  [/ถั่วลิสง/, "Peanut butter", "Condiments"],
  [/เส้นบะหมี่|บะหมี่|เส้นก๋วยเตี๋ยว/, "Noodles", "Grains"],
  [/ซีอิ๊ว|ซีอิ้ว/, "Soy sauce", "Condiments"],
  [/น้ำมันพืช|น้ำมันสำหรับทอด/, "Cooking oil", "Condiments"],
  [/กระเทียม|กะเทียม/, "Garlic", "Vegetables"],
];

const categoryRules = [
  [/กุ้ง|ปู|หอย|ปลา/, "Seafood"],
  [/ไก่|หมู|เนื้อ|เป็ด/, "Meat"],
  [/ไข่|นม|เนย|ชีส/, "Dairy"],
  [/ข้าว|แป้ง|เส้น|ขนมปัง/, "Grains"],
  [/น้ำมัน|น้ำปลา|ซีอิ๊ว|ซอส|น้ำตาล|เกลือ/, "Condiments"],
];

const prohibitedHalalPattern =
  /หมู|สุกร|เบคอน|แฮม|กุนเชียง|ไส้กรอก|น้ำมันหมู|มันหมู|เลือด|เหล้า|ไวน์|บรั่นดี|เบียร์|เหล้ารัม/;
const landAnimalPattern =
  /ไก่|เป็ด|ห่าน|นก|เนื้อโค|เนื้อวัว|เนื้อควาย|เนื้อแพะ|เนื้อแกะ|กบ|ตับ|เครื่องใน|กระดูก|เนื้อสัตว์|เนื้อตามชอบ|เนื้อที่จะ/;
const seafoodPattern = /ปลา|กุ้ง|ปู|หอย|ปลาหมึก|กะปิ|น้ำปลา|น้ำเคย|เคย|ไข่ปลา/;
const vegetarianPattern =
  /ไข่|นม(?!มะพร้าว)|เนย(?!ถั่ว)|ชีส|ครีม|โยเกิร์ต|น้ำผึ้ง/;

const numericValue = (line) => {
  const mixed = line.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = line.match(/(\d+)\/(\d+)/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const number = line.match(/\d+(?:\.\d+)?/);
  return number ? Number(number[0]) : 1;
};

const ingredientName = (line) =>
  line
    .replace(/^[-•]\s*/, "")
    .split(/\s+\d/)[0]
    .replace(/\s+/g, " ")
    .trim();

function parseIngredients(text, rowIndex) {
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
        key: `unparsed:${rowIndex}`,
        name: `ส่วนผสมรอตรวจสอบ ${rowIndex}`,
        category: "Other",
        requiredQuantity: 1,
        unit: "pieces",
        allergens: [],
      },
    ];
  }

  const seen = new Set();
  return lines.flatMap((line) => {
    const parsedName =
      ingredientName(line) || line.replace(/^[-•]\s*/, "").trim();
    const canonical = canonicalIngredients.find(([pattern]) =>
      pattern.test(parsedName),
    );
    const name = canonical?.[1] ?? parsedName;
    const key = name.normalize("NFKC").toLocaleLowerCase("th-TH");
    if (seen.has(key)) return [];
    seen.add(key);
    return [
      {
        key,
        name,
        category:
          canonical?.[2] ??
          categoryRules.find(([pattern]) => pattern.test(parsedName))?.[1] ??
          "Other",
        requiredQuantity: numericValue(line),
        unit:
          unitRules.find(([pattern]) => pattern.test(line))?.[1] ?? "pieces",
        allergens: allergenRules
          .filter(([pattern]) => pattern.test(line))
          .map(([, allergen]) => allergen),
      },
    ];
  });
}

function parseInstructions(text) {
  const method = text.match(/##\s*วิธีทำ([\s\S]*)/)?.[1]?.trim();
  if (!method) return ["รายละเอียดวิธีทำอยู่ระหว่างการตรวจสอบจากข้อมูลต้นฉบับ"];
  const steps = method
    .split(/\n{2,}|(?<=[.!?])\s+/)
    .map((step) => step.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
  return steps.length ? steps : [method];
}

function classifyThaiRecipe(text) {
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

  if (hasLandAnimal)
    return {
      category: "No restriction",
      reasons: ["พบเนื้อสัตว์บกหรือส่วนประกอบจากสัตว์"],
      halalCompatibility: hasProhibitedHalalIngredient
        ? "incompatible"
        : "needs-review",
    };
  if (hasSeafood)
    return {
      category: "Pescatarian",
      reasons: ["พบปลาหรืออาหารทะเล แต่ไม่พบเนื้อสัตว์บก"],
      halalCompatibility: "compatible",
    };
  if (hasEggDairyOrHoney)
    return {
      category: "Vegetarian",
      reasons: ["พบไข่ นม เนย หรือผลิตภัณฑ์จากสัตว์ที่ไม่ใช่เนื้อ"],
      halalCompatibility: "compatible",
    };
  return {
    category: "Vegan",
    reasons: ["ไม่พบเนื้อสัตว์ อาหารทะเล ไข่ นม หรือน้ำผึ้ง"],
    halalCompatibility: "compatible",
  };
}

const recipes = [];
const ingredientMap = new Map();
const links = [];
const recipeNameCounts = rows.reduce((counts, row) => {
  counts.set(row.name, (counts.get(row.name) ?? 0) + 1);
  return counts;
}, new Map());

for (const row of rows) {
  const parsedIngredients = parseIngredients(row.text, row.rowIndex);
  const classification = classifyThaiRecipe(row.text);
  recipes.push({
    source_row_index: row.rowIndex,
    name:
      recipeNameCounts.get(row.name) > 1
        ? `${row.name} (ตำรับ ${row.rowIndex})`
        : row.name,
    description: "ตำรับอาหารไทยจากชุดข้อมูล PyThaiNLP thai_food_v1.0",
    instructions: parseInstructions(row.text),
    preparation_time: 30,
    difficulty: "Easy",
    default_servings: 2,
    dietary_category: classification.category,
    health_goals: [],
    classification_reasons: classification.reasons,
    halal_compatibility: classification.halalCompatibility,
  });

  for (const ingredient of parsedIngredients) {
    const existing = ingredientMap.get(ingredient.key);
    ingredientMap.set(ingredient.key, {
      name: ingredient.name,
      category: ingredient.category,
      allergens: [
        ...new Set([...(existing?.allergens ?? []), ...ingredient.allergens]),
      ],
    });
    links.push({
      source_row_index: row.rowIndex,
      ingredient_name: ingredient.name,
      required_quantity: ingredient.requiredQuantity,
      unit: ingredient.unit,
      is_optional: false,
    });
  }
}

if (new Set(recipes.map((recipe) => recipe.source_row_index)).size !== 159) {
  throw new Error("Dataset row indexes must be unique");
}
if (new Set(recipes.map((recipe) => recipe.name)).size !== 159) {
  throw new Error("Recipe names must be unique for the current schema");
}

const ingredients = [...ingredientMap.values()].sort((a, b) =>
  a.name.localeCompare(b.name, "th"),
);
const json = (value) => JSON.stringify(value).replaceAll("$json$", "$ json $");
const legacyNames = [
  "Chicken & vegetable stir-fry",
  "Mushroom omelette",
  "Tomato pasta",
  "Vegetable fried rice",
  "Spinach & cheese sandwich",
  "Chicken rice bowl",
  "Silky carrot soup",
  "Egg fried rice",
  "Peanut noodle bowl",
  "Halal chicken rice bowl",
  "Halal tomato chicken pasta",
  "Halal egg vegetable rice",
];

const sql = `-- Generated by scripts/generate-thai-supabase-migration.mjs.
-- Source: pythainlp/thai_food_v1.0 (159 train rows).
-- Dietary labels are machine classifications and are not certifications.
begin;

alter table public.recipes
  add column if not exists source_dataset text,
  add column if not exists source_row_index integer,
  add column if not exists review_status text not null default 'unreviewed',
  add column if not exists classification_reasons text[] not null default '{}',
  add column if not exists halal_compatibility text not null default 'needs-review';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'recipes_review_status_check'
      and conrelid = 'public.recipes'::regclass
  ) then
    alter table public.recipes add constraint recipes_review_status_check
      check (review_status in ('unreviewed', 'machine-classified', 'verified', 'rejected'));
  end if;
end
$$;

alter table public.recipes
  drop constraint if exists recipes_halal_compatibility_check;
alter table public.recipes
  add constraint recipes_halal_compatibility_check
  check (halal_compatibility in ('compatible', 'incompatible', 'needs-review'));

create unique index if not exists recipes_source_row_unique
  on public.recipes(source_dataset, source_row_index)
  where source_dataset is not null and source_row_index is not null;

insert into public.allergies(name)
values ('Peanuts'),('Tree nuts'),('Milk'),('Eggs'),('Soy'),('Wheat'),('Fish'),('Shellfish'),('Sesame')
on conflict do nothing;

-- Preserve history even when its original recipe is later removed.
alter table public.cooking_history
  add column if not exists recipe_name_snapshot text,
  add column if not exists recipe_snapshot jsonb;

update public.cooking_history h
set
  recipe_name_snapshot = coalesce(h.recipe_name_snapshot, r.name),
  recipe_snapshot = coalesce(
    h.recipe_snapshot,
    jsonb_build_object(
      'name', r.name,
      'description', r.description,
      'instructions', r.instructions,
      'default_servings', r.default_servings,
      'dietary_category', r.dietary_category
    )
  )
from public.recipes r
where h.recipe_id = r.id;

alter table public.cooking_history
  drop constraint if exists cooking_history_recipe_id_fkey;
alter table public.cooking_history
  alter column recipe_id drop not null;
alter table public.cooking_history
  add constraint cooking_history_recipe_id_fkey
  foreign key (recipe_id) references public.recipes(id) on delete set null;

create or replace function public.snapshot_cooking_history_recipe()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.recipe_id is not null then
    select
      r.name,
      jsonb_build_object(
        'name', r.name,
        'description', r.description,
        'instructions', r.instructions,
        'default_servings', r.default_servings,
        'dietary_category', r.dietary_category
      )
    into new.recipe_name_snapshot, new.recipe_snapshot
    from public.recipes r
    where r.id = new.recipe_id;
  end if;
  return new;
end
$$;

drop trigger if exists snapshot_cooking_history_recipe
  on public.cooking_history;
create trigger snapshot_cooking_history_recipe
before insert or update of recipe_id on public.cooking_history
for each row execute function public.snapshot_cooking_history_recipe();

delete from public.recipes
where name = any(array[${legacyNames.map((name) => `'${name.replaceAll("'", "''")}'`).join(",")}]);

with payload as (
  select *
  from jsonb_to_recordset($json$${json(ingredients)}$json$::jsonb)
    as x(name text, category text, allergens jsonb)
)
insert into public.ingredients(name, category)
select name, category from payload
on conflict (normalized_name) do update set category = excluded.category;

with payload as (
  select *
  from jsonb_to_recordset($json$${json(ingredients)}$json$::jsonb)
    as x(name text, category text, allergens jsonb)
)
update public.ingredients i
set allergen_ids = coalesce((
  select array_agg(distinct a.id)
  from jsonb_array_elements_text(payload.allergens) allergen(name)
  join public.allergies a on a.normalized_name = lower(trim(allergen.name))
), '{}')
from payload
where i.normalized_name = lower(trim(payload.name));

with payload as (
  select *
  from jsonb_to_recordset($json$${json(recipes)}$json$::jsonb)
    as x(
      source_row_index integer,
      name text,
      description text,
      instructions jsonb,
      preparation_time integer,
      difficulty text,
      default_servings integer,
      dietary_category public.dietary_preference,
      health_goals text[],
      classification_reasons text[],
      halal_compatibility text
    )
)
insert into public.recipes(
  name, description, instructions, preparation_time, difficulty,
  default_servings, dietary_category, health_goals,
  source_dataset, source_row_index, review_status,
  classification_reasons, halal_compatibility
)
select
  name, description, instructions, preparation_time, difficulty,
  default_servings, dietary_category, health_goals,
  'pythainlp/thai_food_v1.0', source_row_index, 'machine-classified',
  classification_reasons, halal_compatibility
from payload
on conflict (name) do update set
  description = excluded.description,
  instructions = excluded.instructions,
  preparation_time = excluded.preparation_time,
  difficulty = excluded.difficulty,
  default_servings = excluded.default_servings,
  dietary_category = excluded.dietary_category,
  health_goals = excluded.health_goals,
  source_dataset = excluded.source_dataset,
  source_row_index = excluded.source_row_index,
  review_status = excluded.review_status,
  classification_reasons = excluded.classification_reasons,
  halal_compatibility = excluded.halal_compatibility;

delete from public.recipe_ingredients ri
using public.recipes r
where ri.recipe_id = r.id
  and r.source_dataset = 'pythainlp/thai_food_v1.0';

with payload as (
  select *
  from jsonb_to_recordset($json$${json(links)}$json$::jsonb)
    as x(
      source_row_index integer,
      ingredient_name text,
      required_quantity numeric,
      unit text,
      is_optional boolean
    )
)
insert into public.recipe_ingredients(
  recipe_id, ingredient_id, required_quantity, unit, is_optional
)
select
  r.id, i.id, payload.required_quantity, payload.unit, payload.is_optional
from payload
join public.recipes r
  on r.source_dataset = 'pythainlp/thai_food_v1.0'
 and r.source_row_index = payload.source_row_index
join public.ingredients i
  on i.normalized_name = lower(trim(payload.ingredient_name))
on conflict (recipe_id, ingredient_id) do update set
  required_quantity = excluded.required_quantity,
  unit = excluded.unit,
  is_optional = excluded.is_optional;

do $$
declare
  recipe_count integer;
begin
  select count(*) into recipe_count
  from public.recipes
  where source_dataset = 'pythainlp/thai_food_v1.0';
  if recipe_count <> 159 then
    raise exception 'Expected 159 imported Thai recipes, found %', recipe_count;
  end if;
end
$$;

commit;
`;

const classifications = recipes.map((recipe) => ({
  source_row_index: recipe.source_row_index,
  dietary_category: recipe.dietary_category,
  classification_reasons: recipe.classification_reasons,
  halal_compatibility: recipe.halal_compatibility,
}));

const classificationSql = `-- Generated by scripts/generate-thai-supabase-migration.mjs.
-- Backfills machine dietary classifications when migration 004 was already applied.
begin;

alter table public.recipes
  add column if not exists classification_reasons text[] not null default '{}',
  add column if not exists halal_compatibility text not null default 'needs-review';

alter table public.recipes
  drop constraint if exists recipes_review_status_check;
alter table public.recipes
  add constraint recipes_review_status_check
  check (review_status in ('unreviewed', 'machine-classified', 'verified', 'rejected'));

alter table public.recipes
  drop constraint if exists recipes_halal_compatibility_check;
alter table public.recipes
  add constraint recipes_halal_compatibility_check
  check (halal_compatibility in ('compatible', 'incompatible', 'needs-review'));

with payload as (
  select *
  from jsonb_to_recordset($json$${json(classifications)}$json$::jsonb)
    as x(
      source_row_index integer,
      dietary_category public.dietary_preference,
      classification_reasons text[],
      halal_compatibility text
    )
)
update public.recipes r
set
  dietary_category = payload.dietary_category,
  review_status = 'machine-classified',
  classification_reasons = payload.classification_reasons,
  halal_compatibility = payload.halal_compatibility
from payload
where r.source_dataset = 'pythainlp/thai_food_v1.0'
  and r.source_row_index = payload.source_row_index;

do $$
declare
  classified_count integer;
begin
  select count(*) into classified_count
  from public.recipes
  where source_dataset = 'pythainlp/thai_food_v1.0'
    and review_status = 'machine-classified';
  if classified_count <> 159 then
    raise exception 'Expected 159 machine-classified Thai recipes, found %', classified_count;
  end if;
end
$$;

commit;
`;

await writeFile(outputPath, sql, "utf8");
await writeFile(classificationOutputPath, classificationSql, "utf8");
console.log(
  `Generated Supabase migrations with ${recipes.length} recipes, ${ingredients.length} ingredients, and ${links.length} recipe links.`,
);
