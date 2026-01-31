// backend/api/orders.js (compatibile Express e Vercel)
import Order from "../models/Order.js";
import { connectDB } from "../db.js";

export default async function handler(req, res) {
  await connectDB();

  try {
    if (req.method === "POST") {
  const { utente, products, total, pointsEarned } = req.body; // <-- leggere pointsEarned
  if (!utente || !products || products.length === 0 || !total) {
    return res.status(400).json({ message: "Dati mancanti" });
  }

  const newOrder = new Order({
    utente: utente.toLowerCase(),
    products,
    total,
    pointsEarned, // <-- usa pointsEarned per corrispondere al modello
  });

  const savedOrder = await newOrder.save();
  return res.status(201).json(savedOrder);
}


    if (req.method === "GET") {
      const email = req.query.email;
      if (!email) return res.status(400).json({ message: "Email mancante" });

      const orders = await Order.find({ utente: email.toLowerCase() }).sort({ date: -1 });
      return res.json(orders);
    }

    return res.status(405).json({ message: "Metodo non consentito" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore server ordini" });
  }
}
