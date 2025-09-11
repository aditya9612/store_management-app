import React, { useState, useEffect } from "react";

export default function OffersAdmin() {
  const [offers, setOffers] = useState([]);

  // Load saved offers from localStorage on mount
  useEffect(() => {
    const storedOffers = localStorage.getItem("offers");
    if (storedOffers) {
      setOffers(JSON.parse(storedOffers));
    }
  }, []);

  // Add new offer
  const handleAddOffer = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newOffer = {
      id: Date.now(),
      title: formData.get("title"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price")),
      expiresAt: new Date(formData.get("expiresAt")).toLocaleString(),
    };

    const updatedOffers = [newOffer, ...offers];

    // Save in state + localStorage
    setOffers(updatedOffers);
    localStorage.setItem("offers", JSON.stringify(updatedOffers));

    e.target.reset();
  };

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "Arial" }}>
      <h1>Offer Management 🎁</h1>

      {/* Offer creation form */}
      <form onSubmit={handleAddOffer} style={{ marginBottom: "20px" }}>
        <input type="text" name="title" placeholder="Offer Title" required />
        <textarea name="description" placeholder="Offer Description" required />
        <input type="number" name="price" placeholder="Offer Price (₹)" required />
        <input type="datetime-local" name="expiresAt" required />
        <button type="submit">Create Offer</button>
      </form>

      {/* List of created offers (admin view) */}
      <ul>
        {offers.length === 0 && <p>No offers created yet.</p>}
        {offers.map((offer) => (
          <li key={offer.id}>
            <strong>{offer.title}</strong> - {offer.description} - ₹
            {offer.price} - Expires: {offer.expiresAt}
          </li>
        ))}
      </ul>
    </div>
  );
}
