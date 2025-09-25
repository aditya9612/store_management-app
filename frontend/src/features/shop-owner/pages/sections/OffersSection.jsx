import React, { useState, useEffect } from "react";
import { authService, offersApi } from "@/utils/api";
import { toast } from "react-toastify";
import "@/features/shop-owner/styles/shop-owner-dashboard.css";
import "@/features/shop-owner/styles/offers-section.css";

export default function OffersSection({ selectedShop, offers, setOffers }) {
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);


  const handleCreateOffer = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target);
      
      const newOffer = {
        title: formData.get("title"),
        description: formData.get("description"),
        discount: parseFloat(formData.get("discount")),
        valid_until: formData.get("valid_until"),
        store_id: selectedShop.id
      };
      
      await offersApi.create(newOffer);
      toast.success("Offer created successfully!");
      setShowAddForm(false);
      const response = await offersApi.listByStore(selectedShop.id);
      setOffers(Array.isArray(response) ? response : []);
      e.target.reset();
    } catch (error) {
      toast.error("Failed to create offer");
      console.error(error);
    }
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    if (!editingOffer) return;

    try {
      const formData = new FormData(e.target);
      const updatedOffer = {
        title: formData.get("title"),
        description: formData.get("description"),
        discount: parseFloat(formData.get("discount")),
        valid_until: formData.get("valid_until"),
      };

      await offersApi.update(editingOffer.id, updatedOffer);
      toast.success("Offer updated successfully!");
      setEditingOffer(null);
      const response = await offersApi.listByStore(selectedShop.id);
      setOffers(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error("Failed to update offer");
      console.error(error);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      await offersApi.remove(offerId);
      toast.success("Offer deleted successfully!");
      // Refresh offers list by calling the function from props
      const response = await offersApi.listByStore(selectedShop.id);
      setOffers(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error("Failed to delete offer");
      console.error(error);
    }
    setShowDeleteConfirm(null);
  };

  const handleSendToAllCustomers = async (offerId) => {
    try {
      setSendingOffer(offerId);
      await offersApi.sendToAllCustomers(offerId);
      toast.success("Offer sent to all customers!");
    } catch (error) {
      toast.error("Failed to send offer");
      console.error(error);
    } finally {
      setSendingOffer(false);
    }
  };

  // Early return if no shop selected
  if (!selectedShop) {
    return (
      <div className="empty-state">
        <i className="fas fa-store-slash"></i>
        <h3>No Shop Selected</h3>
        <p>Please select a shop to manage offers.</p>
      </div>
    );
  }

  return (
    <div className="offers-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-gift"></i>
          Offers Management
        </h2>
        <button 
          className="add-btn"
          onClick={() => setShowAddForm(true)}
        >
          <i className="fas fa-plus"></i>
          Create New Offer
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-offer-form">
            <h3>
              <i className="fas fa-gift"></i>
              Create New Offer
            </h3>
            <form onSubmit={handleCreateOffer}>
              <div className="form-group">
                <label>
                  <i className="fas fa-tag"></i>
                  Title
                </label>
                <input 
                  name="title" 
                  type="text" 
                  required 
                  placeholder="e.g. Winter Sale"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-align-left"></i>
                  Description
                </label>
                <textarea 
                  name="description" 
                  required 
                  placeholder="e.g. 20% off on electronics"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-percent"></i>
                  Discount (%)
                </label>
                <input 
                  name="discount" 
                  type="number" 
                  min="1"
                  max="100"
                  required 
                  placeholder="e.g. 20"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-calendar-alt"></i>
                  Valid Until
                </label>
                <input 
                  name="valid_until" 
                  type="datetime-local" 
                  required 
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <i className="fas fa-check"></i>
                  Create Offer
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingOffer && (
        <div className="modal-overlay">
          <div className="add-offer-form">
            <h3>
              <i className="fas fa-edit"></i>
              Edit Offer
            </h3>
            <form onSubmit={handleUpdateOffer}>
              <div className="form-group">
                <label>
                  <i className="fas fa-tag"></i>
                  Title
                </label>
                <input 
                  name="title" 
                  type="text" 
                  required 
                  defaultValue={editingOffer.title}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-align-left"></i>
                  Description
                </label>
                <textarea 
                  name="description" 
                  required 
                  defaultValue={editingOffer.description}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-percent"></i>
                  Discount (%)
                </label>
                <input 
                  name="discount" 
                  type="number" 
                  min="1"
                  max="100"
                  required 
                  defaultValue={editingOffer.discount}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-calendar-alt"></i>
                  Valid Until
                </label>
                <input 
                  name="valid_until" 
                  type="datetime-local" 
                  required 
                  defaultValue={new Date(editingOffer.valid_until).toISOString().slice(0, 16)}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <i className="fas fa-check"></i>
                  Update Offer
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setEditingOffer(null)}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this offer?</p>
            <div className="form-actions">
              <button className="submit-btn" onClick={() => handleDeleteOffer(showDeleteConfirm)}>
                Confirm
              </button>
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="offers-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            Loading offers...
          </div>
        ) : (!offers || offers.length === 0) ? (
          <div className="empty-state">
            <i className="fas fa-gift"></i>
            <h3>No Offers Found</h3>
            <p>Create your first offer to attract more customers!</p>
          </div>
        ) : (
          <div className="offers-grid">
            {offers.map((offer) => {
              console.log('🎁 Rendering offer:', offer);
              return (
              <div key={offer.id} className="offer-card">
                <div className="offer-header">
                  <h3>{offer.title}</h3>
                  <span className="discount-badge">{offer.discount}% OFF</span>
                  <div className="offer-actions">
                    <button className="edit-btn" onClick={() => setEditingOffer(offer)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="delete-btn" onClick={() => setShowDeleteConfirm(offer.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <p className="offer-description">{offer.description}</p>
                <div className="offer-validity">
                  <i className="fas fa-clock"></i>
                  Valid until: {new Date(offer.valid_until).toLocaleDateString()} 
                  {new Date(offer.valid_until).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <button 
                  className="send-offer-btn"
                  onClick={() => handleSendToAllCustomers(offer.id)}
                  disabled={sendingOffer === offer.id}
                >
                  {sendingOffer === offer.id ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send to All Customers
                    </>
                  )}
                </button>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}