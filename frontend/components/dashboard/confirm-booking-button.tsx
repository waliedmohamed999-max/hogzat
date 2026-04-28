"use client";

import { secureFetch } from "@/lib/client-security";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ConfirmBookingButtonProps = {
  bookingId: number;
  disabled?: boolean;
};

export function ConfirmBookingButton({
  bookingId,
  disabled = false,
}: ConfirmBookingButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);

    const response = await secureFetch(`/api/v1/dashboard/bookings/${bookingId}/confirm`, {
      method: "POST",
    });

    const result = (await response.json()) as {
      status?: number;
      message?: string;
    };

    if (!response.ok || result.status !== 1) {
      setError(result.message || "تعذر تأكيد الحجز حالياً.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleConfirm}
        disabled={disabled || isPending}
        className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "جارٍ التأكيد..." : "تأكيد الحجز"}
      </button>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}
    </div>
  );
}
