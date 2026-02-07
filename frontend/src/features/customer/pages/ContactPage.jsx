import React, { useState } from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import "@/features/customer/styles/customer-global.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    phone: ""
  });
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("Form submitted:", formData);
    setSuccess(true);
    setIsSubmitting(false);
    setFormData({ name: "", email: "", subject: "", message: "", phone: "" });

    setTimeout(() => setSuccess(false), 5000);
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Visit Us",
      details: ["123 Fashion Street", "New York, NY 10001", "United States"],
      color: "lightblue"
    },
    {
      icon: <FaPhone />,
      title: "Call Us",
      details: ["+1 (555) 123-4567", "+1 (555) 123-4568"],
      color: "lightgreen"
    },
    {
      icon: <FaEnvelope />,
      title: "Email Us",
      details: ["hello@storehub.com", "support@storehub.com"],
      color: "purple"
    },
    {
      icon: <FaClock />,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 8:00 PM", "Sat: 10:00 AM - 6:00 PM", "Sun: Closed"],
      color: "orange"
    }
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, url: "#", label: "Facebook", color: "#1877f2" },
    { icon: <FaTwitter />, url: "#", label: "Twitter", color: "#1da1f2" },
    { icon: <FaInstagram />, url: "#", label: "Instagram", color: "#e4405f" },
    { icon: <FaLinkedinIn />, url: "#", label: "LinkedIn", color: "#0077b5" }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Get In Touch</h1>
            <p className="hero-description">
              Have a question about our products or need help with your order?
              We're here to help! Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className={`contact-info-card ${info.color}`}>
                <div className="contact-icon">
                  {info.icon}
                </div>
                <div className="contact-details">
                  <h3>{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx}>{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-content">
            {/* Contact Form */}
            <div className="contact-form-section">
              <div className="form-header">
                <h2>Send Us a Message</h2>
                <p>Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>

              <div className="contact-form-container">
                {success && (
                  <div className="success-message">
                    <FaCheckCircle />
                    <div className="success-content">
                      <h3>Message Sent Successfully!</h3>
                      <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                          // 🚫 BLOCK: Prevent input if first digit is 1-5
                          if (value.length > 0 && /^[1-5]/.test(value.charAt(0))) {
                            return; // Don't update state if first digit is invalid
                          }
                          if (value.length <= 10) {
                            setFormData({ ...formData, phone: value });
                          }
                        }}
                        pattern="[6-9][0-9]{9}"
                        maxLength="10"
                        placeholder="Enter your phone number"
                        title="Phone number must start with 6-9 (e.g., 9876543210)"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Subject *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Customer Support</option>
                        <option value="orders">Order Issues</option>
                        <option value="returns">Returns & Exchanges</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section">
              <div className="faq-header">
                <h2>Frequently Asked Questions</h2>
                <p>Quick answers to common questions</p>
              </div>

              <div className="faq-list">
                <details className="faq-item">
                  <summary className="faq-question">
                    How long does shipping take?
                  </summary>
                  <div className="faq-answer">
                    <p>Standard shipping takes 3-5 business days. Express shipping (2-3 business days) is available for an additional fee. International shipping may take 7-14 business days depending on the destination.</p>
                  </div>
                </details>

                <details className="faq-item">
                  <summary className="faq-question">
                    What is your return policy?
                  </summary>
                  <div className="faq-answer">
                    <p>We offer a 30-day return policy for all items in new, unworn condition with original tags attached. Return shipping is free for defective items. Custom or personalized items cannot be returned.</p>
                  </div>
                </details>

                <details className="faq-item">
                  <summary className="faq-question">
                    Do you offer international shipping?
                  </summary>
                  <div className="faq-answer">
                    <p>Yes! We ship to over 50 countries worldwide. International shipping rates and delivery times vary by location. All international orders are subject to customs fees and import duties.</p>
                  </div>
                </details>

                <details className="faq-item">
                  <summary className="faq-question">
                    How can I track my order?
                  </summary>
                  <div className="faq-answer">
                    <p>Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section className="social-section">
        <div className="container">
          <div className="social-content">
            <h2>Follow Us</h2>
            <p>Stay connected for the latest updates, promotions, and style inspiration</p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="social-link"
                  style={{ backgroundColor: social.color }}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}