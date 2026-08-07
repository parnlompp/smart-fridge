"use client";
import { useParams } from "next/navigation";
import { useDemo } from "@/components/demo-provider";
import { InventoryForm } from "@/components/inventory-form";
import { PageHeading } from "@/components/page-heading";
export default function EditInventory() {
  const { id } = useParams<{ id: string }>();
  const { inventory } = useDemo();
  const item = inventory.find((i) => i.id === id);
  return (
    <div className="page">
      <PageHeading
        eyebrow="คลังวัตถุดิบ"
        title={item ? `แก้ไข ${item.name}` : "ไม่พบวัตถุดิบ"}
      />
      {item ? <InventoryForm item={item} /> : <p>รายการนี้อาจถูกลบไปแล้ว</p>}
    </div>
  );
}
