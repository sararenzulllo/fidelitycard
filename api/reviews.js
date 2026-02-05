import Review from "../models/Review.js";
import { connectDB } from "../db.js";

export default async function handler(req, res) {
  try {
    // Connessione al DB
    await connectDB();
    console.log("✅ DB connesso correttamente");

    if (req.method === "GET") {
      const { userEmail } = req.query;
      if (!userEmail) return res.status(400).json({ message: "Email mancante" });

      console.log(`🔍 Recupero recensioni per: ${userEmail}`);
      const reviews = await Review.find({ userEmail: userEmail.toLowerCase() }).sort({ createdAt: -1 });

      return res.status(200).json(reviews);
    }
    
    if (req.method === "POST") {
      console.log("📩 Body ricevuto:", req.body);

      const { product, rating, comment, userEmail, photo } = req.body;

      if (!product || !rating || !comment || !userEmail) {
        console.warn("❌ POST reviews: Dati mancanti", req.body);
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
      console.log("✅ Recensione salvata:", saved);

      return res.status(201).json(saved);
    }
    
    return res.status(405).json({ message: "Metodo non consentito" });
  } catch (err) {
    console.error("❌ ERRORE SERVER recensioni:", err);
    return res.status(500).json({ message: "Errore server recensioni", error: err.message });
  }
}
