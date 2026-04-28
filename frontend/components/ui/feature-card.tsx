import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.5)]">
      <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}
