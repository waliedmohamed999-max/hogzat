"use client";

import { secureFetch } from "@/lib/client-security";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type CancelBookingButtonProps = {
  bookingId: number;
  disabled?: boolean;
};

export function CancelBookingButton({
  bookingId,
  disabled = false,
}: CancelBookingButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    const confirmed = window.confirm("هل تريد إلغاء هذا الحجز؟");
    if (!confirmed) {
      return;
    }

    setError(null);

    const response = await secureFetch(`/api/v1/dashboard/bookings/${bookingId}/cancel`, {
      method: "POST",
    });

    const result = (await response.json()) as {
      status?: number;
      message?: string;
    };

    if (!response.ok || result.status !== 1) {
      setError(result.message || "تعذر إلغاء الحجز حالياً.");
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
        onClick={handleCancel}
        disabled={disabled || isPending}
        className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "جارٍ الإلغاء..." : "إلغاء الحجز"}
      </button>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}
    </div>
  );
}
