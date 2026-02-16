import React from "react";

export default function AddShopTab({ shopFormData, setShopFormData, owners, loading, onSubmit }) {
  return (
    <div className="admin-section">
      <div className="section-header">
        <h1>Add Shop</h1>
        <p className="section-subtitle">Create a shop and assign it to an owner</p>
      </div>

      <form onSubmit={onSubmit} className="form-card form-card--compact">
        <div className="form-row">
          <div className="form-group">
            <label>Shop Name</label>
            <input
              type="text"
              value={shopFormData.name}
              onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Owner</label>
            <select
              value={shopFormData.owner_id}
              onChange={(e) => setShopFormData({ ...shopFormData, owner_id: e.target.value })}
              required
            >
              <option value="">Select owner</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={shopFormData.city}
              onChange={(e) => setShopFormData({ ...shopFormData, city: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={shopFormData.state}
              onChange={(e) => setShopFormData({ ...shopFormData, state: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Pincode</label>
            <input
              type="text"
              maxLength={6}
              value={shopFormData.pincode}
              onChange={(e) =>
                setShopFormData({
                  ...shopFormData,
                  pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>GSTIN (Optional)</label>
            <input
              type="text"
              value={shopFormData.gstin}
              onChange={(e) => setShopFormData({ ...shopFormData, gstin: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Full Address</label>
          <textarea
            rows={3}
            value={shopFormData.address}
            onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Shop"}
          </button>
        </div>
      </form>
    </div>
  );
}
