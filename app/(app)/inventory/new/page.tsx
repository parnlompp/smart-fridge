import { InventoryForm } from "@/components/inventory-form";
import { PageHeading } from "@/components/page-heading";
export default function NewInventory() {
  return (
    <div className="page">
      <PageHeading
        eyebrow="คลังวัตถุดิบ"
        title="เพิ่มวัตถุดิบ"
        description="กรอกวันที่จากบรรจุภัณฑ์ หรือให้ระบบประมาณวันหมดอายุอย่างระมัดระวัง"
      />
      <InventoryForm />
    </div>
  );
}
