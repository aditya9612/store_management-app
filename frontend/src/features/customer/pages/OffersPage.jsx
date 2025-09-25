import React, { useState, useEffect } from "react";
import "@/features/customer/styles/customer-global.css";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    // Mock data since localStorage might be empty
    const mockOffers = [
      { id: 1, title: 'Summer Sale', description: 'Get 20% off on all summer collection items.', price: '20% Off', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { id: 2, title: 'Flash Deal', description: 'Limited time offer on select electronics.', price: 'Up to 50% Off', expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
    ];
    setOffers(mockOffers);
  }, []);

  return (
    <section className="container">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
        <h2>Our Special Offers</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Don't miss out on these exclusive deals!</p>
      </div>
      {offers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No offers available at the moment. Please check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {offers.map((o) => (
            <div key={o.id} className="card">
              <div className="card-content">
                <h3>{o.title}</h3>
                <p>{o.description}</p>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-success)', margin: 'var(--space-3) 0' }}>
                  {o.price}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Expires: {new Date(o.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
