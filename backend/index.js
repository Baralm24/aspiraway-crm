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
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server proxy calls)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked request from origin: ${origin}`));
      }
    },
    // Added PATCH to allowed methods
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

/* =========================
   IN-MEMORY DATABASE (With Seed Data)
========================= */
const users = [];
const students = [];

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
   COUNSELLOR & MENTOR ROUTES
========================= */
app.get("/api/mentors", auth, (req, res) => {
  res.json(mentors);
});

app.get("/api/counsellors", auth, (req, res) => {
  res.json(counsellors);
});

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

  // Binding to '0.0.0.0' guarantees IPv4 & IPv6 localhost/container access
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start backend server:", err);
});

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

// Get all students
app.get("/api/students", auth, (req, res) => {
  res.json(students);
});

// Get single student by ID
app.get("/api/students/:id", auth, (req, res) => {
  const { id } = req.params;
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(student);
});

// Create new student
app.post("/api/students/new", auth, (req, res) => {
  const { name, email } = req.body;

  const student = {
    id: uuid(),
    user: { name, email, role: "STUDENT" },
    status: "LEAD",
    mentorId: null,
    applications: [],
    followUps: [],
    createdAt: new Date(),
  };

  students.push(student);
  res.json(student);
});

// Update student profile/status/mentor via PUT or PATCH
const updateStudentHandler = (req, res) => {
  const { id } = req.params;
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Preserve nested user object if user fields are updated
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
   MENTOR ROUTES
========================= */
app.get("/api/mentors", auth, (req, res) => {
  res.json(mentors);
});