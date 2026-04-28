import { promises as fs } from "node:fs";
import path from "node:path";

type GeneralStore = {
  identity: Record<string, unknown>;
  colors: Record<string, unknown>;
  content: Record<string, unknown>;
  contact: Record<string, unknown>;
  social: Record<string, unknown>;
  footer: Record<string, unknown>;
  analytics: Record<string, unknown>;
  technical: Record<string, unknown>;
  cities: Array<Record<string, unknown> & { id: string }>;
};

const storePath = path.join(process.cwd(), "storage", "general-settings.json");

const defaultStore: GeneralStore = {
  identity: {},
  colors: {},
  content: {},
  contact: {},
  social: {},
  footer: {},
  analytics: {},
  technical: {},
  cities: [
    { id: "riyadh", nameAr: "الرياض", nameEn: "Riyadh", country: "السعودية", active: true, featured: true, listings: 128 },
    { id: "jeddah", nameAr: "جدة", nameEn: "Jeddah", country: "السعودية", active: true, featured: true, listings: 96 },
  ],
};

async function ensureDir() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
}

export async function readGeneralStore(): Promise<GeneralStore> {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    return { ...defaultStore, ...(JSON.parse(raw) as Partial<GeneralStore>) };
  } catch {
    return defaultStore;
  }
}

export async function writeGeneralStore(store: GeneralStore) {
  await ensureDir();
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}
