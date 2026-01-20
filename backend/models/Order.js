import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  utente: { type: String, required: true }, 
  products: [
    {
      _id: { type: String }, 
      name: { type: String, required: true },
      price: { type: Number, required: true },
      points: { type: Number, default: 0 },
      quantity: { type: Number, required: true },
      image: { type: String }
    }
  ],
  total: { type: Number, required: true },
  pointsEarned: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
