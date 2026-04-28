type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "start";
  inverted?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  inverted = false,
}: SectionHeadingProps) {
  const alignment =
    align === "start" ? "items-start text-right" : "items-center text-center";

  return (
    <div className={`mx-auto flex max-w-3xl flex-col gap-4 ${alignment}`}>
      <span
        className={`rounded-md border px-4 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
          inverted
            ? "border-white/15 bg-white/10 text-rose-100"
            : "border-rose-100 bg-rose-50 text-rose-600"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl ${
          inverted ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>
      <p className={`max-w-2xl text-sm leading-7 sm:text-base ${inverted ? "text-white/72" : "text-slate-600"}`}>
        {description}
      </p>
    </div>
  );
}
