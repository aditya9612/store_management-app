import React, { useState } from "react";
import "@assets/css/invoice.css";

export default function InvoicesSection({ invoices, setInvoices }) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([]);
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemRate, setItemRate] = useState("");
  const [itemDiscount, setItemDiscount] = useState("");

  // Add line item
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemDesc || !itemQty || !itemRate) return;

    setItems([
      ...items,
      {
        desc: itemDesc,
        qty: Number(itemQty),
        rate: Number(itemRate),
        discount: Number(itemDiscount) || 0,
      },
    ]);

    setItemDesc("");
    setItemQty("");
    setItemRate("");
    setItemDiscount("");
  };

  // Generate invoice
  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!customer || !phone || items.length === 0) {
      alert("Please enter customer name, phone, and at least one item.");
      return;
    }

    // ✅ Calculate totals
    const subtotal = items.reduce(
      (s, it) => s + it.qty * it.rate * (1 - it.discount / 100),
      0
    );

    const newInvoice = {
      id: Date.now(),
      number: invoices.length + 101,
      date: new Date().toLocaleDateString(),
      customer,
      phone,
      address,
      items,
      total: subtotal, // ✅ store total revenue
    };

    setInvoices([newInvoice, ...invoices]);

    // Reset form
    setCustomer("");
    setPhone("");
    setAddress("");
    setItems([]);
  };

  const currency = (n) => `₹${Number(n).toLocaleString()}`;

  return (
    <div className="invoices-section">
      <h1>Invoice Generator 🧾</h1>

      <div className="invoice-grid">
        {/* Create Invoice Form */}
        <div className="invoice-card">
          <h3>Create Invoice</h3>
          <form onSubmit={handleGenerateInvoice}>
            <label>Customer Name</label>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer name"
              required
            />
            <label>Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Customer phone"
              required
            />
            <label>Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Customer address"
            />

            <hr />
            <h4>Add Item</h4>
            <div className="item-form">
              <input
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder="Description"
              />
              <input
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
                placeholder="Qty"
                type="number"
                min="1"
              />
              <input
                value={itemRate}
                onChange={(e) => setItemRate(e.target.value)}
                placeholder="Rate"
                type="number"
                min="0"
              />
              <input
                value={itemDiscount}
                onChange={(e) => setItemDiscount(e.target.value)}
                placeholder="Discount %"
                type="number"
                min="0"
                max="100"
              />
              <button className="small-btn" onClick={handleAddItem}>
                Add Item
              </button>
            </div>

            {items.length > 0 && (
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Discount</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.desc}</td>
                      <td>{it.qty}</td>
                      <td>{currency(it.rate)}</td>
                      <td>{it.discount}%</td>
                      <td>
                        {currency(
                          it.qty * it.rate * (1 - it.discount / 100)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button className="blue fullwidth">Generate Invoice</button>
          </form>
        </div>

        {/* Invoice List */}
        <div className="invoice-card">
          <h3>Invoices</h3>
          <ul className="invoice-list">
            {invoices.map((inv) => (
              <li key={inv.id} className="invoice-row">
                <div>
                  <strong>#{inv.number}</strong> — {inv.customer} <br />
                  <span className="muted">{inv.date}</span>
                </div>
                <div className="invoice-actions">
                  <span className="highlight">Total: {currency(inv.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
