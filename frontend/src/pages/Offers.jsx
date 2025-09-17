import React, { useState, useEffect } from "react";

export default function Offers() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("offers");
    if (stored) {
      setOffers(JSON.parse(stored));
    }
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto" }}>
      <h1>Current Offers 🎁</h1>
      {offers.length === 0 ? (
        <p>No offers available at the moment.</p>
      ) : (
        <ul>
          {offers.map((o) => (
            <li key={o.id}>
              <b>{o.title}</b> - {o.description} - ₹{o.price} -{" "}
              Expires: {new Date(o.expiresAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
