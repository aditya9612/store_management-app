import React from "react";
import { Link } from "react-router-dom"; // Assuming you use React Router for navigation
import p1 from "@shared/assets/images/p1.png";
import p2 from "@shared/assets/images/p2.png";
import p3 from "@shared/assets/images/p3.png";
import p4 from "@shared/assets/images/p4.png";
import "@/features/customer/styles/customer-global.css";

function HomePage() {
  const products = [
    { img: p1, name: "Men's Shirt", price: 65 },
    { img: p2, name: "Women's Dress", price: 75 },
    { img: p3, name: "Men's Watch", price: 80 },
    { img: p4, name: "Women's Handbag", price: 90 },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>
            <span>Sale 20% Off</span>
            <br />
            On Everything
          </h1>
          <p>
            Grab the best deals today with exclusive discounts on all products.
          </p>
          <Link to="/products" className="btn btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Why Shop With Us Section */}
      <section className="container">
        <div className="heading">
          <h2>Why Shop With Us</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="card">
            <div className="card-content">
              <h3>Fast Delivery</h3>
              <p>We ensure quick and reliable delivery for all your orders.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <h3>Free Shipping</h3>
              <p>Enjoy free shipping on all products with no hidden charges.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <h3>Best Quality</h3>
              <p>We deliver only the highest quality products for our customers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container">
        <div className="heading">
          <h2>Featured Products</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {products.map((product, idx) => (
            <div key={idx} className="card">
              <img src={product.img} alt={product.name} />
              <div className="card-content">
                <h4>{product.name}</h4>
                <p style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>${product.price}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <Link to="/products" className="btn btn-secondary">
            View All Products
          </Link>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="container bg-surface p-6">
        <div className="heading text-center">
          <h2>Subscribe To Get Discount Offers</h2>
        </div>
        <p className="text-center">
          Sign up to receive the latest news, exclusive deals, and special offers
          directly in your inbox.
        </p>
        <form 
          onSubmit={(e) => e.preventDefault()} 
          className="flex items-center justify-center gap-2 mt-4"
        >
          <input 
            type="email" 
            placeholder="Enter your email" 
            required 
            className="form-input flex-1"
          />
          <button type="submit" className="btn btn-primary">
            Subscribe
          </button>
        </form>
      </section>
    </>
  );
}

export default HomePage;