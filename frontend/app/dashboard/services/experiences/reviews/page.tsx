import Link from "next/link";
import { headers } from "next/headers";
import { getDashboardReviews } from "@/lib/api";

export default async function ExperienceReviewsPage() {
  const headerStore = await headers();
  const reviews = await getDashboardReviews("experience", headerStore.get("cookie") ?? "");

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
        <h1 className="text-3xl font-semibold text-slate-950">تعليقات التجارب</h1>
        <p className="mt-3 text-sm text-slate-600">مراجعة تعليقات التجارب والفعاليات من داخل لوحة التحكم الجديدة.</p>
      </section>

      <div className="grid gap-4">
        {(reviews ?? []).map((review) => (
          <article key={review.id} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{review.service_title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {review.author} - {review.email}
                </p>
              </div>
              <Link href={`/experience/${review.service_id}/details`} className="text-sm font-medium text-rose-500">
                عرض التجربة
              </Link>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">{review.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
