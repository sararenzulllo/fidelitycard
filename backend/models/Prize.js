import mongoose from "mongoose";

const PrizeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  pointsNeeded: { type: Number, required: true },
  validUntil: { type: Date, required: true },
  categoria: { type: String, default: "Generale" },
  consigliato: { type: Boolean, default: false },
  best: { type: Boolean, default: false }
});

const Prize = mongoose.model("Prize", PrizeSchema);
export default Prize;
