import React from "react";
import { FiShoppingBag, FiMapPin, FiUser } from "react-icons/fi";

export default function ManageShopsTab({
  loading,
  owners,
  selectedOwnerId,
  onChangeOwner,
  shops,
  onToggleStatus,
}) {
  return (
    <div className="admin-section">
      <div className="section-header">
        <h1>Manage Shops</h1>
        <p className="section-subtitle">Filter shops by owner and change status</p>
      </div>

      <div className="toolbar">
        <div className="form-group" style={{ maxWidth: 360 }}>
          <label>Owner</label>
          <select value={selectedOwnerId || ""} onChange={(e) => onChangeOwner(e.target.value)}>
            <option value="">Filter by Owner</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading shops...</p>
        </div>
      ) : (
        <div className="shops-grid">
          {shops.length > 0 ? (
            shops.map((shop) => (
              <div key={shop.id} className="shop-card">
                <div className="shop-card-header">
                  <FiShoppingBag className="shop-icon" />
                  <div className="shop-title">
                    <h3>{shop.name}</h3>
                    <span className={`status-badge ${shop.status}`}>{shop.status}</span>
                  </div>
                </div>

                <div className="shop-details">
                  <p>
                    <FiMapPin /> {shop.city}, {shop.state}
                  </p>
                  <p>
                    <FiUser /> Owner ID: {shop.owner_id}
                  </p>
                </div>

                <div className="shop-actions">
                  <button
                    type="button"
                    className={`btn-status ${shop.status === "active" ? "suspend" : "activate"}`}
                    onClick={() => onToggleStatus(shop)}
                  >
                    {shop.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No shops found.</div>
          )}
        </div>
      )}
    </div>
  );
}
