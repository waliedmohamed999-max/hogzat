import { headers } from "next/headers";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  Landmark,
  Link2,
  ReceiptText,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { PayoutItemActions } from "@/components/dashboard/payout-item-actions";
import { FinanceActionButton, type FinanceQuickAction } from "@/components/dashboard/finance-action-button";
import { getDashboardFinanceStats, getDashboardPayouts } from "@/lib/api";
import { SAUDI_RIYAL_SYMBOL } from "@/lib/presentation";

type DashboardPayoutsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function formatMoney(value: number, currency = SAUDI_RIYAL_SYMBOL) {
  const normalizedCurrency = ["SR", "SAR", "ر.س", "ريال", "ريال سعودي", "رس", "⃁"].includes(currency)
    ? SAUDI_RIYAL_SYMBOL
    : currency;
  return `${Number(value || 0).toLocaleString("ar-SA")} ${normalizedCurrency}`;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "قيد الانتظار",
    completed: "مكتملة",
    processing: "قيد المعالجة",
    failed: "فاشلة",
  };
  return labels[status] || status || "غير محدد";
}

function statusClass(status: string) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700";
  if (status === "failed") return "bg-rose-50 text-rose-600";
  if (status === "processing") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
}

function StatCard({
  label,
  value,
  hint,
  tone = "dark",
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "dark" | "green" | "pink" | "blue";
  icon: typeof Wallet;
}) {
  const tones = {
    dark: "bg-[#1a1f36] text-white",
    green: "bg-emerald-50 text-emerald-700",
    pink: "bg-[#FF385C]/10 text-[#FF385C]",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-gray-500">{label}</p>
          <p className="mt-3 text-2xl font-black text-[#1a1f36]">{value}</p>
          <p className="mt-2 text-xs font-semibold text-gray-400">{hint}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ToolCard({
  title,
  desc,
  icon: Icon,
  action,
  actionKey,
}: {
  title: string;
  desc: string;
  icon: typeof Wallet;
  action: string;
  actionKey: FinanceQuickAction;
}) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-black text-[#1a1f36]">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">{desc}</p>
      <FinanceActionButton action={actionKey} className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {action}
      </FinanceActionButton>
    </div>
  );
}

export default async function DashboardPayoutsPage({ searchParams }: DashboardPayoutsPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const [payouts, financeStats] = await Promise.all([
    getDashboardPayouts(cookieHeader, resolvedSearchParams),
    getDashboardFinanceStats(cookieHeader, resolvedSearchParams),
  ]);
  const rows = payouts?.results ?? [];

  const totalPayouts = rows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const completed = rows.filter((item) => item.status === "completed").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pending = rows.filter((item) => item.status !== "completed").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const revenue = financeStats?.total_revenue ?? totalPayouts;
  const vat = financeStats?.vat ?? Math.round(totalPayouts * 0.15);
  const expenses = financeStats?.expenses ?? Math.round(totalPayouts * 0.08);
  const net = financeStats?.net_profit ?? Math.max(totalPayouts - vat - expenses, 0);
  const invoiceCount = rows.length || 0;

  return (
    <div className="space-y-6" dir="rtl">
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-[#1a1f36] text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
              <Wallet className="h-4 w-4 text-[#FF385C]" />
              النظام المالي
            </div>
            <h1 className="mt-5 text-3xl font-black">المالية والمدفوعات</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
              مركز مالي متكامل للتحويلات، الفواتير، التسويات، الضرائب، تقارير الإيرادات، وربط الفوترة الإلكترونية مع هيئة الزكاة والضريبة والجمارك.
            </p>
          </div>
          <div className="grid min-w-[280px] gap-3 rounded-2xl bg-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-white/70">حالة زاتكا</span>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">جاهز للربط</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-white/70">VAT</span>
              <span className="font-black">15%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-white/70">العملة</span>
              <span className="font-black">{SAUDI_RIYAL_SYMBOL}</span>
            </div>
          </div>
        </div>
        <div className="grid border-t border-white/10 bg-white/5 p-4 text-sm text-white/70 md:grid-cols-4">
          <div className="flex items-center gap-2 px-3 py-2"><ReceiptText className="h-4 w-4 text-[#FF385C]" /> فواتير ضريبية وإشعارات دائن</div>
          <div className="flex items-center gap-2 px-3 py-2"><Landmark className="h-4 w-4 text-[#FF385C]" /> تسويات بنكية وشركاء</div>
          <div className="flex items-center gap-2 px-3 py-2"><ShieldCheck className="h-4 w-4 text-[#FF385C]" /> ربط ZATCA وفوترة إلكترونية</div>
          <div className="flex items-center gap-2 px-3 py-2"><FileSpreadsheet className="h-4 w-4 text-[#FF385C]" /> تقارير قابلة للتصدير</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="إجمالي الإيرادات" value={formatMoney(revenue)} hint="بيانات فعلية من قاعدة البيانات" icon={ArrowUpRight} tone="pink" />
        <StatCard label="تم تحويله" value={formatMoney(completed)} hint="دفعات مكتملة" icon={CheckCircle2} tone="green" />
        <StatCard label="قيد المعالجة" value={formatMoney(pending)} hint="ينتظر اعتماد مالي" icon={Wallet} tone="blue" />
        <StatCard label="ضريبة القيمة المضافة" value={formatMoney(vat)} hint="احتساب مبدئي 15%" icon={ReceiptText} tone="dark" />
        <StatCard label="الصافي المتوقع" value={formatMoney(net)} hint="بعد الضريبة والرسوم" icon={Banknote} tone="green" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-[#1a1f36]">دفتر الأستاذ المالي</h2>
              <p className="mt-2 text-sm text-gray-500">توزيع الإيرادات والرسوم والضرائب وصافي مستحقات الشركاء.</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700">يومي</button>
              <button className="rounded-xl bg-[#1a1f36] px-4 py-2 text-xs font-bold text-white">شهري</button>
              <button className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700">سنوي</button>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["الإيرادات", revenue, "bg-[#FF385C]"],
              ["المصروفات", expenses, "bg-[#1a1f36]"],
              ["VAT", vat, "bg-amber-500"],
              ["صافي الشركاء", net, "bg-emerald-500"],
            ].map(([label, value, color]) => (
              <div key={String(label)} className="rounded-2xl bg-gray-50 p-4">
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min((Number(value) / Math.max(totalPayouts, 1)) * 100, 100)}%` }} />
                </div>
                <p className="mt-4 text-xs font-bold text-gray-500">{label}</p>
                <p className="mt-1 text-lg font-black text-[#1a1f36]">{formatMoney(Number(value))}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-gray-50 p-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-gray-500">حالة المطابقة البنكية</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">مطابقة مبدئية</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-white p-4"><p className="text-xs text-gray-400">آخر تسوية</p><p className="mt-2 font-black text-[#1a1f36]">اليوم 02:30</p></div>
                  <div className="rounded-xl bg-white p-4"><p className="text-xs text-gray-400">إجمالي المصروفات</p><p className="mt-2 font-black text-emerald-700">{formatMoney(expenses)}</p></div>
              <div className="rounded-xl bg-white p-4"><p className="text-xs text-gray-400">فواتير مولدة</p><p className="mt-2 font-black text-[#1a1f36]">{invoiceCount.toLocaleString("ar-SA")}</p></div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-[#1a1f36]">ربط زاتكا</h2>
              <p className="mt-2 text-sm text-gray-500">إعدادات الفوترة الإلكترونية والربط مع هيئة الزكاة والضريبة والجمارك.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[
              ["الرقم الضريبي", "جاهز للإدخال"],
              ["وضع الربط", "Sandbox / Production"],
              ["شهادة التوقيع", "لم يتم رفعها"],
              ["QR ضريبي", "مفعل للفواتير"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                <span className="text-sm font-bold text-gray-500">{label}</span>
                <span className="text-sm font-black text-[#1a1f36]">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FinanceActionButton action="zatca-settings" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF385C] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
              <Link2 className="h-4 w-4" />
              إعداد الربط
            </FinanceActionButton>
            <FinanceActionButton action="test-invoice" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 disabled:opacity-60">
              <FileCheck2 className="h-4 w-4" />
              اختبار فاتورة
            </FinanceActionButton>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        <ToolCard title="إصدار فاتورة ضريبية" desc="إنشاء فاتورة PDF مع QR، VAT، رقم ضريبي، وبيانات العميل والشريك." icon={ReceiptText} action="إنشاء فاتورة" actionKey="issue-invoice" />
        <ToolCard title="إشعار دائن / استرداد" desc="إصدار إشعار دائن مرتبط بعملية استرداد أو تعديل مبلغ الفاتورة." icon={ArrowDownLeft} action="إنشاء إشعار" actionKey="refund" />
        <ToolCard title="تصدير تقرير VAT" desc="تقرير شهري لضريبة القيمة المضافة قابل للمراجعة والمحاسبة." icon={FileSpreadsheet} action="تصدير التقرير" actionKey="export-vat" />
        <ToolCard title="مطابقة بوابات الدفع" desc="مطابقة Stripe/PayTabs/HyperPay مع التحويلات والفواتير البنكية." icon={CreditCard} action="بدء المطابقة" actionKey="reconcile" />
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#1a1f36]">طلبات الصرف والتحويلات</h2>
            <p className="mt-2 text-sm text-gray-500">إدارة طلبات الصرف الحالية ومراجعتها وتحديث حالتها.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/system/payments" className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">
              لوحة الدفع
            </Link>
            <FinanceActionButton action="export-ledger" className="inline-flex items-center gap-2 rounded-2xl border border-[#FF385C]/25 bg-[#FF385C]/10 px-4 py-3 text-sm font-bold text-[#FF385C] disabled:opacity-60">
              <Download className="h-4 w-4" />
              تصدير Excel
            </FinanceActionButton>
          </div>
        </div>
        <form className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto]">
          <label className="relative">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="_s"
              defaultValue={firstValue(resolvedSearchParams._s)}
              placeholder="بحث برقم الدفعة أو معرف المستخدم"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
            />
          </label>
          <select
            name="status"
            defaultValue={firstValue(resolvedSearchParams.status)}
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
          >
            <option value="">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="processing">قيد المعالجة</option>
            <option value="completed">مكتملة</option>
            <option value="failed">فاشلة</option>
          </select>
          <label className="relative">
            <Calendar className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="date" name="date" className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white" />
          </label>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2d3458]">
            <Filter className="h-4 w-4" />
            فلترة
          </button>
        </form>
      </section>

      {rows.length > 0 ? (
        <section className="space-y-5">
          {rows.map((item) => (
            <article
              key={item.id}
              className="grid gap-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-gray-200 hover:shadow-md lg:grid-cols-[minmax(0,1fr)_280px]"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#FF385C]">طلب صرف</p>
                    <h2 className="mt-2 text-2xl font-black text-[#1a1f36]">{item.payout_id || `دفعة #${item.id}`}</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(item.status)}`}>
                    {statusLabel(item.status)}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                    <div className="text-xs font-bold text-gray-400">المبلغ</div>
                    <div className="mt-1 font-black text-[#1a1f36]">{formatMoney(item.amount, item.currency)}</div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                    <div className="text-xs font-bold text-gray-400">المستخدم</div>
                    <div className="mt-1 font-black text-[#1a1f36]">#{item.user_id}</div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                    <div className="text-xs font-bold text-gray-400">الفاتورة</div>
                    <div className="mt-1 font-black text-[#1a1f36]">INV-{item.id.toString().padStart(5, "0")}</div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                    <div className="text-xs font-bold text-gray-400">الإنشاء</div>
                    <div className="mt-1 font-black text-[#1a1f36]">{item.created_at || "-"}</div>
                  </div>
                </div>
                {item.note ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{item.note}</p> : null}
              </div>
              <PayoutItemActions id={item.id} detailUrl={`/dashboard/system/payouts/${item.id}`} />
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
            <Wallet className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-xl font-black text-[#1a1f36]">لا توجد طلبات صرف حالياً</h2>
          <p className="mt-2 text-sm text-gray-500">عند وصول طلبات صرف جديدة ستظهر هنا مع الفواتير والتسويات المرتبطة بها.</p>
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-[#1a1f36]">إعدادات الفواتير</h3>
          <div className="mt-5 space-y-3">
            <input placeholder="الرقم الضريبي" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
            <input placeholder="اسم المنشأة القانوني" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
            <select className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none">
              <option>فاتورة ضريبية مبسطة</option>
              <option>فاتورة ضريبية كاملة</option>
            </select>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-[#1a1f36]">سياسات التحويل</h3>
          <div className="mt-5 space-y-3">
            <select className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none">
              <option>شهري</option>
              <option>أسبوعي</option>
              <option>نصف شهري</option>
              <option>يدوي</option>
            </select>
            <input placeholder="الحد الأدنى للتحويل" defaultValue="500" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
            <label className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600">
              موافقة مالية قبل الصرف
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-[#1a1f36]">حسابات بنكية</h3>
          <div className="mt-5 space-y-3">
            <input dir="ltr" placeholder="IBAN" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
            <input placeholder="اسم البنك" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
            <FinanceActionButton action="save-settings" className="w-full rounded-2xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">حفظ إعدادات المالية</FinanceActionButton>
          </div>
        </div>
      </section>
    </div>
  );
}
