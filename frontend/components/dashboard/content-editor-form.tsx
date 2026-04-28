"use client";

import { secureFetch } from "@/lib/client-security";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type {
  BridgeContentEditorTerms,
  BridgePageEditorPayload,
  BridgePostEditorPayload,
} from "@/lib/api";

type ContentEditorFormProps =
  | {
      resource: "posts";
      initialData: BridgePostEditorPayload;
    }
  | {
      resource: "pages";
      initialData: BridgePageEditorPayload;
    };

function TermsPicker({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: BridgeContentEditorTerms["available"];
  selected: number[];
  onChange: (next: number[]) => void;
}) {
  return (
    <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option.id);
          return (
            <label
              key={option.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange([...selected, option.id]);
                    return;
                  }
                  onChange(selected.filter((item) => item !== option.id));
                }}
              />
              <span>{option.title}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function ContentEditorForm(props: ContentEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(props.initialData.title ?? "");
  const [slug, setSlug] = useState(props.initialData.slug ?? "");
  const [content, setContent] = useState(props.initialData.content ?? "");
  const [status, setStatus] = useState(props.initialData.status ?? "draft");
  const [thumbnailId, setThumbnailId] = useState(String(props.initialData.thumbnail_id ?? 0));
  const [thumbnailUrl, setThumbnailUrl] = useState(props.initialData.thumbnail_url ?? "");
  const [pageTemplate, setPageTemplate] = useState(
    props.resource === "pages" ? props.initialData.page_template ?? "default" : "default",
  );
  const [categories, setCategories] = useState(
    props.resource === "posts" ? props.initialData.categories.selected : [],
  );
  const [tags, setTags] = useState(
    props.resource === "posts" ? props.initialData.tags.selected : [],
  );

  const pageTitle = useMemo(
    () => (props.resource === "posts" ? "محرر المنشورات" : "محرر الصفحات"),
    [props.resource],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const body: Record<string, unknown> = {
      title,
      slug,
      content,
      status,
      thumbnail_id: Number(thumbnailId || 0),
    };

    if (props.resource === "posts") {
      body.categories = categories;
      body.tags = tags;
    } else {
      body.page_template = pageTemplate;
    }

    const response = await secureFetch(
      `/api/v1/dashboard/bridge/dashboard/content/${props.resource}/editor/${props.initialData.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const result = (await response.json()) as { status?: number; message?: string };

    if (!response.ok || result.status !== 1) {
      setError(result.message || "تعذر الحفظ الآن.");
      return;
    }

    setMessage(result.message || "تم الحفظ بنجاح.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">{pageTitle}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              محرر موحد يحفظ المحتوى مباشرة في جداول النظام الحالية بدون فصل عن لوحة التحكم.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/${props.resource}`)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            العودة للقائمة
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-900">العنوان</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-900">الرابط المختصر</span>
                <input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-900">المحتوى</span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={18}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 outline-none"
                />
              </label>
            </div>
          </section>

          {props.resource === "posts" ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <TermsPicker
                label="التصنيفات"
                options={props.initialData.categories.available}
                selected={categories}
                onChange={setCategories}
              />
              <TermsPicker
                label="الوسوم"
                options={props.initialData.tags.available}
                selected={tags}
                onChange={setTags}
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-900">الحالة</span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="draft">مسودة</option>
                  <option value="publish">منشور</option>
                  <option value="trash">محذوف</option>
                </select>
              </label>
              {props.resource === "pages" ? (
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-900">القالب</span>
                  <input
                    value={pageTemplate}
                    onChange={(event) => setPageTemplate(event.target.value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  />
                </label>
              ) : null}
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-900">معرف الصورة</span>
                <input
                  value={thumbnailId}
                  onChange={(event) => setThumbnailId(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-900">رابط الصورة</span>
                <input
                  value={thumbnailUrl}
                  onChange={(event) => setThumbnailUrl(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>
              {thumbnailUrl ? (
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                  <Image
                    src={thumbnailUrl}
                    alt={title || pageTitle}
                    width={640}
                    height={320}
                    className="h-48 w-full object-cover"
                  />
                </div>
              ) : null}
              <button
                type="submit"
                disabled={isPending}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                حفظ التغييرات
              </button>
              {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
