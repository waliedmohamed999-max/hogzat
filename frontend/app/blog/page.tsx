import Link from "next/link";
import { headers } from "next/headers";
import { Footer } from "@/components/sections/footer";
import { SiteNavbar } from "@/components/sections/site-navbar";
import { getPublicSystemSettings, getSessionUser } from "@/lib/api";
import { legacyUrl } from "@/lib/platform";
import { normalizeAssetUrl } from "@/lib/presentation";
import { resolveBrand } from "@/lib/brand";

type PublicPost = {
  id: number;
  title?: string;
  content?: string;
  desc?: string;
  excerpt?: string;
  image?: string;
  thumbnail?: string;
  created_at?: string;
};

async function getPublicPosts() {
  try {
    const response = await fetch(legacyUrl("/api/v1/posts"), {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { results?: PublicPost[] };
    return payload.results ?? [];
  } catch {
    return [];
  }
}

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function BlogPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const [currentUser, posts, publicSettings] = await Promise.all([
    getSessionUser(cookieHeader),
    getPublicPosts(),
    getPublicSystemSettings(),
  ]);
  const siteBrand = resolveBrand(publicSettings);

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-slate-950">
      <SiteNavbar currentUser={currentUser} />

      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-500">
              المدونة
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              أخبار ونصائح {siteBrand.nameAr}
            </h1>
            <p className="mt-5 text-sm leading-8 text-slate-600">
              محتوى المنصة يظهر هنا من بيانات النظام الحالية بدون فتح أي واجهات قديمة.
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {posts.map((post) => {
                const image = normalizeAssetUrl(post.image || post.thumbnail);
                const summary = stripHtml(post.excerpt || post.desc || post.content).slice(0, 180);

                return (
                  <article key={post.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
                    <div
                      className="h-56 bg-cover bg-center"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                    <div className="p-6">
                      <div className="text-xs font-semibold text-slate-400">{post.created_at || siteBrand.nameAr}</div>
                      <h2 className="mt-3 text-2xl font-semibold">{post.title || `منشور #${post.id}`}</h2>
                      {summary ? <p className="mt-3 text-sm leading-7 text-slate-600">{summary}</p> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="text-2xl font-semibold">لا توجد مقالات منشورة حاليًا</h2>
              <p className="mt-3 text-sm text-slate-500">
                عند نشر مقالات من لوحة التحكم ستظهر هنا تلقائيًا.
              </p>
              <Link
                href="/dashboard/posts"
                className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                إدارة المقالات
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
