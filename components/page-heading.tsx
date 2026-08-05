export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[.18em] text-[#2f7d5c]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-extrabold tracking-[-.03em] text-[#17352b] md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68766f]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
