"use client";

import { secureFetch } from "@/lib/client-security";
import type { PaymentMethod, PaymentMethodKey } from "@/lib/payment-methods";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  HandCoins,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TabKey = "gateways" | "transactions" | "overview" | "refunds" | "payouts" | "settings";

type PaymentStats = {
  totalRevenue: number;
  todayRevenue: number;
  pending: number;
  refunded: number;
  todayTransactions: number;
  pendingCount: number;
  refundedCount: number;
};

type Transaction = {
  id: string;
  bookingId: string;
  customer: string;
  customerEmail: string;
  gateway: string;
  amount: number;
  status: "success" | "failed" | "pending" | "refunded" | "review";
  date: string;
  durationMs: number;
};

type RefundRequest = {
  id: string;
  bookingId: string;
  customer: string;
  amount: number;
  reason: string;
  status: "review" | "approved" | "rejected" | "processed";
  date: string;
};

type PartnerPayout = {
  partnerId: string;
  partner: string;
  listings: number;
  totalRevenue: number;
  due: number;
  lastPayout: string;
  status: "ready" | "processing" | "paid";
};

type ChartPoint = { label: string; revenue: number; refunds: number; net: number };

type PaymentSettings = {
  currency: string;
  currencyPosition: "after" | "before";
  decimals: number;
  serviceFeePercent: number;
  fixedFee: number;
  feePayer: "customer" | "partner" | "split";
  invoicesEnabled: boolean;
  vatNumber: string;
  refundApprovalRequired: boolean;
  payoutSchedule: "manual" | "weekly" | "semi_monthly" | "monthly";
  minPayout: number;
};

const tabs: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "gateways", label: "بوابات الدفع", icon: CreditCard },
  { key: "transactions", label: "المعاملات", icon: Receipt },
  { key: "overview", label: "المدفوعات", icon: WalletCards },
  { key: "refunds", label: "المستردات", icon: RefreshCw },
  { key: "payouts", label: "التحويلات للشركاء", icon: HandCoins },
  { key: "settings", label: "الإعدادات", icon: Settings },
];

const gatewayMeta: Record<PaymentMethodKey, { icon: string; title: string; type: string }> = {
  visa: { icon: "💳", title: "فيزا / Visa", type: "بوابة إلكترونية" },
  bank_transfer: { icon: "🏦", title: "تحويل بنكي", type: "متابعة يدوية" },
  mastercard: { icon: "💳", title: "ماستر كارد", type: "بوابة إلكترونية" },
  mada: { icon: "📱", title: "مدى", type: "بوابة إلكترونية" },
  apple_pay: { icon: "🍎", title: "Apple Pay", type: "بوابة إلكترونية" },
  stc_pay: { icon: "🟢", title: "STC Pay", type: "بوابة إلكترونية" },
  paytabs: { icon: "💰", title: "PayTabs", type: "بوابة إلكترونية" },
  hyperpay: { icon: "🔵", title: "HyperPay", type: "بوابة إلكترونية" },
  cash: { icon: "💵", title: "دفع عند الوصول", type: "نقدي" },
  installments: { icon: "🔄", title: "تقسيط Tabby/Tamara", type: "تقسيط" },
};

const defaultStats: PaymentStats = {
  totalRevenue: 0,
  todayRevenue: 0,
  pending: 0,
  refunded: 0,
  todayTransactions: 0,
  pendingCount: 0,
  refundedCount: 0,
};

const defaultSettings: PaymentSettings = {
  currency: "SAR",
  currencyPosition: "after",
  decimals: 0,
  serviceFeePercent: 8,
  fixedFee: 0,
  feePayer: "customer",
  invoicesEnabled: true,
  vatNumber: "300000000000003",
  refundApprovalRequired: true,
  payoutSchedule: "monthly",
  minPayout: 500,
};

function money(value: number) {
  return `${Number(value || 0).toLocaleString("ar-SA")} ر.س`;
}

function relativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    success: "ناجحة",
    failed: "فاشلة",
    pending: "معلّقة",
    refunded: "مستردة",
    review: "قيد المراجعة",
    approved: "مقبولة",
    rejected: "مرفوضة",
    processed: "منفّذة",
  };
  return labels[status] ?? status;
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    success: "bg-green-50 text-green-700",
    approved: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-600",
    rejected: "bg-red-50 text-red-600",
    pending: "bg-yellow-50 text-yellow-700",
    review: "bg-blue-50 text-blue-700",
    refunded: "bg-purple-50 text-purple-700",
    processed: "bg-purple-50 text-purple-700",
    ready: "bg-green-50 text-green-700",
    processing: "bg-yellow-50 text-yellow-700",
    paid: "bg-purple-50 text-purple-700",
  };
  return classes[status] ?? "bg-gray-100 text-gray-600";
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-green-500" : "bg-gray-300"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "right-6" : "right-1"}`} />
    </button>
  );
}

function StatCard({ title, value, sub, icon: Icon }: { title: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <p className="mt-3 text-2xl font-bold text-gray-950">{value}</p>
          <p className="mt-2 text-xs text-emerald-600">{sub}</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function MiniAreaChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((item) => item.revenue), 1);
  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (item.revenue / max) * 82;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 110" className="h-64 w-full overflow-visible">
      <defs>
        <linearGradient id="paymentChart" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FF385C" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FF385C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,100 ${points} 100,100`} fill="url(#paymentChart)" stroke="none" />
      <polyline points={points} fill="none" stroke="#FF385C" strokeLinecap="round" strokeWidth="2.5" />
      {data.map((item, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * 100;
        const y = 100 - (item.revenue / max) * 82;
        return <circle key={item.label} cx={x} cy={y} fill="#1a1f36" r="1.7" />;
      })}
    </svg>
  );
}

function DonutChart({ methods, transactions }: { methods: PaymentMethod[]; transactions: Transaction[] }) {
  const successful = transactions.filter((transaction) => transaction.status === "success");
  const distribution = methods
    .map((method) => ({
      method,
      total: successful.filter((transaction) => transaction.gateway === method.key).reduce((sum, transaction) => sum + transaction.amount, 0),
      count: successful.filter((transaction) => transaction.gateway === method.key).length,
    }))
    .filter((item) => item.total > 0 || item.count > 0);
  const totalAmount = distribution.reduce((sum, item) => sum + item.total, 0);
  return (
    <div className="flex flex-col items-center gap-5 lg:flex-row">
      <div className={`relative size-40 rounded-full ${distribution.length ? "bg-[conic-gradient(#FF385C_0_35%,#1a1f36_35%_58%,#10B981_58%_78%,#F59E0B_78%_100%)]" : "bg-gray-100"}`}>
        <div className="absolute inset-8 flex items-center justify-center rounded-full bg-white text-center text-sm font-bold text-gray-900">
          {distribution.length}
          <br />
          بوابة
        </div>
      </div>
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        {distribution.length ? distribution.slice(0, 6).map(({ method, total }) => (
          <div key={method.key} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm">
            <span>{method.label}</span>
            <span className="font-bold text-gray-900">{totalAmount ? Math.round((total / totalAmount) * 100) : 0}%</span>
          </div>
        )) : <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-400 sm:col-span-2">لا توجد معاملات مدفوعة بعد</div>}
      </div>
    </div>
  );
}

export function PaymentMethodsManager({ initialMethods }: { initialMethods: PaymentMethod[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("gateways");
  const [environment, setEnvironment] = useState<"test" | "live">("test");
  const [methods, setMethods] = useState(initialMethods);
  const [stats, setStats] = useState<PaymentStats>(defaultStats);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [payouts, setPayouts] = useState<PartnerPayout[]>([]);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [openGateway, setOpenGateway] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundModal, setRefundModal] = useState<RefundRequest | null>(null);
  const [payoutModal, setPayoutModal] = useState<PartnerPayout | null>(null);
  const [customGatewayOpen, setCustomGatewayOpen] = useState(false);

  useEffect(() => {
    void refreshDashboard();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ q: query, status: statusFilter, gateway: gatewayFilter });
    fetch(`/api/admin/payments/transactions?${params.toString()}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { data?: Transaction[] }) => setTransactions(result.data ?? []))
      .catch(() => undefined);
  }, [query, statusFilter, gatewayFilter]);

  async function refreshDashboard() {
    const [statsResult, transactionsResult, refundsResult, payoutsResult, chartResult, settingsResult] = await Promise.all([
      fetch("/api/admin/payments/stats", { cache: "no-store" }).then((response) => response.json()).catch(() => null),
      fetch("/api/admin/payments/transactions", { cache: "no-store" }).then((response) => response.json()).catch(() => null),
      fetch("/api/admin/payments/refunds", { cache: "no-store" }).then((response) => response.json()).catch(() => null),
      fetch("/api/admin/payments/payouts", { cache: "no-store" }).then((response) => response.json()).catch(() => null),
      fetch("/api/admin/payments/revenue-chart", { cache: "no-store" }).then((response) => response.json()).catch(() => null),
      fetch("/api/admin/payments/settings", { cache: "no-store" }).then((response) => response.json()).catch(() => null),
    ]);
    setStats(statsResult?.data ?? defaultStats);
    setTransactions(transactionsResult?.data ?? []);
    setRefunds(refundsResult?.data ?? []);
    setPayouts(payoutsResult?.data ?? []);
    setChart(chartResult?.data ?? []);
    setSettings(settingsResult?.data ?? defaultSettings);
  }

  function updateMethod(key: PaymentMethod["key"], patch: Partial<PaymentMethod>) {
    setMethods((current) => current.map((method) => (method.key === key ? { ...method, ...patch } : method)));
  }

  async function saveAll() {
    setSaving(true);
    setMessage(null);
    const response = await secureFetch("/api/v1/dashboard/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ methods }),
    });
    const result = (await response.json().catch(() => null)) as { status?: number; message?: string; data?: PaymentMethod[] } | null;
    if (response.ok && result?.status === 1 && result.data) {
      setMethods(result.data);
      setMessage(result.message ?? "تم حفظ إعدادات الدفع.");
    } else {
      setMessage(result?.message ?? "تعذر حفظ إعدادات الدفع.");
    }

    await secureFetch("/api/admin/payments/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }).catch(() => undefined);
    setSaving(false);
  }

  async function saveGateway(key: PaymentMethod["key"]) {
    const gateway = methods.find((method) => method.key === key);
    if (!gateway) return;
    const response = await secureFetch(`/api/admin/payments/gateways/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gateway),
    });
    setMessage(response.ok ? "تم حفظ إعدادات البوابة." : "تعذر حفظ البوابة.");
  }

  async function testGateway(key: PaymentMethod["key"]) {
    const response = await secureFetch(`/api/admin/payments/gateways/${key}/test`, { method: "POST" });
    const result = (await response.json().catch(() => null)) as { message?: string } | null;
    setMessage(result?.message ?? (response.ok ? "تم اختبار الاتصال." : "تعذر اختبار الاتصال."));
  }

  async function copyValue(value: string) {
    await navigator.clipboard?.writeText(value).catch(() => undefined);
    setMessage("تم النسخ.");
  }

  async function updateRefund(refund: RefundRequest, status: RefundRequest["status"]) {
    const response = await secureFetch(`/api/admin/payments/refunds/${refund.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      setRefundModal(null);
      await refreshDashboard();
      setMessage("تم تحديث حالة الاسترداد.");
    }
  }

  async function processPayout(payout: PartnerPayout) {
    const response = await secureFetch(`/api/admin/payments/payouts/${payout.partnerId}`, { method: "POST" });
    if (response.ok) {
      setPayoutModal(null);
      await refreshDashboard();
      setMessage("تم تسجيل التحويل للشريك.");
    }
  }

  const filteredRefundSummary = useMemo(() => {
    const total = refunds.reduce((sum, item) => sum + item.amount, 0);
    const month = refunds.filter((item) => new Date(item.date).getMonth() === new Date().getMonth()).reduce((sum, item) => sum + item.amount, 0);
    return { total, month, rate: refunds.length ? 2.4 : 0 };
  }, [refunds]);

  const payoutSummary = useMemo(
    () => ({
      due: payouts.reduce((sum, item) => sum + item.due, 0),
      paid: 0,
      processing: payouts.filter((item) => item.status === "processing").reduce((sum, item) => sum + item.due, 0),
      month: 0,
    }),
    [payouts],
  );

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F8FA] font-[Cairo] text-gray-950">
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-[#F7F8FA]/95 px-4 py-5 backdrop-blur lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#1a1f36] text-white shadow-sm">
              <CreditCard className="size-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-950">لوحة الدفع</h1>
              <p className="mt-1 text-sm text-gray-500">إدارة بوابات الدفع وطرق السداد والمعاملات المالية</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-2xl border border-gray-200 bg-white p-1">
              {(["test", "live"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setEnvironment(mode)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    environment === mode ? "bg-[#1a1f36] text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {mode === "test" ? "🧪 وضع الاختبار" : "🟢 الإنتاج"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={saveAll}
              disabled={saving}
              className="rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#e62f50] disabled:opacity-60"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ جميع الإعدادات"}
            </button>
          </div>
        </div>
        {message ? <p className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1a1f36] shadow-sm">{message}</p> : null}
      </div>

      <main className="space-y-6 p-4 lg:p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="إجمالي الإيرادات" value={money(stats.totalRevenue)} sub="0% هذا الشهر" icon={ArrowUpRight} />
          <StatCard title="معاملات اليوم" value={money(stats.todayRevenue)} sub={`${stats.todayTransactions} معاملة`} icon={Receipt} />
          <StatCard title="قيد المراجعة" value={money(stats.pending)} sub={`${stats.pendingCount} معاملات`} icon={AlertTriangle} />
          <StatCard title="مسترجعة" value={money(stats.refunded)} sub={`${stats.refundedCount} معاملات`} icon={ArrowDownLeft} />
        </section>

        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  activeTab === tab.key ? "bg-[#1a1f36] text-white shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {activeTab === "gateways" ? (
          <section className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-2">
              {methods.map((method) => (
                <GatewayCard
                  key={method.key}
                  method={method}
                  open={Boolean(openGateway[method.key])}
                  secretVisible={Boolean(visibleSecrets[method.key])}
                  onOpen={() => setOpenGateway((current) => ({ ...current, [method.key]: !current[method.key] }))}
                  onSecret={() => setVisibleSecrets((current) => ({ ...current, [method.key]: !current[method.key] }))}
                  onChange={(patch) => updateMethod(method.key, patch)}
                  onCopy={copyValue}
                  onSave={() => void saveGateway(method.key)}
                  onTest={() => void testGateway(method.key)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCustomGatewayOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-5 text-sm font-bold text-[#1a1f36] transition hover:border-[#1a1f36]"
            >
              <Plus className="size-4" />
              إضافة بوابة دفع مخصصة
            </button>
          </section>
        ) : null}

        {activeTab === "transactions" ? (
          <TransactionsTab
            transactions={transactions}
            methods={methods}
            query={query}
            statusFilter={statusFilter}
            gatewayFilter={gatewayFilter}
            onQuery={setQuery}
            onStatus={setStatusFilter}
            onGateway={setGatewayFilter}
            onSelect={setSelectedTransaction}
          />
        ) : null}

        {activeTab === "overview" ? (
          <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">الإيرادات والمدفوعات</h2>
                  <p className="mt-1 text-sm text-gray-500">تحليل الإيرادات والمستردات والصافي خلال الفترة المحددة.</p>
                </div>
                <div className="flex gap-2">
                  {["يومي", "أسبوعي", "شهري", "سنوي"].map((item) => (
                    <button key={item} type="button" className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:border-[#1a1f36]">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <MiniAreaChart data={chart} />
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-4 text-sm">إجمالي الإيرادات: <b>{money(stats.totalRevenue)}</b></div>
                <div className="rounded-xl bg-gray-50 p-4 text-sm">إجمالي المستردات: <b>{money(filteredRefundSummary.total)}</b></div>
                <div className="rounded-xl bg-gray-50 p-4 text-sm">الصافي: <b>{money(stats.totalRevenue - filteredRefundSummary.total)}</b></div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">توزيع طرق الدفع</h2>
                <DonutChart methods={methods} transactions={transactions} />
              </div>
              <TopCustomers transactions={transactions} />
            </div>
          </section>
        ) : null}

        {activeTab === "refunds" ? (
          <RefundsTab refunds={refunds} summary={filteredRefundSummary} onOpen={setRefundModal} />
        ) : null}

        {activeTab === "payouts" ? (
          <PayoutsTab payouts={payouts} summary={payoutSummary} settings={settings} setSettings={setSettings} onOpen={setPayoutModal} />
        ) : null}

        {activeTab === "settings" ? (
          <SettingsTab settings={settings} setSettings={setSettings} />
        ) : null}
      </main>

      {selectedTransaction ? <TransactionDrawer transaction={selectedTransaction} methods={methods} onClose={() => setSelectedTransaction(null)} /> : null}
      {refundModal ? <RefundModal refund={refundModal} onClose={() => setRefundModal(null)} onConfirm={(status) => void updateRefund(refundModal, status)} /> : null}
      {payoutModal ? <PayoutModal payout={payoutModal} onClose={() => setPayoutModal(null)} onConfirm={() => void processPayout(payoutModal)} /> : null}
      {customGatewayOpen ? <CustomGatewayModal onClose={() => setCustomGatewayOpen(false)} /> : null}
    </div>
  );
}

function GatewayCard({
  method,
  open,
  secretVisible,
  onOpen,
  onSecret,
  onChange,
  onCopy,
  onSave,
  onTest,
}: {
  method: PaymentMethod;
  open: boolean;
  secretVisible: boolean;
  onOpen: () => void;
  onSecret: () => void;
  onChange: (patch: Partial<PaymentMethod>) => void;
  onCopy: (value: string) => void;
  onSave: () => void;
  onTest: () => void;
}) {
  const meta = gatewayMeta[method.key];
  const isManual = method.key === "bank_transfer";
  const isCash = method.key === "cash";
  const secretType = secretVisible ? "text" : "password";

  return (
    <article className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition ${method.enabled ? "border-l-4 border-l-green-400" : "border-l-4 border-l-gray-200 opacity-75"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-gray-50 text-2xl">{meta.icon}</span>
          <div>
            <h2 className="text-base font-bold text-gray-950">{meta.title}</h2>
            <p className="mt-1 text-xs text-gray-500">{meta.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${method.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {method.enabled ? "نشط" : "معطّل"}
          </span>
          <Toggle checked={method.enabled} onChange={(enabled) => onChange({ enabled })} />
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <Input label="اسم الطريقة" value={method.label} onChange={(label) => onChange({ label })} />
        <Textarea label="وصف للعميل" value={method.description} onChange={(description) => onChange({ description })} />
      </div>

      <button type="button" onClick={onOpen} className="mt-5 flex w-full items-center justify-between border-t border-gray-100 pt-4 text-sm font-bold text-[#1a1f36]">
        <span>إعدادات المفاتيح</span>
        <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="mt-4 grid gap-3 rounded-2xl bg-gray-50 p-4">
          {isManual ? (
            <>
              <Input label="اسم البنك" value={method.bankName ?? ""} onChange={(bankName) => onChange({ bankName })} />
              <Input label="اسم صاحب الحساب" value={method.accountName ?? ""} onChange={(accountName) => onChange({ accountName })} />
              <Input label="رقم الحساب / IBAN" value={method.iban ?? ""} onChange={(iban) => onChange({ iban })} ltr />
              <Input label="رمز السويفت" value={method.swift ?? ""} onChange={(swift) => onChange({ swift })} ltr />
            </>
          ) : isCash ? (
            <Input label="الحد الأقصى للمبلغ" value={String(method.maxAmount ?? 0)} onChange={(maxAmount) => onChange({ maxAmount: Number(maxAmount) })} ltr />
          ) : method.key === "mada" || method.key === "stc_pay" || method.key === "paytabs" || method.key === "hyperpay" || method.key === "installments" ? (
            <>
              <Input label="Merchant ID" value={method.merchantId ?? ""} onChange={(merchantId) => onChange({ merchantId })} ltr />
              <Input label="Terminal ID" value={method.terminalId ?? ""} onChange={(terminalId) => onChange({ terminalId })} ltr />
              <SecretInput label="Merchant Key" value={method.merchantKey ?? ""} visible={secretVisible} onToggle={onSecret} onCopy={onCopy} onChange={(merchantKey) => onChange({ merchantKey })} />
            </>
          ) : (
            <>
              <SecretInput label="المفتاح العام" value={method.publicKey ?? ""} visible={secretVisible} onToggle={onSecret} onCopy={onCopy} onChange={(publicKey) => onChange({ publicKey })} type="text" />
              <SecretInput label="المفتاح الخاص" value={method.secretKey ?? ""} visible={secretVisible} onToggle={onSecret} onCopy={onCopy} onChange={(secretKey) => onChange({ secretKey })} type={secretType} />
              <SecretInput label="Webhook Secret" value={method.webhookSecret ?? ""} visible={secretVisible} onToggle={onSecret} onCopy={onCopy} onChange={(webhookSecret) => onChange({ webhookSecret })} type={secretType} />
            </>
          )}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        <Textarea label="تعليمات إضافية" value={method.instructions ?? ""} onChange={(instructions) => onChange({ instructions })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="رسوم المعاملة %" value={String(method.feePercent ?? 0)} onChange={(feePercent) => onChange({ feePercent: Number(feePercent) })} ltr />
          <Input label="رسوم ثابتة ر.س" value={String(method.feeFixed ?? 0)} onChange={(feeFixed) => onChange({ feeFixed: Number(feeFixed) })} ltr />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onTest} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:border-[#1a1f36]">
          اختبار الاتصال
        </button>
        <button type="button" onClick={onSave} className="rounded-xl bg-[#1a1f36] px-4 py-2 text-xs font-bold text-white hover:bg-[#2d3458]">
          حفظ الإعدادات
        </button>
      </div>
    </article>
  );
}

function Input({ label, value, onChange, ltr = false }: { label: string; value: string; onChange: (value: string) => void; ltr?: boolean }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-gray-700">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} dir={ltr ? "ltr" : "rtl"} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36]" />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-gray-700">{label}</span>
      <textarea value={value} rows={3} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36]" />
    </label>
  );
}

function SecretInput({
  label,
  value,
  visible,
  onToggle,
  onCopy,
  onChange,
  type,
}: {
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onCopy: (value: string) => void;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-gray-700">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
        <input value={value} onChange={(event) => onChange(event.target.value)} type={type ?? (visible ? "text" : "password")} dir="ltr" className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none" />
        <button type="button" onClick={onToggle} className="rounded-lg p-2 text-gray-500 hover:bg-gray-50">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
        <button type="button" onClick={() => onCopy(value)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-50"><Copy className="size-4" /></button>
      </div>
    </label>
  );
}

function TransactionsTab({
  transactions,
  methods,
  query,
  statusFilter,
  gatewayFilter,
  onQuery,
  onStatus,
  onGateway,
  onSelect,
}: {
  transactions: Transaction[];
  methods: PaymentMethod[];
  query: string;
  statusFilter: string;
  gatewayFilter: string;
  onQuery: (value: string) => void;
  onStatus: (value: string) => void;
  onGateway: (value: string) => void;
  onSelect: (value: Transaction) => void;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
          <Search className="size-4 text-gray-400" />
          <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="رقم المعاملة / اسم العميل / رقم الحجز" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <select value={statusFilter} onChange={(event) => onStatus(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
          <option value="all">كل الحالات</option>
          <option value="success">ناجحة</option>
          <option value="failed">فاشلة</option>
          <option value="pending">معلّقة</option>
          <option value="refunded">مستردة</option>
          <option value="review">قيد المراجعة</option>
        </select>
        <select value={gatewayFilter} onChange={(event) => onGateway(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
          <option value="all">كل البوابات</option>
          {methods.map((method) => <option key={method.key} value={method.key}>{method.label}</option>)}
        </select>
        <button type="button" className="flex items-center justify-center gap-2 rounded-xl bg-[#1a1f36] px-4 py-2 text-sm font-bold text-white">
          <Download className="size-4" />
          تصدير Excel
        </button>
      </div>
      <DataTable
        headers={["التاريخ", "رقم الحجز", "العميل", "الحالة", "المبلغ", "البوابة", "الإجراءات"]}
        rows={transactions.map((transaction) => [
          relativeDate(transaction.date),
          transaction.bookingId,
          <div key="customer" className="flex items-center gap-2"><Avatar name={transaction.customer} /><span>{transaction.customer}</span></div>,
          <Badge key="status" status={transaction.status} />,
          <b key="amount">{money(transaction.amount)}</b>,
          methods.find((method) => method.key === transaction.gateway)?.label ?? transaction.gateway,
          <button key="actions" type="button" onClick={() => onSelect(transaction)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold">عرض</button>,
        ])}
      />
    </section>
  );
}

function RefundsTab({ refunds, summary, onOpen }: { refunds: RefundRequest[]; summary: { total: number; month: number; rate: number }; onOpen: (refund: RefundRequest) => void }) {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="إجمالي المستردات" value={money(summary.total)} sub="كل الفترات" icon={RefreshCw} />
        <StatCard title="هذا الشهر" value={money(summary.month)} sub="طلبات نشطة" icon={ArrowDownLeft} />
        <StatCard title="معدل الاسترداد" value={`${summary.rate}%`} sub="من إجمالي المدفوعات" icon={SlidersHorizontal} />
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <DataTable
          headers={["التاريخ", "رقم الحجز", "العميل", "الحالة", "المبلغ", "السبب", "الإجراءات"]}
          rows={refunds.map((refund) => [
            relativeDate(refund.date),
            refund.bookingId,
            refund.customer,
            <Badge key="status" status={refund.status} />,
            <b key="amount">{money(refund.amount)}</b>,
            refund.reason,
            <button key="actions" type="button" onClick={() => onOpen(refund)} className="rounded-xl bg-[#1a1f36] px-3 py-2 text-xs font-bold text-white">معالجة</button>,
          ])}
        />
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">إعدادات سياسة الاسترداد</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="أيام قبل موعد الحجز" value="72h" onChange={() => undefined} />
          <Input label="نسبة الاسترداد" value="100%" onChange={() => undefined} />
          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <span className="text-sm font-bold">يتطلب موافقة المشرف</span>
            <Toggle checked onChange={() => undefined} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PayoutsTab({
  payouts,
  summary,
  settings,
  setSettings,
  onOpen,
}: {
  payouts: PartnerPayout[];
  summary: { due: number; paid: number; processing: number; month: number };
  settings: PaymentSettings;
  setSettings: (settings: PaymentSettings) => void;
  onOpen: (payout: PartnerPayout) => void;
}) {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="مستحق للدفع" value={money(summary.due)} sub="جاهز للتحويل" icon={HandCoins} />
        <StatCard title="تم تحويله" value={money(summary.paid)} sub="إجمالي سابق" icon={Check} />
        <StatCard title="قيد المعالجة" value={money(summary.processing)} sub="بانتظار البنك" icon={Building2} />
        <StatCard title="الشهر الحالي" value={money(summary.month)} sub="مستحقات شهرية" icon={Banknote} />
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <DataTable
          headers={["الشريك", "الحسابات", "إجمالي الإيرادات", "المستحق", "آخر تحويل", "الإجراءات"]}
          rows={payouts.map((payout) => [
            <div key="partner" className="flex items-center gap-2"><Avatar name={payout.partner} /><span>{payout.partner}</span></div>,
            payout.listings,
            money(payout.totalRevenue),
            <b key="due" className={payout.due > 0 ? "text-[#FF385C]" : "text-gray-700"}>{money(payout.due)}</b>,
            payout.lastPayout,
            <button key="actions" type="button" onClick={() => onOpen(payout)} className="rounded-xl bg-[#1a1f36] px-3 py-2 text-xs font-bold text-white">تحويل الآن</button>,
          ])}
        />
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">جدول التحويل التلقائي</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <select value={settings.payoutSchedule} onChange={(event) => setSettings({ ...settings, payoutSchedule: event.target.value as PaymentSettings["payoutSchedule"] })} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
            <option value="manual">يدوي</option>
            <option value="weekly">أسبوعي</option>
            <option value="semi_monthly">نصف شهري</option>
            <option value="monthly">شهري</option>
          </select>
          <Input label="الحد الأدنى للتحويل ر.س" value={String(settings.minPayout)} onChange={(minPayout) => setSettings({ ...settings, minPayout: Number(minPayout) })} ltr />
        </div>
      </div>
    </section>
  );
}

function SettingsTab({ settings, setSettings }: { settings: PaymentSettings; setSettings: (settings: PaymentSettings) => void }) {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold">إعدادات الدفع العامة</h2>
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-bold text-gray-700">العملة الافتراضية</span>
            <select value={settings.currency} onChange={(event) => setSettings({ ...settings, currency: event.target.value })} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="EUR">يورو (EUR)</option>
            </select>
          </label>
          <Input label="نسبة رسوم المنصة %" value={String(settings.serviceFeePercent)} onChange={(serviceFeePercent) => setSettings({ ...settings, serviceFeePercent: Number(serviceFeePercent) })} ltr />
          <Input label="رسوم ثابتة لكل معاملة ر.س" value={String(settings.fixedFee)} onChange={(fixedFee) => setSettings({ ...settings, fixedFee: Number(fixedFee) })} ltr />
          <div className="grid gap-2">
            <span className="text-xs font-bold text-gray-700">من يدفع الرسوم</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                ["customer", "العميل"],
                ["partner", "الشريك"],
                ["split", "مشترك 50/50"],
              ].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setSettings({ ...settings, feePayer: value as PaymentSettings["feePayer"] })} className={`rounded-xl border px-4 py-3 text-sm font-bold ${settings.feePayer === value ? "border-[#1a1f36] bg-[#1a1f36] text-white" : "border-gray-200 text-gray-600"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold">الفاتورة الإلكترونية والإشعارات</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
            <span className="font-bold">تفعيل الفواتير التلقائية</span>
            <Toggle checked={settings.invoicesEnabled} onChange={(invoicesEnabled) => setSettings({ ...settings, invoicesEnabled })} />
          </div>
          <Input label="رقم التسجيل الضريبي VAT" value={settings.vatNumber} onChange={(vatNumber) => setSettings({ ...settings, vatNumber })} ltr />
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">نسبة ضريبة القيمة المضافة: <b className="text-gray-900">15%</b></div>
          {["إشعار عند الدفع الناجح", "إشعار عند الدفع الفاشل", "إشعار عند الاسترداد", "إشعار للشريك عند استلام الحجز", "إشعار موعد التحويل"].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <span className="text-sm font-bold">{item}</span>
              <Toggle checked onChange={() => undefined} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
        <h2 className="mb-5 text-lg font-bold">حدود الدفع</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="الحد الأدنى للحجز ر.س" value="100" onChange={() => undefined} ltr />
          <Input label="الحد الأقصى للحجز ر.س" value="50000" onChange={() => undefined} ltr />
          <Input label="الحد اليومي للمعاملات ر.س" value="250000" onChange={() => undefined} ltr />
        </div>
      </div>
    </section>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-right text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-500">
            {headers.map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-50 last:border-0">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-4 align-middle">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(status)}`}>{statusLabel(status)}</span>;
}

function Avatar({ name }: { name: string }) {
  return <span className="flex size-9 items-center justify-center rounded-full bg-[#1a1f36] text-xs font-bold text-white">{name.slice(0, 2)}</span>;
}

function TransactionDrawer({ transaction, methods, onClose }: { transaction: Transaction; methods: PaymentMethod[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose}>
      <aside className="mr-auto h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-sm text-gray-500">{transaction.id}</p>
            <h2 className="mt-2 text-2xl font-bold">تفاصيل المعاملة</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 p-2"><X className="size-5" /></button>
        </div>
        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl bg-gray-50 p-5">
            <p className="text-sm text-gray-500">المبلغ</p>
            <p className="mt-2 text-3xl font-bold">{money(transaction.amount)}</p>
          </div>
          <div className="grid gap-3">
            {["إنشاء المعاملة", "إرسال للبوابة", "استجابة البوابة", "تأكيد الدفع"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700">{index + 1}</span>
                <span className="text-sm font-bold">{item}</span>
              </div>
            ))}
          </div>
          <InfoGrid items={[
            ["رقم الحجز", transaction.bookingId],
            ["العميل", transaction.customer],
            ["البريد", transaction.customerEmail],
            ["البوابة", methods.find((method) => method.key === transaction.gateway)?.label ?? transaction.gateway],
            ["الحالة", statusLabel(transaction.status)],
            ["المدة", `${transaction.durationMs}ms`],
          ]} />
          <pre className="overflow-x-auto rounded-2xl bg-[#0d1117] p-4 text-left font-mono text-xs text-green-400" dir="ltr">
            {JSON.stringify({ status: transaction.status, authorization: `AUTH-${transaction.id}`, amount: transaction.amount }, null, 2)}
          </pre>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-bold text-white">استرداد المبلغ</button>
            <button type="button" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold">تحميل الإيصال</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-1 font-bold text-gray-950">{value}</p>
        </div>
      ))}
    </div>
  );
}

function RefundModal({ refund, onClose, onConfirm }: { refund: RefundRequest; onClose: () => void; onConfirm: (status: RefundRequest["status"]) => void }) {
  return (
    <Modal title="معالجة الاسترداد" onClose={onClose}>
      <InfoGrid items={[["رقم الحجز", refund.bookingId], ["العميل", refund.customer], ["المبلغ الأصلي", money(refund.amount)], ["السبب", refund.reason]]} />
      <Input label="مبلغ الاسترداد" value={String(refund.amount)} onChange={() => undefined} ltr />
      <Textarea label="ملاحظة داخلية" value="" onChange={() => undefined} />
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => onConfirm("processed")} className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white">تأكيد الاسترداد</button>
        <button type="button" onClick={() => onConfirm("rejected")} className="rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white">رفض الطلب</button>
      </div>
    </Modal>
  );
}

function PayoutModal({ payout, onClose, onConfirm }: { payout: PartnerPayout; onClose: () => void; onConfirm: () => void }) {
  const [transferReference] = useState(() => `PAY-${Date.now()}`);

  return (
    <Modal title="تحويل للشريك" onClose={onClose}>
      <InfoGrid items={[["الشريك", payout.partner], ["الحسابات", String(payout.listings)], ["إجمالي الإيرادات", money(payout.totalRevenue)], ["المستحق", money(payout.due)]]} />
      <Input label="المبلغ المراد تحويله" value={String(payout.due)} onChange={() => undefined} ltr />
      <Input label="مرجع التحويل" value={transferReference} onChange={() => undefined} ltr />
      <Textarea label="ملاحظة التحويل" value="تحويل مستحقات الشريك من لوحة الدفع." onChange={() => undefined} />
      <button type="button" onClick={onConfirm} className="rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-bold text-white">تأكيد التحويل</button>
    </Modal>
  );
}

function CustomGatewayModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="إضافة بوابة دفع مخصصة" onClose={onClose}>
      <div className="grid gap-4">
        <Input label="اسم البوابة بالعربي" value="" onChange={() => undefined} />
        <Input label="Gateway English Name" value="" onChange={() => undefined} ltr />
        <select className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
          <option>إلكترونية</option>
          <option>يدوية</option>
          <option>تقسيط</option>
        </select>
        <Textarea label="API endpoint configuration" value="" onChange={() => undefined} />
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">رفع شعار البوابة</div>
        <button type="button" onClick={onClose} className="rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white">حفظ البوابة</button>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 p-2"><X className="size-5" /></button>
        </div>
        <div className="grid gap-4">{children}</div>
      </div>
    </div>
  );
}

function TopCustomers({ transactions }: { transactions: Transaction[] }) {
  const customers = transactions
    .filter((transaction) => transaction.status === "success")
    .reduce<Array<{ name: string; total: number; count: number }>>((list, transaction) => {
      const existing = list.find((item) => item.name === transaction.customer);
      if (existing) {
        existing.total += transaction.amount;
        existing.count += 1;
        return list;
      }
      return [...list, { name: transaction.customer, total: transaction.amount, count: 1 }];
    }, [])
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">أعلى العملاء دفعاً</h2>
      {customers.length ? (
        <div className="grid gap-3">
        {customers.map(({ name, total, count }) => (
          <div key={name} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
            <div className="flex items-center gap-2"><Avatar name={name} /><span className="font-bold">{name}</span></div>
            <div className="text-left text-sm">
              <b>{money(total)}</b>
              <p className="text-xs text-gray-500">{count} معاملات</p>
            </div>
          </div>
        ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
          لا توجد مدفوعات عملاء بعد
        </div>
      )}
    </div>
  );
}
