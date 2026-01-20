import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Utente non trovato" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore del server" });
  }
});

router.put("/:email", async (req, res) => {
  const { email } = req.params;
  const { dateOfBirth } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() }); // cerca l'utente
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    user.dateOfBirth = dateOfBirth; 

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

router.put("/:email/redeem", async (req, res) => {
  try {
    const { premio } = req.body;
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    if (user.points < premio.punti) {
      return res.status(400).json({ message: "Punti insufficienti" });
    }

    if (!Array.isArray(user.rewards)) user.rewards = [];
    if (!Array.isArray(user.history)) user.history = [];

    if (user.rewards.includes(premio.nome)) {
      return res.status(400).json({ message: "Premio già riscattato" });
    }

    user.points -= premio.punti;
    user.history.push({
      date: new Date(),
      points: -premio.punti,
      type: "premio",
      description: `Riscattato: ${premio.nome}`
    });
    user.rewards.push(premio.nome);

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

router.put("/:email/order", async (req, res) => {
  const { points, products, appliedReward } = req.body;
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Utente non trovato" });
    if (!products || products.length === 0) return res.status(400).json({ message: "Carrello vuoto" });

    // Aggiorna punti
    user.points += points;
    user.monthlyPoints += points;

    // Salva ordine nello storico
    user.orders.push({ date: new Date(), products });

    // Rimuovi premio applicato
    if (appliedReward) {
      const appliedName = appliedReward.name.trim().toLowerCase();
      if (appliedReward.type === "gift" || appliedReward.type === "discount") {
        // Rimuovi dallo stato rewards
        user.rewards = user.rewards.filter(r => r.trim().toLowerCase() !== appliedName);
        // Se era discount, registra come usato
        if (appliedReward.type === "discount") {
          if (!Array.isArray(user.usedDiscounts)) user.usedDiscounts = [];
          user.usedDiscounts.push(appliedReward.name.trim().toLowerCase());
        }
      }
    }

    await user.save();

    res.json(user); // ritorna utente aggiornato
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});


router.get("/history/email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Utente non trovato" });
    res.json(user.history || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

router.put("/:email/daily-login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    const now = new Date();
    const lastLogin = user.lastDailyLogin ? new Date(user.lastDailyLogin) : null;

    if (lastLogin && lastLogin.toDateString() === now.toDateString()) {
      return res.status(400).json({ message: "Login giornaliero già effettuato oggi" });
    }

    const pointsEarned = 10;
    user.points += pointsEarned;
    user.monthlyPoints += pointsEarned;
    user.lastDailyLogin = now;

    if (!Array.isArray(user.history)) user.history = [];
    user.history.push({
      date: now,
      points: pointsEarned,
      type: "bonus",
      description: "Login giornaliero"
    });

    await user.save();
    res.json({ message: `Hai ricevuto ${pointsEarned} punti!`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

router.put("/:email/share-app", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    const now = new Date();
    const lastShare = user.lastShareBonus ? new Date(user.lastShareBonus) : null;

    if (lastShare && lastShare.toDateString() === now.toDateString()) {
      return res.status(400).json({ message: "Bonus condivisione già ottenuto oggi" });
    }

    const pointsEarned = 5;
    user.points += pointsEarned;
    user.monthlyPoints += pointsEarned;
    user.lastShareBonus = now;

    if (!Array.isArray(user.history)) user.history = [];
    user.history.push({
      date: now,
      points: pointsEarned,
      type: "bonus",
      description: "Condivisione app"
    });

    await user.save();
    res.json({ message: `Hai ricevuto ${pointsEarned} punti per aver condiviso l'app!`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

router.get("/by-id/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

router.put("/:id/add-points", async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    const addPoints = points || 50;
    user.points += addPoints;

    if (!Array.isArray(user.history)) user.history = [];
    user.history.push({
      date: new Date(),
      points: addPoints,
      type: "bonus",
      description: "Punti aggiunti dall'operatore"
    });

    await user.save();
    res.json({ message: `${addPoints} punti aggiunti`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

export default router;
