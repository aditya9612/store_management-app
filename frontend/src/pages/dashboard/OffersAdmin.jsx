import React, { useState, useEffect } from "react";

export default function OffersAdmin() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("offers");
    if (stored) {
      setOffers(JSON.parse(stored));
    }
  }, []);

  const handleAddOffer = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newOffer = {
      id: Date.now(),
      title: formData.get("title"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price")),
      expiresAt: formData.get("expiresAt"), // keep as ISO string
    };

    const updated = [newOffer, ...offers];
    setOffers(updated);
    localStorage.setItem("offers", JSON.stringify(updated));

    e.target.reset();
  };

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto" }}>
      <h1>Offer Management 🎁</h1>
      <form onSubmit={handleAddOffer}>
        <input type="text" name="title" placeholder="Offer Title" required />
        <textarea name="description" placeholder="Description" required />
        <input type="number" name="price" placeholder="Price ₹" required />
        <input type="datetime-local" name="expiresAt" required />
        <button type="submit">Create Offer</button>
      </form>

      <h2>Created Offers</h2>
      {offers.length === 0 ? (
        <p>No offers created.</p>
      ) : (
        <ul>
          {offers.map((o) => (
            <li key={o.id}>
              <b>{o.title}</b> - {o.description} - ₹{o.price} -{" "}
              {new Date(o.expiresAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
