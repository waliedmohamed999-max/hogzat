import { promises as fs } from "node:fs";
import path from "node:path";
import { getPaymentMethods, savePaymentMethods, type PaymentMethod } from "@/lib/payment-methods";

export type PaymentTransaction = {
  id: string;
  bookingId: string;
  customer: string;
  customerEmail: string;
  gateway: string;
  amount: number;
  status: "success" | "failed" | "pending" | "refunded" | "review";
  date: string;
  durationMs: number;
};

export type RefundRequest = {
  id: string;
  bookingId: string;
  customer: string;
  amount: number;
  reason: string;
  status: "review" | "approved" | "rejected" | "processed";
  date: string;
};

export type PartnerPayout = {
  partnerId: string;
  partner: string;
  listings: number;
  totalRevenue: number;
  due: number;
  lastPayout: string;
  status: "ready" | "processing" | "paid";
};

export type PaymentSettings = {
  currency: string;
  currencyPosition: "after" | "before";
  decimals: number;
  serviceFeePercent: number;
  fixedFee: number;
  feePayer: "customer" | "partner" | "split";
  invoicesEnabled: boolean;
  vatNumber: string;
  refundApprovalRequired: boolean;
  payoutSchedule: "manual" | "weekly" | "semi_monthly" | "monthly";
  minPayout: number;
};

type Store = {
  transactions: PaymentTransaction[];
  refunds: RefundRequest[];
  payouts: PartnerPayout[];
  settings: PaymentSettings;
};

const storePath = path.join(process.cwd(), "storage", "admin-payments.json");
const today = new Date();

const defaultStore: Store = {
  transactions: [],
  refunds: [],
  payouts: [],
  settings: {
    currency: "SAR",
    currencyPosition: "after",
    decimals: 0,
    serviceFeePercent: 8,
    fixedFee: 0,
    feePayer: "customer",
    invoicesEnabled: true,
    vatNumber: "300000000000003",
    refundApprovalRequired: true,
    payoutSchedule: "monthly",
    minPayout: 500,
  },
};

async function ensureDir() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
}

export async function readPaymentsStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    return { ...defaultStore, ...(JSON.parse(raw) as Partial<Store>) };
  } catch {
    return defaultStore;
  }
}

export async function writePaymentsStore(store: Store) {
  await ensureDir();
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function getGateways() {
  return getPaymentMethods();
}

export async function saveGateways(gateways: Partial<PaymentMethod>[]) {
  return savePaymentMethods(gateways);
}

export function paymentStats(store: Store) {
  const todayKey = today.toISOString().slice(0, 10);
  const successful = store.transactions.filter((item) => item.status === "success");
  const todayTransactions = store.transactions.filter((item) => item.date.slice(0, 10) === todayKey);
  const pendingTransactions = store.transactions.filter((item) => item.status === "pending" || item.status === "review");
  const processedRefunds = store.refunds.filter((item) => item.status === "processed");

  return {
    totalRevenue: successful.reduce((sum, item) => sum + item.amount, 0),
    todayRevenue: todayTransactions.reduce((sum, item) => sum + item.amount, 0),
    pending: pendingTransactions.reduce((sum, item) => sum + item.amount, 0),
    refunded: processedRefunds.reduce((sum, item) => sum + item.amount, 0),
    todayTransactions: todayTransactions.length,
    pendingCount: pendingTransactions.length,
    refundedCount: processedRefunds.length,
  };
}

export function revenueChart() {
  return Array.from({ length: 12 }, (_, index) => ({
    label: `${index + 1}`,
    revenue: 0,
    refunds: 0,
    net: 0,
  }));
}
