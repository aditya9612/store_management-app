/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@assets/css/AuthPage.css";

function AuthPage() {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    number: "",
    address: "",
    email: "",
    password: "",
  });

  const [loginInput, setLoginInput] = useState(""); // email or phone
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loggedInOwner, setLoggedInOwner] = useState(null);

  const navigate = useNavigate();

  // ✅ Auto-login if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isOwnerLoggedIn");
    const ownerData = localStorage.getItem("loggedInOwner");
    if (isLoggedIn && ownerData) {
      setLoggedInOwner(JSON.parse(ownerData));
      navigate("/dashboard");
    }
  }, [navigate]);

  // ✅ Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Register new shop owner
  const handleRegister = (e) => {
    e.preventDefault();
    const existingOwners = JSON.parse(localStorage.getItem("shopOwners")) || [];

    // check if email/phone already exists
    const exists = existingOwners.some(
      (owner) =>
        owner.email === formData.email || owner.number === formData.number
    );
    if (exists) {
      alert("Email or phone already registered!");
      return;
    }

    const newOwner = {
      ...formData,
      id: Date.now(),
    };

    const updatedOwners = [...existingOwners, newOwner];
    localStorage.setItem("shopOwners", JSON.stringify(updatedOwners));

    alert("Registration successful! Please login.");
    setFormData({
      name: "",
      shopName: "",
      number: "",
      address: "",
      email: "",
      password: "",
    });
    setIsRegister(false);
  };

  // ✅ Send OTP for login
  const sendOtp = () => {
    if (!loginInput) {
      alert("Enter your registered email or phone.");
      return;
    }

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

    // ✅ For real use, integrate SMS/Email API here
    alert(`Mock OTP for ${owner.shopName}: ${otpCode}`);
  };

  // ✅ Verify OTP and login
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
      localStorage.setItem("isOwnerLoggedIn", "true");
      localStorage.setItem("loggedInOwner", JSON.stringify(owner));
      setLoggedInOwner(owner);
      alert(`Welcome ${owner.shopName} ✅`);
      navigate("/dashboard");
    } else {
      alert("Invalid OTP.");
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("isOwnerLoggedIn");
    localStorage.removeItem("loggedInOwner");
    setLoggedInOwner(null);
    setOtp("");
    setOtpSent(false);
    setLoginInput("");
    navigate("/owner-login");
  };

  return (
    <div className="auth-container">
      {isRegister ? (
        <div className="form-box">
          <h2>Register Store Owner</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="shopName"
              placeholder="Shop Name"
              value={formData.shopName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="number"
              placeholder="Phone Number"
              value={formData.number}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Shop Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Register</button>
            <p onClick={() => setIsRegister(false)} className="toggle-text">
              Already have an account? Login
            </p>
          </form>
        </div>
      ) : (
        <div className="form-box">
          <h2>Store Owner Login</h2>
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
            <p onClick={() => setIsRegister(true)} className="toggle-text">
              New user? Register here
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

export default AuthPage;
