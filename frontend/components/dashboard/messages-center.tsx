"use client";

import { useMemo, useState, type ReactNode } from "react";
import { BellRing, CheckCircle2, Mail, MessageSquareMore, Search, Send, Smartphone, UsersRound, Zap, type LucideIcon } from "lucide-react";
import type { BridgeMessagesMeta } from "@/lib/api";
import { secureFetch } from "@/lib/client-security";

export function MessagesCenter({
  meta,
  mode = "all",
}: {
  meta: BridgeMessagesMeta;
  mode?: "all" | "specific";
}) {
  const [globalMessage, setGlobalMessage] = useState("");
  const [mobile, setMobile] = useState("");
  const [specificMessage, setSpecificMessage] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return meta.users.slice(0, 8);
    return meta.users
      .filter((user) => `${user.name} ${user.mobile} ${user.email}`.toLowerCase().includes(needle))
      .slice(0, 8);
  }, [meta.users, query]);

  async function submit(path: string, body: unknown) {
    setMessage(null);
    setError(null);
    setPending(true);

    try {
      const response = await secureFetch(`/api/v1/dashboard/bridge/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = (await response.json()) as { status?: number; message?: string };
      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر إرسال الرسالة.");
        return;
      }

      setMessage(result.message || "تم إرسال الرسالة بنجاح.");
      if (path.endsWith("/all")) setGlobalMessage("");
      if (path.endsWith("/specific")) setSpecificMessage("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
        <div className="grid gap-6 bg-[#1a1f36] p-6 text-white lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FF385C]/15 px-3 py-1 text-xs font-bold text-[#FF385C]">
              <MessageSquareMore className="size-4" />
              مركز رسائل العملاء
            </span>
            <h1 className="mt-4 text-3xl font-black">رسائل الإشعارات</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
              أرسل رسائل جماعية أو مخصصة، راجع الجمهور المستهدف، واستخدم قنوات التواصل المناسبة بدون مغادرة لوحة التحكم.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <HeroStat icon={UsersRound} label="المستخدمون" value={meta.users.length} />
            <HeroStat icon={Smartphone} label="SMS" value="جاهز" />
            <HeroStat icon={BellRing} label="داخل اللوحة" value="نشط" />
            <HeroStat icon={Mail} label="البريد" value="متاح" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          {mode === "all" ? (
            <MessageCard
              title="رسالة جماعية"
              description="إرسال تنبيه واحد لكل المستخدمين المسجلين في النظام."
              icon={UsersRound}
            >
              <textarea
                rows={8}
                value={globalMessage}
                onChange={(event) => setGlobalMessage(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-7 outline-none transition focus:border-[#FF385C] focus:bg-white focus:ring-2 focus:ring-[#FF385C]/15"
                placeholder="اكتب الرسالة التي سترسل لكل المستخدمين"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-gray-400">{globalMessage.length.toLocaleString("ar-SA")} حرف</span>
                <button
                  type="button"
                  disabled={pending || !globalMessage.trim()}
                  onClick={() => submit("dashboard/system-native/messages/all", { message: globalMessage })}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  <Send className="size-4" />
                  إرسال للجميع
                </button>
              </div>
            </MessageCard>
          ) : null}

          <MessageCard
            title="رسالة مخصصة"
            description="أرسل SMS لمستخدم محدد أو اكتب رقم جوال يدويًا."
            icon={Smartphone}
          >
            <div className="grid gap-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ابحث بالاسم أو الجوال أو البريد"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pe-11 ps-4 text-sm outline-none focus:border-[#FF385C] focus:bg-white"
                />
              </div>
              {filteredUsers.length ? (
                <div className="grid gap-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setMobile(user.mobile)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-right transition ${mobile === user.mobile ? "border-[#FF385C] bg-[#FF385C]/5" : "border-gray-100 bg-white hover:border-gray-200"}`}
                    >
                      <span>
                        <b className="block text-sm text-[#1a1f36]">{user.name || `مستخدم #${user.id}`}</b>
                        <span className="text-xs text-gray-400">{user.email || "بدون بريد"}</span>
                      </span>
                      <span className="font-mono text-xs text-gray-500" dir="ltr">{user.mobile || "-"}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <input
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                placeholder="رقم الجوال"
                dir="ltr"
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#FF385C] focus:bg-white"
              />
              <textarea
                rows={7}
                value={specificMessage}
                onChange={(event) => setSpecificMessage(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-7 outline-none focus:border-[#FF385C] focus:bg-white"
                placeholder="اكتب الرسالة"
              />
              <button
                type="button"
                disabled={pending || !mobile.trim() || !specificMessage.trim()}
                onClick={() => submit("dashboard/system-native/messages/specific", { mobile, message: specificMessage })}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                <Send className="size-4" />
                إرسال رسالة مخصصة
              </button>
            </div>
          </MessageCard>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-black text-[#1a1f36]">قنوات الإرسال</h2>
            <div className="mt-4 space-y-3">
              <Channel icon={BellRing} title="تنبيه داخل اللوحة" state="نشط" />
              <Channel icon={Smartphone} title="رسائل SMS" state="جاهز" />
              <Channel icon={Mail} title="البريد الإلكتروني" state="متاح" />
              <Channel icon={Zap} title="Webhook" state="اختياري" />
            </div>
          </section>
          <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-black text-[#1a1f36]">إرشادات سريعة</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-gray-600">
              <li>استخدم الرسائل الجماعية للتنبيهات العامة فقط.</li>
              <li>تجنب إرسال روابط غير موثوقة داخل SMS.</li>
              <li>راجع رقم الجوال قبل الإرسال المخصص.</li>
            </ul>
          </section>
        </aside>
      </div>

      {message ? (
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

function HeroStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <Icon className="mb-3 size-5 text-[#FF385C]" />
      <div className="text-xl font-black">{typeof value === "number" ? value.toLocaleString("ar-SA") : value}</div>
      <div className="mt-1 text-xs font-bold text-white/60">{label}</div>
    </div>
  );
}

function MessageCard({ title, description, icon: Icon, children }: { title: string; description: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#1a1f36]">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Channel({ icon: Icon, title, state }: { icon: LucideIcon; title: string; state: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-3">
      <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-700">
        <Icon className="size-4 text-[#FF385C]" />
        {title}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
        <CheckCircle2 className="size-3.5" />
        {state}
      </span>
    </div>
  );
}
