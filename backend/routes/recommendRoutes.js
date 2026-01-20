import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    const products = await Product.find();

    const suggested = products.filter(p => {
      const alreadyBought = user.history?.some(h => h.description.includes(p.name));
      return !alreadyBought && p.points <= user.points;
    });

    res.json(suggested.slice(0, 5)); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

export default router;
