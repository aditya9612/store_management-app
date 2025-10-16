import React, { useEffect, useState } from "react";
import "@/features/shop-owner/styles/product-management.css";
import { productsApi } from "@/utils/api";

export default function ProductManagementSection({ products, setProducts }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    const storeIdStr = localStorage.getItem('selectedStoreId');
    if (!storeIdStr) return;
    const store_id = parseInt(storeIdStr);
    const payload = {
      name: formData.name,
      price: formData.price,
      description: formData.description,
      store_id,
      imageFile
    };
    const resp = await productsApi.create(payload);
    setProducts([...(products || []), resp.data]);
    setFormData({ name: "", price: "", description: "" });
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    try {
      await productsApi.remove(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
    setShowDeleteConfirm(null);
  };

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

  const saveEdit = async () => {
    if (!editingProduct) return;

    const payload = {
      name: editingProduct.name,
      price: editingProduct.price,
      description: editingProduct.description,
      imageFile: editingProduct.imageFile
    };

    try {
      const resp = await productsApi.update(editingProduct.id, payload);
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? resp.data : p))
      );
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
    }
  };

  const cancelEdit = () => setEditingProduct(null);

  useEffect(() => {
    const storeIdStr = localStorage.getItem('selectedStoreId');
    if (!storeIdStr) return;
    productsApi.list(parseInt(storeIdStr)).then((resp) => setProducts(resp.data || []));
  }, [setProducts]);

  return (
    <div className="product-management">
      <h1><i className="fas fa-box-open"></i> Product Management</h1>

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
        <input
          type="text"
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
        />
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <button className="blue"><i className="fas fa-plus"></i> Add Product</button>
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
                {p.image_path ? (
                  <img src={`http://localhost:8000${p.image_path}`} alt={p.name} className="product-image" />
                ) : (
                  <div className="placeholder">No Image</div>
                )}
                <h3>{p.name}</h3>
                <p>Price: ₹{p.price}</p>
                {p.description && <p>{p.description}</p>}
                <button className="blue" onClick={() => startEditing(p)}>
                  Edit
                </button>
                <button className="red" onClick={() => setShowDeleteConfirm(p.id)}>
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this product?</p>
            <div className="form-actions">
              <button className="submit-btn" onClick={() => handleDelete(showDeleteConfirm)}>
                Confirm
              </button>
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}