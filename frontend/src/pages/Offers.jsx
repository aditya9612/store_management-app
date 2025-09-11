import React, { useState, useEffect } from "react";

export default function Offers() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const storedOffers = localStorage.getItem("offers");
    if (storedOffers) {
      setOffers(JSON.parse(storedOffers));
    }
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", fontFamily: "Arial" }}>
      <h1>Current Offers 🎁</h1>

      {offers.length === 0 ? (
        <p>No offers available at the moment.</p>
      ) : (
        <ul>
          {offers.map((offer) => (
            <li key={offer.id}>
              <strong>{offer.title}</strong> - {offer.description} - ₹
              {offer.price} - Expires: {offer.expiresAt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
