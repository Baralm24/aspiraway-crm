const router = require("express").Router();
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post(
  "/upload",
  auth(["ADMIN", "MENTOR"]),
  upload.single("file"),
  async (req, res) => {
    const doc = await prisma.document.create({
      data: {
        studentId: req.body.studentId,
        type: req.body.type,
        fileUrl: `/uploads/${req.file.filename}`,
      },
    });

    res.json(doc);
  }
);

module.exports = router;
