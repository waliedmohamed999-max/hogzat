import Image from "next/image";
import Link from "next/link";
import { BookText, FileStack, FileText, MessageCircle, Plus, Search, Tags, type LucideIcon } from "lucide-react";
import type { BridgeContentResponse } from "@/lib/api";
import { ContentItemActions } from "@/components/dashboard/content-item-actions";
import { CreateContentButton } from "@/components/dashboard/create-content-button";

type Resource = "posts" | "pages";

type ContentListSuiteProps = {
  resource: Resource;
  payload: BridgeContentResponse | null;
  searchParams: Record<string, string | string[] | undefined>;
};

function getParam(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function metaFor(resource: Resource) {
  if (resource === "posts") {
    return {
      title: "المنشورات",
      eyebrow: "إدارة المحتوى",
      description: "أنشئ ونظم منشورات المدونة مع أدوات نشر ومراجعة وروابط سريعة للتصنيفات والوسوم.",
      createLabel: "إنشاء منشور",
      createIcon: BookText,
      editBase: "/dashboard/posts",
      empty: "لا توجد منشورات ضمن الفلاتر الحالية.",
    };
  }

  return {
    title: "الصفحات",
    eyebrow: "الصفحات الثابتة",
    description: "إدارة الصفحات التي تظهر في الواجهة، مع أدوات تعديل ونشر ومعاينة مرتبطة ببيانات النظام.",
    createLabel: "إنشاء صفحة",
    createIcon: FileStack,
    editBase: "/dashboard/pages",
    empty: "لا توجد صفحات ضمن الفلاتر الحالية.",
  };
}

export function ContentListSuite({ resource, payload, searchParams }: ContentListSuiteProps) {
  const meta = metaFor(resource);
  const Icon = meta.createIcon;
  const items = payload?.results ?? [];
  const published = items.filter((item) => item.status === "publish").length;
  const drafts = items.filter((item) => item.status === "draft").length;

  return (
    <div className="space-y-6" dir="rtl">
      <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
        <div className="grid gap-6 bg-[#1a1f36] p-6 text-white lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FF385C]/15 px-3 py-1 text-xs font-bold text-[#FF385C]">
              <Icon className="size-4" />
              {meta.eyebrow}
            </span>
            <h1 className="mt-4 text-3xl font-black">{meta.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{meta.description}</p>
            <div className="mt-5">
              <CreateContentButton resource={resource} label={meta.createLabel} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Summary label="الإجمالي" value={items.length} />
            <Summary label="منشور" value={published} />
            <Summary label="مسودات" value={drafts} />
          </div>
        </div>
        <form className="grid gap-3 border-b border-gray-100 p-5 md:grid-cols-[1fr_220px_auto]">
          <label className="relative">
            <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="_s"
              defaultValue={getParam(searchParams, "_s")}
              placeholder={`بحث بعنوان ${resource === "posts" ? "المنشور" : "الصفحة"} أو الرقم`}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pe-11 ps-4 text-sm outline-none focus:border-[#FF385C] focus:bg-white"
            />
          </label>
          <select name="status" defaultValue={getParam(searchParams, "status")} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#FF385C] focus:bg-white">
            <option value="">كل الحالات</option>
            <option value="publish">منشور</option>
            <option value="draft">مسودة</option>
            <option value="trash">سلة المهملات</option>
          </select>
          <button type="submit" className="rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white">
            تصفية
          </button>
        </form>
      </section>

      {items.length > 0 ? (
        <section className="grid gap-5 xl:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="relative flex min-h-[230px] items-center justify-center bg-gray-100">
                  {resource === "posts" && item.thumbnail ? (
                    <Image src={item.thumbnail} alt={item.title} width={520} height={520} className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="size-14 text-gray-300" />
                  )}
                </div>
                <div className="space-y-5 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">{item.status_label}</span>
                    <span className="font-mono text-xs text-gray-400">#{item.id}</span>
                  </div>
                  <div>
                    <h2 className="line-clamp-2 min-h-[3.5rem] text-2xl font-black text-[#1a1f36]">{item.title || "بدون عنوان"}</h2>
                    <p className="mt-2 text-sm text-gray-500">{item.created_at}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="rounded-xl border border-gray-200 px-3 py-1 font-mono text-xs" dir="ltr">{item.slug || "-"}</span>
                    {resource === "posts" ? (
                      <Link href="/dashboard/posts/comments" className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1 transition hover:border-[#FF385C]/30 hover:text-[#FF385C]">
                        <MessageCircle className="size-4" />
                        التعليقات
                      </Link>
                    ) : null}
                  </div>
                  <ContentItemActions
                    resource={resource}
                    id={item.id}
                    editUrl={`${meta.editBase}/${item.id}/edit`}
                    publicUrl={item.public_url}
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[28px] border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gray-50 text-gray-400">
            <Icon className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-black text-[#1a1f36]">{meta.empty}</h2>
        </section>
      )}

      {resource === "posts" ? (
        <section className="grid gap-4 md:grid-cols-2">
          <QuickLink href="/dashboard/posts/categories" icon={Tags} label="تصنيفات المقالات" />
          <QuickLink href="/dashboard/posts/tags" icon={Tags} label="وسوم المقالات" />
        </section>
      ) : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
      <div className="text-2xl font-black">{value.toLocaleString("ar-SA")}</div>
      <div className="mt-1 text-xs font-bold text-white/60">{label}</div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center justify-between rounded-[22px] border border-gray-100 bg-white p-5 text-sm font-black text-[#1a1f36] shadow-sm transition hover:border-[#FF385C]/30 hover:text-[#FF385C]">
      <span className="inline-flex items-center gap-2">
        <Icon className="size-4" />
        {label}
      </span>
      <Plus className="size-4" />
    </Link>
  );
}
