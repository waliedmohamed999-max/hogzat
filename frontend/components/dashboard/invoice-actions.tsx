"use client";

type InvoiceLineItem = {
  label: string;
  value: number;
};

type InvoiceActionsProps = {
  invoice: {
    booking_id: string;
    service_name: string;
    currency: string;
    line_items: InvoiceLineItem[];
    tax_percent: number;
    commission_percent: number;
    subtotal: number;
    total: number;
  };
};

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  function handlePrint() {
    window.print();
  }

  function handleExportJson() {
    downloadFile(
      `invoice-${invoice.booking_id}.json`,
      JSON.stringify(invoice, null, 2),
      "application/json",
    );
  }

  function handleExportCsv() {
    const rows = [
      ["booking_id", invoice.booking_id],
      ["service_name", invoice.service_name],
      ["subtotal", String(invoice.subtotal)],
      ["tax_percent", String(invoice.tax_percent)],
      ["commission_percent", String(invoice.commission_percent)],
      ["total", String(invoice.total)],
      ...invoice.line_items.map((item) => [item.label, String(item.value)]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    downloadFile(`invoice-${invoice.booking_id}.csv`, csv, "text/csv;charset=utf-8");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handlePrint}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
      >
        طباعة الفاتورة
      </button>
      <button
        type="button"
        onClick={handleExportJson}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
      >
        تصدير JSON
      </button>
      <button
        type="button"
        onClick={handleExportCsv}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
      >
        تصدير CSV
      </button>
    </div>
  );
}
