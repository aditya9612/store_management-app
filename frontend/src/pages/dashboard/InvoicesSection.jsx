/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "@assets/css/invoice.css";

export default function InvoicesSection() {
  const [invoices, setInvoices] = useState([
    {
      id: Date.now(),
      number: 101,
      date: new Date().toLocaleDateString(),
      customer: "John Doe",
      address: "22 Baker St, New York",
      items: [
        { desc: "Nike Shoes", qty: 1, rate: 2000, discount: 0 },
      ],
    },
  ]);

  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([]);
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemRate, setItemRate] = useState("");
  const [itemDiscount, setItemDiscount] = useState(""); // discount in %

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
        discount: Number(itemDiscount) || 0, // store % discount
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
    if (!customer || items.length === 0) {
      alert("Please enter customer name and at least one item.");
      return;
    }

    const newInvoice = {
      id: Date.now(),
      number: invoices.length + 101,
      date: new Date().toLocaleDateString(),
      customer,
      address,
      items,
    };

    setInvoices([newInvoice, ...invoices]);
    setCustomer("");
    setAddress("");
    setItems([]);
  };

  const currency = (n) => `₹${Number(n).toLocaleString()}`;

  // Print invoice
  const printInvoice = (invoice) => {
    const subtotal = invoice.items.reduce(
      (s, it) => s + it.qty * it.rate * (1 - it.discount / 100),
      0
    );
    const tax = 0;
    const total = subtotal + tax;

    const html = `
      <html>
      <head>
        <title>Invoice #${invoice.number}</title>
        <style>
          body{font-family: Arial, Helvetica, sans-serif; margin:20px; color:#222;}
          .inv-wrap{max-width:800px;margin:0 auto;border:1px solid #eee;padding:24px;}
          header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;}
          .brand{font-size:20px;font-weight:700;color:#1d4ed8;}
          .meta{text-align:right;}
          table{width:100%;border-collapse:collapse;margin-top:10px;}
          th,td{padding:10px;border:1px solid #e6e6e6;text-align:left;}
          tfoot td{font-weight:700;}
          .totals{margin-top:20px;display:flex;justify-content:flex-end;}
          .totals table{width:320px;}
          .small{font-size:12px;color:#666;margin-top:10px;}
          @media print{
            body{margin:0;}
            .inv-wrap{border:none;box-shadow:none;}
          }
        </style>
      </head>
      <body>
        <div class="inv-wrap">
          <header>
            <div class="brand">Your Store Name</div>
            <div class="meta">
              <div>Invoice #: <strong>${invoice.number}</strong></div>
              <div>Date: ${invoice.date}</div>
            </div>
          </header>

          <section>
            <div>
              <strong>Bill To:</strong><br/>
              ${invoice.customer}<br/>
              ${invoice.address || ""}
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width:50%;">Description</th>
                  <th style="width:10%;">Qty</th>
                  <th style="width:15%;">Rate</th>
                  <th style="width:10%;">Discount (%)</th>
                  <th style="width:15%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(it => `
                  <tr>
                    <td>${it.desc}</td>
                    <td>${it.qty}</td>
                    <td>${currency(it.rate)}</td>
                    <td>${it.discount}%</td>
                    <td>${currency(it.qty * it.rate * (1 - it.discount / 100))}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <div class="totals">
              <table>
                <tbody>
                  <tr>
                    <td>Subtotal</td>
                    <td style="text-align:right">${currency(subtotal)}</td>
                  </tr>
                  <tr>
                    <td>Tax</td>
                    <td style="text-align:right">${currency(tax)}</td>
                  </tr>
                  <tr>
                    <td>Total</td>
                    <td style="text-align:right">${currency(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="small">Thank you for your business!</div>
          </section>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      alert("Pop-up blocked. Allow popups to print the invoice.");
      return;
    }
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="invoices-section">
      <h1>Invoice Generator 🧾</h1>

      <div className="invoice-grid">
        {/* Create Invoice */}
        <div className="invoice-card">
          <h3>Create New Invoice</h3>
          <div>
            <label>Customer Name</label>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer name"
              required
            />

            <label>Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Customer address (optional)"
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
              <button className="small-btn" onClick={handleAddItem}>Add Item</button>
            </div>

            <div className="items-list">
              {items.length === 0 ? <p className="muted">No items added yet</p> :
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Discount (%)</th>
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
              }
            </div>

            <button className="blue fullwidth" onClick={handleGenerateInvoice}>Generate Invoice</button>
          </div>
        </div>

        {/* Invoices list */}
        <div className="invoice-card">
          <h3>Invoices</h3>
          <ul className="invoice-list">
            {invoices.map((inv) => {
              const subtotal = inv.items.reduce((s, it) => s + it.qty * it.rate * (1 - it.discount / 100), 0);
              return (
                <li key={inv.id} className="invoice-row">
                  <div>
                    <strong>#{inv.number}</strong> — {inv.customer} <br />
                    <span className="muted">{inv.date}</span>
                  </div>
                  <div className="invoice-actions">
                    <button className="small-btn" onClick={() => printInvoice(inv)}>Print / PDF</button>
                    <button className="small-btn" onClick={() => {
                      navigator.clipboard?.writeText(JSON.stringify(inv));
                      alert("Invoice copied to clipboard (JSON).");
                    }}>Copy JSON</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
