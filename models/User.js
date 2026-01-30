import mongoose from "mongoose";
import Order from "./Order.js";     
import Review from "./Review.js";    

const historySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  points: Number,
  type: String,
  description: String
});


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: Date },
  points: { type: Number, default: 0 },
  monthlyPoints: { type: Number, default: 0 },
  history: [historySchema],
  rewards: { type: [String], default: [] },
  orders: { type: [Object], default: [] },
  lastDailyLogin: { type: Date, default: null },
  lastShareBonus: { type: Date, default: null }
}, { timestamps: true });

// Middleware per cancellare ordini e recensioni dell'utente
userSchema.pre("remove", async function(next) {
  try {
    await Order.deleteMany({ utente: this.email });
    await Review.deleteMany({ utente: this.email });
    next();
  } catch (err) {
    next(err);
  }
});


export default mongoose.model("User", userSchema);
