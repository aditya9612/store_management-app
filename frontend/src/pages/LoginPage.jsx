import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@assets/css/AuthPage.css"; // Only styles the login form

function LoginPage() {
  const [loginInput, setLoginInput] = useState(""); // email or phone
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  // Auto-login if already logged in
  useEffect(() => {
    const ownerData = localStorage.getItem("loggedInOwner");
    if (ownerData) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Send OTP
  const sendOtp = () => {
    const owners = JSON.parse(localStorage.getItem("shopOwners")) || [];
    const owner = owners.find(
      (o) => o.email === loginInput || o.number === loginInput
    );

    if (!owner) {
      alert("No shop owner found with this email or phone.");
      return;
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otpCode);
    setOtpSent(true);

    alert(`Mock OTP for ${owner.name}: ${otpCode}`);
  };

  // Verify OTP
  const verifyOtp = (e) => {
    e.preventDefault();
    const owners = JSON.parse(localStorage.getItem("shopOwners")) || [];
    const owner = owners.find(
      (o) => o.email === loginInput || o.number === loginInput
    );

    if (!owner) {
      alert("No shop owner found.");
      return;
    }

    if (otp === generatedOtp) {
      localStorage.setItem("loggedInOwner", JSON.stringify(owner));
      alert(`Welcome ${owner.name} ✅`);
      navigate("/dashboard");
    } else {
      alert("Invalid OTP.");
    }
  };

  return (
    <div className="auth-container">
      <div className="form-box">
        <h2>Shop Owner Login 🔑</h2>
        <form onSubmit={verifyOtp}>
          <input
            type="text"
            placeholder="Enter Email or Phone"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            required
          />
          {otpSent && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          )}
          {!otpSent ? (
            <button type="button" onClick={sendOtp}>
              Send OTP
            </button>
          ) : (
            <button type="submit">Verify & Login</button>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
