import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Auth.css";

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Punto finale API
  const API_URL = process.env.REACT_APP_API_URL || "/api";

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(`${API_URL}/login`, { // ❌ togli .js
      email: email.toLowerCase(),
      password,
    });

    const { token, user } = res.data;

    // 🔹 Salva token e email in localStorage
    localStorage.setItem("authToken", token);
    localStorage.setItem("userEmail", user.email);

    setIsLoggedIn(true);
    toast.success("✅ Login effettuato con successo!");
    navigate("/homepage");
  } catch (err) {
    console.error("Errore login:", err);
    toast.error(err.response?.data?.message || "❌ Errore nel login");
  }
};
  

  return (
    <div className="auth-page">
      <ToastContainer />
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="register-text">
          Non sei registrato?{" "}
          <span onClick={() => navigate("/register")}>Registrati</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
