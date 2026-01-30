import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // rimosse le opzioni obsolete
    console.log("MongoDB Atlas connesso");
  } catch (err) {
    console.error("Errore connessione MongoDB:", err);
    process.exit(1);
  }
};
