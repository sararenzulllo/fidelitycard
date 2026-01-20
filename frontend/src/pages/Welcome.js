import React from "react";
import { useNavigate } from "react-router-dom";
import fidelityCardImg from "../assets/fidelitycard.png";
import "../styles/Welcome.css";

const Welcome = () => {
  const navigate = useNavigate(); 

  return (
    <div className="welcome-container">
      <div className="welcome-content">

        <div className="welcome-text">
          <h1 className="welcome-title">La tua FidelityCard360!</h1>

          <p className="welcome-description">
            Benvenuto nella <strong>Fidelity Card Interattiva</strong> del nostro supermercato!<br />
            Accumula punti ad ogni acquisto, riscattali per premi esclusivi e scopri offerte personalizzate pensate proprio per te.<br />
            La tua esperienza di spesa diventa <strong>più divertente, intuitiva e gratificante</strong>: controlla i tuoi punti in tempo reale, tieni traccia dei premi riscattati e partecipa a sfide e promozioni dedicate ai nostri clienti più fedeli.
          </p>

          <div className="welcome-buttons">
            <button
              className="btn-login"
              type="button"
              onClick={() => navigate("/login")}  
            >
              Login
            </button>

            <button
              className="btn-register"
              type="button"
              onClick={() => navigate("/register")} 
            >
              Registrati
            </button>
          </div>
        </div>

        <div className="fidelity-card">
          <img
            src={fidelityCardImg}
            alt="Fidelity Card"
            className="fidelity-image"
          />
        </div>

      </div>
    </div>
  );
};

export default Welcome;
