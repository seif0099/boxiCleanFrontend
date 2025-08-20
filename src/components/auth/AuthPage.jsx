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
  const [remember, setRemember] = useState(false); // kept for UI only
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

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
      if (!res.ok) throw new Error(data.message || "Une erreur est survenue");

      // After register, switch to login form
      if (isRegister) {
        alert("✅ Compte créé avec succès. Vous pouvez vous connecter.");
        setIsRegister(false);
        setSubmitting(false);
        return;
      }

      if (!data.token) throw new Error("Token manquant dans la réponse.");

      // Always save token & user in localStorage
      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        try {
          const payload = jwtDecode(data.token);
          const lightUser = {
            id: payload.id,
            role: payload.role,
            email: payload.email,
          };
          localStorage.setItem("user", JSON.stringify(lightUser));
        } catch {
          /* ignore decode errors */
        }
      }

      // Route based on role
      const { role: userRole } = jwtDecode(data.token) || {};
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
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="login-card">
        {/* Left illustration */}
        <div className="login-illustration">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            alt="illustration"
          />
        </div>

        {/* Right form */}
        <div className="login-form-side">
          <div className="social-row">
            <span className="social-label">Sign in with</span>
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

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
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
            )}

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
              />
            </div>

            {isRegister && (
              <div className="field">
                <label>Choose role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="client">Client</option>
                  <option value="prestataire">Prestataire</option>
                  <option value="vendeur">Vendeur</option>
                  <option value="livreur">Livreur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {!isRegister && (
              <div className="form-row">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a className="forgot" href="#">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary lg"
              disabled={submitting}
            >
              {submitting
                ? isRegister
                  ? "REGISTERING..."
                  : "LOGGING IN..."
                : isRegister
                ? "REGISTER"
                : "LOGIN"}
            </button>
          </form>

          <p className="swap-auth">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  className="link-btn"
                  onClick={() => setIsRegister(false)}
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don’t have an account?{" "}
                <button
                  className="link-btn danger"
                  onClick={() => setIsRegister(true)}
                >
                  Register
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Footer */}
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

export default AuthPage;
