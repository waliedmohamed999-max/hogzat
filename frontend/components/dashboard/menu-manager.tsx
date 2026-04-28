"use client";

import { secureFetch } from "@/lib/client-security";
import type { BridgeMenu, BridgeMenuItem } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  GripVertical,
  LayoutList,
  Link2,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

function createEmptyItem(): BridgeMenuItem {
  return {
    item_id: Date.now(),
    parent_id: 0,
    depth: 0,
    name: "",
    type: "custom",
    post_id: 0,
    post_title: "",
    url: "",
    route_name: "",
    target: "_self",
    icon: "",
    class: "",
    css_class: "",
    sort_order: 0,
    is_active: 1,
    target_blank: 0,
    open_in_new_tab: 0,
    permission_key: "",
    metadata: {},
  };
}

function emptyMenu(): BridgeMenu {
  return { id: 0, title: "", key: "", position: "", description: "", is_active: 1, items: [createEmptyItem()] };
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold text-gray-400">{label}</p>
      <p className="mt-3 text-2xl font-black text-[#1a1f36]">{value}</p>
    </div>
  );
}

export function MenuManager({ initialMenus }: { initialMenus: BridgeMenu[] }) {
  const [menus, setMenus] = useState(initialMenus);
  const [selectedId, setSelectedId] = useState<number | "new">(initialMenus[0]?.id ?? "new");
  const [draft, setDraft] = useState<BridgeMenu>(initialMenus[0] ?? emptyMenu());
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const totalItems = useMemo(() => menus.reduce((sum, menu) => sum + menu.items.length, 0), [menus]);
  const externalItems = useMemo(
    () => menus.reduce((sum, menu) => sum + menu.items.filter((item) => item.target_blank === 1).length, 0),
    [menus],
  );

  async function saveMenu(menuOverride?: BridgeMenu, successMessage?: string) {
    const targetMenu = menuOverride ?? draft;
    setError(null);
    setMessage(null);
    if (!targetMenu.title.trim()) {
      setError("عنوان القائمة مطلوب.");
      return;
    }
    if (!targetMenu.position.trim()) {
      setError("موقع ظهور القائمة مطلوب.");
      return;
    }
    const invalidIndex = targetMenu.items.findIndex((item) => !item.name.trim() || (item.type !== "dropdown" && !item.url.trim() && !item.route_name?.trim()));
    if (invalidIndex >= 0) {
      setError(`راجع بيانات عنصر القائمة رقم ${invalidIndex + 1}.`);
      return;
    }
    setBusy("save");
    try {
      const payload = {
        ...targetMenu,
        items: targetMenu.items.map((item, index) => ({
          ...item,
          class: item.class || item.css_class || "",
          css_class: item.css_class || item.class || "",
          sort_order: index,
          open_in_new_tab: item.target_blank,
          target: item.target_blank === 1 ? "_blank" : "_self",
        })),
      };
      const response = await secureFetch("/api/v1/dashboard/bridge/dashboard/system-native/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { status?: number; message?: string; data?: { id?: number } };

      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر حفظ القائمة.");
        return;
      }

      const savedId = result.data?.id ?? targetMenu.id;
      const savedMenu = { ...payload, id: savedId };
      setMenus((current) => {
        const exists = current.some((item) => item.id === savedId);
        return exists ? current.map((item) => (item.id === savedId ? savedMenu : item)) : [...current, savedMenu];
      });
      setSelectedId(savedId);
      setDraft(savedMenu);
      setMessage(successMessage || result.message || "تم حفظ القائمة.");
    } finally {
      setBusy(null);
    }
  }

  function selectMenu(id: number | "new") {
    setSelectedId(id);
    setDraft(id === "new" ? emptyMenu() : (menus.find((item) => item.id === id) ?? emptyMenu()));
  }

  async function deleteMenu() {
    if (!draft.id) {
      selectMenu("new");
      return;
    }
    if (!window.confirm(`هل تريد حذف قائمة ${draft.title}؟`)) return;

    setBusy("delete");
    setError(null);
    setMessage(null);
    try {
      const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/system-native/menus/${draft.id}/delete`, {
        method: "POST",
      });
      const result = (await response.json()) as { status?: number; message?: string };

      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر حذف القائمة.");
        return;
      }

      setMenus((current) => current.filter((item) => item.id !== draft.id));
      selectMenu("new");
      setMessage(result.message || "تم حذف القائمة.");
    } finally {
      setBusy(null);
    }
  }

  function updateItem(index: number, patch: Partial<BridgeMenuItem>) {
    const next = [...draft.items];
    next[index] = { ...next[index], ...patch };
    setDraft({ ...draft, items: next });
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.items.length) return;
    const next = [...draft.items];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setDraft({ ...draft, items: next });
  }

  function cloneMenu() {
    const clonedMenu = {
      ...draft,
      id: 0,
      title: `${draft.title || "قائمة"} نسخة`,
      key: "",
      position: "",
      items: draft.items.map((item, index) => ({ ...item, item_id: Date.now() + index })),
    };
    setDraft(clonedMenu);
    setSelectedId("new");
    setMessage("تم إنشاء نسخة قابلة للحفظ كقائمة جديدة.");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.key || draft.position || "menu"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...draft.items];
    const [item] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, item);
    const nextMenu = { ...draft, items: next };
    setDraft(nextMenu);
    setDragIndex(null);
    if (nextMenu.id) {
      void saveMenu(nextMenu, "تم تحديث ترتيب العناصر.");
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-3xl border border-gray-100 bg-[#1a1f36] p-6 text-white shadow-sm lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
              <LayoutList className="h-4 w-4 text-[#FF385C]" />
              مركز القوائم
            </div>
            <h1 className="mt-5 text-3xl font-black">إدارة قوائم التنقل</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              أنشئ قوائم الهيدر والفوتر والروابط الداخلية مع معاينة فورية وتنظيم واضح للعناصر.
            </p>
          </div>
          <button
            type="button"
            onClick={() => selectMenu("new")}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e63252]"
          >
            <Plus className="h-4 w-4" />
            قائمة جديدة
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="القوائم" value={menus.length} />
        <StatCard label="العناصر" value={totalItems} />
        <StatCard label="روابط خارجية" value={externalItems} />
        <StatCard label="القائمة الحالية" value={draft.items.length} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-5 shadow-sm xl:sticky xl:top-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#FF385C]">القوائم المتاحة</p>
              <h2 className="mt-2 text-2xl font-black text-[#1a1f36]">اختر قائمة</h2>
            </div>
            <button
              type="button"
              onClick={() => selectMenu("new")}
              className="rounded-xl bg-[#1a1f36] px-4 py-2 text-sm font-bold text-white"
            >
              جديد
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {menus.map((menu) => (
              <button
                key={menu.id}
                type="button"
                onClick={() => selectMenu(menu.id)}
                className={classNames(
                  "w-full rounded-2xl border p-4 text-right transition",
                  selectedId === menu.id
                    ? "border-[#1a1f36] bg-[#1a1f36] text-white"
                    : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black">{menu.title || `قائمة #${menu.id}`}</span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs">{menu.items.length}</span>
                </div>
                <div className="mt-2 text-xs opacity-70">{menu.position || "بدون موضع"}</div>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-5">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#FF385C]">{draft.id ? `#${draft.id}` : "قائمة جديدة"}</p>
                <h2 className="mt-2 text-2xl font-black text-[#1a1f36]">
                  {draft.id ? `تعديل ${draft.title}` : "إنشاء قائمة"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={cloneMenu}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-[#1a1f36]"
                >
                  نسخ القائمة
                </button>
                <button
                  type="button"
                  onClick={exportJson}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-[#1a1f36]"
                >
                  تصدير JSON
                </button>
                <button
                  type="button"
                  disabled={busy === "save"}
                  onClick={() => void saveMenu()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e63252] disabled:opacity-60"
                >
                  {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  حفظ القائمة
                </button>
                <button
                  type="button"
                  disabled={busy === "delete"}
                  onClick={() => void deleteMenu()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  حذف
                </button>
              </div>
            </div>

            {(message || error) && (
              <div
                className={classNames(
                  "mt-5 rounded-2xl border p-4 text-sm font-bold",
                  error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700",
                )}
              >
                <div className="flex items-center gap-2">
                  {error ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {error || message}
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold text-gray-600">عنوان القائمة</span>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="الرئيسية"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold text-gray-600">المفتاح البرمجي</span>
                <input
                  dir="ltr"
                  value={draft.key ?? ""}
                  onChange={(event) => setDraft({ ...draft, key: event.target.value })}
                  placeholder="primary-menu"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold text-gray-600">الموضع</span>
                <input
                  dir="ltr"
                  value={draft.position}
                  onChange={(event) => setDraft({ ...draft, position: event.target.value })}
                  placeholder="primary"
                  list="menu-locations"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
                />
                <datalist id="menu-locations">
                  <option value="primary" />
                  <option value="header" />
                  <option value="footer" />
                  <option value="sidebar" />
                  <option value="mobile-menu" />
                </datalist>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold text-gray-600">حالة القائمة</span>
                <select
                  value={draft.is_active ?? 1}
                  onChange={(event) => setDraft({ ...draft, is_active: Number(event.target.value) })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
                >
                  <option value={1}>نشطة وتظهر في الواجهة</option>
                  <option value={0}>مخفية مؤقتاً</option>
                </select>
              </label>
            </div>
            <label className="mt-4 block space-y-2">
              <span className="text-xs font-bold text-gray-600">وصف داخلي</span>
              <textarea
                value={draft.description ?? ""}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                placeholder="ملاحظة داخلية تساعد فريق الإدارة على معرفة استخدام هذه القائمة"
                className="min-h-24 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
              />
            </label>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-[#1a1f36]">عناصر القائمة</h3>
                <p className="mt-1 text-sm text-gray-500">رتب العناصر وعدل روابطها وخصائص فتحها.</p>
              </div>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, items: [...draft.items, createEmptyItem()] })}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-[#1a1f36]"
              >
                <Plus className="h-4 w-4" />
                إضافة عنصر
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {draft.items.map((item, index) => (
                <article
                  key={`${item.item_id}-${index}`}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => setDragIndex(null)}
                  className={classNames(
                    "rounded-3xl border border-gray-100 bg-gray-50 p-5 transition",
                    dragIndex === index && "opacity-60 ring-2 ring-[#FF385C]/30",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-[#1a1f36]">{item.name || `عنصر ${index + 1}`}</h4>
                        <p className="mt-1 text-xs text-gray-500">{item.url || "رابط غير محدد"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => moveItem(index, -1)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600">رفع</button>
                      <button type="button" onClick={() => moveItem(index, 1)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600">خفض</button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <input value={item.name ?? ""} onChange={(event) => updateItem(index, { name: event.target.value })} placeholder="التسمية" className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]" />
                    <input dir="ltr" value={item.url ?? ""} onChange={(event) => updateItem(index, { url: event.target.value })} placeholder="الرابط أو المرساة" className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]" />
                    <select value={item.type} onChange={(event) => updateItem(index, { type: event.target.value })} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]">
                      <option value="custom">custom</option>
                      <option value="internal">internal route</option>
                      <option value="external">external url</option>
                      <option value="anchor">anchor</option>
                      <option value="dropdown">dropdown parent</option>
                      <option value="page">page</option>
                      <option value="post">post</option>
                      <option value="category">category</option>
                    </select>
                    <input dir="ltr" value={item.route_name ?? ""} onChange={(event) => updateItem(index, { route_name: event.target.value })} placeholder="route.name" className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]" />
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-4">
                    <input type="number" value={item.parent_id ?? 0} onChange={(event) => updateItem(index, { parent_id: Number(event.target.value || 0) })} placeholder="الأب" className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]" />
                    <input type="number" value={item.depth ?? 0} onChange={(event) => updateItem(index, { depth: Number(event.target.value || 0) })} placeholder="المستوى" className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]" />
                    <input type="number" value={item.post_id ?? 0} onChange={(event) => updateItem(index, { post_id: Number(event.target.value || 0) })} placeholder="معرف المحتوى" className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]" />
                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700">
                      <span className="inline-flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        فتح جديد
                      </span>
                      <input type="checkbox" checked={item.target_blank === 1} onChange={(event) => updateItem(index, { target_blank: event.target.checked ? 1 : 0 })} />
                    </label>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <input dir="ltr" value={item.icon ?? ""} onChange={(event) => updateItem(index, { icon: event.target.value })} placeholder="icon name" className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]" />
                    <input dir="ltr" value={item.class || item.css_class || ""} onChange={(event) => updateItem(index, { class: event.target.value, css_class: event.target.value })} placeholder="CSS class" className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]" />
                    <input dir="ltr" value={item.permission_key ?? ""} onChange={(event) => updateItem(index, { permission_key: event.target.value })} placeholder="permission key" className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]" />
                    <select value={item.is_active ?? 1} onChange={(event) => updateItem(index, { is_active: Number(event.target.value) })} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a1f36]">
                      <option value={1}>ظاهر في الواجهة</option>
                      <option value={0}>مخفي</option>
                    </select>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Link2 className="h-4 w-4" />
                      {item.type} {item.post_title ? `- ${item.post_title}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, items: draft.items.filter((_, itemIndex) => itemIndex !== index) })}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف العنصر
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
