import { headers } from "next/headers";
import Image from "next/image";
import {
  Calendar,
  FileImage,
  Filter,
  HardDrive,
  ImageIcon,
  Search,
  UploadCloud,
} from "lucide-react";
import { MediaItemActions } from "@/components/dashboard/media-item-actions";
import { getDashboardMedia } from "@/lib/api";

type DashboardMediaPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function statValue(value: number) {
  return Number(value || 0).toLocaleString("ar-SA");
}

function getSearchValue(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  return (Array.isArray(value) ? value[0] : value) || "";
}

export default async function DashboardMediaPage({ searchParams }: DashboardMediaPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const media = await getDashboardMedia(cookieHeader, resolvedSearchParams);
  const total = media?.results.length ?? 0;
  const imageCount = media?.results.filter((item) => (item.type || "").toLowerCase().includes("image")).length ?? 0;
  const datedCount = media?.results.filter((item) => item.created_at).length ?? 0;

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-3xl border border-gray-100 bg-[#1a1f36] p-6 text-white shadow-sm lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
              <FileImage className="h-4 w-4 text-[#FF385C]" />
              مكتبة الملفات
            </div>
            <h1 className="mt-5 text-3xl font-black">مكتبة الوسائط</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              تصفح الصور والملفات المرفوعة، افتح الملفات بسرعة، ونظف العناصر غير المطلوبة من مكان واحد.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white opacity-80"
            >
              <UploadCloud className="h-4 w-4" />
              رفع ملف
            </button>
            <span className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold text-white/70">
              يتم الرفع من محرر المحتوى الحالي
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400">كل الملفات</p>
          <p className="mt-3 text-2xl font-black text-[#1a1f36]">{statValue(total)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400">صور</p>
          <p className="mt-3 text-2xl font-black text-[#1a1f36]">{statValue(imageCount)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400">بتاريخ واضح</p>
          <p className="mt-3 text-2xl font-black text-[#1a1f36]">{statValue(datedCount)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400">الصفحة</p>
          <p className="mt-3 text-2xl font-black text-[#1a1f36]">{statValue(media?.page ?? 1)}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="relative">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="_s"
              defaultValue={getSearchValue(resolvedSearchParams, "_s")}
              placeholder="بحث بالعنوان أو رقم الملف"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2d3458]"
          >
            <Filter className="h-4 w-4" />
            تصفية
          </button>
        </form>
      </section>

      {media && media.results.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {media.results.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {item.url ? (
                  <Image
                    src={item.url}
                    alt={item.title || `Media ${item.id}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#1a1f36] shadow-sm">
                  #{item.id}
                </span>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {item.type || "ملف"}
                </span>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <h2 className="line-clamp-1 text-lg font-black text-[#1a1f36]">
                    {item.title || `ملف #${item.id}`}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.created_at || "تاريخ غير متوفر"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-2">
                      <HardDrive className="h-3.5 w-3.5" />
                      author #{item.author || 0}
                    </span>
                  </div>
                </div>
                <MediaItemActions id={item.id} url={item.url} />
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
          <h2 className="mt-5 text-xl font-black text-[#1a1f36]">لا توجد ملفات مطابقة</h2>
          <p className="mt-2 text-sm text-gray-500">غيّر البحث أو ارفع ملفات جديدة من محررات المحتوى.</p>
        </section>
      )}
    </div>
  );
}
