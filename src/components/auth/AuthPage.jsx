import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./AuthPage.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("client");
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? "/auth/register" : "/auth/login";
    const payload = isRegister
      ? { ...formData, role }
      : { email: formData.email, password: formData.password };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      alert(data.message || "Success");

      // ✅ LOGIN ONLY
      if (!isRegister && data.token) {
        localStorage.setItem("token", data.token);
        const decoded = jwtDecode(data.token); // ✅ CORRECT
        const userRole = decoded.role;

        // ✅ Redirect by role
        switch (userRole) {
          case "client":
            navigate("/client-dashboard");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "prestataire":
            navigate("/prestataire-dashboard");
            break;
          case "vendeur":
            navigate("/vendeur-dashboard");
            break;
          case "livreur":
            navigate("/livreur-dashboard");
            break;
          default:
            navigate("/");
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {isRegister && (
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {isRegister && (
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="client">Client</option>
            <option value="prestataire">Prestataire</option>
            <option value="admin">Admin</option>
            <option value="vendeur">Vendeur</option>
            <option value="livreur">Livreur</option>
          </select>
        )}
        <button type="submit">{isRegister ? "Register" : "Login"}</button>
      </form>
      <p onClick={() => setIsRegister((prev) => !prev)} className="switch-mode">
        {isRegister ? "Already have an account? Login" : "No account? Register"}
      </p>
    </div>
  );
};

export default AuthPage;
