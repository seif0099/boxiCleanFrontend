import React, { useState } from "react";
import axios from "axios";
import "./productForm.css"; // Assuming you have some styles for the form
const AddProductForm = () => {
  const [product, setProduct] = useState({
    nom: "",
    description: "",
    prix: "",
    stock: "",
    categorie: "",
    code_barres: "",
  });

  const [imageBase64, setImageBase64] = useState("");

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(",")[1];
        setImageBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...product,
      image_base64: imageBase64,
    };

    try {
      await axios.post("http://localhost:5000/seller/products", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      alert("Produit ajouté !");
      setProduct({
        nom: "",
        description: "",
        prix: "",
        stock: "",
        categorie: "",
        code_barres: "",
      });
      setImageBase64("");
    } catch (err) {
      console.error("Erreur:", err);
      alert("Échec de l'ajout.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-product-form">
      <h2 className="text-xl font-semibold mb-4">Ajouter un Produit</h2>

      <input
        type="text"
        name="nom"
        placeholder="Nom du produit"
        className="input"
        value={product.nom}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        className="input"
        value={product.description}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="prix"
        placeholder="Prix (€)"
        className="input"
        value={product.prix}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="stock"
        placeholder="Quantité en stock"
        className="input"
        value={product.stock}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="categorie"
        placeholder="Catégorie"
        className="input"
        value={product.categorie}
        onChange={handleChange}
      />
      <input
        type="text"
        name="code_barres"
        placeholder="Code-barres"
        className="input"
        value={product.code_barres}
        onChange={handleChange}
      />
      <input
        type="file"
        accept="image/*"
        className="input"
        onChange={handleImageChange}
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded mt-4"
      >
        Ajouter
      </button>
    </form>
  );
};

export default AddProductForm;
