import { connectDB } from "./db.js";
import User from "./models/User.js";

async function fixNegativePoints() {
  await connectDB();
  const users = await User.find({ points: { $lt: 0 } });
  for (let u of users) {
    console.log(`Reset punti utente ${u.email} da ${u.points} a 0`);
    u.points = 0;
    await u.save();
  }
  console.log("✅ Tutti i punti negativi resettati");
  process.exit();
}

fixNegativePoints();
