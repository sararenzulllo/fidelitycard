import User from "../models/User.js";
import Product from "../models/Product.js";
import { connectDB } from "../db.js";


export default async function handler(req, res) {
  await connectDB();

  try {
    if (req.method === "GET") {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ message: "Email mancante" });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      const products = await Product.find();

      const suggested = products.filter((p) => {
        const alreadyBought = user.history?.some((h) =>
          h.description.includes(p.name)
        );

        return !alreadyBought && p.points <= user.points;
      });

      return res.json(suggested.slice(0, 5));
    }

    return res.status(405).json({ message: "Metodo non consentito" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore server" });
  }
}
