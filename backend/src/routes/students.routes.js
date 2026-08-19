const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();

// Get all students
router.get("/", auth(["ADMIN", "MENTOR"]), async (req, res) => {
  const students = await prisma.studentProfile.findMany({
    include: { user: true },
  });
  res.json(students);
});

// Update student status
router.patch("/:id/status", auth(["ADMIN", "MENTOR"]), async (req, res) => {
  const { status } = req.body;

  const updated = await prisma.studentProfile.update({
    where: { id: req.params.id },
    data: { status },
  });

  res.json(updated);
});

module.exports = router;
