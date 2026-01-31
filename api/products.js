import express from "express";
import Product from "../models/Product.js";
import { connectDB } from "../db.js";
import multer from "multer";
import path from "path";

const router = express.Router();
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

// =========================
// GET /api/products
// =========================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server prodotti" });
  }
});

// =========================
// POST /api/products
// =========================
router.post(
  "/",
  isLocal ? upload.single("image") : async (req, res, next) => next(),
  async (req, res) => {
    try {
      const { name, price, points, quantity, description, image } = req.body;

      let imageName;

      if (isLocal) {
        // In locale: multer salva l'immagine
        if (!req.file) return res.status(400).json({ message: "Immagine mancante" });
        imageName = req.file.filename;
      } else {
        // Su Vercel: usa solo nome immagine già presente
        if (!image) return res.status(400).json({ message: "Immagine mancante" });
        imageName = image;
      }

      const newProduct = new Product({
        name,
        price,
        points,
        quantity,
        description,
        image: imageName,
      });

      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Errore aggiunta prodotto" });
    }
  }
);

export default router;
