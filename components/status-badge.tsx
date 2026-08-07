import { getExpiryStatus } from "@/lib/business/expiry";
import { expiryLabel } from "@/lib/thai-labels";
export function StatusBadge({
  date,
  estimated,
}: {
  date: string;
  estimated?: boolean;
}) {
  const { status } = getExpiryStatus(date);
  const config = {
    expired: [expiryLabel.expired, "#fde8e5", "#a4372d"],
    today: [expiryLabel.today, "#fff0d4", "#955c00"],
    soon: [expiryLabel.soon, "#fff5cf", "#795900"],
    fresh: [expiryLabel.fresh, "#e2f2e7", "#246445"],
  }[status];
  return (
    <span className="flex flex-wrap gap-1">
      <span
        className="badge"
        style={{ background: config[1], color: config[2] }}
      >
        {config[0]}
      </span>
      {estimated && (
        <span className="badge bg-slate-100 text-slate-600">
          วันที่โดยประมาณ
        </span>
      )}
    </span>
  );
}
