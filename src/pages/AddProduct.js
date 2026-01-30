import React, { useState } from "react";
import axios from "axios";
import "../styles/AddProduct.css";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [points, setPoints] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState(""); // ora solo URL
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/products", {
        name,
        price: Number(price),
        points: Number(points),
        quantity: Number(quantity),
        description,
        image: imageURL, // qui metti URL
      });

      setName("");
      setPrice("");
      setPoints("");
      setQuantity("");
      setDescription("");
      setImageURL("");

      setSuccessMsg("Prodotto aggiunto correttamente!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Errore aggiunta prodotto");
    }
  };

  return (
    <div className="add-product-container">
      <h1>Aggiungi Prodotto</h1>

      {successMsg && <p className="success-msg">{successMsg}</p>}

      <form onSubmit={handleSubmit} className="add-product-form">
        <input
          type="text"
          placeholder="Nome prodotto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Prezzo"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Punti"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Quantità"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <textarea
          placeholder="Descrizione del prodotto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <input
          type="text"
          placeholder="URL immagine"
          value={imageURL}
          onChange={(e) => setImageURL(e.target.value)}
        />

        <button type="submit">Aggiungi Prodotto</button>
      </form>
    </div>
  );
};

export default AddProduct;
