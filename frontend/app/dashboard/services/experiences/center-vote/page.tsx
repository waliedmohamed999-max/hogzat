import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { BarChart3, CheckCircle2, ExternalLink, Plus, Search, Settings, Vote } from "lucide-react";
import { ManagedServiceActions } from "@/components/dashboard/managed-service-actions";
import { getCenterVote, getManagedExperiences } from "@/lib/api";
import {
  FALLBACK_LISTING_IMAGE,
  formatMoney,
  normalizeAssetUrl,
} from "@/lib/presentation";

type CenterVotePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchValue(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function publicExperiencePath(id: number, fallback?: string) {
  return fallback || `/experience/${id}/details`;
}

export default async function CenterVotePage({ searchParams }: CenterVotePageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const search = getSearchValue(resolvedSearchParams, "_s");
  const status = getSearchValue(resolvedSearchParams, "status");

  const [voteItems, managed] = await Promise.all([
    getCenterVote(cookieHeader),
    getManagedExperiences(cookieHeader, { _s: search, status }),
  ]);

  const items = voteItems ?? [];
  const managedResults = managed?.results ?? [];
  const voteExperienceIds = new Set(items.map((item) => item.experience_id));
  const missingFromVote = managedResults.filter((item) => !voteExperienceIds.has(item.id));
  const publishedCount = managedResults.filter((item) => item.status === "publish").length;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.28)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600">
              <Vote className="size-4" />
              مركز التصويت
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">مركز التصويت</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              إدارة التجارب المعروضة للتصويت داخل الواجهة الجديدة، ومراجعة التجارب الناقصة قبل نشرها للمستخدمين.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/services/experiences/new"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="size-4" />
              إضافة تجربة
            </Link>
            <Link
              href="/experience-search-result"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              <ExternalLink className="size-4" />
              عرض الواجهة
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "معروض للتصويت", value: items.length, icon: Vote },
          { label: "إجمالي التجارب", value: managed?.total ?? managedResults.length, icon: BarChart3 },
          { label: "تجارب منشورة", value: publishedCount, icon: CheckCircle2 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <div className="mt-2 text-3xl font-semibold text-slate-950">{stat.value}</div>
                </div>
                <div className="flex size-12 items-center justify-center rounded-lg bg-slate-950 text-white">
                  <Icon className="size-5" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="_s"
              defaultValue={search}
              placeholder="بحث في التجارب بالعنوان أو رقم التجربة"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-11 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            />
          </label>
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
          >
            <option value="">كل الحالات</option>
            <option value="publish">منشور</option>
            <option value="pending">معلق</option>
            <option value="draft">مسودة</option>
            <option value="trash">سلة المهملات</option>
          </select>
          <button type="submit" className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            تصفية
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">التجارب المعروضة للتصويت</h2>
            <p className="mt-2 text-sm text-slate-500">هذه العناصر قادمة من ربط الداشبورد الحالي لمركز التصويت.</p>
          </div>
          <Link
            href="/dashboard/services/experiences"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <Settings className="size-4" />
            إدارة كل التجارب
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {items.map((item) => {
              const image = normalizeAssetUrl(item.image || FALLBACK_LISTING_IMAGE);
              const publicUrl = publicExperiencePath(item.experience_id, item.public_url);
              return (
                <article key={item.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.28)]">
                  <div className="grid md:grid-cols-[260px_minmax(0,1fr)]">
                    <div className="relative min-h-[240px] bg-slate-100">
                      <Image src={image} alt={item.title} fill className="object-cover" sizes="(min-width: 1280px) 260px, 100vw" />
                    </div>
                    <div className="flex flex-col gap-5 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">مفعل في التصويت</span>
                        <span className="text-xs text-slate-400">#{item.experience_id}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold leading-8 text-slate-950">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-500">تاريخ الفعالية: {item.event_date || "غير محدد"}</p>
                      </div>
                      <div className="mt-auto grid gap-3 sm:grid-cols-2">
                        <Link
                          href={`/dashboard/services/experiences/${item.experience_id}/edit`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                        >
                          <Settings className="size-4" />
                          تعديل التجربة
                        </Link>
                        <Link
                          href={publicUrl}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          <ExternalLink className="size-4" />
                          عرض الواجهة
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">لا توجد تجارب مفعلة في مركز التصويت</h3>
            <p className="mt-2 text-sm text-slate-500">أضف أو عدّل التجارب من الداشبورد ثم فعّل إعدادات التصويت من نموذج التجربة إن كانت متاحة في البيانات.</p>
            <Link href="/dashboard/services/experiences/new" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Plus className="size-4" />
              إضافة تجربة جديدة
            </Link>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">تجارب غير موجودة في مركز التصويت</h2>
          <p className="mt-2 text-sm text-slate-500">راجع هذه التجارب وأكمل الصور والتواريخ والحالة ثم فعّلها من نموذج التحرير إذا كان خيار التصويت متاحًا.</p>
        </div>

        {missingFromVote.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {missingFromVote.map((item) => {
              const image = normalizeAssetUrl(item.thumbnail || FALLBACK_LISTING_IMAGE);
              const publicUrl = publicExperiencePath(item.id, item.public_url || `/experience/${item.id}/${item.slug || "details"}`);
              return (
                <article key={item.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.28)]">
                  <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="relative min-h-[220px] bg-slate-100">
                      <Image src={image} alt={item.title} fill className="object-cover" sizes="(min-width: 1280px) 220px, 100vw" />
                    </div>
                    <div className="space-y-5 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-md bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">غير مضاف للتصويت</span>
                        <span className="text-xs text-slate-400">#{item.id}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold leading-8 text-slate-950">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-500">{item.type_label || "تجربة"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                        <span className="rounded-md border border-slate-200 px-3 py-1">{item.status_label || item.status}</span>
                        <span className="rounded-md border border-slate-200 px-3 py-1">{item.guests} أشخاص</span>
                        <span className="rounded-md border border-slate-200 px-3 py-1">{formatMoney(item.price, item.currency)}</span>
                      </div>
                      <ManagedServiceActions
                        type="experience"
                        id={item.id}
                        editUrl={`/dashboard/services/experiences/${item.id}/edit`}
                        publicUrl={publicUrl}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            كل التجارب الظاهرة في الفلتر الحالي موجودة بالفعل في مركز التصويت.
          </div>
        )}
      </section>
    </div>
  );
}
