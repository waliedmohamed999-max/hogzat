const cardWidths = ["w-2/3", "w-1/2", "w-3/4", "w-5/12"];

export default function DashboardLoading() {
  return (
    <div dir="rtl" className="space-y-6">
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-5 h-8 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-slate-100" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cardWidths.map((width, index) => (
          <article key={index} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="size-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className={`mt-6 h-4 ${width} animate-pulse rounded-full bg-slate-100`} />
            <div className="mt-4 h-7 w-24 animate-pulse rounded-full bg-slate-100" />
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
        {[0, 1].map((item) => (
          <article key={item} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-5 w-48 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="h-20 animate-pulse rounded-2xl bg-slate-50" />
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
