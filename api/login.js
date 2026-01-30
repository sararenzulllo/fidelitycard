import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { connectDB } from "../db.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metodo non consentito" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email o password mancanti" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Credenziali errate" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Credenziali errate" });

    // 🔹 JWT leggero
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // valido 7 giorni
    );

    return res.status(200).json({
      message: "Login riuscito",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        points: user.points || 0,
      },
    });
  } catch (err) {
    console.error("Errore login:", err);
    return res.status(500).json({ message: "Errore login" });
  }
}
