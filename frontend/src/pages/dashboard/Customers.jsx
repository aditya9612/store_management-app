import React, { useState, useEffect } from "react";
import "@assets/css/dashboard.css";

export default function Customers() {
  const [customers, setCustomers] = useState(() => {
    // ✅ Load from localStorage
    return JSON.parse(localStorage.getItem("customers")) || [];
  });

  // ✅ Save to localStorage whenever customers change
  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const address = e.target.address.value;

    if (name && email && phone) {
      setCustomers([...customers, { name, email, phone, address }]);
      e.target.reset();
    }
  };

  return (
    <div>
      <h1>Customer Management 👥</h1>

      <form onSubmit={handleAddCustomer} className="form-card">
        <input type="text" name="name" placeholder="Customer Name" required />
        <input type="email" name="email" placeholder="Customer Email" required />
        <input
          type="tel"
          name="phone"
          placeholder="Customer Phone"
          pattern="[0-9]{10}"
          required
        />
        <input type="text" name="address" placeholder="Customer Address" />
        <button className="blue">Add Customer</button>
      </form>

      <ul className="list-card">
        {customers.map((c, idx) => (
          <li key={idx}>
            <strong>{c.name}</strong> — {c.email} — {c.phone} — {c.address}
          </li>
        ))}
      </ul>
    </div>
  );
}
