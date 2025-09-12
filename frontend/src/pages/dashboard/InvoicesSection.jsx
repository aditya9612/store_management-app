import React, { useState, useEffect } from "react";
import "@assets/css/invoice.css";

export default function InvoicesSection({ invoices, setInvoices, loggedInOwner }) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([]);
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemRate, setItemRate] = useState("");
  const [itemDiscount, setItemDiscount] = useState("");
  const [shopDetails, setShopDetails] = useState(null);

  const ownerId = loggedInOwner?.id;

  // ✅ Load invoices and shop details per owner
  useEffect(() => {
    if (ownerId) {
      const storedInvoices =
        JSON.parse(localStorage.getItem(`invoices_${ownerId}`)) || [];
      setInvoices(storedInvoices);

      const storedShop = loggedInOwner || {};
      setShopDetails(storedShop);
    }
  }, [setInvoices, ownerId, loggedInOwner]);

  // ✅ Save invoices per owner
  useEffect(() => {
    if (ownerId) {
      localStorage.setItem(`invoices_${ownerId}`, JSON.stringify(invoices));
    }
  }, [invoices, ownerId]);

  const currency = (n) =>
    `₹${Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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

  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!customer || !phone || items.length === 0) {
      alert("Please enter customer info and at least one item.");
      return;
    }

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
      total: subtotal,
      shop: shopDetails || {},
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);

    setCustomer("");
    setPhone("");
    setAddress("");
    setItems([]);
  };

  const printInvoice = (invoice) => {
    const subtotal = invoice.items.reduce(
      (s, it) => s + it.qty * it.rate * (1 - it.discount / 100),
      0
    );

    const shop = invoice.shop || {};

    const html = `
      <html>
      <head>
        <title>Invoice #${invoice.number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2, h3 { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 6px; text-align: left; }
          .header { border-bottom: 2px solid #000; margin-bottom: 15px; }
          .shop { font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${shop.shopName || "Shop Name"}</h2>
          <p class="shop">
            ${shop.address || ""}<br/>
            Phone: ${shop.number || ""} | Email: ${shop.email || ""}<br/>
            GST: ${shop.gst || ""}
          </p>
        </div>

        <h3>Invoice #${invoice.number}</h3>
        <p>Date: ${invoice.date}</p>
        <p><strong>Customer:</strong> ${invoice.customer}</p>
        <p>Phone: ${invoice.phone}</p>
        <p>Address: ${invoice.address || ""}</p>

        <table>
          <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Amount</th></tr>
          ${invoice.items
            .map(
              (it) =>
                `<tr>
                  <td>${it.desc}</td>
                  <td>${it.qty}</td>
                  <td>${currency(it.rate)}</td>
                  <td>${it.discount}%</td>
                  <td>${currency(it.qty * it.rate * (1 - it.discount / 100))}</td>
                </tr>`
            )
            .join("")}
        </table>
        <h3>Total: ${currency(subtotal)}</h3>
        <script>window.onload=function(){window.print();}</script>
      </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) alert("Pop-up blocked!");
    w.document.write(html);
    w.document.close();
  };

  // ✅ SMS sending integration
  const sendSMS = async (invoice) => {
    try {
      const total = invoice.items
        .reduce((s, it) => s + it.qty * it.rate * (1 - it.discount / 100), 0)
        .toFixed(2);

      const message = `Invoice #${invoice.number} for ${invoice.customer}: Total ₹${total}`;
      
      const res = await fetch("http://localhost:5000/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: invoice.phone, body: message }),
      });

      const data = await res.json();
      if (data.success) alert("SMS sent successfully!");
      else alert(`Failed: ${data.error}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="invoices-section">
      <h1>Invoice Generator 🧾</h1>

      <div className="invoice-grid">
        {/* CREATE INVOICE */}
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
                      <td>{currency(it.qty * it.rate * (1 - it.discount / 100))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="blue fullwidth">Generate Invoice</button>
          </form>
        </div>

        {/* LIST INVOICES */}
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
                  <button className="small-btn" onClick={() => printInvoice(inv)}>
                    Print
                  </button>
                  <button className="small-btn" onClick={() => sendSMS(inv)}>
                    Send SMS
                  </button>
                  <button
                    className="small-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(inv));
                      alert("Copied!");
                    }}
                  >
                    Copy JSON
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
