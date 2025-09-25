import React, { useState, useEffect } from "react";
import { AuthService } from "@utils/auth";
import "@/features/shop-owner/styles/notifications-section.css";

export default function NotificationsSection({ offers, customers, loggedInOwner, selectedShop }) {
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Pre-fill message when an offer is selected
  useEffect(() => {
    if (selectedOfferId) {
      const offer = offers.find(o => o.id === parseInt(selectedOfferId));
      if (offer) {
        setCustomMessage(`🎁 ${offer.title}: ${offer.description} - ${offer.discount}% OFF! Valid until ${new Date(offer.valid_until).toLocaleDateString()}.`);
      }
    } else {
      setCustomMessage('');
    }
  }, [selectedOfferId, offers]);

  const handleSendMessage = (platform) => {
    if (!customMessage) {
      alert('Please select an offer or write a message.');
      return;
    }
    
    if (platform === 'sms') {
      alert(`Message sent via SMS to ${customers.length} customers:\n${customMessage}`);
    } else if (platform === 'whatsapp') {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(customMessage)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <div className="notifications-admin">
      <h1><i className="fas fa-paper-plane"></i> Send Offers</h1>

      <div className="notification-composer">
        <h3><i className="fas fa-pen-alt"></i> Create a Notification</h3>
        <div className="form-group">
          <label>Select an Offer (optional)</label>
          <select 
            value={selectedOfferId} 
            onChange={(e) => setSelectedOfferId(e.target.value)}
            className="offer-select"
          >
            <option value="">-- Select an Offer --</option>
            {offers.map(offer => (
              <option key={offer.id} value={offer.id}>{offer.title}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Notification Message</label>
          <textarea 
            value={customMessage} 
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Write your custom message here..."
            rows="5"
            className="message-input"
          />
        </div>
        <div className="send-buttons">
          <button className="btn-sms" onClick={() => handleSendMessage('sms')}>
            <i className="fas fa-sms"></i> Send to {customers.length} via SMS
          </button>
          <button className="btn-whatsapp" onClick={() => handleSendMessage('whatsapp')}>
            <i className="fab fa-whatsapp"></i> Send to {customers.length} via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}