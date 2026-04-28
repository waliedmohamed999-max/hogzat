import { NextResponse } from "next/server";
import { readPaymentsStore } from "../../_store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const store = await readPaymentsStore();
  const transaction = store.transactions.find((item) => item.id === id);
  if (!transaction) return NextResponse.json({ status: 0, message: "Transaction not found." }, { status: 404 });
  return NextResponse.json({
    status: 1,
    data: {
      ...transaction,
      timeline: ["إنشاء المعاملة", "إرسال للبوابة", "استجابة البوابة", "تأكيد الدفع"],
      gatewayResponse: { status: transaction.status, authorization: `AUTH-${transaction.id}` },
    },
  });
}
