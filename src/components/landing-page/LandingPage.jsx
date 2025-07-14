import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-hero">
        <h1>
          Bienvenue sur <span>BoxiClean</span>
        </h1>
        <p>
          Plateforme innovante pour réserver, gérer et suivre vos prestations de
          nettoyage, achats de produits et livraisons en Tunisie.
        </p>
        <div className="landing-buttons">
          <Link to="/login" className="btn-primary">
            Se connecter
          </Link>
          <Link to="/register" className="btn-secondary">
            Créer un compte
          </Link>
        </div>
      </header>

      <section className="features">
        <h2>Pourquoi choisir BoxiClean ?</h2>
        <div className="feature-grid">
          <div className="feature-item">
            <h3>✔️ Réservation simple</h3>
            <p>Réservez un service en quelques clics selon votre planning.</p>
          </div>
          <div className="feature-item">
            <h3>🚚 Livraison rapide</h3>
            <p>Produits d’hygiène livrés à domicile partout en Tunisie.</p>
          </div>
          <div className="feature-item">
            <h3>📊 Suivi en temps réel</h3>
            <p>
              Suivez vos prestations, commandes et paiements depuis votre
              tableau de bord.
            </p>
          </div>
        </div>
      </section>

      <section className="steps">
        <h2>Comment ça marche ?</h2>
        <div className="step-grid">
          <div className="step-item">
            <span>1</span>
            <p>Créez votre compte gratuitement</p>
          </div>
          <div className="step-item">
            <span>2</span>
            <p>Choisissez un service ou un produit</p>
          </div>
          <div className="step-item">
            <span>3</span>
            <p>Réservez et suivez vos prestations</p>
          </div>
        </div>
      </section>

      <section className="cta-final">
        <h2>Prêt à rendre votre quotidien plus propre ?</h2>
        <Link to="/register" className="btn-primary large">
          Commencer maintenant
        </Link>
      </section>

      <footer className="landing-footer">
        <p>© 2025 BoxiClean. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
