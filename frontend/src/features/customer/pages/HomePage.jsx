import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaTruck, FaShieldAlt, FaGift, FaArrowRight } from "react-icons/fa";
import p1 from "@shared/assets/images/p1.png";
import p2 from "@shared/assets/images/p2.png";
import p3 from "@shared/assets/images/p3.png";
import p4 from "@shared/assets/images/p4.png";
import "@/features/customer/styles/customer-global.css";

function HomePage() {
  const products = [
    { img: p1, name: "Premium Cotton Shirt", price: 65, rating: 4.8, badge: "Bestseller" },
    { img: p2, name: "Elegant Summer Dress", price: 75, rating: 4.9, badge: "New" },
    { img: p3, name: "Classic Men's Watch", price: 80, rating: 4.7, badge: "Popular" },
    { img: p4, name: "Designer Handbag", price: 90, rating: 4.6, badge: "Trending" },
  ];

  const features = [
    {
      icon: <FaTruck />,
      title: "Free Shipping",
      description: "Free delivery on orders over $50"
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure Payment",
      description: "100% secure payment processing"
    },
    {
      icon: <FaGift />,
      title: "Best Quality",
      description: "Premium products guaranteed"
    }
  ];

  return (
    <>
      {/* Modern Hero Section */}
      <section className="hero-modern">
        <div className="hero-content">
          <div className="hero-badge">
            <FaStar />
            <span>Limited Time Offer</span>
          </div>
          <h1 className="hero-title">
            Discover Amazing
            <span className="gradient-text">Products</span>
          </h1>
          <p className="hero-subtitle">
            Shop the latest trends with unbeatable prices and premium quality.
            Free shipping on all orders over $50.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-large">
              Shop Now
              <FaArrowRight />
            </Link>
            <Link to="/about" className="btn btn-outline">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <img src={p1} alt="Featured Product" />
            <div className="floating-badge">20% OFF</div>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="features-modern">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Us</h2>
            <p>Experience the difference with our premium service and quality products</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Products Section */}
      <section className="products-modern">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Handpicked collection of our most popular items</p>
          </div>
          <div className="products-grid">
            {products.map((product, idx) => (
              <div key={idx} className="product-card">
                <div className="product-image">
                  <img src={product.img} alt={product.name} />
                  <div className="product-badge">{product.badge}</div>
                  <div className="product-overlay">
                    <button className="btn btn-primary btn-small">Add to Cart</button>
                  </div>
                </div>
                <div className="product-info">
                  <div className="product-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < Math.floor(product.rating) ? 'star filled' : 'star'}
                        />
                      ))}
                    </div>
                    <span className="rating-text">({product.rating})</span>
                  </div>
                  <h4 className="product-name">{product.name}</h4>
                  <div className="product-price">
                    <span className="price">${product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/products" className="btn btn-outline btn-large">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Newsletter Section */}
      <section className="newsletter-modern">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-info">
              <h2>Stay Updated</h2>
              <p>Get exclusive deals and new product announcements delivered to your inbox</p>
            </div>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;