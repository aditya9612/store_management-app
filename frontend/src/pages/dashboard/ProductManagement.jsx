/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "@assets/css/dashboard.css";

export default function ProductManagement({ loggedInOwner, products, setProducts }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setFormData({ ...formData, image: reader.result });
    reader.readAsDataURL(file);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const newProduct = {
      id: Date.now(),
      name: formData.name,
      price: Number(formData.price),
      image: formData.image || "",
    };

    setProducts([...products, newProduct]);
    setFormData({ name: "", price: "", image: "" });
  };

  const handleDelete = (id) => setProducts(products.filter((p) => p.id !== id));

  return (
    <div className="product-management">
      <h1>Product Management 🛒</h1>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="form-card">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <button className="blue">Add Product</button>
      </form>

      {/* Product Grid */}
      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            {p.image ? (
              <img src={p.image} alt={p.name} className="product-image" />
            ) : (
              <div className="placeholder">No Image</div>
            )}
            <h3>{p.name}</h3>
            <p>Price: ₹{p.price}</p>
            <button className="red" onClick={() => handleDelete(p.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
