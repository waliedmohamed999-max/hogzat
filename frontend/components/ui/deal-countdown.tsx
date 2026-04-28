"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

type DealCountdownProps = {
  endsAtTimestamp?: number;
};

function formatRemaining(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(secs).padStart(2, "0"),
  };
}

export function DealCountdown({ endsAtTimestamp }: DealCountdownProps) {
  const [remaining, setRemaining] = useState(() => {
    const end = Number(endsAtTimestamp ?? 0) * 1000;
    return end > 0 ? Math.max(0, Math.floor((end - Date.now()) / 1000)) : 0;
  });

  useEffect(() => {
    const end = Number(endsAtTimestamp ?? 0) * 1000;
    if (!end) {
      return;
    }

    const tick = () => setRemaining(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endsAtTimestamp]);

  if (!endsAtTimestamp) {
    return null;
  }

  if (remaining <= 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-bold text-slate-500">
        انتهت مدة العرض
      </div>
    );
  }

  const time = formatRemaining(remaining);
  const units = [
    { label: "يوم", value: time.days },
    { label: "ساعة", value: time.hours },
    { label: "دقيقة", value: time.minutes },
    { label: "ثانية", value: time.seconds },
  ];

  return (
    <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-rose-700">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold">
        <span>مدة العرض المتبقية</span>
        <Clock3 className="size-4" />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {units.map((unit) => (
          <div key={unit.label} className="rounded-md bg-white px-1.5 py-1 text-center shadow-sm">
            <div className="text-sm font-black tabular-nums text-slate-950">{unit.value}</div>
            <div className="text-[10px] font-semibold text-slate-500">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
