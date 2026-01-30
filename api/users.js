// backend/api/users.js
import { connectDB } from "../db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  await connectDB();
  const { method } = req;

  try {
    // =========================
    // GET utente o storico punti
    // =========================
    if (method === "GET") {
      const email = req.query.email?.toLowerCase();
      const history = req.query.history === "true";

      if (!email) return res.status(400).json({ message: "Email mancante" });

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "Utente non trovato" });

      if (history) return res.json(user.history || []);
      return res.json(user);
    }

    // =========================
    // PUT aggiornamento utente, riscatto premio o conferma ordine
    // =========================
    if (method === "PUT") {
      const email = req.query.email?.toLowerCase();
      const id = req.query.id;
      const { dateOfBirth, dailyLogin, addPoints, redeemPrize, order } = req.body;

      if (!email && !id) return res.status(400).json({ message: "Parametri mancanti" });

      // Recupera utente
      let user = null;
      if (id) {
        user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });
      } else if (email) {
        user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Utente non trovato" });
      }

      // ===== Aggiornamento generico =====
      if (dateOfBirth) user.dateOfBirth = dateOfBirth;
      if (dailyLogin) {
        const dailyPoints = 10;
        user.points = (user.points || 0) + dailyPoints;
        user.history = user.history || [];
        user.history.push({ date: new Date(), points: dailyPoints, action: "Bonus giornaliero" });
      }
      if (addPoints) {
        user.points = (user.points || 0) + addPoints;
        user.history = user.history || [];
        user.history.push({ date: new Date(), points: addPoints, action: "Bonus QR" });
      }

      // ===== Riscatto premio =====
      if (redeemPrize) {
        user.rewards = user.rewards || [];
        if (user.rewards.includes(redeemPrize.nome)) {
          return res.status(400).json({ message: "Premio già riscattato" });
        }
        user.rewards.push(redeemPrize.nome);
        if (redeemPrize.punti) user.points = (user.points || 0) - redeemPrize.punti;
      }

      // ===== Conferma ordine =====
      if (order) {
        const { products, points: orderPoints } = order;

        if (!products || products.length === 0) {
          return res.status(400).json({ message: "Ordine vuoto" });
        }

        // Aggiorna punti utente (decumula punti spesi)
        user.points = (user.points || 0) - (orderPoints || 0);

        // Aggiorna storico ordini
        user.history = user.history || [];
        products.forEach(p => {
          user.history.push({
            date: new Date(),
            points: p.points || 0,
            action: `Acquisto: ${p.name}`
          });
        });
      }

      await user.save();
      return res.json({ user, message: "Aggiornamento utente completato!" });
    }

    return res.status(405).json({ message: "Metodo non consentito" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore server" });
  }
}
