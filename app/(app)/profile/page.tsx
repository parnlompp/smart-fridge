"use client";
import { useState } from "react";
import { IconPlus, IconX } from "@tabler/icons-react";
import { PageHeading } from "@/components/page-heading";
import { useDemo } from "@/components/demo-provider";
import { validateNewAllergy } from "@/lib/business/allergies";
import type { DietaryPreference } from "@/lib/types";
import { allergenLabel, dietLabel, healthGoalLabel } from "@/lib/thai-labels";
const common = [
  "Peanuts",
  "Tree nuts",
  "Milk",
  "Eggs",
  "Soy",
  "Wheat",
  "Fish",
  "Shellfish",
  "Sesame",
];
export default function Profile() {
  const { profile, setProfile } = useDemo();
  const [draft, setDraft] = useState(profile);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  function add(value: string) {
    const result = validateNewAllergy(value, draft.allergies);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft({ ...draft, allergies: [...draft.allergies, result.value] });
    setCustom("");
    setError("");
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="การตั้งค่าส่วนบุคคล"
        title="โปรไฟล์การรับประทานอาหาร"
        description="เราใช้ข้อมูลเหล่านี้เพื่อคัดกรองสูตรอาหารที่ไม่ปลอดภัยหรือไม่เหมาะกับคุณ"
      />
      <div className="grid max-w-4xl gap-6">
        <section className="card p-6">
          <h2 className="text-lg font-extrabold">ข้อมูลของคุณ</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label>
              <span className="label">ชื่อที่แสดง</span>
              <input
                className="input"
                value={draft.displayName}
                onChange={(e) =>
                  setDraft({ ...draft, displayName: e.target.value })
                }
              />
            </label>
            <label>
              <span className="label">รูปแบบการรับประทานอาหาร</span>
              <select
                className="input"
                value={draft.dietaryPreference}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    dietaryPreference: e.target.value as DietaryPreference,
                  })
                }
              >
                {[
                  "No restriction",
                  "Vegetarian",
                  "Vegan",
                  "Pescatarian",
                  "Halal",
                  "Other",
                ].map((x) => (
                  <option key={x} value={x}>
                    {dietLabel[x as DietaryPreference]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">เป้าหมายด้านสุขภาพ</span>
              <select
                className="input"
                value={draft.healthGoal}
                onChange={(e) =>
                  setDraft({ ...draft, healthGoal: e.target.value })
                }
              >
                {[
                  "Balanced diet",
                  "High protein",
                  "Lower calorie",
                  "Reduce sugar",
                  "No specific goal",
                ].map((x) => (
                  <option key={x} value={x}>
                    {healthGoalLabel[x]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">
                ข้อจำกัดทางศาสนา{" "}
                <span className="font-normal text-slate-400">(ไม่บังคับ)</span>
              </span>
              <input
                className="input"
                value={draft.religiousRestriction ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, religiousRestriction: e.target.value })
                }
                placeholder="เว้นว่างหากไม่มี"
              />
            </label>
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-lg font-extrabold">อาหารที่แพ้</h2>
          <p className="mt-1 text-sm leading-6 text-[#68766f]">
            ระบบจะไม่แสดงสูตรที่มีสารก่อภูมิแพ้ที่คุณเลือก ข้อมูลนี้ช่วย
            ในการวางแผนเท่านั้น และไม่ครอบคลุมการปนเปื้อนข้าม
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {common.map((item) => {
              const active = draft.allergies.some(
                (x) => x.toLowerCase() === item.toLowerCase(),
              );
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    active
                      ? setDraft({
                          ...draft,
                          allergies: draft.allergies.filter(
                            (x) => x.toLowerCase() !== item.toLowerCase(),
                          ),
                        })
                      : add(item)
                  }
                  className={`rounded-full border px-3 py-2 text-sm font-semibold ${active ? "border-[#2f7d5c] bg-[#e1efe4] text-[#215c41]" : "border-[#d9e0da] bg-white text-[#617068]"}`}
                >
                  {active ? "✓ " : ""}
                  {allergenLabel[item] ?? item}
                </button>
              );
            })}
          </div>
          <div className="mt-6 border-t pt-5">
            <span className="label">อาหารที่แพ้อื่น ๆ</span>
            <div className="flex gap-2">
              <input
                className="input max-w-sm"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="เช่น มัสตาร์ด"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => add(custom)}
              >
                <IconPlus size={17} />
                Add
              </button>
            </div>
            {error && (
              <p
                role="alert"
                className="mt-2 text-sm font-semibold text-red-700"
              >
                {error}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {draft.allergies
                .filter(
                  (x) =>
                    !common.some((c) => c.toLowerCase() === x.toLowerCase()),
                )
                .map((x) => (
                  <span className="badge bg-[#e7eee8] text-[#2d5945]" key={x}>
                    {x}
                    <button
                      aria-label={`ลบ ${allergenLabel[x] ?? x}`}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          allergies: draft.allergies.filter((a) => a !== x),
                        })
                      }
                    >
                      <IconX size={14} />
                    </button>
                  </span>
                ))}
            </div>
          </div>
        </section>
        <div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setProfile({ ...draft, setupCompleted: true });
              setSaved(true);
            }}
          >
            บันทึกโปรไฟล์
          </button>
          {saved && (
            <span
              role="status"
              className="ml-4 text-sm font-bold text-emerald-700"
            >
              บันทึกโปรไฟล์แล้ว
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
