import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiHeart, FiPackage } from "react-icons/fi";
import logo from "@shared/assets/images/Logo1.png";
import "@shared/styles/Header.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);
  const togglerRef = useRef(null);
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole") || "";

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close when clicking outside or pressing Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        togglerRef.current &&
        !togglerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { path: "/", label: "Home", type: "main" },
    { path: "/product", label: "Products", type: "main" },
    { path: "/offers", label: "Offers", type: "main" },
    { path: "/about", label: "About", type: "secondary" },
    { path: "/contact", label: "Contact", type: "secondary" },
  ];

  return (
    <>
      <header className={`header ${isScrolled ? "scrolled" : ""}`}>
        <div className="header-container">
          {/* Brand Section */}
          <div className="header-brand">
            <Link to="/" className="brand-link" onClick={() => setIsOpen(false)}>
              <div className="brand-logo-container">
                <img src={logo} alt="StoreHub" className="brand-logo" />
              </div>
              <span className="brand-name">StoreHub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <div className="nav-sections">
              {/* Main Navigation */}
              <div className="nav-section main-nav">
                <ul className="nav-menu">
                  {navItems.filter(item => item.type === "main").map((item) => (
                    <li key={item.path} className="nav-item">
                      <Link
                        to={item.path}
                        className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Secondary Navigation */}
              <div className="nav-section secondary-nav">
                <ul className="nav-menu">
                  {navItems.filter(item => item.type === "secondary").map((item) => (
                    <li key={item.path} className="nav-item">
                      <Link
                        to={item.path}
                        className={`nav-link secondary ${location.pathname === item.path ? "active" : ""}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            ref={togglerRef}
            className={`mobile-toggle ${isOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-overlay ${isOpen ? "visible" : ""}`} onClick={() => setIsOpen(false)}>
        <div 
          className={`mobile-nav ${isOpen ? "slide-in" : ""}`} 
          ref={menuRef} 
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="mobile-header">
            <div className="mobile-brand">
              <img src={logo} alt="" className="mobile-logo" aria-hidden="true" />
              <span className="mobile-brand-name">StoreHub</span>
            </div>
            <button 
              className="mobile-close" 
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
          
          <div className="mobile-content">
            <nav className="mobile-menu">
              <div className="mobile-nav-section">
                <div className="mobile-nav-links">
                  {navItems.filter(item => item.type === "main").map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`mobile-link ${location.pathname === item.path ? "active" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mobile-nav-section">
                <div className="mobile-nav-links">
                  {navItems.filter(item => item.type === "secondary").map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`mobile-link ${location.pathname === item.path ? "active" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {isLoggedIn && userRole === "owner" && (
                <div className="mobile-nav-section">
                  <h3 className="mobile-nav-title">Management</h3>
                  <div className="mobile-nav-links">
                    <Link to="/dashboard" className="mobile-link" onClick={() => setIsOpen(false)}>
                      <FiPackage />
                      <span>Dashboard</span>
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}