import { InventoryForm } from "@/components/inventory-form";
import { PageHeading } from "@/components/page-heading";
export default function NewInventory() {
  return (
    <div className="page">
      <PageHeading
        eyebrow="Inventory"
        title="Add an ingredient"
        description="Enter a date from the package, or let Smart Fridge make a conservative estimate."
      />
      <InventoryForm />
    </div>
  );
}
