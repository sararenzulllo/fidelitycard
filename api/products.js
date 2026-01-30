import Product from "../models/Product.js";
import { connectDB } from "../db.js";


export default async function handler(req, res) {
  await connectDB();

  try {
    // =========================
    // GET /api/products
    // =========================
    if (req.method === "GET") {
      const products = await Product.find();
      return res.json(products);
    }

    // =========================
    // POST /api/products
    // image = URL (Cloudinary ecc.)
    // =========================
    if (req.method === "POST") {
      const { name, price, points, quantity, description, image } = req.body;

      if (!name || !price) {
        return res.status(400).json({ message: "Dati mancanti" });
      }

      const newProduct = new Product({
        name,
        price,
        points,
        quantity,
        description,
        image: image || "",
      });

      await newProduct.save();
      return res.status(201).json(newProduct);
    }

    // =========================
    // PUT /api/products?id=
    // =========================
    if (req.method === "PUT") {
      const { id } = req.query;
      const { quantity } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID mancante" });
      }

      const updated = await Product.findByIdAndUpdate(
        id,
        { quantity },
        { new: true }
      );

      return res.json(updated);
    }

    // =========================
    // DELETE /api/products?id=
    // =========================
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: "ID mancante" });
      }

      await Product.findByIdAndDelete(id);
      return res.json({ message: "Prodotto eliminato" });
    }

    return res.status(405).json({ message: "Metodo non consentito" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Errore server prodotti" });
  }
}
