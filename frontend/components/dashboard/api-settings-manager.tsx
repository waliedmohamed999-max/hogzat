"use client";

import { secureFetch } from "@/lib/client-security";
import type { BridgeApiSettings } from "@/lib/api";
import {
  AlertTriangle,
  BarChart3,
  Blocks,
  Check,
  ChevronDown,
  Clipboard,
  Code2,
  Copy,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Webhook,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Tab = "keys" | "usage" | "logs" | "security" | "docs";
type Environment = "live" | "test";
type Method = "GET" | "POST" | "PUT" | "DELETE";
type PermissionAction = "read" | "write" | "delete";

type ApiKey = {
  id: string;
  name: string;
  description: string;
  environment: Environment;
  permissions: string[];
  lastUsed: string;
  active: boolean;
  token: string;
};

type ApiLog = {
  id: string;
  date: string;
  endpoint: string;
  method: Method;
  status: number;
  duration: number;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
};

type Integration = {
  id: string;
  name: string;
  type: "app" | "payment" | "plugin" | "custom";
  provider: string;
  environment: Environment;
  status: "active" | "disabled";
  baseUrl: string;
  publicKey: string;
  secretPreview: string;
  webhookUrl: string;
};

const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: "keys", label: "مفاتيح API", icon: KeyRound },
  { id: "usage", label: "الاستخدام", icon: BarChart3 },
  { id: "logs", label: "السجلات", icon: FileText },
  { id: "security", label: "الأمان", icon: ShieldCheck },
  { id: "docs", label: "التوثيق", icon: Code2 },
];

const resources = ["الإعلانات", "الحجوزات", "المستخدمون", "المدفوعات", "التقارير", "الإشعارات"];
const actions: Array<{ key: PermissionAction; label: string }> = [
  { key: "read", label: "قراءة" },
  { key: "write", label: "كتابة" },
  { key: "delete", label: "حذف" },
];

const initialKeys: ApiKey[] = [
  {
    id: "key_live_main",
    name: "تطبيق الويب الرئيسي",
    description: "يستخدم في لوحة التحكم والتكاملات الداخلية",
    environment: "live",
    permissions: ["قراءة", "كتابة"],
    lastUsed: "منذ 2 ساعة",
    active: true,
    token: "",
  },
  {
    id: "key_test_mobile",
    name: "بيئة اختبار الموبايل",
    description: "مفتاح تجريبي لفريق التطبيق",
    environment: "test",
    permissions: ["قراءة"],
    lastUsed: "منذ 3 أيام",
    active: true,
    token: "example_mobile_token",
  },
];

const initialIntegrations: Integration[] = [
  {
    id: "int_stripe_demo",
    name: "Stripe Payments",
    type: "payment",
    provider: "Stripe",
    environment: "test",
    status: "active",
    baseUrl: "https://api.stripe.com",
    publicKey: "pk_test_••••",
    secretPreview: "sk_t••••2f9a",
    webhookUrl: "https://labayh.com/webhooks/stripe",
  },
];

const logs: ApiLog[] = [
  {
    id: "log_1",
    date: "2026-04-18 00:12",
    endpoint: "/v1/listings",
    method: "GET",
    status: 200,
    duration: 128,
    request: { headers: { authorization: "Bearer [redacted]" }, query: { page: 1 } },
    response: { status: 1, results: 24 },
  },
  {
    id: "log_2",
    date: "2026-04-17 23:45",
    endpoint: "/v1/bookings",
    method: "POST",
    status: 201,
    duration: 214,
    request: { body: { listing_id: 42, nights: 2 } },
    response: { status: 1, booking_id: "BK-2048" },
  },
  {
    id: "log_3",
    date: "2026-04-17 22:10",
    endpoint: "/v1/payments/charge",
    method: "POST",
    status: 422,
    duration: 392,
    request: { body: { amount: 1800 } },
    response: { status: 0, message: "Card declined" },
  },
  {
    id: "log_4",
    date: "2026-04-17 21:05",
    endpoint: "/v1/listings/12",
    method: "DELETE",
    status: 403,
    duration: 96,
    request: { headers: { authorization: "Bearer example_***" } },
    response: { status: 0, message: "Permission denied" },
  },
];

const chartData = Array.from({ length: 30 }, (_, index) => ({
  day: index + 1,
  ok: 1800 + Math.round(Math.sin(index / 3) * 260) + index * 34,
  failed: 42 + Math.round(Math.cos(index / 4) * 18) + (index % 7 === 0 ? 35 : 0),
}));

const endpointGroups = [
  {
    title: "الإعلانات (Listings)",
    rows: [
      ["GET", "/v1/listings", "جلب قائمة الإعلانات"],
      ["GET", "/v1/listings/{id}", "جلب إعلان محدد"],
      ["POST", "/v1/listings", "إنشاء إعلان جديد"],
      ["PUT", "/v1/listings/{id}", "تعديل إعلان"],
      ["DELETE", "/v1/listings/{id}", "حذف إعلان"],
    ],
  },
  {
    title: "الحجوزات (Bookings)",
    rows: [
      ["GET", "/v1/bookings", "جلب الحجوزات"],
      ["POST", "/v1/bookings", "إنشاء حجز"],
      ["PUT", "/v1/bookings/{id}", "تعديل حالة الحجز"],
    ],
  },
  {
    title: "المستخدمون (Users)",
    rows: [
      ["GET", "/v1/users/me", "بيانات الحساب الحالي"],
      ["PUT", "/v1/users/me", "تحديث بيانات الحساب"],
    ],
  },
  {
    title: "المدفوعات (Payments)",
    rows: [
      ["GET", "/v1/payments", "قائمة المدفوعات"],
      ["POST", "/v1/payments/refund", "استرجاع مبلغ"],
    ],
  },
];

function formatLifetime(type: string) {
  const map: Record<string, string> = {
    seconds: "ثانية",
    minute: "دقيقة",
    hour: "ساعة",
    day: "يوم",
    week: "أسبوع",
    month: "شهر",
    never: "لا تنتهي",
  };
  return map[type] ?? type;
}

function buildToken(prefix: Environment) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = `sk_${prefix === "live" ? "live" : "test"}_`;
  for (let index = 0; index < 28; index += 1) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function methodClass(method: Method) {
  const styles: Record<Method, string> = {
    GET: "bg-blue-50 text-blue-700",
    POST: "bg-emerald-50 text-emerald-700",
    PUT: "bg-amber-50 text-amber-700",
    DELETE: "bg-red-50 text-red-600",
  };
  return styles[method];
}

function statusClass(status: number) {
  if (status >= 500) return "bg-red-50 text-red-600";
  if (status >= 400) return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

function CopyButton({ value, onCopy }: { value: string; onCopy: (label: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        onCopy("تم النسخ");
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-[#1a1f36]"
    >
      <Copy className="h-4 w-4" />
      نسخ
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-[#1a1f36]" : "bg-gray-200"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "right-6" : "right-1"}`} />
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>{children}</section>;
}

function MiniStat({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-black text-[#1a1f36]">{value}</p>
      {trend ? <p className="mt-1 text-xs font-bold text-emerald-600">{trend}</p> : null}
    </div>
  );
}

function LineChart() {
  const max = Math.max(...chartData.map((item) => item.ok));
  const width = 720;
  const height = 220;
  const points = (key: "ok" | "failed") =>
    chartData
      .map((item, index) => {
        const x = (index / (chartData.length - 1)) * width;
        const y = height - (item[key] / max) * (height - 20) - 10;
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
        <polyline fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points("ok")} />
        <polyline fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points("failed")} />
      </svg>
      <div className="flex items-center gap-5 text-xs font-bold">
        <span className="inline-flex items-center gap-2 text-emerald-700"><span className="h-2 w-8 rounded bg-emerald-500" /> ناجحة</span>
        <span className="inline-flex items-center gap-2 text-red-600"><span className="h-2 w-8 rounded bg-red-500" /> فاشلة</span>
      </div>
    </div>
  );
}

export function ApiSettingsManager({ payload }: { payload: BridgeApiSettings }) {
  const [form, setForm] = useState(payload);
  const [activeTab, setActiveTab] = useState<Tab>("keys");
  const [environment, setEnvironment] = useState<Environment>("live");
  const [showToken, setShowToken] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [toast, setToast] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [integrationOpen, setIntegrationOpen] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [createdAccepted, setCreatedAccepted] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://labayh.com/webhooks/labayh");
  const [webhookSecretVisible, setWebhookSecretVisible] = useState(false);
  const [webhookSecret] = useState("");
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [logSearch, setLogSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [ipWhitelist, setIpWhitelist] = useState(["0.0.0.0/0"]);
  const [ipDraft, setIpDraft] = useState("");
  const [corsOrigins, setCorsOrigins] = useState(["https://labayh.com"]);
  const [originDraft, setOriginDraft] = useState("");
  const [openDocs, setOpenDocs] = useState<Record<string, boolean>>({ "الإعلانات (Listings)": true });
  const [newKey, setNewKey] = useState({
    name: "",
    description: "",
    environment: "test" as Environment,
    expiry: "30",
    ips: [] as string[],
    ipDraft: "",
    permissions: new Set<string>(["الإعلانات:read", "الحجوزات:read"]),
  });
  const [integrationForm, setIntegrationForm] = useState({
    name: "",
    type: "payment" as Integration["type"],
    provider: "",
    environment: "test" as Environment,
    baseUrl: "",
    publicKey: "",
    secretKey: "",
    webhookUrl: "",
  });

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = !logSearch || log.endpoint.toLowerCase().includes(logSearch.toLowerCase());
      const matchesMethod = methodFilter === "all" || log.method === methodFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "2xx" && log.status >= 200 && log.status < 300) ||
        (statusFilter === "4xx" && log.status >= 400 && log.status < 500) ||
        (statusFilter === "5xx" && log.status >= 500);
      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [logSearch, methodFilter, statusFilter]);

  async function saveMainSettings() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await secureFetch("/api/v1/dashboard/bridge/dashboard/system-native/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_lifetime: form.api_lifetime,
          api_lifetime_type: form.api_lifetime_type,
        }),
      });
      const result = (await response.json().catch(() => null)) as { status?: number; message?: string } | null;
      setMessage(response.ok && result?.status === 1 ? "تم حفظ إعدادات API." : result?.message || "تعذر حفظ الإعدادات.");
    } catch {
      setMessage("تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  async function regenerateToken() {
    setConfirmRegenerate(false);
    setLoading(true);
    try {
      const response = await secureFetch("/api/settings/api-keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment }),
      });
      const result = (await response.json().catch(() => null)) as { token?: string } | null;
      const token = result?.token;
      if (token) {
        setForm((current) => ({ ...current, access_token: token }));
        setToast("تم توليد رمز جديد");
      }
    } finally {
      setLoading(false);
    }
  }

  function createKey() {
    const token = buildToken(newKey.environment);
    const permissionLabels = Array.from(newKey.permissions).map((permission) => (permission.endsWith(":read") ? "قراءة" : permission.endsWith(":write") ? "كتابة" : "حذف"));
    setKeys((current) => [
      {
        id: `key_${Date.now()}`,
        name: newKey.name || "مفتاح جديد",
        description: newKey.description || "بدون وصف",
        environment: newKey.environment,
        permissions: Array.from(new Set(permissionLabels)),
        lastUsed: "لم يستخدم بعد",
        active: true,
        token,
      },
      ...current,
    ]);
    setCreatedKey(token);
    setCreatedAccepted(false);
  }

  async function createIntegration() {
    const response = await secureFetch("/api/settings/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(integrationForm),
    });
    const result = (await response.json().catch(() => null)) as { status?: number; data?: Integration; message?: string } | null;
    if (response.ok && result?.data) {
      setIntegrations((current) => [result.data as Integration, ...current]);
      setToast("تم إنشاء الربط");
      setIntegrationOpen(false);
      setIntegrationForm({
        name: "",
        type: "payment",
        provider: "",
        environment: "test",
        baseUrl: "",
        publicKey: "",
        secretKey: "",
        webhookUrl: "",
      });
      return;
    }
    setMessage(result?.message || "تعذر إنشاء الربط.");
  }

  function addTag(value: string, current: string[], setter: (value: string[]) => void, clear: () => void) {
    const clean = value.trim();
    if (!clean || current.includes(clean)) return;
    setter([...current, clean]);
    clear();
  }

  async function testWebhook() {
    setWebhookStatus("جارٍ الاختبار...");
    const response = await secureFetch("/api/settings/webhook/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    setWebhookStatus(response.ok ? "تم الاتصال بنجاح" : "فشل الاتصال");
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F8FA] text-[#1a1f36]">
      {toast ? (
        <div className="fixed left-6 top-6 z-50 rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white shadow-lg">
          {toast} ✓
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 px-4 py-5 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">إعدادات API</h1>
              <p className="mt-1 text-sm text-gray-500">إدارة مفاتيح API وصلاحيات الوصول ومراقبة الاستخدام</p>
            </div>
          </div>
          <div className="flex rounded-2xl bg-gray-100 p-1">
            {(["live", "test"] as Environment[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setEnvironment(item)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${environment === item ? "bg-[#1a1f36] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                {item === "live" ? "🟢 الإنتاج" : "🟡 الاختبار"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIntegrationOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#e92f51]"
          >
            <Blocks className="h-4 w-4" />
            ربط تطبيق / دفع / إضافة
          </button>
        </div>
        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${activeTab === tab.id ? "bg-[#1a1f36] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
        {activeTab === "keys" ? (
          <div className="space-y-6">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black">رمز الوصول الرئيسي</h2>
                  <p className="mt-2 text-sm text-gray-500">ينتهي في: 15 يونيو 2026 (بعد 58 يوماً)</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">● نشط</span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <Lock className="h-5 w-5 text-gray-400" />
                <code dir="ltr" className="min-w-0 flex-1 truncate font-mono text-sm text-gray-800">
                  {showToken ? form.access_token : "••••••••••••••••••••••••••••••••"}
                </code>
                <button type="button" onClick={() => setShowToken(!showToken)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold">
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showToken ? "إخفاء" : "إظهار"}
                </button>
                <CopyButton value={form.access_token} onCopy={setToast} />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <MiniStat label="تاريخ الإنشاء" value="15 مارس 2026" />
                <MiniStat label="مدة الصلاحية" value={`${form.api_lifetime} ${formatLifetime(form.api_lifetime_type)}`} />
                <MiniStat label="آخر استخدام" value="منذ 2 ساعة" />
                <MiniStat label="عدد الطلبات" value="1,247" />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <label className="grid gap-2">
                  <span className="text-sm font-bold">مدة الصلاحية</span>
                  <input value={form.api_lifetime} onChange={(event) => setForm((current) => ({ ...current, api_lifetime: event.target.value }))} className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#1a1f36]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold">الوحدة</span>
                  <select value={form.api_lifetime_type} onChange={(event) => setForm((current) => ({ ...current, api_lifetime_type: event.target.value }))} className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#1a1f36]">
                    <option value="hour">ساعة</option>
                    <option value="day">يوم</option>
                    <option value="week">أسبوع</option>
                    <option value="month">شهر</option>
                    <option value="never">لا تنتهي</option>
                  </select>
                </label>
                <div className="flex items-end gap-3">
                  <span className="text-sm font-bold">تجديد تلقائي</span>
                  <Toggle checked={autoRenew} onChange={setAutoRenew} />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => setConfirmRegenerate(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white">
                  <RefreshCw className="h-4 w-4" /> توليد رمز جديد
                </button>
                <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-5 py-3 text-sm font-bold text-red-600">
                  <AlertTriangle className="h-4 w-4" /> إلغاء الرمز الحالي
                </button>
                <button type="button" onClick={saveMainSettings} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                  <Check className="h-4 w-4" /> حفظ الإعدادات
                </button>
                {message ? <span className="self-center text-sm font-bold text-gray-600">{message}</span> : null}
              </div>
            </Card>

            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-black">مفاتيح API</h2>
                <button type="button" onClick={() => setNewKeyOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-bold text-white">
                  <Plus className="h-4 w-4" /> إنشاء مفتاح جديد
                </button>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] text-right text-sm">
                  <thead className="text-xs text-gray-500">
                    <tr className="border-b border-gray-100">
                      <th className="py-3">الاسم</th>
                      <th>البيئة</th>
                      <th>الصلاحيات</th>
                      <th>آخر استخدام</th>
                      <th>الحالة</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((key) => (
                      <tr key={key.id} className="border-b border-gray-50">
                        <td className="py-4">
                          <p className="font-black">{key.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{key.description}</p>
                        </td>
                        <td><span className={`rounded-full px-2 py-1 text-xs font-bold ${key.environment === "live" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{key.environment === "live" ? "إنتاج" : "اختبار"}</span></td>
                        <td><div className="flex flex-wrap gap-1">{key.permissions.map((item) => <span key={item} className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">{item}</span>)}</div></td>
                        <td className="text-gray-500">{key.lastUsed}</td>
                        <td><span className={`font-bold ${key.active ? "text-emerald-700" : "text-red-600"}`}>● {key.active ? "نشط" : "معطّل"}</span></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <CopyButton value={key.token} onCopy={setToast} />
                            <button type="button" onClick={() => setKeys((current) => current.map((item) => item.id === key.id ? { ...item, active: !item.active } : item))} className="rounded-xl border border-gray-200 p-2"><MoreHorizontal className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setKeys((current) => current.filter((item) => item.id !== key.id))} className="rounded-xl border border-red-200 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">مركز الربط والتكاملات</h2>
                  <p className="mt-1 text-sm text-gray-500">اربط أي تطبيق خارجي، بوابة دفع، أو إضافة مخصصة من مكان واحد.</p>
                </div>
                <button type="button" onClick={() => setIntegrationOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white">
                  <Blocks className="h-4 w-4" />
                  إضافة ربط جديد
                </button>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {integrations.map((integration) => (
                  <div key={integration.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">{integration.name}</p>
                        <p className="mt-1 text-xs font-bold text-gray-500">{integration.provider}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${integration.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
                        {integration.status === "active" ? "نشط" : "معطل"}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-gray-600">
                      <p>النوع: <span className="font-bold text-[#1a1f36]">{integration.type === "payment" ? "بوابة دفع" : integration.type === "app" ? "تطبيق" : integration.type === "plugin" ? "إضافة" : "مخصص"}</span></p>
                      <p>البيئة: <span className="font-bold text-[#1a1f36]">{integration.environment === "live" ? "الإنتاج" : "الاختبار"}</span></p>
                      <p dir="ltr" className="truncate text-left font-mono">{integration.baseUrl || "No base URL"}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold">اختبار</button>
                      <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold">تعديل</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <Webhook className="h-5 w-5 text-[#FF385C]" />
                <h2 className="text-lg font-black">إعدادات Webhook</h2>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-bold">Webhook URL</span>
                  <input dir="ltr" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm outline-none focus:border-[#1a1f36]" />
                </label>
                <div className="grid gap-2">
                  <span className="text-sm font-bold">Secret Key</span>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <code dir="ltr" className="flex-1 truncate font-mono text-sm">{webhookSecretVisible ? webhookSecret : "••••••••••••••••••"}</code>
                    <button type="button" onClick={() => setWebhookSecretVisible(!webhookSecretVisible)}>{webhookSecretVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <button type="button" onClick={testWebhook} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold">اختبار الاتصال</button>
                  {webhookStatus ? <span className="pb-3 text-sm font-bold text-emerald-700">{webhookStatus}</span> : null}
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {["حجز جديد (booking.created)", "إلغاء حجز (booking.cancelled)", "دفع ناجح (payment.succeeded)", "دفع فاشل (payment.failed)", "مستخدم جديد (user.created)", "طلب شريك جديد (partner.applied)", "تقييم جديد (review.created)"].map((event, index) => (
                  <label key={event} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm font-bold">
                    <input type="checkbox" defaultChecked={[0, 1, 4].includes(index)} />
                    {event}
                  </label>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {activeTab === "usage" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <MiniStat label="طلبات اليوم" value="2,847" trend="↑ 12%" />
              <MiniStat label="طلبات الشهر" value="84,291" trend="↑ 8%" />
              <MiniStat label="معدل النجاح" value="99.2%" />
              <MiniStat label="متوسط الاستجابة" value="142ms" trend="↓ 23ms" />
            </div>
            <Card>
              <h2 className="mb-5 text-lg font-black">طلبات API خلال آخر 30 يوم</h2>
              <LineChart />
            </Card>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="text-lg font-black">حدود الاستخدام</h2>
                {[["طلبات في الدقيقة", 847, 1000], ["طلبات في اليوم", 84291, 100000], ["طلبات في الشهر", 84291, 1000000]].map(([label, value, total]) => {
                  const percent = Number(value) / Number(total) * 100;
                  const color = percent > 90 ? "bg-red-500" : percent > 70 ? "bg-amber-500" : "bg-emerald-500";
                  return (
                    <div key={String(label)} className="mt-5">
                      <div className="mb-2 flex justify-between text-sm font-bold"><span>{label}</span><span>{Number(value).toLocaleString("ar-SA")} / {Number(total).toLocaleString("ar-SA")}</span></div>
                      <div className="h-3 rounded-full bg-gray-100"><div className={`h-3 rounded-full ${color}`} style={{ width: `${Math.min(percent, 100)}%` }} /></div>
                    </div>
                  );
                })}
              </Card>
              <Card>
                <h2 className="text-lg font-black">أكثر Endpoints استخداماً</h2>
                <div className="mt-4 space-y-3">
                  {["/v1/listings", "/v1/bookings", "/v1/users/me", "/v1/payments"].map((endpoint, index) => (
                    <div key={endpoint} className="grid grid-cols-4 gap-3 rounded-xl bg-gray-50 p-3 text-sm">
                      <code dir="ltr" className="col-span-2 truncate font-mono">{endpoint}</code>
                      <span>{[12842, 9210, 6500, 2114][index].toLocaleString("ar-SA")}</span>
                      <span className="text-emerald-700">{[99.8, 99.1, 99.9, 97.4][index]}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        {activeTab === "logs" ? (
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-64 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input value={logSearch} onChange={(event) => setLogSearch(event.target.value)} placeholder="ابحث عن endpoint" className="w-full bg-transparent text-sm outline-none" />
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm">
                <option value="all">كل الحالات</option><option value="2xx">2xx</option><option value="4xx">4xx</option><option value="5xx">5xx</option>
              </select>
              <select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm">
                <option value="all">كل الطرق</option><option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="DELETE">DELETE</option>
              </select>
              <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold">تصدير السجلات CSV</button>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-right text-sm">
                <thead className="text-xs text-gray-500"><tr className="border-b"><th className="py-3">التاريخ</th><th>Endpoint</th><th>الطريقة</th><th>الاستجابة</th><th>المدة</th><th>التفاصيل</th></tr></thead>
                <tbody>{filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50">
                    <td className="py-4 text-gray-500">{log.date}</td>
                    <td><code dir="ltr" className="font-mono">{log.endpoint}</code></td>
                    <td><span className={`rounded-full px-2 py-1 text-xs font-bold ${methodClass(log.method)}`}>{log.method}</span></td>
                    <td><span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(log.status)}`}>{log.status}</span></td>
                    <td className={log.duration > 1000 ? "text-red-600" : "text-gray-600"}>{log.duration}ms</td>
                    <td><button onClick={() => setSelectedLog(log)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold">عرض</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Card>
        ) : null}

        {activeTab === "security" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="text-lg font-black">IP Whitelist</h2>
              <p className="mt-2 text-sm text-gray-500">0.0.0.0/0 = جميع IPs مسموحة</p>
              <div className="mt-4 flex gap-2">
                <input dir="ltr" value={ipDraft} onChange={(event) => setIpDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addTag(ipDraft, ipWhitelist, setIpWhitelist, () => setIpDraft("")))} placeholder="192.168.1.1" className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none" />
                <button onClick={() => addTag(ipDraft, ipWhitelist, setIpWhitelist, () => setIpDraft(""))} className="rounded-xl bg-[#1a1f36] px-4 py-3 text-white">إضافة</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">{ipWhitelist.map((ip) => <span key={ip} className="rounded-full bg-gray-100 px-3 py-2 text-sm font-bold">{ip}</span>)}</div>
            </Card>
            <Card>
              <h2 className="text-lg font-black">CORS Settings</h2>
              <div className="mt-4 flex gap-2">
                <input dir="ltr" value={originDraft} onChange={(event) => setOriginDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addTag(originDraft, corsOrigins, setCorsOrigins, () => setOriginDraft("")))} placeholder="https://app.example.com" className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none" />
                <button onClick={() => addTag(originDraft, corsOrigins, setCorsOrigins, () => setOriginDraft(""))} className="rounded-xl bg-[#1a1f36] px-4 py-3 text-white">إضافة</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">{corsOrigins.map((origin) => <span key={origin} className="rounded-full bg-gray-100 px-3 py-2 text-sm font-bold">{origin}</span>)}</div>
            </Card>
            <Card>
              <h2 className="text-lg font-black">أحداث الأمان</h2>
              <div className="mt-4 space-y-3 text-sm font-bold">
                <p className="text-red-600">🔴 محاولة وصول مرفوضة من 185.x.x.x — منذ 2 ساعة</p>
                <p className="text-amber-700">🟡 تجاوز حد المعدل — منذ 5 ساعات</p>
                <p className="text-emerald-700">🟢 توليد مفتاح API جديد — أمس</p>
                <p className="text-emerald-700">🟢 تغيير إعدادات CORS — منذ 3 أيام</p>
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-black">Two-Factor for API</h2>
              {["طلب 2FA لعرض أو توليد مفاتيح API", "إشعار عند إنشاء مفتاح جديد", "تنبيه عند نشاط مشبوه"].map((item) => (
                <div key={item} className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
                  <span className="text-sm font-bold">{item}</span>
                  <Toggle checked onChange={() => undefined} />
                </div>
              ))}
            </Card>
          </div>
        ) : null}

        {activeTab === "docs" ? (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black">Quick Start</h2>
                <CopyButton value={'curl -X GET "https://api.labayh.com/v1/listings" -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json"'} onCopy={setToast} />
              </div>
              <pre dir="ltr" className="mt-4 overflow-x-auto rounded-2xl bg-[#0d1117] p-5 text-left font-mono text-sm text-gray-100">{`# Example API request
curl -X GET "https://api.labayh.com/v1/listings" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
            </Card>
            <Card>
              <h2 className="text-lg font-black">Endpoints Reference</h2>
              <div className="mt-4 space-y-3">
                {endpointGroups.map((group) => (
                  <div key={group.title} className="rounded-2xl border border-gray-100">
                    <button type="button" onClick={() => setOpenDocs((current) => ({ ...current, [group.title]: !current[group.title] }))} className="flex w-full items-center justify-between p-4 font-black">
                      {group.title}<ChevronDown className="h-4 w-4" />
                    </button>
                    {openDocs[group.title] ? <div className="border-t border-gray-100 p-3">{group.rows.map(([method, path, description]) => (
                      <div key={`${method}-${path}`} className="grid gap-2 rounded-xl p-3 text-sm md:grid-cols-[90px_1fr_1fr_auto]">
                        <span className={`rounded-full px-2 py-1 text-center text-xs font-bold ${methodClass(method as Method)}`}>{method}</span>
                        <code dir="ltr" className="font-mono">{path}</code>
                        <span className="text-gray-600">{description}</span>
                        <button className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold">جرّب الآن</button>
                      </div>
                    ))}</div> : null}
                  </div>
                ))}
              </div>
            </Card>
            <div className="grid gap-4 md:grid-cols-3">
              {["JavaScript/Node.js SDK", "Python SDK", "PHP SDK"].map((sdk) => <Card key={sdk}><h3 className="font-black">{sdk}</h3><p className="mt-2 text-sm text-gray-500">روابط التوثيق والحزم الرسمية.</p></Card>)}
            </div>
          </div>
        ) : null}
      </main>

      {newKeyOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            {!createdKey ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">إنشاء مفتاح جديد</h2>
                  <button onClick={() => setNewKeyOpen(false)}><X className="h-5 w-5" /></button>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input value={newKey.name} onChange={(event) => setNewKey((current) => ({ ...current, name: event.target.value }))} placeholder="اسم المفتاح" className="rounded-xl border border-gray-200 px-4 py-3 outline-none" />
                  <input value={newKey.description} onChange={(event) => setNewKey((current) => ({ ...current, description: event.target.value }))} placeholder="الوصف" className="rounded-xl border border-gray-200 px-4 py-3 outline-none" />
                  <select value={newKey.environment} onChange={(event) => setNewKey((current) => ({ ...current, environment: event.target.value as Environment }))} className="rounded-xl border border-gray-200 px-4 py-3">
                    <option value="live">إنتاج</option><option value="test">اختبار</option>
                  </select>
                  <select value={newKey.expiry} onChange={(event) => setNewKey((current) => ({ ...current, expiry: event.target.value }))} className="rounded-xl border border-gray-200 px-4 py-3">
                    <option value="30">30 يوم</option><option value="90">90 يوم</option><option value="never">لا تنتهي</option>
                  </select>
                </div>
                <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead><tr className="bg-gray-50"><th className="p-3 text-right">المورد</th>{actions.map((action) => <th key={action.key}>{action.label}</th>)}</tr></thead>
                    <tbody>{resources.map((resource) => <tr key={resource} className="border-t border-gray-100"><td className="p-3 font-bold">{resource}</td>{actions.map((action) => {
                      const key = `${resource}:${action.key}`;
                      const checked = newKey.permissions.has(key);
                      return <td key={key} className="p-3 text-center"><button onClick={() => setNewKey((current) => {
                        const next = new Set(current.permissions);
                        if (next.has(key)) next.delete(key); else next.add(key);
                        return { ...current, permissions: next };
                      })} className={`rounded-full px-4 py-2 text-xs font-bold ${checked ? "bg-[#1a1f36] text-white" : "bg-gray-100 text-gray-500"}`}>{checked ? "مفعل" : "إيقاف"}</button></td>;
                    })}</tr>)}</tbody>
                  </table>
                </div>
                <button onClick={createKey} className="mt-6 w-full rounded-xl bg-[#FF385C] px-5 py-3 font-black text-white">إنشاء المفتاح</button>
              </>
            ) : (
              <div className="text-center">
                <AlertTriangle className="mx-auto h-14 w-14 text-amber-500" />
                <h2 className="mt-4 text-xl font-black">احفظ هذا المفتاح الآن</h2>
                <p className="mt-2 text-sm text-gray-500">لن يتم عرضه مرة أخرى بعد إغلاق هذه النافذة</p>
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-gray-50 p-4">
                  <code dir="ltr" className="flex-1 truncate font-mono text-sm">{createdKey}</code>
                  <CopyButton value={createdKey} onCopy={setToast} />
                </div>
                <label className="mt-5 flex items-center justify-center gap-2 text-sm font-bold"><input type="checkbox" checked={createdAccepted} onChange={(event) => setCreatedAccepted(event.target.checked)} /> لقد نسخت المفتاح وحفظته في مكان آمن</label>
                <button disabled={!createdAccepted} onClick={() => { setCreatedKey(null); setNewKeyOpen(false); }} className="mt-5 rounded-xl bg-[#1a1f36] px-6 py-3 font-black text-white disabled:opacity-40">إغلاق</button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {integrationOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">ربط تطبيق أو بوابة دفع أو إضافة</h2>
                <p className="mt-2 text-sm text-gray-500">أدخل بيانات الربط الأساسية، ويمكن استخدامها لاحقاً في الدفع، الإشعارات، أو أي تكامل خارجي.</p>
              </div>
              <button type="button" onClick={() => setIntegrationOpen(false)}><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-bold">اسم الربط</span>
                <input value={integrationForm.name} onChange={(event) => setIntegrationForm((current) => ({ ...current, name: event.target.value }))} placeholder="مثال: Stripe Payments" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1a1f36]" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">نوع الربط</span>
                <select value={integrationForm.type} onChange={(event) => setIntegrationForm((current) => ({ ...current, type: event.target.value as Integration["type"] }))} className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1a1f36]">
                  <option value="payment">بوابة دفع</option>
                  <option value="app">تطبيق خارجي</option>
                  <option value="plugin">إضافة</option>
                  <option value="custom">تكامل مخصص</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">المزوّد / Provider</span>
                <input value={integrationForm.provider} onChange={(event) => setIntegrationForm((current) => ({ ...current, provider: event.target.value }))} placeholder="Stripe, PayPal, Moyasar, WhatsApp..." className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1a1f36]" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">البيئة</span>
                <select value={integrationForm.environment} onChange={(event) => setIntegrationForm((current) => ({ ...current, environment: event.target.value as Environment }))} className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1a1f36]">
                  <option value="test">اختبار</option>
                  <option value="live">إنتاج</option>
                </select>
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-bold">Base URL</span>
                <input dir="ltr" value={integrationForm.baseUrl} onChange={(event) => setIntegrationForm((current) => ({ ...current, baseUrl: event.target.value }))} placeholder="https://api.provider.com" className="rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-[#1a1f36]" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">Public Key / Client ID</span>
                <input dir="ltr" value={integrationForm.publicKey} onChange={(event) => setIntegrationForm((current) => ({ ...current, publicKey: event.target.value }))} className="rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-[#1a1f36]" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">Secret Key / Client Secret</span>
                <input dir="ltr" type="password" value={integrationForm.secretKey} onChange={(event) => setIntegrationForm((current) => ({ ...current, secretKey: event.target.value }))} className="rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-[#1a1f36]" />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-bold">Webhook URL اختياري</span>
                <input dir="ltr" value={integrationForm.webhookUrl} onChange={(event) => setIntegrationForm((current) => ({ ...current, webhookUrl: event.target.value }))} placeholder="https://labayh.com/webhooks/provider" className="rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-[#1a1f36]" />
              </label>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
              سيتم حفظ مفاتيح السر بشكل مخفي داخل إعدادات التكامل، ولن يظهر منها إلا جزء مختصر للتمييز.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={createIntegration} className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-black text-white">
                <Check className="h-4 w-4" />
                حفظ الربط
              </button>
              <button type="button" onClick={() => setIntegrationOpen(false)} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-black">إلغاء</button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmRegenerate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black">هل تريد توليد رمز جديد؟</h2>
            <p className="mt-2 text-sm text-gray-500">سيتم إلغاء الرمز الحالي بعد الاعتماد على الرمز الجديد.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={regenerateToken} className="flex-1 rounded-xl bg-[#1a1f36] px-4 py-3 font-black text-white">توليد</button>
              <button onClick={() => setConfirmRegenerate(false)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-black">إلغاء</button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedLog ? (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">تفاصيل الطلب</h2>
            <button onClick={() => setSelectedLog(null)}><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-5 space-y-4">
            <pre dir="ltr" className="overflow-x-auto rounded-2xl bg-[#0d1117] p-4 text-left font-mono text-xs text-gray-100">{JSON.stringify(selectedLog.request, null, 2)}</pre>
            <pre dir="ltr" className="overflow-x-auto rounded-2xl bg-[#0d1117] p-4 text-left font-mono text-xs text-gray-100">{JSON.stringify(selectedLog.response, null, 2)}</pre>
            <div className="rounded-2xl bg-gray-50 p-4 text-sm font-bold">DNS → Connect → TTFB → Transfer: {selectedLog.duration}ms</div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white"><Clipboard className="h-4 w-4" /> نسخ cURL</button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
