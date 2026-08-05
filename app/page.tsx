import Link from "next/link";
import {
  IconArrowRight,
  IconChefHat,
  IconFridge,
  IconLeaf,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { Logo } from "@/components/logo";
export default function Home() {
  const values = [
    {
      Icon: IconFridge,
      title: "Track ingredients",
      text: "Keep quantities, storage locations and expiry dates organised in one calm view.",
    },
    {
      Icon: IconLeaf,
      title: "Reduce food waste",
      text: "See what needs attention and prioritise ingredients before they go to waste.",
    },
    {
      Icon: IconChefHat,
      title: "Discover suitable recipes",
      text: "Get ranked ideas based on your fridge, allergies and dietary preferences.",
    },
  ];
  return (
    <main className="min-h-screen bg-[#f7f4eb]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Logo />
        <Link href="/login" className="btn btn-secondary">
          Sign in
        </Link>
      </nav>
      <section className="hero-grid mx-auto grid max-w-7xl items-center gap-12 overflow-hidden rounded-[32px] border border-[#dce3d9] bg-[#fffdf8] px-7 py-16 md:grid-cols-2 md:px-16 md:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e1eedf] px-3 py-2 text-xs font-bold text-[#246445]">
            <IconSparkles size={15} /> Your kitchen, thoughtfully organised
          </div>
          <h1 className="max-w-xl text-5xl font-black leading-[1.02] tracking-[-.055em] text-[#17352b] md:text-7xl">
            Cook smarter.
            <br />
            <span className="text-[#4b845f]">Waste less.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-[#5e6e66]">
            Know what you have, use what expires first, and discover recipes
            that respect your dietary needs.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/api/demo-session" className="btn btn-primary px-6">
              Start demo <IconArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary px-6">
              Sign in
            </Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-[#66736c]">
            <IconShieldCheck size={16} /> Demo data stays in your browser
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="card rotate-2 bg-[#174e3b] p-5 text-white shadow-2xl">
            <div className="mb-10 flex items-center justify-between">
              <span className="text-sm font-bold">Today in your fridge</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                3 need attention
              </span>
            </div>
            <div className="space-y-3">
              {[
                ["🥦", "Broccoli", "2 days"],
                ["🍗", "Chicken breast", "Tomorrow"],
                ["🍄", "Mushrooms", "2 days"],
              ].map((x) => (
                <div
                  key={x[1]}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"
                >
                  <span className="text-3xl">{x[0]}</span>
                  <div className="flex-1">
                    <b className="block text-sm">{x[1]}</b>
                    <span className="text-xs text-white/60">Use soon</span>
                  </div>
                  <b className="text-xs text-amber-200">{x[2]}</b>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-[#e3edcf] p-4 text-[#17352b]">
              <p className="text-xs font-bold uppercase tracking-wider">
                Best match
              </p>
              <div className="mt-2 flex items-center justify-between">
                <b>Chicken stir-fry</b>
                <span className="rounded-full bg-[#174e3b] px-3 py-1 text-xs text-white">
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-center text-xs font-extrabold uppercase tracking-[.2em] text-[#4b845f]">
          Less guessing. More good food.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {values.map(({ Icon, title, text }) => (
            <div key={title} className="card p-7">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#e5efe2] text-[#28654a]">
                <Icon size={25} />
              </span>
              <h2 className="mt-6 text-lg font-extrabold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#68766f]">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
