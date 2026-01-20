import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path"; // <-- serve per React build

import productsRouter from "./routes/products.js"; 
import supportRoutes from "./routes/supportRoutes.js";
import recommendRoutes from "./routes/recommendRoutes.js";
import ordersRouter from "./routes/orders.js";
import prizesRouter from "./routes/prizes.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import reviewsRoutes from "./routes/reviews.js";

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// --- API Routes ---
app.use("/api/products", productsRouter);
app.use("/api/support", supportRoutes);
app.use("/api/recommendations", recommendRoutes);
app.use("/api/orders", ordersRouter);
app.use("/api/prizes", prizesRouter);
app.use("/api/auth", authRoutes);  
app.use("/api/users", userRoutes);  
app.use("/api/reviews", reviewsRoutes);

// --- MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connesso"))
.catch((err) => console.error("Errore connessione MongoDB:", err));

// --- User routes speciali ---
import User from "./models/User.js"; // Assicurati di importare il modello User

app.put("/api/users/:id/add-points", async (req, res) => {
  const { id } = req.params;
  const { points } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });
    user.points += points;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

app.put("/api/users/:id/qr-bonus", async (req, res) => {
  const { id } = req.params;
  const bonusPoints = 50;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });
    user.points += bonusPoints;
    user.history = user.history || [];
    user.history.push({ date: new Date(), points: user.points });
    await user.save();
    res.json({ user, message: `🎁 Bonus QR di ${bonusPoints} punti aggiunto!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

// --- SERVE REACT BUILD ---
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// --- PORT ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server avviato su porta ${PORT}`));
