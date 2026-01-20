import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Campi mancanti" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Utente già esistente" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      points: 0,
      monthlyPoints: 0,
      history: [],
      rewards: [],
    });

    await user.save();

    res.status(201).json({ message: "Registrazione riuscita" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore registrazione" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenziali errate" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenziali errate" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login riuscito",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        points: user.points,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore login" });
  }
});


router.post("/logout", (req, res) => {
  res.json({ message: "Logout effettuato" });
});

export default router;
