import Prize from "../models/Prize.js";
import { connectDB } from "../db.js";


export default async function handler(req, res) {
  await connectDB();

  try {
    if (req.method === "GET") {
      const now = new Date();

      const prizes = await Prize.find({
        validUntil: { $gte: now },
      });

      return res.json(prizes);
    }

    if (req.method === "POST") {
      const {
        name,
        pointsNeeded,
        validUntil,
        categoria,
        consigliato,
        best,
      } = req.body;

      if (!name || !pointsNeeded || !validUntil) {
        return res
          .status(400)
          .json({ message: "Compila tutti i campi obbligatori" });
      }

      const prize = new Prize({
        name,
        pointsNeeded,
        validUntil,
        categoria: categoria || "Generale",
        consigliato: consigliato || false,
        best: best || false,
      });

      await prize.save();

      return res.status(201).json(prize);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: "ID mancante" });
      }

      const prize = await Prize.findByIdAndDelete(id);

      if (!prize) {
        return res.status(404).json({ message: "Premio non trovato" });
      }

      return res.status(200).json({ message: "Premio eliminato" });
    }

    return res.status(405).json({ message: "Metodo non consentito" });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({ message: "Premio già esistente" });
    }

    return res.status(500).json({ message: "Errore server premi" });
  }
}
