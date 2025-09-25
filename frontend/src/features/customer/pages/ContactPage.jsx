import React, { useState } from "react";
import "@/features/customer/styles/customer-global.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSuccess(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
        <h2>Contact Us</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>We'd love to hear from you. Please fill out the form below.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="card-content">
          {success && (
            <div style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)', textAlign: 'center' }}>
              Thank you! Your message has been sent.
            </div>
          )}
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="subject" className="form-label">Subject</label>
            <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="message" className="form-label">Message</label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} required className="form-input" rows="5"></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
        </form>
      </div>
    </div>
  );
}