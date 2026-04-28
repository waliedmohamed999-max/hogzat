const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { spawn } = require("node:child_process");

const frontendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(frontendRoot, "..");
const backendRoot = path.join(repoRoot, "public_html");
const backendPublicRoot = path.join(backendRoot, "public");
const backendRouter = path.join(backendRoot, "server.php");
const logsRoot = path.join(backendRoot, "storage", "logs");
const backendUrl = process.env.NEXT_PUBLIC_LEGACY_BASE_URL || "http://127.0.0.1:8000";
const phpBin = process.env.PHP_BIN || "C:\\xampp\\php\\php.exe";

function request(pathname, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathname, backendUrl);
    const req = http.request(url, { method: "GET", timeout: timeoutMs }, (res) => {
      res.resume();
      res.on("end", () => resolve(res.statusCode || 0));
    });

    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.end();
  });
}

async function isBackendReady() {
  try {
    const status = await request("/bridge/v1/session");
    return status > 0 && status < 500;
  } catch {
    return false;
  }
}

async function waitForBackend(timeoutMs = 20000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await isBackendReady()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  return false;
}

async function main() {
  if (await isBackendReady()) {
    console.log(`[Labayh] Laravel backend is ready at ${backendUrl}`);
    return;
  }

  if (!fs.existsSync(phpBin)) {
    console.error(`[Labayh] PHP executable was not found: ${phpBin}`);
    console.error("[Labayh] Set PHP_BIN to your php.exe path or install XAMPP PHP.");
    process.exit(1);
  }

  if (!fs.existsSync(backendPublicRoot) || !fs.existsSync(backendRouter)) {
    console.error(`[Labayh] Laravel backend path is invalid: ${backendRoot}`);
    process.exit(1);
  }

  fs.mkdirSync(logsRoot, { recursive: true });
  const out = fs.openSync(path.join(logsRoot, "labayh-backend.out.log"), "a");
  const err = fs.openSync(path.join(logsRoot, "labayh-backend.err.log"), "a");

  const child = spawn(phpBin, ["-S", "127.0.0.1:8000", "-t", "public", backendRouter], {
    cwd: backendRoot,
    detached: true,
    stdio: ["ignore", out, err],
    windowsHide: true,
  });

  child.unref();
  console.log(`[Labayh] Starting Laravel backend at ${backendUrl} with PID ${child.pid}`);

  if (!(await waitForBackend())) {
    console.error("[Labayh] Laravel backend did not become ready in time.");
    console.error(`[Labayh] Check logs: ${path.join(logsRoot, "labayh-backend.err.log")}`);
    process.exit(1);
  }

  console.log(`[Labayh] Laravel backend is ready at ${backendUrl}`);
}

main().catch((error) => {
  console.error("[Labayh] Failed to ensure Laravel backend:", error);
  process.exit(1);
});
