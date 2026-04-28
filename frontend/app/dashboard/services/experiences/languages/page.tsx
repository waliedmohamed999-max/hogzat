import { getDashboardTerms } from "@/lib/api";
import { headers } from "next/headers";

export default async function ExperienceLanguagesPage() {
  const headerStore = await headers();
  const terms = await getDashboardTerms("experience-languages", headerStore.get("cookie") ?? "");

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-950">اللغات</h1>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(terms ?? []).map((term) => (
          <article key={term.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">{term.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{term.name}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
