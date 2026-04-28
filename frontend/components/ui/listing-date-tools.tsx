"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ReceiptText, Users } from "lucide-react";

type BookingCardProps = {
  productId: number;
  productType: string;
  priceLabel: string;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
  freeCancellationLabel?: string;
};

type CalendarProps = {
  initialCheckIn: string;
  initialCheckOut: string;
};

const monthNames = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const weekdayLabels = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

function parseDate(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value: string, days: number): string {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function countNights(checkIn: string, checkOut: string): number {
  const diff = parseDate(checkOut).getTime() - parseDate(checkIn).getTime();
  return Math.max(1, Math.round(diff / 86_400_000));
}

function isValidRange(checkIn: string, checkOut: string): boolean {
  return parseDate(checkOut).getTime() > parseDate(checkIn).getTime();
}

function buildQuoteHref(
  productId: number,
  productType: string,
  checkIn: string,
  checkOut: string,
  guests: number,
): string {
  const params = new URLSearchParams({
    product_id: String(productId),
    type: productType,
    checkin: checkIn,
    checkout: checkOut,
    guests_count: String(Math.max(1, guests)),
  });

  return `/checkout/quote?${params.toString()}`;
}

export function InteractiveBookingCard({
  productId,
  productType,
  priceLabel,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  freeCancellationLabel,
}: BookingCardProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(Math.max(1, initialGuests || 1));
  const validRange = isValidRange(checkIn, checkOut);
  const nights = countNights(checkIn, checkOut);
  const quoteHref = validRange
    ? buildQuoteHref(productId, productType, checkIn, checkOut, guests)
    : "#";

  function updateCheckIn(value: string): void {
    setCheckIn(value);
    if (!isValidRange(value, checkOut)) {
      setCheckOut(addDays(value, 1));
    }
  }

  function updateCheckOut(value: string): void {
    if (isValidRange(checkIn, value)) {
      setCheckOut(value);
    }
  }

  return (
    <div className="rounded-xl border border-[#DDDDDD] bg-white p-6 shadow-lg">
      <div className="space-y-1 border-b border-[#DDDDDD] pb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-[#222222]">{priceLabel}</span>
          <span className="text-base font-normal text-[#717171]">/ ليلة</span>
        </div>
        <div className="text-sm text-[#717171]">اختر التواريخ وعدد الضيوف قبل إكمال الحجز.</div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-[#DDDDDD]">
        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-[#DDDDDD]">
          <label className="block p-3">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase text-[#717171]">
              <CalendarDays className="size-4" />
              تسجيل الوصول
            </span>
            <input type="date" value={checkIn} onChange={(event) => updateCheckIn(event.target.value)} className="mt-2 w-full bg-transparent text-sm font-bold text-[#222222] outline-none" />
          </label>
          <label className="block p-3">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase text-[#717171]">
              <CalendarDays className="size-4" />
              تسجيل المغادرة
            </span>
            <input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(event) => updateCheckOut(event.target.value)} className="mt-2 w-full bg-transparent text-sm font-bold text-[#222222] outline-none" />
          </label>
        </div>
        <label className="block border-t border-[#DDDDDD] p-3">
          <span className="text-[11px] font-bold uppercase text-[#717171]">عدد الضيوف</span>
          <span className="mt-1 flex items-center gap-2">
            <Users className="size-4 text-[#222222]" />
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(event) => setGuests(Math.max(1, Number(event.target.value) || 1))}
              className="w-full bg-transparent text-sm font-bold text-[#222222] outline-none"
            />
          </span>
        </label>
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#717171]">مدة الإقامة</span>
          <strong className="text-[#222222]">{nights} ليال</strong>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-[#717171]">الفترة المختارة</span>
          <strong className="text-[#222222]">{checkIn} - {checkOut}</strong>
        </div>
        {freeCancellationLabel ? (
          <div className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-[#717171]">
            {freeCancellationLabel}
          </div>
        ) : null}
      </div>

      <Link
        href={quoteHref}
        aria-disabled={!validRange}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF385C] px-5 py-3 text-center text-base font-bold text-white transition hover:bg-[#E31C5F] aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        <ReceiptText className="size-5" />
        عرض ملخص السعر
      </Link>
      {!validRange ? (
        <div className="mt-3 flex items-center gap-1 text-sm text-red-500">
          <span>⚠️</span>
          <span>تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول</span>
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        <Link
          href={quoteHref}
          aria-disabled={!validRange}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#222222] px-5 py-3 text-center text-sm font-bold text-[#222222] transition hover:bg-gray-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          إكمال الحجز
        </Link>
      </div>
    </div>
  );
}

export function InteractiveDateCalendar({
  initialCheckIn,
  initialCheckOut,
}: CalendarProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [selecting, setSelecting] = useState<"checkin" | "checkout">("checkin");
  const nights = countNights(checkIn, checkOut);

  const baseDate = useMemo(() => parseDate(checkIn), [checkIn]);

  function chooseDate(value: string): void {
    if (selecting === "checkin") {
      setCheckIn(value);
      setCheckOut(addDays(value, 1));
      setSelecting("checkout");
      return;
    }

    if (isValidRange(checkIn, value)) {
      setCheckOut(value);
      setSelecting("checkin");
      return;
    }

    setCheckIn(value);
    setCheckOut(addDays(value, 1));
    setSelecting("checkout");
  }

  function renderMonth(offset: number) {
    const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) => {
      const day = index - firstDay + 1;
      return day > 0 ? day : null;
    });

    return (
      <div key={`${year}-${month}`} className="rounded-xl border border-[#DDDDDD] p-4">
        <h3 className="text-center font-bold text-[#222222]">
          {monthNames[month]} {year}
        </h3>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#717171]">
          {weekdayLabels.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
          {cells.map((day, index) => {
            if (!day) {
              return <span key={`empty-${index}`} className="h-10" />;
            }

            const value = toDateInputValue(new Date(year, month, day, 12));
            const current = parseDate(value);
            const inRange = current >= parseDate(checkIn) && current <= parseDate(checkOut);
            const isEdge = value === checkIn || value === checkOut;

            return (
              <button
                key={value}
                type="button"
                onClick={() => chooseDate(value)}
                className={[
                  "flex h-10 items-center justify-center rounded-full transition hover:bg-[#FF385C]/10",
                  inRange ? "bg-[#FF385C]/15 text-[#222222]" : "text-[#222222]",
                  isEdge ? "bg-[#FF385C] font-bold text-white hover:bg-[#FF385C]" : "",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#222222]">حدد تاريخ الوصول</h2>
          <p className="mt-2 text-sm text-[#717171]">
            {nights} ليال · {checkIn} - {checkOut}
          </p>
        </div>
        <div className="flex rounded-full border border-[#DDDDDD] p-1 text-sm font-bold">
          <button
            type="button"
            onClick={() => setSelecting("checkin")}
            className={`rounded-full px-4 py-2 ${
              selecting === "checkin" ? "bg-[#222222] text-white" : "text-[#222222]"
            }`}
          >
            اختر الوصول
          </button>
          <button
            type="button"
            onClick={() => setSelecting("checkout")}
            className={`rounded-full px-4 py-2 ${
              selecting === "checkout" ? "bg-[#222222] text-white" : "text-[#222222]"
            }`}
          >
            اختر المغادرة
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {renderMonth(0)}
        {renderMonth(1)}
      </div>
    </div>
  );
}
