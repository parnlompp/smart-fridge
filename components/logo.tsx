import Link from "next/link";
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 font-extrabold tracking-tight"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-[#e2efdf] text-xl">
        🌿
      </span>
      <span className={light ? "text-white" : "text-[#17352b]"}>
        ตู้เย็นอัจฉริยะ
      </span>
    </Link>
  );
}
