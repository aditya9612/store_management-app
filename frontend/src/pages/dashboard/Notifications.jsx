// src/dashboard/NotificationsAdmin.jsx
import React, { useState } from "react";

export default function NotificationsAdmin() {
  const [offerMessage, setOfferMessage] = useState("");

  // Example customer list (you can replace this with real data)
  const customers = [
    { name: "John Doe", phone: "9876543210" },
    { name: "Jane Smith", phone: "9876501234" },
  ];

  const sendSMS = () => {
    if (!offerMessage) return alert("Enter a message first!");
    // Replace this with real SMS API integration
    alert(`Message sent via SMS to ${customers.length} customers:\n${offerMessage}`);
  };

  const sendWhatsApp = () => {
    if (!offerMessage) return alert("Enter a message first!");
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(offerMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="notifications-admin">
      <h1>Send Offers 📢</h1>
      <textarea
        value={offerMessage}
        onChange={(e) => setOfferMessage(e.target.value)}
        placeholder="Write your offer message here"
        rows={5}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <div className="notification-buttons">
        <button className="blue" onClick={sendSMS}>
          Send via SMS
        </button>
        <button className="green" onClick={sendWhatsApp} style={{ marginLeft: "10px" }}>
          Send via WhatsApp
        </button>
      </div>
    </div>
  );
}
