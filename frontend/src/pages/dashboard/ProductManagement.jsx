import React, { useState } from "react";
import "@assets/css/dashboard.css";

export default function ProductManagement({ products, setProducts }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
  });

  const [editingProduct, setEditingProduct] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const startEditing = (product) => setEditingProduct(product);

  const handleEditChange = (e) =>
    setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });

  const handleEditImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setEditingProduct({ ...editingProduct, image: reader.result });
    reader.readAsDataURL(file);
  };

  const saveEdit = () => {
    setProducts(
      products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: editingProduct.name,
              price: Number(editingProduct.price),
              image: editingProduct.image,
            }
          : p
      )
    );
    setEditingProduct(null);
  };

  const cancelEdit = () => setEditingProduct(null);

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
            {editingProduct && editingProduct.id === p.id ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={editingProduct.name}
                  onChange={handleEditChange}
                />
                <input
                  type="number"
                  name="price"
                  value={editingProduct.price}
                  onChange={handleEditChange}
                />
                <input type="file" accept="image/*" onChange={handleEditImage} />
                <button className="blue" onClick={saveEdit}>
                  Save
                </button>
                <button className="red" onClick={cancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="product-image" />
                ) : (
                  <div className="placeholder">No Image</div>
                )}
                <h3>{p.name}</h3>
                <p>Price: ₹{p.price}</p>
                <button className="blue" onClick={() => startEditing(p)}>
                  Edit
                </button>
                <button className="red" onClick={() => handleDelete(p.id)}>
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
