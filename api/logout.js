export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metodo non consentito" });
  }

  return res.json({ message: "Logout effettuato" });
}
