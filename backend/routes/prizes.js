import express from "express";
import Prize from "../models/Prize.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const prizes = await Prize.find({ validUntil: { $gte: now } });
    res.json(prizes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore nel recupero premi" });
  }
});


router.post("/", async (req, res) => {
  const { name, pointsNeeded, validUntil, categoria, consigliato, best } = req.body;

  if (!name || !pointsNeeded || !validUntil) {
    return res.status(400).json({ message: "Compila tutti i campi obbligatori" });
  }

  try {
    const prize = new Prize({
      name,
      pointsNeeded,
      validUntil,
      categoria: categoria || "Generale",
      consigliato: consigliato || false,
      best: best || false
    });
    await prize.save();
    res.status(201).json(prize);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Premio già esistente" });
    }
    res.status(500).json({ message: "Errore creazione premio" });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const prize = await Prize.findByIdAndDelete(req.params.id);
    if (!prize) return res.status(404).json({ message: "Premio non trovato" });
    res.status(200).json({ message: "Premio eliminato" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore eliminazione premio" });
  }
});

export default router;
