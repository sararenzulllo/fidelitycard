import { connectDB } from "../db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  await connectDB();
  const { method } = req;

  try {
    if (method === "GET") {
      const email = req.query.email?.toLowerCase();
      const history = req.query.history === "true";
      if (!email) return res.status(400).json({ message: "Email mancante" });

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "Utente non trovato" });

      if (history) return res.json(user.history || []);
      return res.json(user);
    }

    if (method === "PUT") {
      const email = req.query.email?.toLowerCase();
      const { dailyLogin, addPoints, redeemPrize, order } = req.body;

      if (!email) return res.status(400).json({ message: "Email mancante" });

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "Utente non trovato" });

      console.log("🟢 Punti iniziali utente:", user.points);

      // ===== Bonus giornaliero =====
      if (dailyLogin) {
        const dailyPoints = 10;
        user.points += dailyPoints;
        user.history.push({ date: new Date(), points: dailyPoints, action: "Bonus giornaliero" });
        console.log("💛 Dopo bonus giornaliero:", user.points);
      }

      // ===== Bonus QR / addPoints =====
      if (addPoints) {
        user.points += addPoints;
        user.history.push({ date: new Date(), points: addPoints, action: "Bonus QR" });
        console.log("💙 Dopo addPoints:", user.points);
      }

      // ===== Riscatto premio =====
      if (redeemPrize) {
        console.log("🔹 Tentativo riscatto premio:", redeemPrize.nome, "punti richiesti:", redeemPrize.punti);

        if (user.points < redeemPrize.punti) {
          console.log("❌ Punti insufficienti per riscattare");
          return res.status(400).json({ message: "Punti insufficienti" });
        }

        user.points -= redeemPrize.punti;
        user.rewards.push(redeemPrize.nome);
        user.history.push({ date: new Date(), points: -redeemPrize.punti, action: `Riscatto premio: ${redeemPrize.nome}` });
        console.log("💚 Dopo riscatto premio:", user.points);
      }

      // ===== Conferma ordine =====
      if (order) {
        const { products, pointsEarned, usedReward } = order;
        if (!products || products.length === 0) return res.status(400).json({ message: "Ordine vuoto" });

        console.log("🔹 Conferma ordine, punti guadagnati:", pointsEarned);

        // Aggiungi punti guadagnati dall'ordine
        user.points += pointsEarned || 0;
        user.monthlyPoints += pointsEarned || 0;

        products.forEach(p => {
          user.history.push({ date: new Date(), points: p.points || 0, action: `Acquisto: ${p.name}` });
        });

        // 🔹 Rimuovi premio applicato
        if (usedReward) {
          const index = user.rewards.findIndex(r => r === usedReward);
          if (index !== -1) {
            user.rewards.splice(index, 1); // rimuove il premio
            console.log(`🔹 Premio ${usedReward} rimosso dai premi utente`);
            user.history.push({ date: new Date(), points: 0, action: `Premio utilizzato: ${usedReward}` });
          }
        }

        console.log("💛 Dopo conferma ordine:", user.points);
      }

      // 🔹 Protezione contro punti negativi
      if (user.points < 0) {
        console.log("⚠️ Punti negativi rilevati! Reset a 0");
        user.points = 0;
      }

      await user.save();
      console.log("✅ Punti finali salvati:", user.points);

      return res.json({ user, message: "Aggiornamento utente completato!" });
    }

    return res.status(405).json({ message: "Metodo non consentito" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore server" });
  }
}
