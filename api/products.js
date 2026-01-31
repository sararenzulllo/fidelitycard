// backend/api/products.js
import express from "express";
import Product from "../models/Product.js";
import { connectDB } from "../db.js";

const router = express.Router();

// =========================
// GET /api/products
// =========================
router.get("/", async (req, res) => {
  try {
    // Connessione al DB ad ogni richiesta
    await connectDB();

    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error("Errore API GET /products:", err);
    res.status(500).json({ message: "Errore server prodotti" });
  }
});

// =========================
// POST /api/products
// NOTA: su Vercel non salviamo file, solo immagini già presenti
// =========================
router.post("/", async (req, res) => {
  try {
    await connectDB();

    const { name, price, points, quantity, description, image } = req.body;

    if (!name || !price || !points || !quantity || !description || !image) {
      return res.status(400).json({ message: "Dati mancanti" });
    }

    // image deve essere il nome del file presente in public/images
    const newProduct = new Product({
      name,
      price,
      points,
      quantity,
      description,
      image, // es. "prodotto1.jpg"
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Errore API POST /products:", err);
    res.status(500).json({ message: "Errore aggiunta prodotto" });
  }
});

// =========================
// DELETE /api/products/:id
// =========================
router.delete("/:id", async (req, res) => {
  try {
    await connectDB();

    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Prodotto non trovato" });

    res.status(200).json({ message: "Prodotto eliminato" });
  } catch (err) {
    console.error("Errore API DELETE /products/:id:", err);
    res.status(500).json({ message: "Errore eliminazione prodotto" });
  }
});

export default router;
