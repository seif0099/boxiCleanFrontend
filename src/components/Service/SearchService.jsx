import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchService.css";

const SearchService = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ville, setVille] = useState("");
  const [region, setRegion] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:5000/services");
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error("Erreur de chargement des services", error);
      }
    };

    fetchServices();
  }, []);

  const handleDetails = (id) => {
    navigate(`/service/${id}`);
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.nom_service
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesMin =
      minPrice === "" || service.prix_base >= parseFloat(minPrice);
    const matchesMax =
      maxPrice === "" || service.prix_base <= parseFloat(maxPrice);

    const matchesVille =
      ville === "" ||
      service.ville?.toLowerCase().includes(ville.toLowerCase());

    const matchesRegion =
      region === "" ||
      service.region?.toLowerCase().includes(region.toLowerCase());

    return (
      matchesSearch && matchesMin && matchesMax && matchesVille && matchesRegion
    );
  });

  return (
    <div className="search-service-container">
      <h2 className="search-title">🔍 Rechercher un service</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔎 Nom du service"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="number"
          placeholder="Prix min"
          className="price-input"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Prix max"
          className="price-input"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          type="text"
          placeholder="Ville"
          className="location-input"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
        />
        <input
          type="text"
          placeholder="Région"
          className="location-input"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
      </div>

      <div className="services-grid">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="service-card"
            onClick={() => handleDetails(service.id)}
          >
            <h3 className="service-name">{service.nom_service}</h3>
            <p className="service-description">{service.description}</p>
            <p className="service-price">{service.prix_base} TND</p>
            <p className="service-location">
              {service.ville}, {service.region}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchService;
