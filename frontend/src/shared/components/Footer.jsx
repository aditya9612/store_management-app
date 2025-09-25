import { Link } from "react-router-dom";
import logo from "@shared/assets/images/logo.png";
import "@shared/styles/shared-global.css";

export default function Footer() {
  return (
    <footer className="footer_section">
      <div className="container">
        <div className="row">
          {/* Left Column */}
          <div className="col-md-4">
            <div className="full">
              <div className="logo_footer">
                <Link to="/">
                  <img width="210" src={logo} alt="logo" />
                </Link>
              </div>
              <div className="information_f">
                <p>
                  <strong>ADDRESS:</strong> 28 White tower, Street Name New York
                  City, USA
                </p>
                <p>
                  <strong>TELEPHONE:</strong> +91 987 654 3210
                </p>
                <p>
                  <strong>EMAIL:</strong> yourmain@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-8">
            <div className="row">
              {/* Menu Links */}
              <div className="col-md-7">
                <div className="row">
                  <div className="col-md-6">
                    <div className="widget_menu">
                      <h3>Menu</h3>
                      <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/product">Services</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/blog">Blog</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="widget_menu">
                      <h3>Account</h3>
                      <ul>
                        <li><a href="#">Account</a></li>
                        <li><a href="#">Checkout</a></li>
                        <li><a href="#">Register</a></li>
                        <li><a href="#">Shopping</a></li>
                        <li><a href="#">Widget</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </footer>
  );
}