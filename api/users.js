import { connectDB } from "../db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  await connectDB();
  const { method } = req;

  try {
    // ===================== GET =====================
    if (method === "GET") {
      const email = req.query.email?.toLowerCase();
      const historyOnly = req.query.history === "true";

      if (!email) {
        return res.status(400).json({ message: "Email mancante" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      if (historyOnly) {
        return res.json(user.history || []);
      }

      return res.json(user);
    }

    // ===================== PUT =====================
    if (method === "PUT") {
      const email = req.query.email?.toLowerCase();
      if (!email) {
        return res.status(400).json({ message: "Email mancante" });
      }

      const {
        dateOfBirth,
        dailyLogin,
        addPoints,
        redeemPrize,
        order,
        shareType
      } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      // ===== DATA DI NASCITA =====
      if (dateOfBirth !== undefined) {
        user.dateOfBirth = new Date(dateOfBirth);
      }

      // ===== BONUS LOGIN GIORNALIERO =====
      if (dailyLogin) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let lastLogin = user.lastDailyLogin
          ? new Date(user.lastDailyLogin)
          : null;

        if (lastLogin) lastLogin.setHours(0, 0, 0, 0);

        if (lastLogin && lastLogin.getTime() === today.getTime()) {
          return res
            .status(400)
            .json({ message: "Bonus giornaliero già ricevuto oggi!" });
        }

        const dailyPoints = 10;
        user.points += dailyPoints;
        user.lastDailyLogin = new Date();

        user.history.push({
          date: new Date(),
          points: dailyPoints,
          action: "Bonus giornaliero"
        });
      }

      // ===== BONUS QR =====
      if (addPoints) {
        user.points += addPoints;

        user.history.push({
          date: new Date(),
          points: addPoints,
          action: "Bonus QR"
        });
      }

      // ===== CONDIVISIONE =====
      if (shareType) {
        const sharePoints = 5;
        const actionName =
          shareType === "whatsapp"
            ? "Condivisione WhatsApp"
            : "Condivisione Email";

        user.points += sharePoints;

        user.history.push({
          date: new Date(),
          points: sharePoints,
          action: actionName
        });
      }

      // ===== RISCATTO PREMIO =====
      if (redeemPrize) {
        if (user.points < redeemPrize.punti) {
          return res.status(400).json({ message: "Punti insufficienti" });
        }

        user.points -= redeemPrize.punti;
        user.rewards.push(redeemPrize.nome);

        user.history.push({
          date: new Date(),
          points: -redeemPrize.punti,
          action: `Riscatto premio: ${redeemPrize.nome}`
        });
      }

      // ===== ORDINE =====
      if (order) {
        const { products, pointsEarned, usedReward } = order;

        if (!products || products.length === 0) {
          return res.status(400).json({ message: "Ordine vuoto" });
        }

        const earned = pointsEarned || 0;
        user.points += earned;
        user.monthlyPoints += earned;

        const productNames = products
          .map(p => p.name || "Prodotto")
          .join(", ");

        user.history.push({
          date: new Date(),
          points: earned,
          action: `Ordine: ${productNames}`
        });

        if (usedReward) {
          const index = user.rewards.findIndex(r => r === usedReward);
          if (index !== -1) user.rewards.splice(index, 1);

          user.history.push({
            date: new Date(),
            points: 0,
            action: `Premio utilizzato: ${usedReward}`
          });
        }
      }

      if (user.points < 0) user.points = 0;

      await user.save();

      return res.json({
        user,
        message: "Aggiornamento utente completato!"
      });
    }

    return res.status(405).json({ message: "Metodo non consentito" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore server" });
  }
}
