
import mongoose from "mongoose";

const supportSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("SupportMessage", supportSchema);
