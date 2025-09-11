import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@assets/images/logo.png";
import "@assets/css/Header.css"; // Import CSS with alias

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="header_section">
      <div className="container">
        <nav className="navbar custom_nav-container">
          {/* Logo */}
          <Link className="navbar-brand" to="/">
            <img width="250" src={logo} alt="logo" />
          </Link>

          {/* Hamburger Toggle */}
          <button
            className={`navbar-toggler ${isOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>

          {/* Collapsible Nav */}
          <div className={`navbar-menu ${isOpen ? "show" : ""}`}>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={() => setIsOpen(false)}>Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about" onClick={() => setIsOpen(false)}>About</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/product" onClick={() => setIsOpen(false)}>Products</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/blog" onClick={() => setIsOpen(false)}>Offers</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={() => setIsOpen(false)}>Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
