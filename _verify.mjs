const BASE = "http://127.0.0.1:3123";
const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"} :: ${name}${detail ? " :: " + detail : ""}`);
};

async function main() {
  // public pages
  for (const p of ["/", "/gallery", "/about", "/contact", "/admin/login"]) {
    const r = await fetch(BASE + p, { redirect: "manual" });
    check(`GET ${p}`, r.status >= 200 && r.status < 400, `status=${r.status}`);
  }

  // session anonymous
  let r = await fetch(BASE + "/api/admin/session");
  let b = await r.json();
  check("session anonymous=false", b.authenticated === false, JSON.stringify(b));

  // protected api anonymous
  r = await fetch(BASE + "/api/admin/photos");
  check("admin photos blocked anonymous (401)", r.status === 401, `status=${r.status}`);

  // wrong password
  r = await fetch(BASE + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "clickmedia", password: "wrong" }),
  });
  check("wrong password rejected (401)", r.status === 401, `status=${r.status}`);

  // wrong username
  r = await fetch(BASE + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "nobody", password: "clickmedia@123" }),
  });
  check("wrong username rejected (401)", r.status === 401, `status=${r.status}`);

  // correct login
  r = await fetch(BASE + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "clickmedia", password: "clickmedia@123" }),
  });
  b = await r.json();
  const setCookie = r.headers.get("set-cookie") || "";
  check("correct login accepted (200)", r.status === 200, `status=${r.status} ${JSON.stringify(b)}`);
  const cookie = setCookie.split(";")[0];
  check("session cookie issued", /hug_session=/.test(cookie), cookie ? "cookie set" : "no cookie");

  // session with cookie
  r = await fetch(BASE + "/api/admin/session", { headers: { cookie } });
  b = await r.json();
  check("session authenticated=true", b.authenticated === true, JSON.stringify(b));

  // protected api with cookie
  r = await fetch(BASE + "/api/admin/photos", { headers: { cookie } });
  check("admin photos allowed (200)", r.status === 200, `status=${r.status}`);

  // dashboard anonymous redirect
  r = await fetch(BASE + "/admin/dashboard", { redirect: "manual" });
  check("dashboard redirects anonymous", r.status >= 300 && r.status < 400, `status=${r.status}`);

  // dashboard authenticated
  r = await fetch(BASE + "/admin/dashboard", { headers: { cookie } });
  check("dashboard renders authenticated (200)", r.status === 200, `status=${r.status}`);

  // logout
  r = await fetch(BASE + "/api/admin/logout", { method: "POST", headers: { cookie } });
  check("logout ok (200)", r.status === 200, `status=${r.status}`);
  r = await fetch(BASE + "/api/admin/session", { headers: { cookie } });
  b = await r.json();
  check("session cleared after logout", b.authenticated === false, JSON.stringify(b));

  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
