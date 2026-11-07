export const SAMPLES = [
  {
    id: 'payments',
    name: 'Payment API demo',
    fileName: 'src/routes/payment-api.js',
    language: 'JavaScript',
    code: `import express from "express";
import cors from "cors";
import { db } from "../database.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const ADMIN_API_KEY = "sk_demo_NOT_A_REAL_KEY_89ab";

app.get("/customers", async (req, res) => {
  const email = req.query.email;
  const rows = await db.query(\`SELECT * FROM customers WHERE email = '\${email}'\`);
  res.json(rows);
});

app.post("/session", (req, res) => {
  const { password } = req.body;
  console.log("Login password:", password);
  const token = Math.random().toString(36).slice(2);
  res.json({ token });
});

app.post("/calculate", (req, res) => {
  const output = eval(req.body.expression);
  res.json({ output });
});

app.listen(3000, () => console.log("Ready"));`,
  },
  {
    id: 'profile',
    name: 'Profile page demo',
    fileName: 'src/components/profile.js',
    language: 'JavaScript',
    code: `export function renderProfile(user, target) {
  const displayName = user.name;
  target.innerHTML = "<h2>Welcome " + displayName + "</h2>";
}

export function loadAvatar(url) {
  return fetch(url).then((response) => response.blob());
}

export function makeResetToken() {
  return Math.random().toString(36).slice(2);
}`,
  },
  {
    id: 'python',
    name: 'Python worker demo',
    fileName: 'services/worker.py',
    language: 'Python',
    code: `import os
import subprocess

DEBUG = True
SERVICE_PASSWORD = "demo_password_NOT_REAL_123"

def run_job(request):
    command = request.get("command")
    return subprocess.run(command, shell=True, capture_output=True)

def calculate(expression):
    return eval(expression)
`,
  },
  {
    id: 'clean',
    name: 'Clean example',
    fileName: 'src/utils/sanitize.js',
    language: 'JavaScript',
    code: `export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

export function greet(name) {
  return \`Hello, \${escapeHtml(name)}!\`;
}`,
  },
];

export const DEFAULT_SAMPLE = SAMPLES[0];
