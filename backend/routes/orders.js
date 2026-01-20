import express from "express";
import Order from "../models/Order.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const { utente, products, total, points } = req.body;

    console.log("ORDINE RICEVUTO:", req.body);

    if (!utente || !products || products.length === 0 || !total) {
      return res.status(400).json({ message: "Dati mancanti" });
    }

    const newOrder = new Order({
      utente: utente.toLowerCase(),
      products,
      total,
      points
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore creazione ordine" });
  }
});


router.get("/:email", async (req, res) => {
  try {
    const orders = await Order.find({ utente: req.params.email.toLowerCase() }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore fetch ordini" });
  }
});



export default router;
