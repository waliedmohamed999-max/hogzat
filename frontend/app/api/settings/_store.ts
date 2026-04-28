import { promises as fs } from "node:fs";
import path from "node:path";

export type StoredApiKey = {
  id: string;
  name: string;
  description: string;
  environment: "live" | "test";
  permissions: string[];
  active: boolean;
  createdAt: string;
  lastUsed: string;
  tokenPreview: string;
};

export type StoredIntegration = {
  id: string;
  name: string;
  type: "app" | "payment" | "plugin" | "custom";
  provider: string;
  environment: "live" | "test";
  status: "active" | "disabled";
  baseUrl: string;
  publicKey: string;
  secretPreview: string;
  webhookUrl: string;
  createdAt: string;
};

type Store = {
  keys: StoredApiKey[];
  integrations: StoredIntegration[];
  webhook: Record<string, unknown>;
  security: Record<string, unknown>;
};

const storePath = path.join(process.cwd(), "storage", "api-settings.json");

const defaultStore: Store = {
  keys: [
    {
      id: "key_live_main",
      name: "تطبيق الويب الرئيسي",
      description: "مفتاح إنتاج افتراضي",
      environment: "live",
      permissions: ["read", "write"],
      active: true,
      createdAt: "2026-03-15T09:00:00.000Z",
      lastUsed: "منذ 2 ساعة",
      tokenPreview: "[redacted]",
    },
  ],
  integrations: [],
  webhook: {
    url: "https://labayh.com/webhooks/labayh",
    events: ["booking.created", "booking.cancelled", "user.created"],
  },
  security: {
    ipWhitelistEnabled: false,
    ips: ["0.0.0.0/0"],
    corsOrigins: ["https://labayh.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    maxAge: 86400,
  },
};

async function ensureStoreDir() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
}

export async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    return { ...defaultStore, ...(JSON.parse(raw) as Partial<Store>) };
  } catch {
    return defaultStore;
  }
}

export async function writeStore(next: Store) {
  await ensureStoreDir();
  await fs.writeFile(storePath, JSON.stringify(next, null, 2), "utf8");
}

export function createToken(environment: "live" | "test" = "test") {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = `sk_${environment}_`;
  for (let index = 0; index < 32; index += 1) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export function previewToken(token: string) {
  return `${token.slice(0, 8)}••••••••••••${token.slice(-4)}`;
}
