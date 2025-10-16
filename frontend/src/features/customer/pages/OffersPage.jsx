import React, { useState, useEffect } from "react";
import { FaBolt, FaGift, FaClock, FaTag, FaFire, FaStar, FaCalendarAlt } from "react-icons/fa";
import "@/features/customer/styles/customer-global.css";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    // Enhanced mock data with more variety
    const mockOffers = [
      {
        id: 1,
        title: 'Mega Summer Sale',
        description: 'Unbelievable discounts on summer collection',
        originalPrice: '$99',
        offerPrice: '$49',
        discount: '50% OFF',
        category: 'seasonal',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        featured: true,
        image: 'summer-sale'
      },
      {
        id: 2,
        title: 'Flash Electronics Deal',
        description: 'Limited time offer on premium electronics',
        originalPrice: '$299',
        offerPrice: '$199',
        discount: '$100 OFF',
        category: 'flash',
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        featured: false,
        image: 'electronics'
      },
      {
        id: 3,
        title: 'New Customer Special',
        description: 'Welcome offer for first-time shoppers',
        originalPrice: '$50',
        offerPrice: '$25',
        discount: '50% OFF',
        category: 'new-customer',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        featured: false,
        image: 'welcome'
      },
      {
        id: 4,
        title: 'Weekend Flash Sale',
        description: '48-hour weekend extravaganza',
        originalPrice: '$150',
        offerPrice: '$89',
        discount: '41% OFF',
        category: 'weekend',
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        featured: false,
        image: 'weekend'
      },
      {
        id: 5,
        title: 'Holiday Special',
        description: 'Celebrate the season with amazing deals',
        originalPrice: '$200',
        offerPrice: '$129',
        discount: '35% OFF',
        category: 'seasonal',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        featured: false,
        image: 'holiday'
      },
      {
        id: 6,
        title: 'Student Discount',
        description: 'Exclusive offer for students with valid ID',
        originalPrice: '$75',
        offerPrice: '$52',
        discount: '30% OFF',
        category: 'student',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        featured: false,
        image: 'student'
      }
    ];
    setOffers(mockOffers);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {};
      offers.forEach(offer => {
        const now = new Date().getTime();
        const distance = offer.expiresAt.getTime() - now;

        if (distance > 0) {
          newTimeLeft[offer.id] = {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          };
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [offers]);

  const categories = [
    { id: 'all', label: 'All Offers', icon: <FaTag /> },
    { id: 'flash', label: 'Flash Sales', icon: <FaBolt /> },
    { id: 'seasonal', label: 'Seasonal', icon: <FaCalendarAlt /> },
    { id: 'new-customer', label: 'New Customer', icon: <FaStar /> },
  ];

  const filteredOffers = activeCategory === 'all'
    ? offers
    : offers.filter(offer => offer.category === activeCategory);

  const featuredOffer = offers.find(offer => offer.featured);

  return (
    <div className="offers-page">
      {/* Hero Section with Featured Offer */}
      {featuredOffer && (
        <section className="offers-hero">
          <div className="container">
            <div className="featured-offer-card">
              <div className="featured-badge">
                <FaFire />
                <span>FEATURED DEAL</span>
              </div>
              <div className="featured-content">
                <h1>{featuredOffer.title}</h1>
                <p>{featuredOffer.description}</p>
                <div className="featured-pricing">
                  <div className="original-price">{featuredOffer.originalPrice}</div>
                  <div className="offer-price">{featuredOffer.offerPrice}</div>
                  <div className="discount-badge">{featuredOffer.discount}</div>
                </div>
                {timeLeft[featuredOffer.id] && (
                  <div className="countdown-timer">
                    <div className="timer-unit">
                      <span className="timer-number">{timeLeft[featuredOffer.id].days}</span>
                      <span className="timer-label">Days</span>
                    </div>
                    <div className="timer-unit">
                      <span className="timer-number">{timeLeft[featuredOffer.id].hours}</span>
                      <span className="timer-label">Hours</span>
                    </div>
                    <div className="timer-unit">
                      <span className="timer-number">{timeLeft[featuredOffer.id].minutes}</span>
                      <span className="timer-label">Minutes</span>
                    </div>
                    <div className="timer-unit">
                      <span className="timer-number">{timeLeft[featuredOffer.id].seconds}</span>
                      <span className="timer-label">Seconds</span>
                    </div>
                  </div>
                )}
                <button className="featured-cta">Shop Now</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Filter */}
      <section className="offers-categories">
        <div className="container">
          <div className="categories-filter">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="offers-grid-section">
        <div className="container">
          <div className="section-header">
            <h2>Available Offers</h2>
            <p>Discover amazing deals and save big on your favorite products</p>
          </div>

          {filteredOffers.length === 0 ? (
            <div className="no-offers">
              <div className="no-offers-icon">
                <FaGift />
              </div>
              <h3>No offers available in this category</h3>
              <p>Check back later for new deals or browse all offers.</p>
            </div>
          ) : (
            <div className="offers-grid">
              {filteredOffers.map((offer) => (
                <div key={offer.id} className={`offer-card ${offer.featured ? 'featured' : ''}`}>
                  <div className="offer-badge">
                    {offer.category === 'flash' && <FaBolt />}
                    {offer.category === 'seasonal' && <FaCalendarAlt />}
                    {offer.category === 'new-customer' && <FaStar />}
                    {offer.category === 'weekend' && <FaClock />}
                    <span className="badge-text">
                      {offer.category === 'flash' && 'FLASH SALE'}
                      {offer.category === 'seasonal' && 'SEASONAL'}
                      {offer.category === 'new-customer' && 'NEW CUSTOMER'}
                      {offer.category === 'weekend' && 'WEEKEND DEAL'}
                      {offer.category === 'student' && 'STUDENT'}
                    </span>
                  </div>

                  <div className="offer-content">
                    <h3>{offer.title}</h3>
                    <p>{offer.description}</p>

                    <div className="offer-pricing">
                      <div className="pricing-info">
                        <span className="original-price">{offer.originalPrice}</span>
                        <span className="offer-price">{offer.offerPrice}</span>
                      </div>
                      <div className="discount-tag">{offer.discount}</div>
                    </div>

                    {timeLeft[offer.id] && (
                      <div className="mini-countdown">
                        <div className="mini-timer">
                          <span>{timeLeft[offer.id].days}d</span>
                          <span>{timeLeft[offer.id].hours}h</span>
                          <span>{timeLeft[offer.id].minutes}m</span>
                        </div>
                      </div>
                    )}

                    <button className="offer-cta">
                      Claim Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="offers-cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Never Miss a Deal</h2>
              <p>Join our newsletter to get exclusive offers and early access to sales</p>
            </div>
            <div className="cta-form">
              <input type="email" placeholder="Enter your email" />
              <button className="cta-btn">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
