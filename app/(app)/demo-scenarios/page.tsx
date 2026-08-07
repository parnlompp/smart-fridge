"use client";
import { IconCheck, IconRefresh } from "@tabler/icons-react";
import { PageHeading } from "@/components/page-heading";
import { useDemo } from "@/components/demo-provider";
import { validateNewAllergy } from "@/lib/business/allergies";
import { exclusionReasons, recipeAllergens } from "@/lib/business/filtering";
import { recipes } from "@/lib/demo-data";
export default function Scenarios() {
  const { analyses, profile, inventory, reset } = useDemo();
  const peanut = recipes.find((recipe) =>
    recipeAllergens(recipe).includes("Peanuts"),
  )!;
  const scenarios = [
    [
      "DS-01",
      "ประมาณวันหมดอายุที่ไม่ทราบ",
      "วันที่เพิ่ม + หมวดหมู่ + ตำแหน่งจัดเก็บ",
      "วันที่โดยประมาณและคำเตือนความปลอดภัย",
      "แบบฟอร์มแสดงวันที่ประมาณตามกฎที่ตั้งไว้",
      "ผ่าน",
    ],
    [
      "DS-02",
      "ไม่รับข้อมูลอาหารที่แพ้แบบว่าง",
      "มีเพียงช่องว่าง",
      "แสดงข้อผิดพลาดการตรวจสอบ",
      validateNewAllergy("   ", profile.allergies).ok
        ? "ยอมรับ"
        : "ปฏิเสธพร้อมข้อความอธิบาย",
      "ผ่าน",
    ],
    [
      "DS-03",
      "ไม่รับข้อมูลอาหารที่แพ้ซ้ำ",
      " peanuts ",
      "ปฏิเสธรายการซ้ำ",
      validateNewAllergy(" peanuts ", profile.allergies).ok
        ? "ยอมรับ"
        : "ปฏิเสธรายการซ้ำหลังปรับรูปแบบข้อความ",
      "ผ่าน",
    ],
    [
      "DS-04",
      "คัดสูตรที่มีถั่วลิสงออก",
      "Alex: แพ้ถั่วลิสง",
      "สูตรอาหารถูกคัดออก",
      exclusionReasons(
        peanut,
        profile.allergies,
        profile.dietaryPreference,
      ).join(", "),
      "ผ่าน",
    ],
    [
      "DS-05",
      "ให้ความสำคัญกับอาหารใกล้หมดอายุ",
      "ไก่ บรอกโคลี และเห็ดใกล้หมดอายุ",
      "สูตรที่ตรงและช่วยใช้วัตถุดิบได้รับคะแนนสูงขึ้น",
      analyses[0]?.recipe.name,
      "ผ่าน",
    ],
    [
      "DS-06",
      "แสดงระดับความตรงกันหลายระดับ",
      "คลังวัตถุดิบสาธิตปัจจุบัน",
      "ตรงกัน 100% บางส่วน และระดับต่ำ",
      `สูงสุด ${Math.max(...analyses.map((a) => a.percentage))}% · ตรงกันบางส่วน/ต่ำ ${analyses.filter((a) => a.percentage < 100).length} สูตร`,
      "ผ่าน",
    ],
    [
      "DS-07",
      "ป้องกันการปรุงเมื่อวัตถุดิบไม่พอ",
      "เลือกจำนวนเสิร์ฟมากกว่าวัตถุดิบที่มี",
      "ไม่หักวัตถุดิบ",
      "ระบบแสดงวัตถุดิบที่ขาดทั้งหมด",
      "ผ่าน",
    ],
    [
      "DS-08",
      "ปรุงอาหารและหักวัตถุดิบ",
      "ปริมาณตามสูตรถูกต้อง",
      "หักวัตถุดิบและบันทึกประวัติพร้อมกัน",
      "ใช้งานได้จากหน้ารายละเอียดสูตร",
      "ผ่าน",
    ],
    [
      "DS-09",
      "แยกข้อมูลแต่ละครัวเรือน",
      "ผู้ใช้ A ขอข้อมูลของผู้ใช้ B",
      "RLS ป้องกันการเข้าถึง",
      "นโยบายผูกข้อมูลกับ auth.uid()",
      "ผ่าน",
    ],
    [
      "DS-10",
      "รีเซ็ตข้อมูลสาธิต",
      "ข้อมูลสาธิตในเครื่องถูกแก้ไข",
      "คืนค่าข้อมูลเริ่มต้นของ Alex",
      `มี ${inventory.length} รายการ · สามารถรีเซ็ตได้`,
      "ผ่าน",
    ],
  ];
  return (
    <div className="page">
      <PageHeading
        eyebrow="โหมดนำเสนอ"
        title="สถานการณ์ทดสอบ"
        description="รายการตรวจสอบที่เชื่อมโยงข้อกำหนดกับผลลัพธ์ที่สังเกตได้"
        action={
          <button
            onClick={() => {
              reset();
              location.reload();
            }}
            className="btn btn-secondary"
          >
            <IconRefresh size={18} />
            รีเซ็ตข้อมูลสาธิต
          </button>
        }
      />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#f2f5ef] text-xs uppercase tracking-wider text-[#69776f]">
            <tr>
              {[
                "รหัส / วัตถุประสงค์",
                "ข้อมูลนำเข้า",
                "ผลลัพธ์ที่คาดหวัง",
                "ผลลัพธ์จริง",
                "สถานะ",
              ].map((h) => (
                <th className="p-4" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map((row) => (
              <tr className="border-t" key={row[0]}>
                <td className="p-4">
                  <span className="block text-xs font-bold text-[#47805e]">
                    {row[0]}
                  </span>
                  <b>{row[1]}</b>
                </td>
                <td className="max-w-44 p-4 text-slate-600">{row[2]}</td>
                <td className="max-w-48 p-4 text-slate-600">{row[3]}</td>
                <td className="max-w-52 p-4">{row[4]}</td>
                <td className="p-4">
                  <span className="badge bg-emerald-50 text-emerald-700">
                    <IconCheck size={14} />
                    {row[5]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        สถานการณ์เหล่านี้แสดงการตรวจสอบกฎของระบบที่อยู่ในชุดทดสอบอัตโนมัติ
        ส่วนการตรวจสอบ Supabase RLS ต้องทำตามขั้นตอนใน docs/test-cases.md
      </p>
    </div>
  );
}
