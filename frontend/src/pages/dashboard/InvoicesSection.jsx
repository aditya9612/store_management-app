/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "@assets/css/invoice.css";

export default function InvoicesSection({ invoices, setInvoices, loggedInOwner, products, setProducts }) {
  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState(""); // ✅ new
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([]);
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemRate, setItemRate] = useState("");
  const [itemDiscount, setItemDiscount] = useState("");
  const [shopDetails, setShopDetails] = useState(loggedInOwner);

  useEffect(() => {
    if (loggedInOwner?.id) {
      const storedInvoices = JSON.parse(localStorage.getItem(`invoices_${loggedInOwner.id}`)) || [];
      setInvoices(storedInvoices);
    }
  }, [loggedInOwner, setInvoices]);

  const currency = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemDesc || !itemQty || !itemRate) return;
    const stock = products.find((p) => p.name === itemDesc)?.stock || 0;
    if (Number(itemQty) > stock) return alert("Not enough stock!");
    setItems([...items, { desc: itemDesc, qty: Number(itemQty), rate: Number(itemRate), discount: Number(itemDiscount) || 0 }]);
    setItemDesc(""); setItemQty(""); setItemRate(""); setItemDiscount("");
  };

  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!customer || !phone || !items.length) return alert("Customer info & items required");

    const subtotal = items.reduce((s, it) => s + it.qty * it.rate * (1 - it.discount / 100), 0);

    const newInvoice = {
      id: Date.now(),
      number: invoices.length + 101,
      date: new Date().toLocaleDateString(),
      customer,
      email, // ✅ include email
      phone,
      address,
      items,
      total: subtotal,
      shop: shopDetails || {}
    };

    // Deduct stock
    const updatedProducts = products.map((p) => {
      const item = items.find((it) => it.desc === p.name);
      if (item) return { ...p, stock: p.stock - item.qty };
      return p;
    });
    setProducts(updatedProducts);

    setInvoices([newInvoice, ...invoices]);
    setCustomer(""); setEmail(""); setPhone(""); setAddress(""); setItems([]);
  };

  const printInvoice = (invoice) => {
    const subtotal = invoice.items.reduce((s, it) => s + it.qty * it.rate * (1 - it.discount / 100), 0);
    const shop = invoice.shop || {};
    const html = `
      <html><head><title>Invoice #${invoice.number}</title>
      <style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;margin-top:10px;}th,td{border:1px solid #000;padding:6px;text-align:left;}</style>
      </head><body>
      <h2>${shop.shopName || "My Shop"}</h2>
      <p>${shop.address || ""}<br/>Phone: ${shop.number || ""} | Email: ${shop.email || ""}</p>
      <h3>Invoice #${invoice.number}</h3>
      <p>Date: ${invoice.date}</p>
      <p>Customer: ${invoice.customer}<br/>
         Email: ${invoice.email || ""}<br/>  <!-- ✅ email -->
         Phone: ${invoice.phone}<br/>
         Address: ${invoice.address || ""}</p>
      <table><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Amount</th></tr>
      ${invoice.items.map(it=>`<tr><td>${it.desc}</td><td>${it.qty}</td><td>${currency(it.rate)}</td><td>${it.discount}%</td><td>${currency(it.qty*it.rate*(1-it.discount/100))}</td></tr>`).join("")}
      </table><h3>Total: ${currency(subtotal)}</h3>
      <script>window.onload=function(){window.print();}</script>
      </body></html>`;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) alert("Pop-up blocked!"); else { w.document.write(html); w.document.close(); }
  };

  return (
    <div className="invoices-section">
      <h1>Invoice Generator 🧾</h1>
      <div className="invoice-grid">
        <div className="invoice-card">
          <h3>Create Invoice</h3>
          <form onSubmit={handleGenerateInvoice}>
            <input value={customer} onChange={(e)=>setCustomer(e.target.value)} placeholder="Customer name" required />
            <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Customer email" /> {/* ✅ new */}
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Customer phone" required />
            <input value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Customer address" />

            <h4>Add Item</h4>
            <div className="item-form">
  <input
    type="text"
    value={itemDesc}
    onChange={(e) => {
      setItemDesc(e.target.value);
      const p = products.find((p) => p.name.toLowerCase() === e.target.value.toLowerCase());
      if (p) setItemRate(p.price);
    }}
    placeholder="Product name"
  />
  <input
    type="number"
    value={itemQty}
    onChange={(e) => setItemQty(e.target.value)}
    min="1"
    placeholder="Qty"
  />
  <input
    type="number"
    value={itemRate}
    onChange={(e) => setItemRate(e.target.value)}
    min="0"
    placeholder="Rate"
  />
  <input
    type="number"
    value={itemDiscount}
    onChange={(e) => setItemDiscount(e.target.value)}
    min="0"
    max="100"
    placeholder="Discount %"
  />
  <button className="small-btn" onClick={handleAddItem}>Add Item</button>
</div>


            {items.length>0 && <table className="mini-table"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Amount</th></tr></thead>
              <tbody>{items.map((it,i)=><tr key={i}><td>{it.desc}</td><td>{it.qty}</td><td>{currency(it.rate)}</td><td>{it.discount}%</td><td>{currency(it.qty*it.rate*(1-it.discount/100))}</td></tr>)}</tbody></table>}
            <button className="blue fullwidth">Generate Invoice</button>
          </form>
        </div>

        <div className="invoice-card">
          <h3>Invoices</h3>
          <ul className="invoice-list">
            {invoices.map(inv=>(
              <li key={inv.id} className="invoice-row">
                <div><strong>#{inv.number}</strong> — {inv.customer}<br/><span className="muted">{inv.date}</span></div>
                <div className="invoice-actions">
                  <span className="highlight">Total: {currency(inv.total)}</span>
                  <button className="small-btn" onClick={()=>printInvoice(inv)}>Print</button>
                  <button className="small-btn" onClick={()=>{navigator.clipboard.writeText(JSON.stringify(inv));alert("Copied!");}}>Copy JSON</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
