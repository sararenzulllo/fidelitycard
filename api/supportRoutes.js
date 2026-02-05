import mongoose from "mongoose";
import { connectDB } from "../db.js";


const SupportMessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const SupportMessage = mongoose.models.SupportMessage || mongoose.model("SupportMessage", SupportMessageSchema);

export default async function handler(req, res) {
  await connectDB();

  try {
  
    if (req.method === "POST") {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ message: "Dati incompleti" });
      }

      const newMessage = await SupportMessage.create({
        name,
        email: email.toLowerCase(),
        message
      });

      return res.status(201).json({
        message: "Messaggio inviato con successo",
        data: newMessage
      });
    }

    if (req.method === "GET") {
      const { email } = req.query;
      if (!email) return res.status(400).json({ message: "Email mancante" });

      const messages = await SupportMessage.find({ email: email.toLowerCase() }).sort({ date: -1 });
      return res.json(messages);
    }

    return res.status(405).json({ message: "Metodo non consentito" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore server" });
  }
}
