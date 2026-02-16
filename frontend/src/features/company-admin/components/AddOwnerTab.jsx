import React from "react";

export default function AddOwnerTab({ formData, setFormData, loading, onSubmit }) {
  return (
    <div className="admin-section">
      <div className="section-header">
        <h1>Add Owner</h1>
        <p className="section-subtitle">Create a new shop owner account</p>
      </div>

      <form onSubmit={onSubmit} className="form-card form-card--compact">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Mobile</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setFormData({ ...formData, mobile: value });
              }}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address (Optional)</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Owner"}
          </button>
        </div>
      </form>
    </div>
  );
}
