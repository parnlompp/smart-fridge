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
        eyebrow="Inventory"
        title={item ? `Edit ${item.name}` : "Ingredient not found"}
      />
      {item ? (
        <InventoryForm item={item} />
      ) : (
        <p>This item may have been removed.</p>
      )}
    </div>
  );
}
