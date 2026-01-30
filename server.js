import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";  // <-- corrisponde a export nominato

// import router dalle cartelle API
import productsRouter from "./api/products.js"; 
import loginRouter from "./api/login.js";
import logoutRouter from "./api/logout.js";
import registerRouter from "./api/register.js";
import ordersRouter from "./api/orders.js";
import prizesRouter from "./api/prizes.js";
import userRoutes from "./api/users.js";
import reviewsRoutes from "./api/reviews.js";
import recommendRoutes from "./api/recommendRoutes.js";
import supportRoutes from "./api/supportRoutes.js";

dotenv.config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// rotte
app.use("/api/products", productsRouter);
app.use("/api/login", loginRouter);
app.use("/api/logout", logoutRouter);
app.use("/api/register", registerRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/prizes", prizesRouter);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/recommendations", recommendRoutes);
app.use("/api/support", supportRoutes);

// connessione DB
connectDB();

// server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server avviato su porta ${PORT}`));
