import React, { useState } from "react";

export default function Contact({ loggedInOwner, selectedShop }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    subject: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit → save enquiry as customer in localStorage
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!loggedInOwner || !selectedShop) {
      alert("No shop selected. Please try again.");
      return;
    }

    const newCustomer = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      notes: `Enquiry: ${formData.subject} - ${formData.message}`,
    };

    // 🔹 Save enquiry only to current shop’s customers
    const key = `customers_${loggedInOwner.id}_${selectedShop.id}`;
    const existingCustomers = JSON.parse(localStorage.getItem(key)) || [];
    existingCustomers.push(newCustomer);
    localStorage.setItem(key, JSON.stringify(existingCustomers));

    setSuccess(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      subject: "",
      message: "",
    });
  };

  return (
    <>
      {/* Page Header */}
      <section className="inner_page_head">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="full">
                <h3>Contact Us</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="why_section layout_padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="full">
                <form onSubmit={handleSubmit}>
                  <fieldset>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="subject"
                      placeholder="Enter subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                    <textarea
                      name="message"
                      placeholder="Enter your message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                    <input type="submit" value="Submit" />
                  </fieldset>
                </form>

                {success && (
                  <p style={{ color: "green", marginTop: "10px" }}>
                    ✅ Thank you! Your enquiry has been sent.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
