import React, { useState, useEffect } from "react";
import "@assets/css/invoice.css";

export default function InvoicesSection() {
  const [invoices, setInvoices] = useState([]);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([]);
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemRate, setItemRate] = useState("");
  const [itemDiscount, setItemDiscount] = useState("");

  // Load invoices from localStorage
  useEffect(() => {
    const storedInvoices = JSON.parse(localStorage.getItem("invoices")) || [];
    setInvoices(storedInvoices);
  }, []);

  const saveInvoices = (updatedInvoices) => {
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
  };

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

    setItemDesc(""); setItemQty(""); setItemRate(""); setItemDiscount("");
  };

  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!customer || !phone || items.length === 0) {
      alert("Please enter customer name, phone, and at least one item.");
      return;
    }

    const newInvoice = {
      id: Date.now(),
      number: invoices.length + 101,
      date: new Date().toLocaleDateString(),
      customer,
      phone,
      address,
      items,
    };

    const updatedInvoices = [newInvoice, ...invoices];
    saveInvoices(updatedInvoices);

    // Reset form
    setCustomer(""); setPhone(""); setAddress(""); setItems([]);
  };

  const currency = (n) => `₹${Number(n).toLocaleString()}`;

  const printInvoice = (invoice) => {
    const subtotal = invoice.items.reduce(
      (s, it) => s + it.qty * it.rate * (1 - it.discount / 100),
      0
    );
    const total = subtotal;

    const html = `
      <html>
      <head>
        <title>Invoice #${invoice.number}</title>
        <style>
          body{font-family:Arial,sans-serif;margin:20px;color:#222;}
          .inv-wrap{max-width:800px;margin:0 auto;border:1px solid #eee;padding:24px;}
          header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;}
          .brand{font-size:20px;font-weight:700;color:#1d4ed8;}
          .meta{text-align:right;}
          table{width:100%;border-collapse:collapse;margin-top:10px;}
          th,td{padding:10px;border:1px solid #e6e6e6;text-align:left;}
          .totals{margin-top:20px;display:flex;justify-content:flex-end;}
          .totals table{width:320px;}
          .small{font-size:12px;color:#666;margin-top:10px;}
          @media print{body{margin:0;}.inv-wrap{border:none;box-shadow:none;}}
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
              ${invoice.phone}<br/>
              ${invoice.address || ""}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Description</th><th>Qty</th><th>Rate</th><th>Discount (%)</th><th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(it => `
                  <tr>
                    <td>${it.desc}</td>
                    <td>${it.qty}</td>
                    <td>${currency(it.rate)}</td>
                    <td>${it.discount}%</td>
                    <td>${currency(it.qty*it.rate*(1-it.discount/100))}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
            <div class="totals">
              <table>
                <tbody>
                  <tr><td>Subtotal</td><td style="text-align:right">${currency(subtotal)}</td></tr>
                  <tr><td>Total</td><td style="text-align:right">${currency(total)}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="small">Thank you for your business!</div>
          </section>
        </div>
        <script>window.onload=function(){window.print();}</script>
      </body>
      </html>
    `;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) alert("Pop-up blocked. Allow popups to print.");
    w.document.write(html); w.document.close();
  };

  // Mock SMS sending
  const sendSMS = async (invoice) => {
    try {
      const message = `Invoice #${invoice.number}: ${invoice.items.map(i => `${i.desc} x${i.qty}`).join(", ")}. Total: ${currency(invoice.items.reduce((s,it)=>s+it.qty*it.rate*(1-it.discount/100),0))}`;
      alert(`SMS sent to ${invoice.phone}:\n${message}`);
      // Real SMS would require a backend API integration
    } catch (err) {
      alert(`Error sending SMS: ${err.message}`);
    }
  };

  return (
    <div className="invoices-section">
      <h1>Invoice Generator 🧾</h1>

      <div className="invoice-grid">
        <div className="invoice-card">
          <h3>Create Invoice</h3>
          <label>Customer Name</label>
          <input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Customer name" required />
          <label>Phone Number</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Customer phone" required />
          <label>Address</label>
          <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Customer address" />

          <hr />
          <h4>Add Item</h4>
          <div className="item-form">
            <input value={itemDesc} onChange={e=>setItemDesc(e.target.value)} placeholder="Description" />
            <input value={itemQty} onChange={e=>setItemQty(e.target.value)} placeholder="Qty" type="number" min="1"/>
            <input value={itemRate} onChange={e=>setItemRate(e.target.value)} placeholder="Rate" type="number" min="0"/>
            <input value={itemDiscount} onChange={e=>setItemDiscount(e.target.value)} placeholder="Discount %" type="number" min="0" max="100"/>
            <button className="small-btn" onClick={handleAddItem}>Add Item</button>
          </div>

          {items.length>0 && (
            <table className="mini-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Amount</th></tr></thead>
              <tbody>{items.map((it,i)=>(
                <tr key={i}><td>{it.desc}</td><td>{it.qty}</td><td>{currency(it.rate)}</td><td>{it.discount}%</td><td>{currency(it.qty*it.rate*(1-it.discount/100))}</td></tr>
              ))}</tbody>
            </table>
          )}

          <button className="blue fullwidth" onClick={handleGenerateInvoice}>Generate Invoice</button>
        </div>

        <div className="invoice-card">
          <h3>Invoices</h3>
          <ul className="invoice-list">
            {invoices.map(inv => (
              <li key={inv.id} className="invoice-row">
                <div>
                  <strong>#{inv.number}</strong> — {inv.customer} <br/>
                  <span className="muted">{inv.date}</span>
                </div>
                <div className="invoice-actions">
                  <button className="small-btn" onClick={()=>printInvoice(inv)}>Print</button>
                  <button className="small-btn" onClick={()=>sendSMS(inv)}>Send SMS</button>
                  <button className="small-btn" onClick={()=>{navigator.clipboard.writeText(JSON.stringify(inv)); alert("Copied!");}}>Copy JSON</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
