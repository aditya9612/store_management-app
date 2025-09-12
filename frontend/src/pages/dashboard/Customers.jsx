import React, { useState, useEffect } from "react";
import "@assets/css/dashboard.css";

export default function Customers({ loggedInOwner, onCustomersChange }) {
  const ownerId = loggedInOwner?.id;

  const [customers, setCustomers] = useState(() => {
    if (ownerId) {
      return JSON.parse(localStorage.getItem(`customers_${ownerId}`)) || [];
    }
    return [];
  });

  // Save per-owner customers + notify dashboard
  useEffect(() => {
    if (ownerId) {
      localStorage.setItem(`customers_${ownerId}`, JSON.stringify(customers));
      if (onCustomersChange) {
        onCustomersChange(customers);
      }
    }
  }, [customers, ownerId, onCustomersChange]);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const phone = e.target.phone.value.trim();
    const address = e.target.address.value.trim();

    if (name && email && phone) {
      setCustomers([...customers, { name, email, phone, address }]);
      e.target.reset();
    }
  };

  return (
    <div className="customers-container">
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

      {customers.length > 0 && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.address || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
