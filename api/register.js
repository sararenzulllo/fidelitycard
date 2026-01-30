import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { connectDB } from "../db.js";


export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metodo non consentito" });
  }

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

    return res.status(201).json({ message: "Registrazione riuscita" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore registrazione" });
  }
}
