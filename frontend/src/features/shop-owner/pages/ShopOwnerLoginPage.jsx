import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import '@/features/shop-owner/styles/shop-owner-auth.css';
import {authService} from '@utils/api';
import {toast} from 'react-toastify';

function ShopOwnerLoginPage () {
  const [mobile, setMobile] = useState ('');
  const [otp, setOtp] = useState ('');
  const [otpSent, setOtpSent] = useState (false);
  const [loading, setLoading] = useState (false);
  const navigate = useNavigate ();

  // Check if already logged in and route appropriately
  useEffect (
    () => {
      const ownerId = localStorage.getItem ('owner_id');
      if (ownerId) {
        // Check if we have a selected shop (from previous session)
        const selectedStoreId = localStorage.getItem('selectedStoreId');
        if (selectedStoreId) {
          navigate ('/dashboard');
        } else {
          // No shop selected, need to check shop count
          const checkAndRoute = async () => {
            try {
              const shopsResponse = await authService.getShops(ownerId);
              const shops = Array.isArray(shopsResponse.data) ? shopsResponse.data : [];

              if (shops.length > 1) {
                navigate ('/shop-selector');
              } else if (shops.length === 1) {
                const singleShop = shops[0];
                localStorage.setItem("selectedStoreId", singleShop.id.toString());
                navigate ('/dashboard');
              } else {
                navigate ('/shop-selector'); // No shops, let user add them
              }
            } catch (error) {
              console.error('Error checking shops:', error);
              navigate ('/shop-selector'); // Default to shop selector on error
            }
          };
          checkAndRoute();
        }
      }
    },
    [navigate]
  );

  // Request OTP
  const handleRequestOTP = async e => {
    e.preventDefault ();
    setLoading (true);
    try {
      const result = await authService.requestOTP (mobile);
      setOtpSent (true);
      toast.success (result.message);
    } catch (error) {
      console.log ('Error details:', error); // Debug log
      toast.error (error.message || 'An error occurred', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {backgroundColor: '#FEE2E2', color: '#991B1B'},
      });
      setOtpSent (false); // Reset OTP sent state on error
    } finally {
      setLoading (false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async e => {
    e.preventDefault ();
    setLoading (true);
    try {
      const result = await authService.verifyOTP (mobile, otp);

      // Store auth data
      localStorage.setItem ('owner_id', result.data.owner_id);
      localStorage.setItem ('owner_name', result.data.owner_name);
      localStorage.setItem ('role', result.data.role);

      // Fetch shops to determine routing
      console.log('🔍 Fetching shops for owner:', result.data.owner_id);
      const shopsResponse = await authService.getShops(result.data.owner_id);
      const shops = Array.isArray(shopsResponse.data) ? shopsResponse.data : [];
      console.log('📊 Owner has', shops.length, 'shops');

      toast.success (result.message);

      // Route based on shop count
      if (shops.length > 1) {
        console.log('🔄 Multiple shops found, navigating to shop selector');
        navigate ('/shop-selector');
      } else if (shops.length === 1) {
        console.log('🏪 Single shop found, navigating directly to dashboard');
        // Auto-select the single shop
        const singleShop = shops[0];
        localStorage.setItem("selectedStoreId", singleShop.id.toString());
        navigate ('/dashboard');
      } else {
        console.log('⚠️ No shops found, navigating to shop selector for setup');
        // No shops found, let user add shops first
        navigate ('/shop-selector');
      }
    } catch (error) {
      toast.error (error.message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading (false);
    }
  };

  // Reset OTP form
  const handleResendOTP = () => {
    setOtpSent (false);
    setOtp ('');
  };

  return (
    <div className="auth-page">
      {/* Left Section - Content */}
      <div className="auth-content">
        <h1>Welcome to StoreHub</h1>
        <p className="lead">
          Manage your store efficiently with our powerful dashboard
        </p>

        <div className="features">
          <div className="feature-item">
            <i className="fas fa-chart-line" />
            <h3>Real-time Analytics</h3>
            <p>Track sales, inventory, and customer insights instantly</p>
          </div>

          <div className="feature-item">
            <i className="fas fa-users" />
            <h3>Customer Management</h3>
            <p>Build stronger relationships with your customers</p>
          </div>

          <div className="feature-item">
            <i className="fas fa-mobile-alt" />
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

          {!otpSent
            ? <form onSubmit={handleRequestOTP}>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <div className="input-group">
                    <span className="input-group-text">+91</span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control"
                      pattern="[6-9][0-9]{9}"
                      maxLength="10"
                      required
                      placeholder="Enter 10-digit mobile number"
                      title="Phone number must start with 6-9 (e.g., 9876543210)"
                      value={mobile}
                      onChange={e => {
                        const value = e.target.value.replace (/\D/g, ''); // Only allow digits
                        // Prevent input if first digit is 1-5
                        if (value.length > 0 && /^[1-5]/.test(value.charAt(0))) {
                          return; // Don't update state if first digit is invalid
                        }
                        if (value.length <= 10) {
                          setMobile (value);
                        }
                      }}
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
            : <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    className="form-control otp-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={e => setOtp (e.target.value)}
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
              </form>}

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
