import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const SupportMessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const SupportMessage = mongoose.model("SupportMessage", SupportMessageSchema);

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Dati incompleti" });
    }

    const newMessage = await SupportMessage.create({ name, email, message });
    res.status(201).json({ message: "Messaggio inviato con successo", data: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

export default router;
