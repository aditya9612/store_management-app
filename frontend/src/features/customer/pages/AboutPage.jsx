import React from 'react';
import "@/features/customer/styles/customer-global.css";

export default function AboutPage() {
  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
        <h2>About Our Store</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '800px', margin: '0 auto' }}>
          We are committed to providing you with the best shopping experience. Our store offers a curated selection of high-quality products, fast shipping, and exceptional customer service. Learn more about what makes us special.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-content">
          <h3>Our Mission</h3>
          <p>
            Our mission is to bring you the latest trends and timeless classics at affordable prices. We believe that style should be accessible to everyone, and we work hard to source products that are both fashionable and durable. We are passionate about quality and dedicated to ensuring every customer is satisfied with their purchase.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
        <h2>Why Shop With Us?</h2>
      </div>

      <div className="grid grid-cols-3">
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-content">
            <h3>Fast Delivery</h3>
            <p>We ensure quick and reliable delivery for all your orders, right to your doorstep.</p>
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-content">
            <h3>Free Shipping</h3>
            <p>Enjoy free shipping on all products with no hidden charges or minimum purchase.</p>
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-content">
            <h3>Best Quality</h3>
            <p>We deliver only the highest quality products, sourced from trusted suppliers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}