import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Recensioni.css";

const Recensioni = () => {
  const [reviews, setReviews] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [newReview, setNewReview] = useState({
    product: "",
    rating: 5,
    comment: "",
    photo: null,
  });

  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail")?.toLowerCase();
  const API_URL = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    if (!email) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`, { params: { email } });
        const orders = Array.isArray(res.data) ? res.data : [];

        const productsSet = new Set();
        orders.forEach(order => {
          if (Array.isArray(order.products)) {
            order.products.forEach(p => {
              if (p.name) productsSet.add(p.name);
            });
          }
        });

        setUserProducts(Array.from(productsSet));
      } catch (err) {
        console.error("Errore fetch ordini:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/reviews?userEmail=${email}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Errore fetch recensioni:", err);
      }
    };

    fetchOrders();
    fetchReviews();
  }, [email, API_URL]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setNewReview({ ...newReview, photo: files[0] });
    } else {
      setNewReview({ ...newReview, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.product) return alert("Seleziona un prodotto");

    try {
      // Converti foto in base64 (opzionale)
      let photoBase64 = null;
      if (newReview.photo) {
        photoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(newReview.photo);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });
      }

      const res = await axios.post(
        `${API_URL}/api/reviews`,
        {
          product: newReview.product,
          rating: newReview.rating,
          comment: newReview.comment,
          userEmail: email,
          photo: photoBase64,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setReviews([...reviews, res.data]);
      setNewReview({ product: "", rating: 5, comment: "", photo: null });
    } catch (err) {
      console.error("Errore invio recensione:", err);
      alert("Errore nell'invio della recensione");
    }
  };

  return (
    <div className="recensioni-container">
      <h2>Lascia una recensione</h2>

      {userProducts.length === 0 ? (
        <p>
          Non hai ancora acquistato prodotti. Vai al{" "}
          <button onClick={() => navigate("/catalogo-prodotti")}>catalogo</button> per iniziare!
        </p>
      ) : (
        <form className="review-form" onSubmit={handleSubmit}>
          <label>
            Prodotto:
            <select name="product" value={newReview.product} onChange={handleChange} required>
              <option value="">Seleziona prodotto</option>
              {userProducts.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <label>
            Valutazione:
            <select name="rating" value={newReview.rating} onChange={handleChange}>
              {[5,4,3,2,1].map(st => <option key={st} value={st}>{st} ★</option>)}
            </select>
          </label>

          <label>
            Commento:
            <textarea
              name="comment"
              value={newReview.comment}
              onChange={handleChange}
              placeholder="Scrivi qui la tua recensione"
              required
            />
          </label>

          <label>
            Foto (opzionale):
            <input type="file" name="photo" onChange={handleChange} accept="image/*" />
          </label>

          <button type="submit">Invia recensione</button>
        </form>
      )}

      <h3>Recensioni recenti</h3>
      <div className="reviews-list">
        {reviews.map((r, idx) => (
          <div key={idx} className="review-card">
            <strong>{r.product}</strong> - {r.rating} ★
            <p>{r.comment}</p>
            {r.photo && <img src={r.photo} alt="recensione" style={{ maxWidth: "200px" }} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recensioni;
