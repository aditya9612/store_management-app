import React from 'react';
import { FaUsers, FaAward, FaGlobe, FaHeart, FaTruck, FaShieldAlt, FaStar } from 'react-icons/fa';
import "@/features/customer/styles/customer-global.css";

export default function AboutPage() {
  const stats = [
    { number: '10K+', label: 'Happy Customers', icon: <FaUsers /> },
    { number: '500+', label: 'Products', icon: <FaAward /> },
    { number: '50+', label: 'Countries', icon: <FaGlobe /> },
    { number: '5+', label: 'Years Experience', icon: <FaStar /> },
  ];

  const values = [
    {
      icon: <FaHeart />,
      title: 'Customer First',
      description: 'We prioritize our customers\' needs and satisfaction above everything else.'
    },
    {
      icon: <FaTruck />,
      title: 'Fast Delivery',
      description: 'Lightning-fast shipping ensures you get your orders when you need them.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Quality Guaranteed',
      description: 'Every product undergoes rigorous quality checks before reaching you.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaStar />
              <span>Since 2019</span>
            </div>
            <h1 className="hero-title">
              About <span className="gradient-text">StoreHub</span>
            </h1>
            <p className="hero-description">
              We're passionate about bringing you the latest trends and timeless classics at affordable prices.
              Our mission is to make quality fashion accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">
                  {stat.icon}
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stat.number}</h3>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our Story</h2>
              <p className="story-text">
                Founded in 2019, StoreHub began as a small online boutique with a simple mission:
                to make high-quality fashion accessible to everyone. What started as a passion project
                has grown into a trusted brand serving customers in over 50 countries.
              </p>
              <p className="story-text">
                We believe that great style shouldn't break the bank. That's why we work directly
                with manufacturers and designers to bring you premium products at fair prices,
                without compromising on quality or ethics.
              </p>
            </div>
            <div className="story-visual">
              <div className="story-image">
                <div className="image-placeholder">
                  <FaAward />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose StoreHub?</h2>
            <p>We're committed to providing an exceptional shopping experience</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">
                  {value.icon}
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p className="mission-text">
              To democratize fashion by making premium quality products accessible to everyone,
              regardless of budget or location. We believe that great style should be inclusive,
              sustainable, and bring joy to people's lives.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}