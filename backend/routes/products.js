import express from "express";
import multer from "multer";
import Product from "../models/Product.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore caricamento prodotti" });
  }
});
 
router.post("/", upload.single("image"), async (req, res) => {
  const { name, price, points, quantity, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : "";

  const newProduct = new Product({
    name,
    price,
    points,
    quantity,
    image,
    description,
  });

  await newProduct.save();
  res.status(201).json(newProduct);
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity: req.body.quantity },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore aggiornamento quantità" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Prodotto eliminato" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore eliminazione prodotto" });
  }
});

export default router;
