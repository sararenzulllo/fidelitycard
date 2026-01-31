import Product from "../models/Product.js";
import { connectDB } from "../db.js";
import multer from "multer";
import path from "path";

await connectDB();

// Determina se siamo in locale
const isLocal = process.env.NODE_ENV !== "production";

// Configurazione multer solo per locale
let upload;
if (isLocal) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) =>
      cb(null, path.join(process.cwd(), "public/images")),
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/\s/g, "_");
      cb(null, `${timestamp}-${safeName}`);
    },
  });
  upload = multer({ storage });
}

export default async function handler(req, res) {
  try {
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
      // Se siamo in locale, multer gestisce l'upload
      if (isLocal) {
        return upload.single("image")(req, res, async (err) => {
          if (err) return res.status(500).json({ message: err.message });
          const { name, price, points, description } = req.body;
          if (!name || !price || !points || !description || !req.file)
            return res.status(400).json({ message: "Dati mancanti" });

          const newProduct = new Product({
            name,
            price,
            points,
            description,
            image: req.file.filename,
          });

          await newProduct.save();
          return res.status(201).json(newProduct);
        });
      } else {
        // Su Vercel, solo nome immagine già presente
        const { name, price, points, description, image } = req.body;
        if (!name || !price || !points || !description || !image)
          return res.status(400).json({ message: "Dati mancanti" });

        const newProduct = new Product({ name, price, points, description, image });
        await newProduct.save();
        return res.status(201).json(newProduct);
      }
    }

    // =========================
    // DELETE /api/products?id=...
    // =========================
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "ID mancante" });

      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: "Prodotto non trovato" });

      return res.status(200).json({ message: "Prodotto eliminato" });
    }

    // Metodo non supportato
    res.status(405).json({ message: "Metodo non consentito" });

  } catch (err) {
    console.error("ERRORE API /products:", err);
    res.status(500).json({ error: err.message });
  }
}
