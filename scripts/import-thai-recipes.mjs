import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://datasets-server.huggingface.co/rows";
const DATASET = "pythainlp/thai_food_v1.0";
const expectedRows = 159;
const pages = [0, 100];

const batches = await Promise.all(
  pages.map(async (offset) => {
    const query = new URLSearchParams({
      dataset: DATASET,
      config: "default",
      split: "train",
      offset: String(offset),
      length: "100",
    });
    const response = await fetch(`${API}?${query}`);
    if (!response.ok) {
      throw new Error(`Hugging Face request failed: ${response.status}`);
    }
    return response.json();
  }),
);

const rows = batches
  .flatMap((batch) => batch.rows)
  .sort((a, b) => a.row_idx - b.row_idx)
  .map(({ row_idx, row }) => ({ rowIndex: row_idx, ...row }));

if (rows.length !== expectedRows) {
  throw new Error(`Expected ${expectedRows} rows, received ${rows.length}`);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "data", "thai-food-v1.json");
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(rows, null, 2)}\n`, "utf8");

console.log(`Imported ${rows.length} Thai recipes to ${output}`);
