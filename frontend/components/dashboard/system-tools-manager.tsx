"use client";

import { secureFetch } from "@/lib/client-security";
import type { BridgeSystemTools } from "@/lib/api";
import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  Clock3,
  Copy,
  Database,
  FileArchive,
  FileSearch,
  FolderOpen,
  HardDrive,
  Image,
  Mail,
  Play,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings2,
  ShieldAlert,
  Terminal,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Tab = "maintenance" | "monitor" | "history" | "database" | "files" | "jobs";
type Severity = "normal" | "warning" | "danger" | "info";
type Tool = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  icon: LucideIcon;
  severity?: Severity;
  bridgeAction?: string;
};
type Health = {
  cpu: number;
  memory: { used: number; total: number; percent: number };
  database: { connected: boolean; size: string; tables: number };
  cache: { active: boolean; hitRate: number; size: string };
  uptime: string;
};
type ExecutionRow = {
  id: string;
  tool: string;
  category: string;
  status: "success" | "failed" | "running";
  duration: string;
  user: string;
  date: string;
  output: string[];
};

const tabs: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
  { id: "maintenance", label: "أدوات الصيانة", icon: Settings2 },
  { id: "monitor", label: "مراقبة النظام", icon: BarChart3 },
  { id: "history", label: "سجل التنفيذ", icon: FileSearch },
  { id: "database", label: "قاعدة البيانات", icon: Database },
  { id: "files", label: "الملفات", icon: FolderOpen },
  { id: "jobs", label: "المهام المجدولة", icon: Clock3 },
];

const tools: Tool[] = [
  { id: "clear_cache", title: "مسح الكاش الكامل", subtitle: "Clear all cache", description: "يحرر مساحة الكاش بالكامل", category: "إدارة الكاش", icon: Trash2, severity: "warning", bridgeAction: "clear_cache" },
  { id: "clear_compiled", title: "مسح الملفات المجمّعة", subtitle: "Clear compiled assets", description: "يحذف JS/CSS والملفات المجمّعة", category: "إدارة الكاش", icon: Trash2, bridgeAction: "clear_view" },
  { id: "rebuild_cache", title: "إعادة بناء الكاش", subtitle: "Rebuild cache", description: "يعيد بناء كاش التطبيق", category: "إدارة الكاش", icon: RefreshCw },
  { id: "cache_stats", title: "إحصائيات الكاش", subtitle: "Cache statistics", description: "الحجم ومعدل الإصابة", category: "إدارة الكاش", icon: BarChart3, severity: "info" },
  { id: "database_backup", title: "نسخ احتياطي الآن", subtitle: "Backup database now", description: "ينشئ نسخة احتياطية كاملة", category: "قاعدة البيانات", icon: Archive },
  { id: "optimize_tables", title: "تحسين الجداول", subtitle: "Optimize database tables", description: "يحسن أداء الاستعلامات", category: "قاعدة البيانات", icon: Zap },
  { id: "data_integrity", title: "فحص سلامة البيانات", subtitle: "Check data integrity", description: "يفحص الجداول بحثاً عن أخطاء", category: "قاعدة البيانات", icon: ShieldAlert },
  { id: "clear_expired", title: "حذف البيانات المنتهية", subtitle: "Clear expired data", description: "جلسات ورموز وسجلات قديمة", category: "قاعدة البيانات", icon: Trash2, severity: "warning" },
  { id: "restart_queue", title: "إعادة تشغيل قائمة الانتظار", subtitle: "Restart queue workers", description: "يعيد تشغيل عمال المهام", category: "النظام والتطبيق", icon: RefreshCw },
  { id: "test_email", title: "اختبار البريد الإلكتروني", subtitle: "Test email configuration", description: "يرسل بريد اختباري", category: "النظام والتطبيق", icon: Mail },
  { id: "broken_links", title: "فحص الروابط المعطلة", subtitle: "Check broken links", description: "يفحص روابط الموقع", category: "النظام والتطبيق", icon: FileSearch },
  { id: "regenerate_images", title: "إعادة توليد الصور", subtitle: "Regenerate thumbnails", description: "يعيد إنشاء الصور المصغرة", category: "النظام والتطبيق", icon: Image },
  { id: "symlink", title: "إعادة إنشاء روابط التخزين", subtitle: "Recreate storage links", description: "يعيد ربط مجلدات التخزين", category: "النظام والتطبيق", icon: HardDrive, bridgeAction: "symlink" },
  { id: "update_version", title: "تشغيل تحديثات النظام", subtitle: "Run migrations", description: "ينفذ ترحيلات الإصدار", category: "النظام والتطبيق", icon: Terminal, severity: "warning", bridgeAction: "update_version" },
];

const categories = ["إدارة الكاش", "قاعدة البيانات", "النظام والتطبيق"];
const spark = [42, 38, 49, 55, 44, 62, 68, 59, 74, 66, 70, 63];
const tables = [
  ["users", "12,480", "84 MB", "منذ ساعة"],
  ["posts", "3,204", "126 MB", "اليوم"],
  ["services", "1,842", "210 MB", "اليوم"],
  ["bookings", "9,442", "310 MB", "منذ 10 دقائق"],
  ["usermeta", "82,120", "420 MB", "أمس"],
];
const jobs = [
  ["إرسال ملخص الحجوزات اليومي", "send-daily-booking-summary", "0 8 * * *", "اليوم 8:00 AM", "غداً 8:00 AM"],
  ["تنظيف الجلسات المنتهية", "cleanup-expired-sessions", "*/30 * * * *", "منذ 12 دقيقة", "بعد 18 دقيقة"],
  ["توليد sitemap.xml تلقائياً", "generate-sitemap", "0 2 * * *", "اليوم 2:00 AM", "غداً 2:00 AM"],
  ["نسخ احتياطي تلقائي لقاعدة البيانات", "database-backup", "0 3 * * *", "اليوم 3:00 AM", "غداً 3:00 AM"],
];

function nowTime() {
  return new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function buttonClass(severity: Severity = "normal") {
  if (severity === "warning") return "bg-orange-500 text-white";
  if (severity === "danger") return "bg-red-500 text-white";
  if (severity === "info") return "border border-gray-200 text-gray-700 bg-white";
  return "bg-[#1a1f36] text-white";
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

function HealthCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-[#1a1f36]">{label}</p>
        <Icon className="h-5 w-5 text-[#FF385C]" />
      </div>
      <p className="mt-3 text-lg font-black text-emerald-700">{value}</p>
      <p className="mt-1 text-xs font-bold text-gray-500">{detail}</p>
    </div>
  );
}

function ToolCard({ tool, loading, onRun }: { tool: Tool; loading: boolean; onRun: (tool: Tool) => void }) {
  const Icon = tool.icon;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-[#1a1f36]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-black text-gray-900">{tool.title}</h3>
      <p className="mb-1 mt-1 font-mono text-xs text-gray-400">{tool.subtitle}</p>
      <p className="mb-4 text-xs leading-6 text-gray-500">{tool.description}</p>
      <button
        type="button"
        onClick={() => onRun(tool)}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition disabled:opacity-50 ${buttonClass(tool.severity)}`}
      >
        {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : tool.severity === "info" ? <Search className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {loading ? "جارٍ التنفيذ..." : tool.severity === "info" ? "عرض" : tool.severity === "warning" ? "تنفيذ ⚠️" : "تنفيذ"}
      </button>
    </div>
  );
}

function TerminalPanel({ open, logs, progress, onClose, onClear }: { open: boolean; logs: string[]; progress: number; onClose: () => void; onClear: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 overflow-hidden rounded-2xl border border-gray-800 bg-[#0d1117] text-[#39d353] shadow-2xl lg:inset-x-12">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <p className="font-mono text-sm font-bold text-gray-100">سجل التنفيذ</p>
        <div className="flex items-center gap-2">
          <button onClick={() => void navigator.clipboard?.writeText(logs.join("\n"))} className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-200">نسخ الكل</button>
          <button onClick={onClear} className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-200">مسح</button>
          <button onClick={onClose} className="rounded-lg border border-gray-700 p-1 text-gray-200"><X className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="h-1 bg-gray-800"><div className="h-1 bg-[#39d353] transition-all" style={{ width: `${progress}%` }} /></div>
      <div className="max-h-72 space-y-2 overflow-y-auto p-4 font-mono text-xs leading-6">
        {logs.map((log, index) => <p key={`${index}-${log}`}>[{nowTime()}] {log}</p>)}
      </div>
    </div>
  );
}

export function SystemToolsManager({ payload }: { payload: BridgeSystemTools }) {
  const [activeTab, setActiveTab] = useState<Tab>("maintenance");
  const [password, setPassword] = useState("");
  const [maintenanceMessage, setMaintenanceMessage] = useState("نقوم حالياً بأعمال صيانة لتحسين الخدمة. سنعود قريباً.");
  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [health, setHealth] = useState<Health>({ cpu: 23, memory: { used: 2.1, total: 3, percent: 68 }, database: { connected: true, size: "1.1 GB", tables: 128 }, cache: { active: true, hitRate: 94, size: "291 MB" }, uptime: "12 يوم 4 ساعة" });
  const [loadingTool, setLoadingTool] = useState<string | null>(null);
  const [confirmTool, setConfirmTool] = useState<Tool | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<ExecutionRow[]>([]);
  const [selectedLog, setSelectedLog] = useState<ExecutionRow | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [jobModal, setJobModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadHealth() {
      const response = await fetch("/api/admin/tools/system-health").catch(() => null);
      const result = response ? ((await response.json().catch(() => null)) as { data?: Health } | null) : null;
      if (mounted && result?.data) setHealth(result.data);
    }
    void loadHealth();
    const timer = window.setInterval(loadHealth, 30000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const filteredHistory = useMemo(() => history.filter((item) => !historySearch || item.tool.includes(historySearch) || item.output.join(" ").includes(historySearch)), [history, historySearch]);

  async function runTool(tool: Tool) {
    if (tool.severity === "warning" || tool.severity === "danger") {
      setConfirmTool(tool);
      return;
    }
    await executeTool(tool);
  }

  async function executeTool(tool: Tool) {
    setConfirmTool(null);
    setLoadingTool(tool.id);
    setTerminalOpen(true);
    setProgress(15);
    setTerminalLogs([`> بدء تنفيذ: ${tool.subtitle}`, "> فحص البيئة والصلاحيات..."]);

    const startedAt = performance.now();
    const response = await secureFetch("/api/admin/tools/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: tool.id, params: { bridgeAction: tool.bridgeAction, password, maintenanceMessage } }),
    }).catch(() => null);
    setProgress(75);

    const result = response ? ((await response.json().catch(() => null)) as { status?: string; output?: string[]; result?: { bridgeStatus?: number } } | null) : null;
    const output = result?.output?.length ? result.output : ["تعذر استلام مخرجات الأداة."];
    const duration = `${((performance.now() - startedAt) / 1000).toFixed(1)} ثانية`;
    setTerminalLogs((current) => [...current, ...output.map((line) => `✓ ${line}`), "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", `✅ اكتمل | ${duration}`]);
    setProgress(100);
    setHistory((current) => [
      { id: `run_${Date.now()}`, tool: tool.title, category: tool.category, status: response?.ok ? "success" : "failed", duration, user: "Labayh Admin", date: new Date().toLocaleString("ar-SA"), output },
      ...current,
    ]);
    if (tool.id === "maintenance_on") setMaintenanceOn(true);
    if (tool.id === "maintenance_off") setMaintenanceOn(false);
    setLoadingTool(null);
  }

  function runMaintenanceToggle() {
    const tool: Tool = {
      id: maintenanceOn ? "maintenance_off" : "maintenance_on",
      title: maintenanceOn ? "إلغاء وضع الصيانة" : "تفعيل وضع الصيانة",
      subtitle: maintenanceOn ? "Disable maintenance mode" : "Enable maintenance mode",
      description: "تغيير حالة وضع الصيانة",
      category: "وضع الصيانة",
      icon: AlertTriangle,
      severity: maintenanceOn ? "normal" : "danger",
      bridgeAction: maintenanceOn ? "maintenance_off" : "maintenance_on",
    };
    void runTool(tool);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F8FA] text-[#1a1f36]">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 px-4 py-5 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]"><Terminal className="h-6 w-6" /></div>
            <div>
              <h1 className="text-2xl font-black">الأدوات المتقدمة</h1>
              <p className="mt-1 text-sm text-gray-500">تنفيذ إجراءات الصيانة والنظام من لوحة التحكم الموحدة</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">🟢 النظام يعمل بشكل طبيعي</span>
            <span className="text-xs font-bold text-gray-400">آخر صيانة: منذ 3 أيام</span>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <HealthCard label="الخادم" value="🟢 نشط" detail={`CPU: ${health.cpu}%`} icon={Server} />
          <HealthCard label="قاعدة البيانات" value={health.database.connected ? "🟢 متصلة" : "🔴 غير متصلة"} detail={`${health.database.tables} جدول | ${health.database.size}`} icon={Database} />
          <HealthCard label="الكاش" value={health.cache.active ? "🟢 نشط" : "🔴 متوقف"} detail={`Hit: ${health.cache.hitRate}% | ${health.cache.size}`} icon={Zap} />
          <HealthCard label="الذاكرة" value={`${health.memory.percent}% مستخدم`} detail={`${health.memory.used}GB/${health.memory.total}GB`} icon={Activity} />
        </div>
        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${activeTab === tab.id ? "bg-[#1a1f36] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
        {payload.password_required ? (
          <Card>
            <label className="grid gap-2 md:max-w-md">
              <span className="text-sm font-bold">كلمة مرور النظام</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1a1f36]" />
            </label>
          </Card>
        ) : null}

        {activeTab === "maintenance" ? (
          <div className="space-y-6">
            {categories.map((category) => (
              <Card key={category}>
                <h2 className="text-lg font-black">{category}</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {tools.filter((tool) => tool.category === category).map((tool) => <ToolCard key={tool.id} tool={tool} loading={loadingTool === tool.id} onRun={runTool} />)}
                </div>
              </Card>
            ))}
            <Card className="border-orange-200 bg-orange-50/40">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="text-lg font-black">🚧 وضع الصيانة</h2>
                  <p className="mt-2 text-sm font-bold text-gray-600">{maintenanceOn ? "وضع الصيانة مفعل حالياً" : "النظام يعمل بشكل طبيعي"}</p>
                  <p className="mt-3 text-sm text-orange-700">⚠️ تفعيل وضع الصيانة سيمنع المستخدمين من الوصول للموقع. لوحة التحكم ستبقى متاحة.</p>
                  <textarea value={maintenanceMessage} onChange={(event) => setMaintenanceMessage(event.target.value)} className="mt-4 min-h-28 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm outline-none" />
                </div>
                <div className="flex flex-col justify-end gap-3">
                  <button onClick={runMaintenanceToggle} className={`rounded-xl px-5 py-3 text-sm font-black text-white ${maintenanceOn ? "bg-[#1a1f36]" : "bg-red-500"}`}>
                    {maintenanceOn ? "إلغاء وضع الصيانة" : "تفعيل وضع الصيانة"}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        ) : null}

        {activeTab === "monitor" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card><p className="text-sm font-bold text-gray-500">CPU Usage</p><p className="mt-3 text-4xl font-black text-emerald-600">{health.cpu}%</p></Card>
              <Card><p className="text-sm font-bold text-gray-500">Memory</p><p className="mt-3 text-4xl font-black text-amber-600">{health.memory.percent}%</p><div className="mt-3 h-3 rounded-full bg-gray-100"><div className="h-3 rounded-full bg-amber-500" style={{ width: `${health.memory.percent}%` }} /></div></Card>
              <Card><p className="text-sm font-bold text-gray-500">Response Time</p><p className="mt-3 text-4xl font-black">142ms</p><p className="mt-2 text-xs text-gray-500">P95: 410ms</p></Card>
              <Card><p className="text-sm font-bold text-gray-500">Active Users</p><p className="mt-3 text-4xl font-black">128</p><p className="mt-2 text-xs text-gray-500">Peak today: 312</p></Card>
            </div>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-black">Performance Chart</h2><div className="flex gap-2">{["آخر ساعة", "آخر 24 ساعة", "آخر 7 أيام"].map((item) => <button key={item} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold">{item}</button>)}</div></div>
              <svg viewBox="0 0 600 180" className="mt-6 h-72 w-full rounded-2xl bg-gray-50 p-3">
                <polyline fill="none" stroke="#10B981" strokeWidth="4" points={spark.map((value, index) => `${index * 54},${160 - value * 1.7}`).join(" ")} />
                <polyline fill="none" stroke="#FF385C" strokeWidth="4" points={spark.map((value, index) => `${index * 54},${130 - (100 - value)}`).join(" ")} />
              </svg>
            </Card>
            <Card>
              <h2 className="text-lg font-black">معلومات الخادم</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {["إصدار Node.js: v20.x", "إصدار Next.js: 15.5.15", "بيئة التشغيل: Production", "المنطقة الزمنية: Asia/Riyadh", `وقت التشغيل: ${health.uptime}`, "حجم مجلد الرفع: 2.3 GB"].map((item) => <div key={item} className="rounded-xl bg-gray-50 p-3 text-sm font-bold">{item}</div>)}
              </div>
            </Card>
          </div>
        ) : null}

        {activeTab === "history" ? (
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-72 flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2"><Search className="h-4 w-4 text-gray-400" /><input value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} placeholder="ابحث في السجل" className="w-full bg-transparent text-sm outline-none" /></div>
              <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold">تصدير السجل</button>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-right text-sm">
                <thead className="text-xs text-gray-500"><tr className="border-b"><th className="py-3">التاريخ</th><th>الأداة</th><th>المنفذ</th><th>الحالة</th><th>المدة</th><th>الإجراءات</th></tr></thead>
                <tbody>{filteredHistory.map((row) => <tr key={row.id} className="border-b border-gray-50"><td className="py-4">{row.date}</td><td><p className="font-black">{row.tool}</p><span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{row.category}</span></td><td>{row.user}</td><td><span className={`rounded-full px-2 py-1 text-xs font-bold ${row.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{row.status === "success" ? "✅ ناجح" : "❌ فاشل"}</span></td><td>{row.duration}</td><td><button onClick={() => setSelectedLog(row)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold">عرض السجل</button></td></tr>)}</tbody>
              </table>
              {!filteredHistory.length ? <p className="py-8 text-center text-sm text-gray-500">لا توجد عمليات بعد.</p> : null}
            </div>
          </Card>
        ) : null}

        {activeTab === "database" ? (
          <div className="space-y-6">
            <Card><h2 className="text-lg font-black">نظرة عامة على قاعدة البيانات</h2><div className="mt-4 grid gap-3 md:grid-cols-5">{["🟢 متصل", "Database: labayh", "Host: 127.0.0.1", "الحجم: 1.1 GB", "128 جدول"].map((item) => <div key={item} className="rounded-xl bg-gray-50 p-3 text-sm font-bold">{item}</div>)}</div></Card>
            <Card><h2 className="text-lg font-black">الجداول</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b text-gray-500"><th className="py-3 text-right">اسم الجدول</th><th>الحجم</th><th>عدد السجلات</th><th>آخر تحديث</th><th>الإجراءات</th></tr></thead><tbody>{tables.map(([name, records, size, updated]) => <tr key={name} className="border-b border-gray-50"><td className="py-3 font-mono">{name}</td><td>{size}</td><td>{records}</td><td>{updated}</td><td><button className="rounded-xl border px-3 py-2 text-xs font-bold">تحسين</button></td></tr>)}</tbody></table></div></Card>
            <Card><h2 className="text-lg font-black">Backup Management</h2><button onClick={() => void runTool(tools.find((tool) => tool.id === "database_backup") ?? tools[0])} className="mt-4 rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-black text-white">إنشاء نسخة احتياطية الآن</button></Card>
            <Card><h2 className="text-lg font-black">Quick Query</h2><textarea placeholder="SELECT * FROM users LIMIT 10;" className="mt-4 min-h-32 w-full rounded-xl border border-gray-200 p-4 font-mono text-sm" /><button className="mt-3 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold">تنفيذ SELECT فقط</button></Card>
          </div>
        ) : null}

        {activeTab === "files" ? (
          <div className="space-y-6">
            <Card><h2 className="text-lg font-black">Storage Overview</h2><p className="mt-3 text-3xl font-black">2.7 GB / 5 GB</p><div className="mt-4 h-3 rounded-full bg-gray-100"><div className="h-3 w-[54%] rounded-full bg-emerald-500" /></div></Card>
            <Card><h2 className="text-lg font-black">File Operations</h2><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[
              ["مسح الملفات المؤقتة", "tmp_cleanup", Trash2],
              ["ضغط الصور", "compress_images", Image],
              ["مسح الصور اليتيمة", "orphan_cleanup", FolderOpen],
              ["تقرير مساحة التخزين", "storage_report", FileArchive],
            ].map(([title, id, Icon]) => <div key={String(id)} className="rounded-2xl border border-gray-100 p-4"><Icon className="h-6 w-6 text-[#FF385C]" /><p className="mt-3 font-black">{String(title)}</p><button onClick={() => void runTool({ id: String(id), title: String(title), subtitle: String(id), description: "", category: "الملفات", icon: Icon as LucideIcon, severity: id === "orphan_cleanup" ? "warning" : "normal" })} className="mt-4 rounded-xl bg-[#1a1f36] px-3 py-2 text-xs font-bold text-white">تنفيذ</button></div>)}</div></Card>
            <Card><h2 className="text-lg font-black">Recent Uploads</h2><div className="mt-4 space-y-2">{["villa.jpg — 2.4MB — ناجح", "contract.pdf — 860KB — ناجح", "avatar.png — 120KB — ناجح"].map((item) => <p key={item} className="rounded-xl bg-gray-50 p-3 text-sm">{item}</p>)}</div></Card>
          </div>
        ) : null}

        {activeTab === "jobs" ? (
          <div className="space-y-4">
            <button onClick={() => setJobModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-black text-white"><Plus className="h-4 w-4" /> إضافة مهمة جديدة</button>
            {jobs.map(([title, slug, cron, last, next]) => <Card key={slug}><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-black">📧 {title} <span className="text-sm text-emerald-700">🟢 نشط</span></h2><p className="mt-1 font-mono text-xs text-gray-500">{slug}</p><p className="mt-3 text-sm">الجدول: {cron}</p><p className="mt-1 text-sm text-gray-500">آخر تشغيل: {last} ✅ | التشغيل القادم: {next}</p></div><div className="flex flex-wrap gap-2"><button className="rounded-xl bg-[#1a1f36] px-3 py-2 text-xs font-bold text-white">تشغيل الآن</button><button className="rounded-xl border px-3 py-2 text-xs font-bold">تعطيل</button><button className="rounded-xl border px-3 py-2 text-xs font-bold">تعديل الجدول</button></div></div></Card>)}
          </div>
        ) : null}
      </main>

      <TerminalPanel open={terminalOpen} logs={terminalLogs} progress={progress} onClose={() => setTerminalOpen(false)} onClear={() => setTerminalLogs([])} />

      {confirmTool ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <AlertTriangle className="h-10 w-10 text-orange-500" />
            <h2 className="mt-4 text-xl font-black">تأكيد التنفيذ</h2>
            <p className="mt-2 text-sm text-gray-600">هل تريد تنفيذ: {confirmTool.title}؟</p>
            <p className="mt-2 text-sm font-bold text-red-600">هذا الإجراء لا يمكن التراجع عنه.</p>
            <div className="mt-6 flex gap-3"><button onClick={() => void executeTool(confirmTool)} className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-black text-white">تأكيد التنفيذ</button><button onClick={() => setConfirmTool(null)} className="flex-1 rounded-xl border px-4 py-3 font-black">إلغاء</button></div>
          </div>
        </div>
      ) : null}

      {selectedLog ? (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black">سجل التنفيذ</h2><button onClick={() => setSelectedLog(null)}><X className="h-5 w-5" /></button></div>
          <pre dir="ltr" className="mt-5 overflow-x-auto rounded-2xl bg-[#0d1117] p-5 text-left font-mono text-xs leading-7 text-[#39d353]">{selectedLog.output.join("\n")}</pre>
          <button onClick={() => void navigator.clipboard?.writeText(selectedLog.output.join("\n"))} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white"><Copy className="h-4 w-4" /> نسخ السجل</button>
        </aside>
      ) : null}

      {jobModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6"><div className="flex justify-between"><h2 className="text-xl font-black">إضافة مهمة جديدة</h2><button onClick={() => setJobModal(false)}><X className="h-5 w-5" /></button></div><div className="mt-5 grid gap-3"><input placeholder="اسم المهمة" className="rounded-xl border px-4 py-3" /><input dir="ltr" placeholder="job-identifier" className="rounded-xl border px-4 py-3" /><input dir="ltr" placeholder="0 8 * * *" className="rounded-xl border px-4 py-3 font-mono" /><div className="flex flex-wrap gap-2">{["كل دقيقة", "كل ساعة", "يومياً", "أسبوعياً", "شهرياً", "مخصص"].map((item) => <button key={item} className="rounded-xl border px-3 py-2 text-xs font-bold">{item}</button>)}</div><button className="rounded-xl bg-[#FF385C] px-4 py-3 font-black text-white">حفظ المهمة</button></div></div></div>
      ) : null}
    </div>
  );
}
