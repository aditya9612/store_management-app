import React from 'react';
import p1 from "@shared/assets/images/p1.png";
import p2 from "@shared/assets/images/p2.png";
import p3 from "@shared/assets/images/p3.png";
import p4 from "@shared/assets/images/p4.png";
import p5 from "@shared/assets/images/p5.png";
import p6 from "@shared/assets/images/p6.png";
import "@/features/customer/styles/customer-global.css";

export default function ProductPage() {
  const products = [
    { img: p1, name: "Men's Shirt", price: 75 },
    { img: p2, name: "Men's Shirt", price: 80 },
    { img: p3, name: "Women's Dress", price: 68 },
    { img: p4, name: "Men's Watch", price: 95 },
    { img: p5, name: "Women's Handbag", price: 58 },
    { img: p6, name: "Men's Shoes", price: 88 },
  ];

  return (
    <section className="container">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
        <h2>Our Products</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Check out our latest collection of high-quality products.</p>
      </div>
      <div className="grid grid-cols-4">
        {products.map((product, idx) => (
          <div key={idx} className="card">
            <img src={product.img} alt={product.name} />
            <div className="card-content">
              <h4>{product.name}</h4>
              <p style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>${product.price}</p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
