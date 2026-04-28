"use client";

import { secureFetch } from "@/lib/client-security";

import type {
  BridgeEditorField,
  BridgeEditorFieldItem,
  BridgeEditorPayload,
  BridgeManagedServiceType,
  BridgeUploadedMedia,
} from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CircleDollarSign,
  FileText,
  GalleryHorizontal,
  Languages,
  ListChecks,
  MapPin,
  Pencil,
  Route,
  Search,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

type Props = {
  editor: BridgeEditorPayload;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-right text-sm text-gray-900 transition-all focus:border-[#FF385C] focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20";
const ltrInputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left font-mono text-sm text-gray-900 transition-all focus:border-[#FF385C] focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20";
const textareaClass =
  "w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-right text-sm text-gray-900 transition-all focus:border-[#FF385C] focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20";
const cardClass = "rounded-2xl border border-gray-100 bg-white p-6 shadow-sm";

function isLtrField(id = "") {
  return /(slug|url|link|lat|lng|zoom|image|facebook_image|twitter_image|id)$/i.test(id);
}

function sectionIcon(sectionId: string) {
  if (sectionId.includes("location")) return MapPin;
  if (sectionId.includes("pricing") || sectionId.includes("price")) return CircleDollarSign;
  if (sectionId.includes("gallery")) return GalleryHorizontal;
  if (sectionId.includes("language")) return Languages;
  if (sectionId.includes("inclusion") || sectionId.includes("exclusion")) return ListChecks;
  if (sectionId.includes("itinerary")) return Route;
  if (sectionId.includes("polic")) return ShieldCheck;
  if (sectionId.includes("avail")) return CalendarDays;
  if (sectionId.includes("seo")) return Search;
  return FileText;
}

function FieldChrome({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description ? <p className="mt-1 text-xs text-gray-400">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

const dashboardTextMap: Record<string, string> = {
  "": "",
  "art and culture": "الفنون والثقافة",
  "land trips": "رحلات برية",
  "mountain climbing": "تسلق الجبال",
  tours: "جولات سياحية",
  health: "الصحة والعافية",
  "Nature and the outdoors": "الطبيعة والأنشطة الخارجية",
  "nature and the outdoors": "الطبيعة والأنشطة الخارجية",
  "sea trips": "رحلات بحرية",
  events: "فعاليات",
  "Booking For": "نوع الحجز",
  "Booking Form": "نموذج الحجز",
  Enquiry: "استفسار",
  Featured: "مميز",
  "?Is Featured": "هل العنصر مميز؟",
  "Is Featured": "هل العنصر مميز؟",
  Duration: "المدة",
  Durations: "المدة",
  "Example: 2 days 1 night, 3 hours": "مثال: يومان وليلة، أو 3 ساعات",
  "Experience Type": "نوع التجربة",
  "Max People": "الحد الأقصى للأشخاص",
  "Unlimited. Can change in Custom Price option.": "غير محدود. يمكن تغييره من خيار السعر المخصص.",
  "Subscribe Closed": "إغلاق الاشتراك",
  "Price Type": "نوع السعر",
  per_night: "لكل ليلة",
  per_day: "لكل يوم",
  per_hour: "لكل ساعة",
  fixed: "سعر ثابت",
  "Just Price, no date": "سعر فقط بدون تاريخ",
  date_time: "تاريخ ووقت",
  just_date: "تاريخ فقط",
  package: "باقة",
  external_link: "رابط خارجي",
  "Base Price": "السعر الأساسي",
  "base price": "السعر الأساسي",
  "Price per 7 days": "سعر 7 أيام",
  "Price per 14 days": "سعر 14 يومًا",
  "Price per 30 days": "سعر 30 يومًا",
  "Applies to groups 7 to less than 14 days": "ينطبق على الحجوزات من 7 إلى أقل من 14 يومًا",
  "Applies to groups 14 to less than 30 days": "ينطبق على الحجوزات من 14 إلى أقل من 30 يومًا",
  "Applies to groups 30+ days": "ينطبق على الحجوزات 30 يومًا فأكثر",
  "Long-term Pricing": "تسعير الإقامات الطويلة",
  "Set different price for long stay 7, 14, 30": "حدد سعرًا مختلفًا للإقامات الطويلة 7 أو 14 أو 30 يومًا",
  "Weekend Price": "سعر نهاية الأسبوع",
  "Leave empty if it is the same with the base price": "اتركه فارغًا إذا كان مطابقًا للسعر الأساسي",
  "Days to apply weekend": "أيام تطبيق سعر نهاية الأسبوع",
  thu_fri_sat: "الخميس والجمعة والسبت",
  fri_sat: "الجمعة والسبت",
  sat_sun: "السبت والأحد",
  "Enable Extra Guests": "تفعيل الضيوف الإضافيين",
  "Extra Guests": "الضيوف الإضافيون",
  "discount percentage": "نسبة الخصم",
  discount_percentage: "نسبة الخصم",
  "Discount percentage": "نسبة الخصم",
  "?Is there a discount": "هل يوجد خصم؟",
  "Is there a discount": "هل يوجد خصم؟",
  "There is a discount": "يوجد خصم",
  "No discount": "لا يوجد خصم",
  "Price Categories": "فئات الأسعار",
  "Extra Services": "الخدمات الإضافية",
  "Add service": "إضافة خدمة",
  "Custom Price / Availability": "السعر والتوفر المخصص",
  "You can change price, availability, max people": "يمكنك تغيير السعر والتوفر والحد الأقصى للأشخاص.",
  "Custom pricing rules": "قواعد التسعير المخصصة",
  "No custom pricing rules yet.": "لا توجد قواعد تسعير مخصصة حتى الآن.",
  "Add rule": "إضافة قاعدة",
  Remove: "حذف",
  "main sponsors": "الرعاة الرئيسيون",
  "Main Sponsors": "الرعاة الرئيسيون",
  "Co-Sponsors": "الرعاة المشاركون",
  "Choose main sponsors": "اختر الرعاة الرئيسيين",
  "Choose Co-Sponsors": "اختر الرعاة المشاركين",
  video: "الفيديو",
  Video: "الفيديو",
  "Youtube, Vimeo": "يوتيوب أو فيميو",
  "Ical Sync": "مزامنة iCal",
  "Export Ical": "تصدير iCal",
  Recommend: "تنبيه مهم",
  "To use Ical Sync, you need to setup cron-job on your server.": "لاستخدام مزامنة iCal يجب إعداد مهمة cron على الخادم.",
  "Import calendar feeds are saved from the list above and synced by cron": "روابط التقويم المستوردة تحفظ من القائمة أعلاه وتتم مزامنتها عبر cron.",
  "Choose sponsors": "اختر الرعاة",
  "Choose value": "اختر قيمة",
  Publish: "منشور",
};

const mojibakeTextMap: Record<string, string> = {
  "Ø§Ø®ØªØ± Ù‚ÙŠÙ…Ø©": "اختر قيمة",
  "Ù…ÙØ¹Ù„": "مفعل",
  "ØºÙŠØ± Ù…ÙØ¹Ù„": "غير مفعل",
  "Ø¹Ù†ÙˆØ§Ù† SEO": "عنوان SEO",
  "ÙˆØµÙ SEO": "وصف SEO",
  "Ø¹Ù†ÙˆØ§Ù† ÙÙŠØ³Ø¨ÙˆÙƒ": "عنوان فيسبوك",
  "ÙˆØµÙ ÙÙŠØ³Ø¨ÙˆÙƒ": "وصف فيسبوك",
  "Ù…Ø¹Ø±Ù‘Ù ØµÙˆØ±Ø© ÙÙŠØ³Ø¨ÙˆÙƒ": "معرف صورة فيسبوك",
  "Ø¹Ù†ÙˆØ§Ù† X / ØªÙˆÙŠØªØ±": "عنوان X / تويتر",
  "ÙˆØµÙ X / ØªÙˆÙŠØªØ±": "وصف X / تويتر",
  "Ù…Ø¹Ø±Ù‘Ù ØµÙˆØ±Ø© X / ØªÙˆÙŠØªØ±": "معرف صورة X / تويتر",
  "Ø§Ù„Ø¹Ù†ÙˆØ§Ù†": "العنوان",
  "Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©": "المدينة",
  "Ø§Ù„Ù…Ù†Ø·Ù‚Ø©": "المنطقة",
  "Ø§Ù„Ø¯ÙˆÙ„Ø©": "الدولة",
  "Ø§Ù„Ø±Ù…Ø² Ø§Ù„Ø¨Ø±ÙŠØ¯ÙŠ": "الرمز البريدي",
  "ØµÙˆØ±Ø© Ø±Ø¦ÙŠØ³ÙŠØ©": "صورة رئيسية",
  "Ø­Ø°Ù Ø§Ù„ØµÙˆØ±Ø©": "حذف الصورة",
  "Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ù…Ù„Ù": "إزالة الملف",
  "Ø¥Ø¶Ø§ÙØ© Ø¹Ù†ØµØ±": "إضافة عنصر",
  "Ø³Ø¹Ø± Ø§Ù„Ø¨Ø§Ù„Øº": "سعر البالغ",
  "Ø³Ø¹Ø± Ø§Ù„Ø·ÙÙ„": "سعر الطفل",
  "Ø³Ø¹Ø± Ø§Ù„Ø±Ø¶ÙŠØ¹": "سعر الرضيع",
  "Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ": "السعر الرئيسي",
  "ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¨Ø¯Ø§ÙŠØ©": "تاريخ البداية",
  "ØªØ§Ø±ÙŠØ® Ø§Ù„Ù†Ù‡Ø§ÙŠØ©": "تاريخ النهاية",
  "Ø§Ù„Ø³Ø¹Ø±": "السعر",
  "Ø§Ù„Ø¥ØªØ§Ø­Ø©": "الإتاحة",
  "Ù…ØªØ§Ø­": "متاح",
  "Ù…Ø­Ø¬ÙˆØ¨": "محجوب",
  "Ø§Ù„ØªØ§Ø±ÙŠØ®": "التاريخ",
  "Ø§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„ÙˆÙ‚Øª": "التاريخ والوقت",
  "Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù„Ù„Ø£Ø´Ø®Ø§Øµ": "الحد الأقصى للأشخاص",
  "Ù…Ù„Ø§Ø­Ø¸Ø§Øª": "ملاحظات",
  "ØªØ¹Ø¯ÙŠÙ„Ø§Øª Ø§Ù„Ø¥ØªØ§Ø­Ø©": "تعديلات الإتاحة",
  "Ø¥Ø¶Ø§ÙØ© ØªØ¹Ø¯ÙŠÙ„": "إضافة تعديل",
  "Ø­Ø°Ù": "حذف",
  "Ø±Ø§Ø¨Ø· ØªØµØ¯ÙŠØ± iCal": "رابط تصدير iCal",
  "Ù†Ø³Ø® Ø§Ù„Ø±Ø§Ø¨Ø·": "نسخ الرابط",
  "Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ù…Ø³ØªÙˆØ±Ø¯Ø©": "الروابط المستوردة",
  "Ù…Ø·Ù„ÙˆØ¨": "مطلوب",
  "Ø§Ø®ØªÙŠØ§Ø±ÙŠ": "اختياري",
};

function dashboardText(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }
  return dashboardTextMap[text] ?? mojibakeTextMap[text] ?? text;
}

function dashboardChoiceLabel(choice: { label?: string; value?: string }) {
  const label = dashboardText(choice.label);
  if (label && label !== choice.label) {
    return label;
  }
  return dashboardText(choice.value ?? choice.label ?? "");
}

function normalizeInitialValue(field: BridgeEditorField) {
  if (field.type === "on_off") {
    return field.value === "on" ? "on" : "off";
  }

  if (field.type === "checkbox") {
    return Array.isArray(field.value) ? field.value : [];
  }

  if (field.type === "list_item") {
    return Array.isArray(field.value) ? field.value : [];
  }

  if (field.type === "media_advanced") {
    const value = (field.value ?? {}) as {
      ids?: number[];
      featured_id?: number;
      items?: BridgeUploadedMedia[];
    };

    return {
      ids: value.ids ?? [],
      featured_id: value.featured_id ?? 0,
      items: value.items ?? [],
    };
  }

  if (field.type === "upload") {
    return field.value ?? null;
  }

  if (field.type === "location") {
    return {
      address: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
      lat: "",
      lng: "",
      zoom: "",
      ...(typeof field.value === "object" && field.value ? field.value : {}),
    };
  }

  if (field.type === "price_categories") {
    return {
      selected: [],
      price_primary: "adult_price",
      adult_price: 0,
      child_price: 0,
      infant_price: 0,
      ...(typeof field.value === "object" && field.value ? field.value : {}),
    };
  }

  if (field.type === "price" || field.type === "availability" || field.type === "ical") {
    return typeof field.value === "object" && field.value ? field.value : {};
  }

  return field.value ?? "";
}

function evaluateCondition(condition: string, values: Record<string, unknown>) {
  if (!condition) {
    return true;
  }

  return condition.split(",").every((rule) => {
    const match = rule.match(/^([^:]+):(is|not)\((.*)\)$/);
    if (!match) {
      return true;
    }

    const [, fieldId, operator, expected] = match;
    const current = values[fieldId];
    const currentValues = Array.isArray(current)
      ? current.map(String)
      : [String(current ?? "")];

    const isMatch = currentValues.includes(expected);
    return operator === "is" ? isMatch : !isMatch;
  });
}

function createEmptyListItem(items: BridgeEditorFieldItem[]) {
  const row: Record<string, unknown> = {};
  items.forEach((item) => {
    row[item.id] = item.type === "on_off" ? "off" : item.type === "upload" ? null : "";
  });
  return row;
}

function createEmptyPriceEntry(serviceType: BridgeManagedServiceType) {
  if (serviceType === "home") {
    return {
      start_date: "",
      end_date: "",
      price: "",
      available: "on",
    };
  }

  return {
    start_at: "",
    adult_price: "",
    child_price: "",
    infant_price: "",
    max_people: "",
  };
}

function createEmptyAvailabilityEntry(serviceType: BridgeManagedServiceType) {
  if (serviceType === "home") {
    return {
      start_date: "",
      end_date: "",
    };
  }

  return {
    date: "",
    max_people: "",
    summary: "",
  };
}

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await secureFetch("/api/v1/dashboard/media/upload", {
    method: "POST",
    body: formData,
  });

  return (await response.json()) as { status: number; data?: BridgeUploadedMedia; message?: string };
}

export function ServiceEditorForm({ editor }: Props) {
  const editorSections = useMemo(
    () => (Array.isArray(editor.sections) ? editor.sections : []),
    [editor.sections],
  );
  const editorFields = useMemo(
    () => (Array.isArray(editor.fields) ? editor.fields : []),
    [editor.fields],
  );
  const preview = editor.preview ?? {
    id: editor.service_id ?? 0,
    title: "",
    status_label: "",
    thumbnail_url: "",
    type_label: "",
    price: 0,
    currency: "ر.س",
  };
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(editorSections[0]?.id ?? "");
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(editorFields.map((field) => [field.id, normalizeInitialValue(field)])),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageTone, setMessageTone] = useState<"success" | "error" | "idle">("idle");

  const fieldsBySection = useMemo(() => {
    const groups: Record<string, BridgeEditorField[]> = {};
    editorSections.forEach((section) => {
      groups[section.id] = editorFields.filter((field) => field.section === section.id);
    });
    return groups;
  }, [editorFields, editorSections]);

  function updateValue(fieldId: string, nextValue: unknown) {
    setFormValues((prev) => ({ ...prev, [fieldId]: nextValue }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setMessageTone("idle");

    try {
      const segment = editor.service_type === "home" ? "homes" : "experiences";
      const body = JSON.stringify({
        type: editor.service_type,
        id: editor.service_id,
        values: formValues,
      });

      let response = await secureFetch("/api/v1/dashboard/bridge/dashboard/services/editor-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (response.status === 404) {
        response = await secureFetch("/api/v1/dashboard/services/editor/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
        });
      }

      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json")
        ? ((await response.json()) as {
            status: number;
            message?: string;
            data?: { public_url?: string; service_id?: number };
          })
        : {
            status: 0,
            message: `استجابة غير متوقعة (${response.status})`,
          };

      setMessage(payload.status ? "تم حفظ التعديلات بنجاح" : dashboardText(payload.message ?? "تعذر حفظ التعديلات"));

      setMessage(payload.status ? dashboardText(payload.message ?? "تم حفظ التعديلات بنجاح") : dashboardText(payload.message ?? "تعذر حفظ التعديلات"));
      setMessage(
        payload.status
          ? dashboardText(payload.message ?? "تم حفظ التعديلات بنجاح")
          : response.status === 404
            ? "تعذر الوصول إلى مسار الحفظ. أعد تحميل الصفحة ثم حاول مرة أخرى."
            : dashboardText(payload.message ?? "تعذر حفظ التعديلات"),
      );
      setMessageTone(payload.status ? "success" : "error");

      if (payload.status) {
        const savedId = Number(payload.data?.service_id ?? editor.service_id);
        if (savedId && savedId !== editor.service_id) {
          router.replace(`/dashboard/services/${segment}/${savedId}/edit`);
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? `تعذر الحفظ: ${error.message}` : "تعذر الحفظ بسبب خطأ غير متوقع",
      );
      setMessage(error instanceof Error ? `تعذر الحفظ: ${error.message}` : "تعذر الحفظ بسبب خطأ غير متوقع");
      setMessageTone("error");
    } finally {
      setSaving(false);
    }
  }

  const dashboardListPath =
    editor.service_type === "home"
      ? "/dashboard/services/homes"
      : "/dashboard/services/experiences";

  return (
    <div className="space-y-6 bg-[#F7F8FA] text-gray-900">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FF385C]">
              {editor.service_type === "home" ? "الإعلانات" : "التجارب"}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">{dashboardText(editor.title)}</h1>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              {editor.created
                ? "تم إنشاء مسودة جديدة ويمكنك الآن إكمال جميع الحقول من داخل الواجهة الحديثة."
                : "يمكنك تعديل البيانات وحفظها مباشرة من لوحة التحكم الموحدة."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={dashboardListPath}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-[#FF385C] hover:text-[#FF385C]"
            >
              العودة إلى الإدارة الجديدة
            </Link>
            <a
              href={editor.public_url || dashboardListPath}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#1a1f36] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-900"
            >
              معاينة الصفحة
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <nav className="flex gap-2 overflow-x-auto xl:block xl:space-y-1">
            {editorSections.map((section) => {
              const Icon = sectionIcon(section.id);
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex w-full min-w-max items-center justify-end gap-2 rounded-xl px-4 py-2.5 text-right text-sm transition-all xl:min-w-0",
                    activeSection === section.id
                      ? "bg-[#1a1f36] text-white"
                      : "cursor-pointer text-gray-600 hover:bg-gray-50",
                  )}
                >
                  <span>{dashboardText(section.label)}</span>
                  <Icon className="size-4" />
                </button>
              );
            })}
            </nav>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">ملخص سريع</p>
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
              {preview.thumbnail_url ? (
                <Image
                  src={preview.thumbnail_url}
                  alt=""
                  width={480}
                  height={240}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-40 items-center justify-center text-sm text-slate-400">لا توجد صورة رئيسية</div>
              )}
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{dashboardText(preview.title) || "عنصر جديد"}</p>
                <p className="mt-1 text-xs text-slate-500">{dashboardText(preview.type_label)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">#{preview.id}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{dashboardText(preview.status_label)}</span>
              </div>
              <p className="text-sm text-slate-600">
                السعر الأساسي: <span className="font-semibold text-slate-950">{preview.price} {dashboardText(preview.currency)}</span>
              </p>
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-6">
          {editorSections
            .filter((section) => section.id === activeSection)
            .map((section) => (
              <section key={section.id} className={cardClass}>
                <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                  {(() => {
                    const Icon = sectionIcon(section.id);
                    return (
                      <span className="flex size-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                        <Icon className="size-5" />
                      </span>
                    );
                  })()}
                  <h2 className="text-xl font-bold text-gray-900">{dashboardText(section.label)}</h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {(fieldsBySection[section.id] ?? [])
                    .filter((field) => evaluateCondition(field.condition, formValues))
                    .map((field) => (
                      <div
                        key={field.id}
                        className={cn(
                          "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm",
                          field.type === "editor" ||
                            field.type === "textarea" ||
                            field.type === "location" ||
                            field.type === "checkbox" ||
                            field.type === "list_item" ||
                            field.type === "media_advanced" ||
                            field.type === "price_categories" ||
                            field.type === "seo" ||
                            field.type === "price" ||
                            field.type === "availability" ||
                            field.type === "ical"
                            ? "md:col-span-2"
                            : "",
                        )}
                      >
                        <FieldChrome label={dashboardText(field.label)} description={field.desc ? dashboardText(field.desc) : undefined}>
                          <FieldRenderer
                            field={field}
                            value={formValues[field.id]}
                            serviceType={editor.service_type}
                            onChange={(nextValue) => updateValue(field.id, nextValue)}
                          />
                        </FieldChrome>
                      </div>
                    ))}
                </div>
              </section>
            ))}

          <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div
              className={cn(
                "rounded-full px-4 py-2 text-sm",
                messageTone === "success" ? "bg-green-50 text-green-700" : "",
                messageTone === "error" ? "bg-red-50 text-red-600" : "",
                messageTone === "idle" ? "text-gray-500" : "",
              )}
            >
              {message}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#FF385C] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#e0314f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "جار الحفظ..." : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  serviceType,
}: {
  field: BridgeEditorField;
  value: unknown;
  onChange: (value: unknown) => void;
  serviceType: BridgeManagedServiceType;
}) {
  const choices = Array.isArray(field.choices) ? field.choices : [];
  const fieldItems = Array.isArray(field.items) ? field.items : [];

  if (field.type === "text" || field.type === "permalink") {
    const ltr = isLtrField(field.id) || field.type === "permalink";
    return (
      <div className="relative">
        <input
          dir={ltr ? "ltr" : "rtl"}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className={ltr ? ltrInputClass : inputClass}
        />
        {field.type === "permalink" ? <Pencil className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" /> : null}
        <div className="mt-1 text-left text-xs text-gray-400">{String(value ?? "").length} حرف</div>
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        dir="ltr"
        className={ltrInputClass}
      />
    );
  }

  if (field.type === "textarea" || field.type === "editor") {
    return (
      <textarea
        rows={field.type === "editor" ? 8 : 4}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className={cn(textareaClass, field.type === "editor" ? "min-h-[140px]" : "min-h-[120px]")}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "appearance-none pl-10")}
      >
        <option value="">اختر قيمة</option>
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {dashboardChoiceLabel(choice)}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "on_off") {
    const checked = value === "on";
    return (
      <button
        type="button"
        onClick={() => onChange(checked ? "off" : "on")}
        className={cn(
          "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition",
          checked ? "bg-[#10B981] text-white" : "bg-gray-200 text-gray-700",
        )}
      >
        {checked ? "مفعل" : "غير مفعل"}
      </button>
    );
  }

  if (field.type === "seo") {
    const seo = (value ?? {}) as Record<string, string | number>;

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="عنوان SEO">
          <input
            value={String(seo.seo_title ?? "")}
            onChange={(event) => onChange({ ...seo, seo_title: event.target.value })}
            className={inputClass}
          />
        </FormField>
        <FormField label="وصف SEO">
          <textarea
            rows={3}
            value={String(seo.seo_description ?? "")}
            onChange={(event) => onChange({ ...seo, seo_description: event.target.value })}
            className={textareaClass}
          />
        </FormField>
        <FormField label="عنوان فيسبوك">
          <input
            value={String(seo.facebook_title ?? "")}
            onChange={(event) => onChange({ ...seo, facebook_title: event.target.value })}
            className={inputClass}
          />
        </FormField>
        <FormField label="وصف فيسبوك">
          <textarea
            rows={3}
            value={String(seo.facebook_description ?? "")}
            onChange={(event) => onChange({ ...seo, facebook_description: event.target.value })}
            className={textareaClass}
          />
        </FormField>
        <FormField label="معرّف صورة فيسبوك">
          <input
            type="number"
            value={String(seo.facebook_image ?? 0)}
            onChange={(event) => onChange({ ...seo, facebook_image: Number(event.target.value || 0) })}
            className={ltrInputClass}
          />
        </FormField>
        <FormField label="عنوان X / تويتر">
          <input
            value={String(seo.twitter_title ?? "")}
            onChange={(event) => onChange({ ...seo, twitter_title: event.target.value })}
            className={inputClass}
          />
        </FormField>
        <FormField label="وصف X / تويتر">
          <textarea
            rows={3}
            value={String(seo.twitter_description ?? "")}
            onChange={(event) => onChange({ ...seo, twitter_description: event.target.value })}
            className={textareaClass}
          />
        </FormField>
        <FormField label="معرّف صورة X / تويتر">
          <input
            type="number"
            value={String(seo.twitter_image ?? 0)}
            onChange={(event) => onChange({ ...seo, twitter_image: Number(event.target.value || 0) })}
            className={ltrInputClass}
          />
        </FormField>
      </div>
    );
  }

  if (field.type === "checkbox") {
    const selected = Array.isArray(value) ? value.map(String) : [];
    return (
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => {
          const checked = selected.includes(choice.value);
          return (
            <label
              key={choice.value}
              className={cn(
                "cursor-pointer rounded-lg border px-3 py-2 text-sm transition-all",
                checked
                  ? "border-[#1a1f36] bg-[#1a1f36] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-400",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...selected, choice.value]
                    : selected.filter((item) => item !== choice.value);
                  onChange(next);
                }}
              />
              <span>{dashboardChoiceLabel(choice)}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (field.type === "location") {
    const location = (value ?? {}) as Record<string, string>;
    const labels: Array<[string, string]> = [
      ["address", "العنوان"],
      ["city", "المدينة"],
      ["state", "المنطقة"],
      ["country", "الدولة"],
      ["postcode", "الرمز البريدي"],
      ["lat", "خط العرض"],
      ["lng", "خط الطول"],
      ["zoom", "مستوى التكبير"],
    ];

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <MapPin className="size-4" />
          <span>Location Settings</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
        {labels.map(([key, label]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
              dir={isLtrField(key) ? "ltr" : "rtl"}
              value={location[key] ?? ""}
              onChange={(event) => onChange({ ...location, [key]: event.target.value })}
              className={isLtrField(key) ? ltrInputClass : inputClass}
            />
          </div>
        ))}
        </div>
      </div>
    );
  }

  if (field.type === "media_advanced") {
    const media = (value ?? { ids: [], items: [], featured_id: 0 }) as {
      ids: number[];
      items: BridgeUploadedMedia[];
      featured_id?: number;
    };
    const mediaIds = Array.isArray(media.ids) ? media.ids : [];
    const mediaItems = Array.isArray(media.items) ? media.items : [];

    return (
      <div className="space-y-4">
        <label className="block cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-[#FF385C] hover:bg-rose-50/30">
          <UploadCloud className="mx-auto size-8 text-gray-300" />
          <span className="mt-3 block text-sm font-semibold text-gray-700">اسحب الصور هنا أو انقر للرفع</span>
          <span className="mt-1 block text-xs text-gray-400">Choose at least 5 photos</span>
          <input
            type="file"
            multiple
            accept="image/*"
          onChange={async (event) => {
            const input = event.currentTarget;
            const files = Array.from(event.target.files ?? []);
            let next = { ...media };
            for (const file of files) {
              const uploaded = await uploadFile(file);
              if (uploaded.status && uploaded.data) {
                next = {
                  ...next,
                  ids: [...(Array.isArray(next.ids) ? next.ids : []), uploaded.data.id],
                  items: [...(Array.isArray(next.items) ? next.items : []), uploaded.data],
                  featured_id: next.featured_id || uploaded.data.id,
                };
              }
            }
            onChange(next);
            input.value = "";
          }}
            className="sr-only"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <Image
                src={item.url}
                alt=""
                width={480}
                height={240}
                className="h-40 w-full object-cover"
              />
              <div className="space-y-3 p-3">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="radio"
                    name={`${field.id}-featured`}
                    checked={(media.featured_id ?? 0) === item.id}
                    onChange={() => onChange({ ...media, featured_id: item.id })}
                  />
                  صورة رئيسية
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...media,
                      ids: mediaIds.filter((id) => id !== item.id),
                      items: mediaItems.filter((current) => current.id !== item.id),
                      featured_id:
                        media.featured_id === item.id ? mediaItems.find((current) => current.id !== item.id)?.id ?? 0 : media.featured_id,
                    })
                  }
                  className="text-xs font-medium text-[#FF385C]"
                >
                  حذف الصورة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "upload") {
    const media = (value ?? null) as BridgeUploadedMedia | null;
    return (
      <div className="space-y-4">
        <label className="block cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-[#FF385C] hover:bg-rose-50/30">
          <UploadCloud className="mx-auto size-8 text-gray-300" />
          <span className="mt-3 block text-sm font-semibold text-gray-700">اسحب الصورة هنا أو انقر للرفع</span>
          <span className="mt-1 block text-xs text-gray-400">PNG, JPG, WebP</span>
          <input
            type="file"
            accept="image/*"
          onChange={async (event) => {
            const input = event.currentTarget;
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }
            const uploaded = await uploadFile(file);
            if (uploaded.status && uploaded.data) {
              onChange(uploaded.data);
            }
            input.value = "";
          }}
            className="sr-only"
          />
        </label>
        {media ? (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <Image
              src={media.url}
              alt=""
              width={640}
              height={320}
              className="h-48 w-full rounded-2xl object-cover"
            />
            <button type="button" onClick={() => onChange(null)} className="mt-3 text-xs font-medium text-[#FF385C]">
              إزالة الملف
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (field.type === "list_item") {
    const rows = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onChange([...rows, createEmptyListItem(fieldItems)])}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white py-3 text-sm font-medium text-gray-500 transition hover:border-[#FF385C] hover:text-[#FF385C]"
        >
          إضافة عنصر
        </button>
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={index} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                <p className="text-sm font-semibold text-slate-900">عنصر #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => onChange(rows.filter((_, currentIndex) => currentIndex !== index))}
                  className="text-xs font-medium text-[#FF385C]"
                >
                  حذف
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {fieldItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(item.type === "textarea" || item.type === "editor" || item.type === "upload" ? "md:col-span-2" : "")}
                  >
                    <label className="mb-2 block text-sm font-medium text-gray-700">{dashboardText(item.label)}</label>
                    <ListItemField
                      item={item}
                      value={(row as Record<string, unknown>)[item.id]}
                      onChange={(nextValue) => {
                        const nextRows = [...rows];
                        nextRows[index] = { ...(row as Record<string, unknown>), [item.id]: nextValue };
                        onChange(nextRows);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "price_categories") {
    const priceValue = (value ?? {
      selected: [],
      price_primary: "adult_price",
      adult_price: 0,
      child_price: 0,
      infant_price: 0,
    }) as Record<string, unknown>;
    const selected = Array.isArray(priceValue.selected) ? priceValue.selected.map(String) : [];
    const priceChoices = [
      { key: "adult_price", label: "سعر البالغ" },
      { key: "child_price", label: "سعر الطفل" },
      { key: "infant_price", label: "سعر الرضيع" },
    ];

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {priceChoices.map((choice) => {
            const checked = selected.includes(choice.key);
            return (
              <label
                key={choice.key}
                className={cn(
                  "cursor-pointer rounded-lg border px-3 py-2 text-sm transition-all",
                  checked ? "border-[#1a1f36] bg-[#1a1f36] text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={(event) => {
                    const nextSelected = event.target.checked
                      ? [...selected, choice.key]
                      : selected.filter((item) => item !== choice.key);
                    onChange({ ...priceValue, selected: nextSelected });
                  }}
                />
                {dashboardText(choice.label)}
              </label>
            );
          })}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">السعر الرئيسي</label>
            <select
              value={String(priceValue.price_primary ?? "adult_price")}
              onChange={(event) => onChange({ ...priceValue, price_primary: event.target.value })}
              className={cn(inputClass, "appearance-none pl-10")}
            >
              {priceChoices.map((choice) => (
                <option key={choice.key} value={choice.key}>
                  {dashboardText(choice.label)}
                </option>
              ))}
            </select>
          </div>
          {priceChoices.map((choice) => (
            <div key={choice.key} className="space-y-2">
              <label className="text-xs font-medium text-slate-500">{dashboardText(choice.label)}</label>
              <input
                type="number"
                value={String(priceValue[choice.key] ?? "")}
                onChange={(event) => onChange({ ...priceValue, [choice.key]: event.target.value })}
                className={ltrInputClass}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "price") {
    return <CustomPriceField value={value} serviceType={serviceType} onChange={onChange} />;
  }

  if (field.type === "availability") {
    return <AvailabilityField value={value} serviceType={serviceType} onChange={onChange} />;
  }

  if (field.type === "ical") {
    return <IcalField value={value} />;
  }

  if (field.type === "alert") {
    const info = (value ?? {}) as { message?: string };
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>{dashboardText(info.message ?? field.desc)}</span>
      </div>
    );
  }

  return (
    <input
      value={String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    />
  );
}

function CustomPriceField({
  value,
  onChange,
  serviceType,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  serviceType: BridgeManagedServiceType;
}) {
  const data = (value ?? {}) as {
    booking_type?: string;
    entries?: Array<Record<string, unknown>>;
  };
  const entries = Array.isArray(data.entries) ? data.entries : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">قواعد التسعير المخصصة</p>
          <p className="text-xs text-gray-400">
            {serviceType === "home"
              ? "أضف فترات بتاريخ بداية ونهاية مع سعر مخصص وحالة الإتاحة."
              : "أضف تواريخ أو مواعيد بسعر مخصص وحد أقصى للضيوف."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...data, entries: [...entries, createEmptyPriceEntry(serviceType)] })}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 transition hover:border-[#FF385C] hover:text-[#FF385C]"
        >
          إضافة قاعدة
        </button>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
            لا توجد قواعد تسعير مخصصة حتى الآن.
          </div>
        ) : null}

        {entries.map((entry, index) => (
          <div key={`${serviceType}-price-${index}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="text-sm font-semibold text-slate-900">قاعدة #{index + 1}</p>
              <button
                type="button"
                onClick={() => onChange({ ...data, entries: entries.filter((_, currentIndex) => currentIndex !== index) })}
                className="text-xs font-medium text-[#FF385C]"
              >
                حذف
              </button>
            </div>

            {serviceType === "home" ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="تاريخ البداية">
                  <input
                    type="date"
                    value={String(entry.start_date ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, start_date: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
                <FormField label="تاريخ النهاية">
                  <input
                    type="date"
                    value={String(entry.end_date ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, end_date: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
                <FormField label="السعر">
                  <input
                    type="number"
                    value={String(entry.price ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, price: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
                <FormField label="الإتاحة">
                  <select
                    value={String(entry.available ?? "on")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, available: event.target.value } : current,
                        ),
                      })
                    }
                    className={cn(inputClass, "appearance-none pl-10")}
                  >
                    <option value="on">متاح</option>
                    <option value="off">محجوب</option>
                  </select>
                </FormField>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <FormField label={data.booking_type === "date_time" ? "التاريخ والوقت" : "التاريخ"}>
                  <input
                    type={data.booking_type === "date_time" ? "datetime-local" : "date"}
                    value={String(entry.start_at ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, start_at: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
                <FormField label="سعر البالغ">
                  <input
                    type="number"
                    value={String(entry.adult_price ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, adult_price: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
                <FormField label="سعر الطفل">
                  <input
                    type="number"
                    value={String(entry.child_price ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, child_price: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
                <FormField label="سعر الرضيع">
                  <input
                    type="number"
                    value={String(entry.infant_price ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, infant_price: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
                <FormField label="الحد الأقصى للأشخاص">
                  <input
                    type="number"
                    value={String(entry.max_people ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, max_people: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AvailabilityField({
  value,
  onChange,
  serviceType,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  serviceType: BridgeManagedServiceType;
}) {
  const data = (value ?? {}) as { entries?: Array<Record<string, unknown>> };
  const entries = Array.isArray(data.entries) ? data.entries : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">تعديلات الإتاحة</p>
          <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-600">
            {serviceType === "home"
              ? "احجب فترات يدوياً حتى لا تكون متاحة للحجز."
              : "أضف تواريخ محجوبة أو خفّض السعة المتاحة في يوم معين."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...data, entries: [...entries, createEmptyAvailabilityEntry(serviceType)] })}
          className="rounded-xl bg-[#1a1f36] px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
        >
          إضافة تعديل
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
          لا توجد تعديلات إتاحة يدوية حتى الآن.
        </div>
      ) : null}

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={`${serviceType}-availability-${index}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="text-sm font-semibold text-slate-900">تعديل #{index + 1}</p>
              <button
                type="button"
                onClick={() => onChange({ ...data, entries: entries.filter((_, currentIndex) => currentIndex !== index) })}
                className="text-xs font-medium text-[#FF385C]"
              >
                حذف
              </button>
            </div>

            {serviceType === "home" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="تاريخ البداية">
                  <input
                    type="date"
                    value={String(entry.start_date ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, start_date: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
                <FormField label="تاريخ النهاية">
                  <input
                    type="date"
                    value={String(entry.end_date ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, end_date: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="التاريخ">
                  <input
                    type="date"
                    value={String(entry.date ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, date: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
                <FormField label="الحد الأقصى للأشخاص">
                  <input
                    type="number"
                    value={String(entry.max_people ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, max_people: event.target.value } : current,
                        ),
                      })
                    }
                    className={ltrInputClass}
                  />
                </FormField>
                <FormField label="ملاحظات">
                  <input
                    value={String(entry.summary ?? "")}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        entries: entries.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, summary: event.target.value } : current,
                        ),
                      })
                    }
                    className={inputClass}
                  />
                </FormField>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IcalField({ value }: { value: unknown }) {
  const data = (value ?? {}) as {
    export_url?: string;
    imports?: Array<{ name?: string; ical_url?: string }>;
    message?: string;
  };
  const imports = Array.isArray(data.imports) ? data.imports : [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">رابط تصدير iCal</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            readOnly
            value={data.export_url ?? ""}
            dir="ltr"
            className={cn(ltrInputClass, "min-w-0 flex-1 bg-gray-50")}
          />
          <button
            type="button"
            onClick={async () => {
              if (data.export_url) {
                await navigator.clipboard.writeText(data.export_url);
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1f36] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
          >
            نسخ الرابط
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">الروابط المستوردة</p>
        <p className="mt-1 text-xs text-slate-500">{data.message ?? "يتم تحديث هذه الروابط المستوردة من خلال مهام المزامنة المجدولة."}</p>
        <div className="mt-4 space-y-3">
          {imports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm text-gray-400">
              لا توجد روابط iCal مستوردة حتى الآن.
            </div>
          ) : null}
          {imports.map((item, index) => (
            <div key={`ical-import-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{item.name || `رابط #${index + 1}`}</p>
              <p className="mt-1 break-all text-xs text-gray-500">{item.ical_url || "-"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function ListItemField({
  item,
  value,
  onChange,
}: {
  item: BridgeEditorFieldItem;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const choices = Array.isArray(item.choices) ? item.choices : [];

  if (item.type === "text" || item.type === "unique" || item.type === "unique_id") {
    return (
      <input
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className={isLtrField(item.id) ? ltrInputClass : inputClass}
      />
    );
  }

  if (item.type === "number") {
    return (
      <input
        type="number"
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        dir="ltr"
        className={ltrInputClass}
      />
    );
  }

  if (item.type === "textarea" || item.type === "editor") {
    return (
      <textarea
        rows={item.type === "editor" ? 5 : 3}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className={textareaClass}
      />
    );
  }

  if (item.type === "select") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "appearance-none pl-10")}
      >
        <option value="">اختر قيمة</option>
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {dashboardChoiceLabel(choice)}
          </option>
        ))}
      </select>
    );
  }

  if (item.type === "on_off") {
    const checked = value === "on";
    return (
      <button
        type="button"
        onClick={() => onChange(checked ? "off" : "on")}
        className={cn(
          "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition",
          checked ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700",
        )}
      >
        {checked ? "مطلوب" : "اختياري"}
      </button>
    );
  }

  if (item.type === "upload") {
    const media = (value ?? null) as BridgeUploadedMedia | null;
    return (
      <div className="space-y-3">
        <label className="block cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-[#FF385C] hover:bg-rose-50/30">
          <UploadCloud className="mx-auto size-7 text-gray-300" />
          <span className="mt-2 block text-xs font-medium text-gray-500">رفع صورة</span>
          <input
            type="file"
            accept="image/*"
          onChange={async (event) => {
            const input = event.currentTarget;
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }
            const uploaded = await uploadFile(file);
            if (uploaded.status && uploaded.data) {
              onChange(uploaded.data);
            }
            input.value = "";
          }}
            className="sr-only"
          />
        </label>
        {media ? (
          <Image
            src={media.url}
            alt=""
            width={480}
            height={240}
            className="h-40 w-full rounded-2xl object-cover"
          />
        ) : null}
      </div>
    );
  }

  return (
    <input
      value={String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
    />
  );
}
