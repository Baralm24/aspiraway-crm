import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const app = express();

/* =========================
   CORS CONFIGURATION
========================= */
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://crm.aspiraway.com",
  "https://mock.aspiraway.com",
  "https://aspiraway-mock-backend.onrender.com"
];

// 1. Explicitly allow origins & credentials
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow to prevent blocking
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
  })
);

// 2. Explicit Pre-Flight Handling for all routes
app.options("*", cors());

// 3. Manual Fallback Headers Middleware (Ensures headers attach even on errors)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

/* =========================
   AUTH MIDDLEWARE
========================= */
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* =========================
   IN-MEMORY DATABASE
========================= */
const users = [];

const students = [
  {
    id: "s-1",
    user: { name: "Aarav Patel", email: "aarav@example.com", role: "STUDENT" },
    status: "LEAD",
    mentorId: "m-1",
    applications: [],
    followUps: [],
    createdAt: new Date(),
  },
  {
    id: "s-2",
    user: { name: "Sita Sharma", email: "sita@example.com", role: "STUDENT" },
    status: "APPLIED",
    mentorId: "m-2",
    applications: [],
    followUps: [],
    createdAt: new Date(),
  },
];

const mentors = [
  {
    id: "m-1",
    name: "Dr. Anish Sharma",
    email: "anish@aspiraway.com",
    expertise: "US & UK University Applications",
    status: "ACTIVE",
  },
  {
    id: "m-2",
    name: "Suman Adhikari",
    email: "suman@aspiraway.com",
    expertise: "SOP & Essay Guidance",
    status: "ACTIVE",
  },
];

const counsellors = [
  {
    id: "c-1",
    name: "Pooja Ray",
    email: "pooja@aspiraway.com",
    specialization: "Australia & Canada Admissions",
    status: "ACTIVE",
  },
];

/* =========================
   SEED ADMIN & START SERVER
========================= */
async function startServer() {
  const exists = users.find((u) => u.email === "admin@aspiraway.com");
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start backend server:", err);
});

/* =========================
   AUTH ROUTES
========================= */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
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
   STUDENT ROUTES
========================= */
app.get("/api/students", auth, (req, res) => {
  res.json(students);
});

app.get("/api/students/:id", auth, (req, res) => {
  const { id } = req.params;
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(student);
});

const createStudentHandler = (req, res) => {
  const { name, email, status, mentorId } = req.body;

  const student = {
    id: uuid(),
    user: { name, email, role: "STUDENT" },
    status: status || "LEAD",
    mentorId: mentorId || null,
    applications: [],
    followUps: [],
    createdAt: new Date(),
  };

  students.push(student);
  res.status(201).json(student);
};

app.post("/api/students", auth, createStudentHandler);
app.post("/api/students/new", auth, createStudentHandler);

const updateStudentHandler = (req, res) => {
  const { id } = req.params;
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const updatedUser = req.body.user
    ? { ...students[index].user, ...req.body.user }
    : students[index].user;

  students[index] = {
    ...students[index],
    ...req.body,
    user: updatedUser,
  };

  res.json(students[index]);
};

app.put("/api/students/:id", auth, updateStudentHandler);
app.patch("/api/students/:id", auth, updateStudentHandler);

/* =========================
   MENTOR & COUNSELLOR ROUTES
========================= */
app.get("/api/mentors", auth, (req, res) => {
  res.json(mentors);
});

app.get("/api/counsellors", auth, (req, res) => {
  res.json(counsellors);
});