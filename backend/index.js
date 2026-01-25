import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

/* =========================
   IN-MEMORY DATABASE
========================= */

const users = [];
const students = [];
const mentors = [];

/* =========================
   SEED ADMIN
========================= */

async function seedAdmin() {
  const exists = users.find(u => u.email === "admin@aspiraway.com");
  if (!exists) {
    const hash = await bcrypt.hash("admin123", 10);
    users.push({
      id: uuid(),
      name: "Aspiraway Admin",
      email: "admin@aspiraway.com",
      password: hash,
      role: "ADMIN",
    });
    console.log("✅ Admin seeded: admin@aspiraway.com / admin123");
  }
}

await seedAdmin();

/* =========================
   AUTH MIDDLEWARE
========================= */

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* =========================
   AUTH
========================= */

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/* =========================
   STUDENTS
========================= */

app.get("/api/students", auth, (req, res) => {
  res.json(students);
});

app.post("/api/students/new", auth, (req, res) => {
  const { name, email } = req.body;

  const student = {
    id: uuid(),
    user: { name, email },
    status: "LEAD",
    applications: [],
    followUps: [],
    createdAt: new Date(),
  };

  students.push(student);
  res.json(student);
});

/* =========================
   SERVER
========================= */

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
