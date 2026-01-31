import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Recommendations.css";

const Recommendations = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [offers, setOffers] = useState([]);
  const [news, setNews] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const email = localStorage.getItem("userEmail")?.toLowerCase();
  const API_URL = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    if (!email) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users`, { params: { email } });
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [email, API_URL]);

  useEffect(() => {
    if (!user) return;

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`);
        const allProducts = res.data;

        let personalizedOffers = [];

        // Offerte basate sugli ultimi acquisti
        if (user.orders && user.orders.length > 0) {
          const lastOrders = user.orders
            .slice(-3)
            .flatMap((order) => order.products);

          const uniqueProducts = Array.from(
            new Map(lastOrders.map((p) => [p.name, p])).values()
          );

          const purchaseOffers = uniqueProducts.map((p, i) => ({
            id: `purchase-${i}`,
            title: `🎉 Offerta speciale per te: -20% su ${p.name}`,
            product: p,
            discountedPrice: Number((p.price * 0.8).toFixed(2)),
            type: "acquisto",
          }));

          personalizedOffers = personalizedOffers.concat(purchaseOffers);
        }

        // Nuovi prodotti
        const newProducts = allProducts.slice(-3);
        const newProductOffers = newProducts.map((p, i) => ({
          id: `new-${i}`,
          title: `🆕 Novità! Scopri ${p.name}`,
          product: p,
          discountedPrice: Number(p.price.toFixed(2)),
          type: "nuovo",
        }));
        personalizedOffers = personalizedOffers.concat(newProductOffers);

        // Offerte stagionali
        const seasonalOffers = allProducts.slice(0, 3).map((p, i) => ({
          id: `sale-${i}`,
          title: `🔥 Saldi stagionali: -15% su ${p.name}`,
          product: p,
          discountedPrice: Number((p.price * 0.85).toFixed(2)),
          type: "sconto",
        }));
        personalizedOffers = personalizedOffers.concat(seasonalOffers);

        setOffers(personalizedOffers);

        setNews(
          newProducts.map((p) => ({
            id: p._id,
            title: `Nuovo prodotto disponibile: ${p.name}`,
            description: `Provalo ora e accumula punti!`,
          }))
        );

        setAlerts([
          { id: 1, message: `Hai ${Number(user.points).toFixed(2)} punti disponibili da riscattare!` },
          { id: 2, message: "Non hai ancora riscattato il tuo premio mensile!" },
        ]);
      } catch (err) {
        console.error("Errore fetch prodotti:", err);
      }
    };

    fetchProducts();
  }, [user, API_URL]);

  if (!email) return <p>❌ Devi fare il login</p>;
  if (!user) return <p>⏳ Caricamento dati utente...</p>;

  // Funzione per aggiungere al carrello con popup
  const addToCartOffer = (product, discountedPrice) => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const newCartItem = { ...product, price: Number(discountedPrice).toFixed(2), quantity: 1 };
    const newCart = [...storedCart, newCartItem];
    localStorage.setItem("cart", JSON.stringify(newCart));

    setConfirmationMessage(`"${product.name}" aggiunto al carrello!`);
    setTimeout(() => setConfirmationMessage(""), 2500);
  };

  return (
    <div className="recommendations-container">
      {/* POPUP DI CONFERMA */}
      {confirmationMessage && (
        <div className="confirmation-popup">
          ✅ {confirmationMessage}
        </div>
      )}

      <h1>🎯 Offerte & Consigli per te</h1>

      <div className="alerts">
        {alerts.map((alert) => (
          <div key={alert.id} className="alert-card">
            ⚠️ {alert.message}
          </div>
        ))}
      </div>

      {["acquisto", "sconto", "nuovo"].map(
        (type) =>
          offers.filter((o) => o.type === type).length > 0 && (
            <div key={type}>
              <h2>
                {type === "acquisto" && "🛍️ Offerte dai tuoi acquisti"}
                {type === "sconto" && "🔥 Offerte stagionali"}
                {type === "nuovo" && "🆕 Nuovi prodotti"}
              </h2>

              <div className="cards-grid">
                {offers
                  .filter((o) => o.type === type)
                  .map((offer) => (
                    <div key={offer.id} className="offer-card">
                      <h3>{offer.title}</h3>
                      <p>Prodotto: {offer.product.name}</p>
                      <p>Prezzo originale: €{Number(offer.product.price).toFixed(2)}</p>
                      <p>Prezzo scontato: €{Number(offer.discountedPrice).toFixed(2)}</p>

                      <button onClick={() => navigate("/catalogo-prodotti")}>
                        🔍 Dettagli
                      </button>

                      <button onClick={() => addToCartOffer(offer.product, offer.discountedPrice)}>
                        🛒 Aggiungi al carrello
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )
      )}

      <h2>📰 Novità & Consigli</h2>
      <div className="cards-grid">
        {news.map((item) => (
          <div key={item.id} className="news-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
