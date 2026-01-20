// backend/models/Review.js
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  product: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  userEmail: { type: String, required: true },
  photo: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Review", ReviewSchema);
