import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaPaperPlane } from "react-icons/fa";
import logo from "@shared/assets/images/logo.png";
import "@shared/styles/shared-global.css";

export default function Footer() {
  return (
    <footer className="footer_section">
      <div className="container">
        <div className="row">
          {/* Left Column - Logo & Info */}
          <div className="col-md-4">
            <div className="footer-brand">
              <div className="logo_footer">
                <Link to="/">
                  <img width="120" src={logo} alt="logo" />
                </Link>
              </div>
              <div className="information_f">
                <div className="info-item">
                  <FaMapMarkerAlt />
                  <p>28 White tower, Street Name New York City, USA</p>
                </div>
                <div className="info-item">
                  <FaPhone />
                  <p>+91 987 654 3210</p>
                </div>
                <div className="info-item">
                  <FaEnvelope />
                  <p>yourmain@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Links */}
          <div className="col-md-5">
            <div className="footer-links">
              <div className="link-section">
                <h3>Quick Links</h3>
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/about">About</Link></li>
                  <li><Link to="/product">Services</Link></li>
                  <li><Link to="/blog">Blog</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                </ul>
              </div>
              <div className="link-section">
                <h3>Account</h3>
                <ul>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Register</Link></li>
                  <li><Link to="/profile">Profile</Link></li>
                  <li><Link to="/checkout">Checkout</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Social & Newsletter */}
          <div className="col-md-3">
            <div className="footer-social">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="#" className="social-link facebook">
                  <FaFacebookF />
                </a>
                <a href="#" className="social-link twitter">
                  <FaTwitter />
                </a>
                <a href="#" className="social-link instagram">
                  <FaInstagram />
                </a>
                <a href="#" className="social-link linkedin">
                  <FaLinkedinIn />
                </a>
                <a href="#" className="social-link youtube">
                  <FaYoutube />
                </a>
              </div>
              <div className="newsletter">
                <h4>Newsletter</h4>
                <p>Subscribe to get updates</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Your email" />
                  <button type="submit">
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="row">
            <div className="col-md-6">
              <p className="copyright">
                © 2024 Your Company. All rights reserved.
              </p>
            </div>
            <div className="col-md-6">
              <div className="footer-bottom-links">
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/cookies">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}