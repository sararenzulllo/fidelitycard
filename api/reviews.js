import Review from "../models/Review.js";
import { connectDB } from "../db.js";


export default async function handler(req, res) {
  await connectDB();

  try {
    // =========================
    // GET /api/reviews?userEmail=
    // =========================
    if (req.method === "GET") {
      const { userEmail } = req.query;

      if (!userEmail) {
        return res.status(400).json({ message: "Email mancante" });
      }

      const reviews = await Review.find({
        userEmail: userEmail.toLowerCase(),
      }).sort({ createdAt: -1 });

      return res.json(reviews);
    }

    // =========================
    // POST /api/reviews
    // photo = URL opzionale
    // =========================
    if (req.method === "POST") {
      const { product, rating, comment, userEmail, photo } = req.body;

      if (!product || !rating || !comment || !userEmail) {
        return res.status(400).json({ message: "Dati mancanti" });
      }

      const newReview = new Review({
        product,
        rating,
        comment,
        userEmail: userEmail.toLowerCase(),
        photo: photo || null,
      });

      const saved = await newReview.save();
      return res.status(201).json(saved);
    }

    return res.status(405).json({ message: "Metodo non consentito" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore server recensioni" });
  }
}
