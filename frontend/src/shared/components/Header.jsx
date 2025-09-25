import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "@shared/assets/images/logo.png";
import "@shared/styles/Header.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const togglerRef = useRef(null);
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole") || "";

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
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

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/products", label: "Products" },
    { path: "/offers", label: "Offers" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Logo Section */}
          <div className="header-left">
            <Link to="/" className="logo" onClick={() => setIsOpen(false)}>
              <img src={logo} alt="StoreHub" className="logo-img" />
              <span className="logo-text">StoreHub</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <ul className="nav-list">
                {navItems.map((item) => (
                  <li
                    key={item.path}
                    className={`nav-item ${
                      location.pathname === item.path ? "active" : ""
                    }`}
                  >
                    <Link to={item.path} className="nav-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
                {isLoggedIn && userRole === "owner" && (
                  <li className="nav-item">
                    <Link to="/dashboard" className="nav-link dashboard-link">
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            ref={togglerRef}
            className={`mobile-menu-toggle ${isOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isOpen ? "open" : ""}`} ref={menuRef}>
        <div className="mobile-nav-content">
          {/* Mobile Navigation Links */}
          <ul className="mobile-nav-list">
            {navItems.map((item) => (
              <li
                key={item.path}
                className={`mobile-nav-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <Link to={item.path} className="mobile-nav-link" onClick={() => setIsOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            {isLoggedIn && userRole === "owner" && (
              <li className="mobile-nav-item">
                <Link to="/dashboard" className="mobile-nav-link" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}