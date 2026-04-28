import { promises as fs } from "node:fs";
import path from "node:path";

export type ToolRun = {
  id: string;
  tool: string;
  status: "success" | "failed" | "running";
  output: string[];
  duration: string;
  createdAt: string;
};

export type Job = {
  id: string;
  name: string;
  slug: string;
  cron: string;
  active: boolean;
};

type Store = {
  runs: ToolRun[];
  jobs: Job[];
};

const storePath = path.join(process.cwd(), "storage", "admin-tools.json");

const defaultStore: Store = {
  runs: [],
  jobs: [
    { id: "daily-booking-summary", name: "إرسال ملخص الحجوزات اليومي", slug: "send-daily-booking-summary", cron: "0 8 * * *", active: true },
    { id: "cleanup-expired-sessions", name: "تنظيف الجلسات المنتهية", slug: "cleanup-expired-sessions", cron: "*/30 * * * *", active: true },
    { id: "generate-sitemap", name: "توليد sitemap.xml تلقائياً", slug: "generate-sitemap", cron: "0 2 * * *", active: true },
  ],
};

async function ensureDir() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
}

export async function readToolsStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    return { ...defaultStore, ...(JSON.parse(raw) as Partial<Store>) };
  } catch {
    return defaultStore;
  }
}

export async function writeToolsStore(store: Store) {
  await ensureDir();
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}
