import { spawn } from "node:child_process";
import { once } from "node:events";
import process from "node:process";
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = process.env.E2E_PORT || "3111";
const BASE = `http://127.0.0.1:${PORT}`;

const results = [];
function check(name, condition, detail = "") {
  const pass = Boolean(condition);
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} :: ${name}${detail ? " :: " + detail : ""}`);
}

async function waitForServer(timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/admin/session`);
      if (res.status) return true;
    } catch {
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

function startNext(env) {
  const nextBin = "node_modules/next/dist/bin/next";
  const child = spawn(process.execPath, [nextBin, "dev", "-p", PORT], {
    cwd: process.cwd(),
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (d) => process.stdout.write(`[next] ${d}`));
  child.stderr.on("data", (d) => process.stderr.write(`[next:err] ${d}`));
  return child;
}

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: { dbName: "hugphotos" },
  });
  const uri = mongod.getUri();
  console.log("Mongo ready at", uri);

  const env = {
    ...process.env,
    NODE_ENV: "development",
    MONGODB_URI: uri,
    AUTH_SECRET: "e2e-test-secret-e2e-test-secret-123456",
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || "Admin",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin@123",
    NEXT_PUBLIC_SITE_URL: BASE,
    NEXT_PUBLIC_WHATSAPP_NUMBER: "",
    NODE_OPTIONS: "",
  };

  const next = startNext(env);
  let exitCode = 0;
  try {
    const ready = await waitForServer();
    check("server responds", ready);
    if (!ready) return;

    // 1. unauthenticated session
    let res = await fetch(`${BASE}/api/admin/session`);
    let body = await res.json().catch(() => ({}));
    check("session unauthenticated", body.authenticated === false, JSON.stringify(body));

    // 2. wrong password
    res = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Admin", password: "wrong-password" }),
    });
    body = await res.json().catch(() => ({}));
    check("wrong password rejected", res.status === 401, `status=${res.status} ${JSON.stringify(body)}`);

    // 3. correct login
    res = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Admin", password: "admin@123" }),
    });
    const setCookie = res.headers.get("set-cookie") || "";
    body = await res.json().catch(() => ({}));
    check("correct login accepted", res.status === 200, `status=${res.status} ${JSON.stringify(body)}`);
    const cookie = setCookie.split(";")[0];
    check("session cookie issued", /hug_session=/.test(cookie), setCookie);

    // 4. session with cookie
    res = await fetch(`${BASE}/api/admin/session`, { headers: { cookie } });
    body = await res.json().catch(() => ({}));
    check("session authenticated", body.authenticated === true, JSON.stringify(body));

    // 5. protected API without cookie
    res = await fetch(`${BASE}/api/admin/photos`);
    check("admin photos blocks anonymous", res.status === 401, `status=${res.status}`);

    // 6. protected API with cookie
    res = await fetch(`${BASE}/api/admin/photos`, { headers: { cookie } });
    check("admin photos allows authenticated", res.status === 200, `status=${res.status}`);

    // 7. dashboard without cookie redirects
    res = await fetch(`${BASE}/admin/dashboard`, { redirect: "manual" });
    check("dashboard redirects anonymous", res.status >= 300 && res.status < 400, `status=${res.status}`);

    // 8. logout
    res = await fetch(`${BASE}/api/admin/logout`, { method: "POST", headers: { cookie } });
    check("logout ok", res.status === 200, `status=${res.status}`);
    res = await fetch(`${BASE}/api/admin/session`, { headers: { cookie: setCookie.split(";")[0] } });
    body = await res.json().catch(() => ({}));
    check("session cleared after logout", body.authenticated === false, JSON.stringify(body));
  } catch (error) {
    console.error("E2E error:", error);
    exitCode = 1;
  } finally {
    next.kill("SIGTERM");
    await Promise.race([once(next, "exit"), new Promise((r) => setTimeout(r, 5000))]);
    try {
      next.kill("SIGKILL");
    } catch {}
    await mongod.stop();
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length > 0 ? 1 : exitCode);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
