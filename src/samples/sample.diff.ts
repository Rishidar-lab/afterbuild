// Bundled demo diff — a realistic multi-file unified `git diff`.
//
// Chosen to trigger a rich, honest concept spread for the demo without ever
// needing to fabricate anything: a TypeScript route file (two separate
// hunks, exercising multi-hunk new-file line-number tracking) that adds a
// new dependency, an env var read, a regex literal, an async/await API
// route handler, and an Authorization/Bearer-token check; plus a Python
// script that adds a function using `os.environ` and `try`/`except`.
//
// See devpost/spec.md > Data Model / Decisions and Open Issues — exact
// new-file line numbers for the added lines here are asserted in
// tests/parseDiff.test.ts.

export const sampleDiff = `diff --git a/src/api/authRoutes.ts b/src/api/authRoutes.ts
index 4a1f2c3..9b7e2d1 100644
--- a/src/api/authRoutes.ts
+++ b/src/api/authRoutes.ts
@@ -1,6 +1,8 @@
 import express from 'express';
+import jwt from 'jsonwebtoken';

 const router = express.Router();
+const JWT_SECRET = process.env.JWT_SECRET;

 router.get('/health', (req, res) => {
   res.json({ status: 'ok' });
@@ -10,4 +12,17 @@
   res.json({ id: req.params.id });
 });

+const TOKEN_RE = /^Bearer\\s+([A-Za-z0-9\\-_.]+)$/;
+
+router.post('/login', async (req, res) => {
+  const authHeader = req.headers['authorization'] || '';
+  const match = TOKEN_RE.exec(authHeader);
+  if (!match) {
+    res.status(401).json({ error: 'missing bearer token' });
+    return;
+  }
+  const payload = await jwt.verify(match[1], JWT_SECRET);
+  res.json({ userId: payload.sub });
+});
+
 export default router;
diff --git a/scripts/notify.py b/scripts/notify.py
index 7c3d9a0..2e5f8b1 100644
--- a/scripts/notify.py
+++ b/scripts/notify.py
@@ -1,8 +1,22 @@
+import os
 import sys


+def send_alert(message):
+    webhook = os.environ.get("ALERT_WEBHOOK_URL")
+    if not webhook:
+        return False
+    try:
+        print(f"sending alert to {webhook}: {message}")
+        return True
+    except Exception as exc:
+        print(f"failed to send alert: {exc}")
+        return False
+
+
 def main():
     print("notify: nothing to do")
+    send_alert("notify job finished")


 if __name__ == "__main__":
`;
