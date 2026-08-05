import { Logo } from "@/components/logo";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[#f7f4eb] lg:grid-cols-2">
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Logo />
          {children}
        </div>
      </section>
      <aside className="hero-grid hidden items-center justify-center border-l bg-[#e4ebdc] p-16 lg:flex">
        <div className="max-w-md">
          <div className="text-8xl">🥬</div>
          <blockquote className="mt-8 text-3xl font-extrabold leading-tight tracking-tight">
            “Dinner starts with what you already have.”
          </blockquote>
          <p className="mt-4 leading-7 text-[#617068]">
            Track freshness, discover safer recipes, and make every ingredient
            count.
          </p>
        </div>
      </aside>
    </main>
  );
}
