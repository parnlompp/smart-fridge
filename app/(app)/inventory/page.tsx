"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { IconEdit, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { useDemo } from "@/components/demo-provider";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { getExpiryStatus } from "@/lib/business/expiry";
import { categoryLabel, storageLabel, unitLabel } from "@/lib/thai-labels";
import type { StorageLocation } from "@/lib/types";
export default function Inventory() {
  const { inventory, deleteInventory } = useDemo();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");
  const filtered = useMemo(
    () =>
      inventory
        .filter(
          (i) =>
            i.name.toLowerCase().includes(search.toLowerCase()) &&
            (status === "all" ||
              getExpiryStatus(i.expiryDate).status === status) &&
            (location === "all" || i.storageLocation === location),
        )
        .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)),
    [inventory, search, status, location],
  );
  return (
    <div className="page">
      <PageHeading
        eyebrow="คลังวัตถุดิบในครัว"
        title="มีอะไรอยู่ในตู้เย็นของคุณ"
        description="ติดตามปริมาณและใช้วัตถุดิบให้ทันก่อนหมดอายุ"
        action={
          <Link href="/inventory/new" className="btn btn-primary">
            <IconPlus size={18} />
            เพิ่มวัตถุดิบ
          </Link>
        }
      />
      <div className="card mb-5 grid gap-3 p-4 md:grid-cols-[1fr_190px_190px]">
        <label className="relative">
          <span className="sr-only">ค้นหาวัตถุดิบ</span>
          <IconSearch
            className="absolute left-3 top-3 text-slate-400"
            size={19}
          />
          <input
            className="input pl-10"
            placeholder="ค้นหาวัตถุดิบ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          className="input"
          aria-label="กรองตามสถานะวันหมดอายุ"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">สถานะวันหมดอายุทั้งหมด</option>
          <option value="expired">หมดอายุแล้ว</option>
          <option value="today">หมดอายุวันนี้</option>
          <option value="soon">ใกล้หมดอายุ</option>
          <option value="fresh">ยังสดใหม่</option>
        </select>
        <select
          className="input"
          aria-label="กรองตามตำแหน่งจัดเก็บ"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="all">ทุกตำแหน่ง</option>
          {(["Refrigerator", "Freezer", "Pantry"] as StorageLocation[]).map(
            (value) => (
              <option key={value} value={value}>
                {storageLabel[value]}
              </option>
            ),
          )}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b bg-[#f6f7f3] text-xs uppercase tracking-wider text-[#6d7b73]">
            <tr>
              <th className="p-4">วัตถุดิบ</th>
              <th>ปริมาณ</th>
              <th>เก็บไว้ใน</th>
              <th>วันหมดอายุ</th>
              <th>สถานะ</th>
              <th>
                <span className="sr-only">การดำเนินการ</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr
                key={i.id}
                className="border-b border-[#edf0ed] last:border-0"
              >
                <td className="p-4">
                  <b className="text-sm">{i.name}</b>
                  <span className="mt-1 block text-xs text-[#7b8881]">
                    {categoryLabel[i.category] ?? i.category}
                  </span>
                </td>
                <td className="text-sm font-semibold">
                  {i.quantity} {unitLabel[i.unit]}
                </td>
                <td className="text-sm">{storageLabel[i.storageLocation]}</td>
                <td className="text-sm">
                  {new Date(i.expiryDate + "T12:00").toLocaleDateString(
                    "th-TH",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                  {i.expirySource === "estimated" && (
                    <span className="block text-[11px] text-[#826514]">
                      วันที่โดยประมาณ
                    </span>
                  )}
                </td>
                <td>
                  <StatusBadge date={i.expiryDate} />
                </td>
                <td>
                  <div className="flex gap-1">
                    <Link
                      aria-label={`แก้ไข ${i.name}`}
                      href={`/inventory/${i.id}/edit`}
                      className="rounded-lg p-2 hover:bg-slate-100"
                    >
                      <IconEdit size={18} />
                    </Link>
                    <button
                      aria-label={`ลบ ${i.name}`}
                      onClick={() =>
                        confirm(`ต้องการลบ ${i.name} หรือไม่?`) &&
                        deleteInventory(i.id)
                      }
                      className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-4xl">🫙</div>
            <h2 className="mt-3 font-bold">ไม่พบวัตถุดิบ</h2>
            <p className="mt-1 text-sm text-[#738079]">
              ลองเปลี่ยนตัวกรองหรือเพิ่มวัตถุดิบใหม่
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
