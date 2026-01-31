import Product from "../models/Product.js";
import { connectDB } from "../db.js";

export default async function handler(req, res) {
  try {
    await connectDB();

    // =========================
    // GET /api/products
    // =========================
    if (req.method === "GET") {
      const products = await Product.find();
      return res.status(200).json(products);
    }

    // =========================
    // POST /api/products
    // =========================
    if (req.method === "POST") {
      const { name, price, points, quantity, description, image } = req.body;

      if (!name || !price || !points || !quantity || !description || !image) {
        return res.status(400).json({ message: "Dati mancanti" });
      }

      const newProduct = new Product({
        name,
        price,
        points,
        quantity,
        description,
        image,
      });

      await newProduct.save();
      return res.status(201).json(newProduct);
    }

    // =========================
    // DELETE /api/products?id=...
    // =========================
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "ID mancante" });

      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Prodotto non trovato" });
      }

      return res.status(200).json({ message: "Prodotto eliminato" });
    }

    // Metodo non supportato
    res.status(405).json({ message: "Metodo non consentito" });

  } catch (err) {
    console.error("ERRORE API /products:", err);
    res.status(500).json({ error: err.message });
  }
}
