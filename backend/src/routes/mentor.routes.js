const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();

// Mentor's students
router.get("/students", auth(["MENTOR"]), async (req, res) => {
  const mentor = await prisma.mentorProfile.findUnique({
    where: { userId: req.user.userId },
    include: {
      mentorships: {
        include: {
          student: { include: { user: true } },
        },
      },
    },
  });

  res.json(mentor?.mentorships || []);
});

module.exports = router;
