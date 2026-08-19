const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();

router.post("/", auth(["ADMIN", "MENTOR"]), async (req, res) => {
  const application = await prisma.application.create({
    data: req.body,
  });
  res.json(application);
});

router.get("/:studentId", auth(["ADMIN", "MENTOR"]), async (req, res) => {
  const apps = await prisma.application.findMany({
    where: { studentId: req.params.studentId },
  });
  res.json(apps);
});

module.exports = router;
