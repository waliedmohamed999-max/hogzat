"use client";

import { ReactNode, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { secureFetch } from "@/lib/client-security";

export type FinanceQuickAction =
  | "issue-invoice"
  | "refund"
  | "export-vat"
  | "reconcile"
  | "export-ledger"
  | "zatca-settings"
  | "test-invoice"
  | "save-settings";

type FinanceActionButtonProps = {
  action: FinanceQuickAction;
  className: string;
  children: ReactNode;
};

async function readMessage(response: Response) {
  const payload = (await response.json().catch(() => null)) as { status?: number; message?: string } | null;
  if (!response.ok || payload?.status === 0) {
    throw new Error(payload?.message || "تعذر تنفيذ الإجراء.");
  }
  return payload?.message || "تم تنفيذ الإجراء بنجاح.";
}

function openExport(type: "ledger" | "vat") {
  window.open(`/api/finance/export?type=${type}`, "_blank", "noopener,noreferrer");
}

export function FinanceActionButton({ action, className, children }: FinanceActionButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  async function runAction() {
    setMessage(null);
    setError(null);

    try {
      setIsLoading(true);

      if (action === "export-ledger") {
        openExport("ledger");
        setMessage("بدأ تنزيل تقرير دفتر الأستاذ.");
        return;
      }

      if (action === "export-vat") {
        openExport("vat");
        setMessage("بدأ تنزيل تقرير VAT.");
        return;
      }

      if (action === "issue-invoice" || action === "test-invoice") {
        const bookingId = window.prompt("اكتب رقم الحجز لإصدار الفاتورة:");
        if (!bookingId) return;

        const response = await secureFetch("/api/v1/dashboard/bridge/dashboard/finance/invoices/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_id: Number(bookingId), booking_table: "booking" }),
        });
        setMessage(await readMessage(response));
      }

      if (action === "refund") {
        const bookingId = window.prompt("اكتب رقم الحجز للاسترداد:");
        if (!bookingId) return;
        const amount = window.prompt("اكتب مبلغ الاسترداد:");
        if (!amount) return;
        const reason = window.prompt("سبب الاسترداد:", "طلب العميل") || "طلب العميل";

        const response = await secureFetch("/api/v1/dashboard/bridge/dashboard/finance/payments/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: Number(bookingId),
            amount: Number(amount),
            reason,
            booking_table: "booking",
          }),
        });
        setMessage(await readMessage(response));
      }

      if (action === "reconcile") {
        const response = await secureFetch("/api/finance/reconcile", { method: "POST" });
        setMessage(await readMessage(response));
      }

      if (action === "zatca-settings" || action === "save-settings") {
        const response = await secureFetch("/api/v1/dashboard/bridge/dashboard/finance/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currency: "SAR",
            vat_rate: 15,
            zatca_enabled: true,
            zatca_environment: "sandbox",
            payout_schedule: "monthly",
            payout_minimum: 500,
          }),
        });
        setMessage(await readMessage(response));
      }

      startTransition(() => router.refresh());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تنفيذ الإجراء.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <span className={className.includes("w-full") ? "relative flex w-full" : "relative inline-flex"}>
      <button type="button" disabled={isLoading || isPending} onClick={runAction} className={className}>
        {isLoading || isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
      </button>
      {message ? (
        <span className="absolute top-full z-20 mt-2 min-w-52 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm">
          {message}
        </span>
      ) : null}
      {error ? (
        <span className="absolute top-full z-20 mt-2 min-w-52 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 shadow-sm">
          {error}
        </span>
      ) : null}
    </span>
  );
}
