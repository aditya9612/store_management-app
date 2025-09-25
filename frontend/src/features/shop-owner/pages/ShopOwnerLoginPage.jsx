import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@/features/shop-owner/styles/shop-owner-auth.css";
import { authService } from "@utils/api";
import { toast } from 'react-toastify';

function ShopOwnerLoginPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const ownerData = localStorage.getItem("owner_id");
    if (ownerData) {
      navigate("/shop-selector");
    }
  }, [navigate]);

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.requestOTP(mobile);
      setOtpSent(true);
      toast.success(result.message);
    } catch (error) {
      console.log('Error details:', error); // Debug log
      toast.error(error.message || 'An error occurred', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: '#FEE2E2', color: '#991B1B' }
      });
      setOtpSent(false); // Reset OTP sent state on error
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.verifyOTP(mobile, otp);
      
      // Store auth data
      localStorage.setItem("owner_id", result.data.owner_id);
      localStorage.setItem("owner_name", result.data.owner_name);
      localStorage.setItem("role", result.data.role);
      
      toast.success(result.message);
      navigate("/shop-selector");
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset OTP form
  const handleResendOTP = () => {
    setOtpSent(false);
    setOtp("");
  };

  return (
    <div className="auth-page">
      {/* Left Section - Content */}
      <div className="auth-content">
        <h1>Welcome to StoreHub</h1>
        <p className="lead">Manage your store efficiently with our powerful dashboard</p>
        
        <div className="features">
          <div className="feature-item">
            <i className="fas fa-chart-line"></i>
            <h3>Real-time Analytics</h3>
            <p>Track sales, inventory, and customer insights instantly</p>
          </div>
          
          <div className="feature-item">
            <i className="fas fa-users"></i>
            <h3>Customer Management</h3>
            <p>Build stronger relationships with your customers</p>
          </div>
          
          <div className="feature-item">
            <i className="fas fa-mobile-alt"></i>
            <h3>Mobile-First</h3>
            <p>Manage your store from anywhere, anytime</p>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="auth-form">
        <div className="form-container">
          <div className="form-header">
            <h2>Shop Owner Login</h2>
            <p>Enter your mobile number to continue</p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleRequestOTP}>
              <div className="form-group">
                <label>Mobile Number</label>
                <div className="input-group">
                  <span className="input-group-text">+91</span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                  />
                </div>
                <small className="form-text text-muted">
                  We'll send you a one-time password
                </small>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  className="form-control otp-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  pattern="[0-9]{6}"
                  maxLength="6"
                  required
                />
                <small className="form-text text-muted">
                  OTP sent to +91 {mobile}
                </small>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 mb-3"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button 
                type="button" 
                className="btn btn-link w-100"
                onClick={handleResendOTP}
                disabled={loading}
              >
                Didn't receive OTP? Try Again
              </button>
            </form>
          )}

          <div className="form-footer">
            <p>
              Having trouble? <a href="/contact">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopOwnerLoginPage;