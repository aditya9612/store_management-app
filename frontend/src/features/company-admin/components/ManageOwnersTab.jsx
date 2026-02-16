import React from "react";
import { FiSearch, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ManageOwnersTab({
  loading,
  owners,
  filteredOwners,
  ownerSearchTerm,
  onSearch,
  editingOwner,
  setEditingOwner,
  onSubmitUpdate,
  onDelete,
  formatDate,
}) {
  return (
    <div className="admin-section">
      <div className="section-header">
        <h1>Manage Owners</h1>
        <p className="section-subtitle">Search, edit and remove owners</p>
      </div>

      <div className="toolbar">
        <div className="search-box search-box--compact">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search owners..."
            value={ownerSearchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="search-input"
          />
          {ownerSearchTerm && (
            <button className="clear-search" type="button" onClick={() => onSearch("")}>
              <FiX />
            </button>
          )}
        </div>

        <div className="stats-badge">
          <span className="stats-count">{filteredOwners.length}</span>
          <span className="stats-label">Owners</span>
        </div>
      </div>

      {loading && filteredOwners.length === 0 ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading owners...</p>
        </div>
      ) : filteredOwners.length > 0 ? (
        <div className="owners-grid">
          {filteredOwners.map((owner) =>
            editingOwner && editingOwner.id === owner.id ? (
              <div key={owner.id} className="owner-card editing">
                <div className="owner-card-header">
                  <h3>Edit Owner</h3>
                  <button onClick={() => setEditingOwner(null)} className="close-btn" type="button">
                    ×
                  </button>
                </div>

                <form onSubmit={onSubmitUpdate} className="owner-edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={editingOwner.name}
                        onChange={(e) => setEditingOwner({ ...editingOwner, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editingOwner.email}
                        onChange={(e) => setEditingOwner({ ...editingOwner, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Mobile</label>
                      <input
                        type="tel"
                        value={editingOwner.mobile}
                        onChange={(e) =>
                          setEditingOwner({
                            ...editingOwner,
                            mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        value={editingOwner.address || ""}
                        onChange={(e) => setEditingOwner({ ...editingOwner, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>New Password (Optional)</label>
                      <input
                        type="password"
                        placeholder="Leave empty to keep current"
                        value={editingOwner.password || ""}
                        onChange={(e) => setEditingOwner({ ...editingOwner, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? "Updating..." : "Update"}
                    </button>
                    <button type="button" onClick={() => setEditingOwner(null)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div key={owner.id} className="owner-card">
                <div className="owner-card-header">
                  <div className="owner-avatar">
                    <FiUser size={24} />
                  </div>
                  <div className="owner-info">
                    <h3>{owner.name}</h3>
                    <div className="owner-meta">
                      <span className="owner-id">ID: #{owner.id}</span>
                      <span className="owner-join-date">Joined {formatDate(owner.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="owner-details">
                  <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <span className="detail-value">{owner.email}</span>
                  </div>
                  <div className="detail-item">
                    <FiPhone className="detail-icon" />
                    <span className="detail-value">{owner.mobile}</span>
                  </div>
                  {owner.address && (
                    <div className="detail-item">
                      <FiMapPin className="detail-icon" />
                      <span className="detail-value">{owner.address}</span>
                    </div>
                  )}
                </div>

                <div className="owner-actions">
                  <button onClick={() => setEditingOwner(owner)} className="btn-icon edit" type="button">
                    <FiEdit2 />
                  </button>
                  <button className="btn-icon danger" onClick={() => onDelete(owner.id)} type="button">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No owners found</h3>
          <p>Try changing the search term.</p>
        </div>
      )}
    </div>
  );
}
