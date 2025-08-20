import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "client",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      alert("✅ Registered successfully! You can now log in.");
      navigate("/login"); // go to your login page
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="login-card">
        {/* Illustration (left) */}
        <div className="login-illustration">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            alt="illustration"
          />
        </div>

        {/* Form (right) */}
        <div className="login-form-side">
          <div className="social-row">
            <span className="social-label">Sign up with</span>
            <button
              type="button"
              className="social-btn fb"
              aria-label="Facebook"
            >
              f
            </button>
            <button
              type="button"
              className="social-btn tw"
              aria-label="Twitter"
            >
              t
            </button>
            <button
              type="button"
              className="social-btn in"
              aria-label="LinkedIn"
            >
              in
            </button>
          </div>

          <div className="divider">
            <span>Or</span>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="field">
              <label>Full name</label>
              <input
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Email address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="field">
              <label>Choose role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="client">Client</option>
                <option value="prestataire">Prestataire</option>
                <option value="vendeur">Vendeur</option>
                <option value="livreur">Livreur</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "REGISTERING..." : "REGISTER"}
            </button>
          </form>

          <p className="swap-auth">
            Already have an account?{" "}
            <button className="link-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          </p>
        </div>
      </div>

      {/* Footer (same as login) */}
      <div className="login-footer">
        <span>
          Copyright © {new Date().getFullYear()}. All rights reserved.
        </span>
        <div className="footer-social">
          <a href="#" aria-label="Facebook">
            f
          </a>
          <a href="#" aria-label="Twitter">
            t
          </a>
          <a href="#" aria-label="Google">
            g
          </a>
          <a href="#" aria-label="LinkedIn">
            in
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
