import express from "express";
import multer from "multer";
import Review from "../models/Review.js";

const router = express.Router();

// Configurazione multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// GET recensioni utente
router.get("/", async (req, res) => {
  const userEmail = req.query.userEmail;
  if (!userEmail) return res.status(400).json({ message: "Email mancante" });

  try {
    const reviews = await Review.find({ userEmail: userEmail.toLowerCase() }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore fetch recensioni" });
  }
});

// POST nuova recensione con foto opzionale
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { product, rating, comment, userEmail } = req.body;
    if (!product || !rating || !comment || !userEmail) {
      return res.status(400).json({ message: "Dati mancanti" });
    }

    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const newReview = new Review({
      product,
      rating,
      comment,
      userEmail: userEmail.toLowerCase(),
      photo: photoPath
    });

    const saved = await newReview.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore creazione recensione" });
  }
});

export default router;
