/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";

export default function Notifications({ loggedInOwner, selectedShop }) {
  const [customers, setCustomers] = useState([]);
  const [offers, setOffers] = useState([]);

  if (!loggedInOwner || !selectedShop) return <p>Please select a shop.</p>;

  const shopKey = `${loggedInOwner.id}_${selectedShop.id}`;

  // Load customers for the selected shop
  useEffect(() => {
    const storedCustomers = localStorage.getItem(`customers_${shopKey}`);
    if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
    else setCustomers([]);
  }, [shopKey]);

  // Load offers initially and listen for updates
  useEffect(() => {
    const loadOffers = () => {
      const storedOffers = localStorage.getItem(`offers_${shopKey}`);
      if (storedOffers) setOffers(JSON.parse(storedOffers));
      else setOffers([]);
    };

    loadOffers();

    const handleOffersUpdated = (e) => {
      if (e.detail.shopKey === shopKey) setOffers(e.detail.updatedOffers);
    };

    window.addEventListener("offersUpdated", handleOffersUpdated);
    return () => window.removeEventListener("offersUpdated", handleOffersUpdated);
  }, [shopKey]);

  // Send SMS for a specific offer
  const sendSMS = (offer) => {
    const message = `🎁 ${offer.title}: ${offer.description} - ₹${offer.price}`;
    alert(`Message sent via SMS to ${customers.length} customers:\n${message}`);
  };

  // Send WhatsApp for a specific offer
  const sendWhatsApp = (offer) => {
    const message = `🎁 ${offer.title}: ${offer.description} - ₹${offer.price}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="notifications-admin">
      <h1>Send Offers 📢</h1>

      {offers.length > 0 ? (
        <div style={{ marginBottom: "15px" }}>
          <h3>Latest Offers</h3>
          <ul>
            {offers.map((o) => (
              <li key={o.id} style={{ marginBottom: "10px" }}>
                <b>{o.title}</b> - {o.description} - ₹{o.price} -{" "}
                {new Date(o.expiresAt).toLocaleString()}
                <div style={{ marginTop: "5px" }}>
                  <button className="blue" onClick={() => sendSMS(o)}>
                    Send via SMS
                  </button>
                  <button
                    className="green"
                    style={{ marginLeft: "10px" }}
                    onClick={() => sendWhatsApp(o)}
                  >
                    Send via WhatsApp
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No offers created yet.</p>
      )}
    </div>
  );
}
