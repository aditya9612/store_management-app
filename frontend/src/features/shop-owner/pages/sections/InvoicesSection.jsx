import React, { useState, useEffect } from "react";
import { AuthService } from "@/utils/auth";
import "@/features/shop-owner/styles/shop-owner-invoice.css";
import { authService, productsApi, ordersApi } from "@/utils/api";

export default function InvoicesSection({
  invoices,
  setInvoices,
  customers,
  setCustomers,
  loggedInOwner,
  selectedShop
}) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [itemQty, setItemQty] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shopDetails] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const ownerId = loggedInOwner?.id;
  const shopKey = selectedShop ? `${ownerId}_${selectedShop.id}` : null;

  useEffect(() => {
    if (!shopKey) return;
    // Load live customers and products for the selected store
    const storeId = selectedShop?.id;
    if (!storeId) return;
    authService.getCustomersByStore(storeId).then(r => setCustomers(r.data || []));
    productsApi.list(storeId).then(r => setAvailableProducts(r.data || []));
    ordersApi.listByStore(storeId).then(r => setInvoices(r.data || []));
  }, [shopKey, selectedShop?.id, setCustomers, setInvoices]);

  useEffect(() => {
    if (!shopKey) return;
    try {
      localStorage.setItem(`invoices_${shopKey}`, JSON.stringify(invoices));
      if (customers) localStorage.setItem(`customers_${shopKey}`, JSON.stringify(customers));
    } catch {
      // ignore storage errors
    }
  }, [invoices, customers, shopKey]);

  const currency = (n) =>
    `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const [availableProducts, setAvailableProducts] = useState([]);
  // Auto-fill customer info by selection
  useEffect(() => {
    if (!customer || !customers) return;
    const existing = customers.find(c => String(c.id) === String(customer));
    if (existing) {
      setPhone(existing.phone || "");
      setEmail(existing.email || "");
      setAddress(existing.address || "");
    }
  }, [customer, customers]);

  // Function to download invoice as PDF
  const downloadInvoice = async (invoice) => {
    try {
      const response = await ordersApi.downloadInvoice(invoice.id);
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoice.number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(`Error downloading invoice: ${err.message}`);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const product = availableProducts.find(p => String(p.id) === String(selectedProductId));
    if (!product || !itemQty) return;
    setItems([...items, {
      product_id: product.id,
      name: product.name,
      qty: Number(itemQty),
      rate: Number(product.price)
    }]);
    setSelectedProductId(""); setItemQty("");
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    const storeId = selectedShop?.id;
    if (!storeId || !customer || items.length === 0) return;
    const payload = {
      store_id: storeId,
      customer_id: Number(customer),
      discount: Number(discount),
      items: items.map(it => ({ product_id: it.product_id, quantity: it.qty, price: it.rate }))
    };
    await ordersApi.create(payload);
    // Fetch latest orders list
    const list = await ordersApi.listByStore(storeId);
    setInvoices(list.data || []);
    setCustomer(""); setPhone(""); setEmail(""); setAddress(""); setItems([]); setDiscount(0);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await ordersApi.remove(invoiceId);
      setInvoices(invoices.filter((inv) => inv.id !== invoiceId));
    } catch (error) {
      alert(`Error deleting invoice: ${error.message}`);
    }
    setShowDeleteConfirm(null);
  };

  const printInvoice = (invoice) => {
    const subtotal = invoice.items.reduce((s, it) => s + (it.quantity||it.qty) * (it.price||it.rate), 0);
    const discountPercent = invoice.discount || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;
    const shop = invoice.shop || shopDetails || {};

    const html = `
      <html>
      <head><title>Invoice #${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2,h3 { margin: 5px 0; }
          table { width:100%; border-collapse: collapse; margin-top:10px; }
          th,td { border:1px solid #000; padding:6px; text-align:left; }
          .text-right { text-align: right; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>${shop.name || "My Shop"}</h2>
        <p>${shop.location || ""}<br/>Phone: ${shop.phone || ""} | Email: ${shop.email || ""}</p>
        <h3>Invoice #${invoice.id}</h3>
        <p>Date: ${new Date(invoice.created_at).toLocaleDateString()}</p>
        <p>Customer: ${invoice.customer?.name || "Customer"}</p>
        <p>Phone: ${invoice.customer?.phone || ""}</p>
        <p>Email: ${invoice.customer?.email || ""}</p>
        <p>Address: ${invoice.customer?.address || ""}</p>
        <table>
          <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
          ${invoice.items.map(it => `<tr>
            <td>${it.product.name || it.product_id}</td>
            <td>${it.quantity || it.qty}</td>
            <td>${currency(it.price || it.rate)}</td>
            <td>${currency((it.quantity||it.qty)*(it.price||it.rate))}</td>
          </tr>`).join("")}
          <tr>
            <td colspan="3" class="text-right">Subtotal:</td>
            <td>${currency(subtotal)}</td>
          </tr>
          ${discountPercent > 0 ? `
          <tr>
            <td colspan="3" class="text-right">Discount (${discountPercent}%):</td>
            <td>-${currency(discountAmount)}</td>
          </tr>` : ''}
          <tr class="total-row">
            <td colspan="3" class="text-right">Total:</td>
            <td>${currency(total)}</td>
          </tr>
        </table>
        <script>window.onload=function(){window.print();}</script>
      </body>
      </html>
    `;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) alert("Pop-up blocked!");
    w.document.write(html);
    w.document.close();
  };

  const sendSMS = async (invoice) => {
    try {
      const total = invoice.items.reduce((s, it) => s + it.qty * it.rate * (1 - it.discount / 100), 0).toFixed(2);
      const message = `Invoice #${invoice.number} for ${invoice.customer}: Total ₹${total}`;
      const res = await fetch("http://localhost:5000/send-sms", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({to:invoice.phone, body:message})
      });
      const data = await res.json();
      if(data.success) alert("SMS sent successfully!");
      else alert(`Failed: ${data.error}`);
    } catch(err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="invoices-section">
      <h1><i className="fas fa-file-invoice-dollar"></i> Invoice Generator</h1>
      <div className="invoice-grid">
        <div className="invoice-card">
          <h3><i className="fas fa-plus-circle"></i> Create Invoice</h3>
          <form onSubmit={handleGenerateInvoice}>
            <label>Select Customer</label>
            <div className="customer-selector" style={{ position: 'relative' }}>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="Search customer..."
                className="fullwidth"
                required
              />
              {showCustomerDropdown && (
                <div className="customer-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #eef2f7',
                  borderRadius: '8px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {customers
                    .filter(c => 
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.phone?.includes(customerSearch) ||
                      c.email?.toLowerCase().includes(customerSearch.toLowerCase())
                    )
                    .map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCustomer(c.id);
                          setCustomerSearch(c.name);
                          setShowCustomerDropdown(false);
                          // Auto-fill customer details
                          setPhone(c.phone || "");
                          setEmail(c.email || "");
                          setAddress(c.address || "");
                        }}
                        style={{
                          padding: '10px 15px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: customer === c.id ? '#f5f9ff' : 'white',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        onMouseEnter={e => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={e => e.target.style.backgroundColor = customer === c.id ? '#f5f9ff' : 'white'}
                      >
                        <strong>{c.name}</strong>
                        <span style={{ fontSize: '0.85em', color: '#666' }}>{c.phone} {c.email ? `• ${c.email}` : ''}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <label>Phone Number</label>
            <input value={phone} placeholder="Customer phone" readOnly disabled />
            <label>Email</label>
            <input value={email} placeholder="Customer email" type="email" readOnly disabled />
            <label>Address</label>
            <input value={address} placeholder="Customer address" readOnly disabled />
            <hr /><h4>Add Item</h4>
            <div className="item-form">
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={selectedProductId ? availableProducts.find(p => p.id === selectedProductId)?.name || '' : productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Search products..."
                  className="fullwidth"
                  style={{ marginBottom: 0 }}
                />
                {showProductDropdown && (
                  <div className="product-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #eef2f7',
                    borderRadius: '8px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {availableProducts
                      .filter(p => 
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.description?.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.price.toString().includes(productSearch)
                      )
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setProductSearch('');
                            setShowProductDropdown(false);
                            // Focus on quantity input after selection
                            document.querySelector('.quantity-input')?.focus();
                          }}
                          style={{
                            padding: '10px 15px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: selectedProductId === p.id ? '#f5f9ff' : 'white',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onMouseEnter={e => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={e => e.target.style.backgroundColor = selectedProductId === p.id ? '#f5f9ff' : 'white'}
                        >
                          <div>
                            <div style={{ fontWeight: 500 }}>{p.name}</div>
                            {p.description && (
                              <div style={{ fontSize: '0.85em', color: '#666' }}>{p.description}</div>
                            )}
                          </div>
                          <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '10px' }}>₹{p.price.toFixed(2)}</div>
                        </div>
                      ))}
                    {availableProducts.filter(p => 
                      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.description?.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.price.toString().includes(productSearch)
                    ).length === 0 && (
                      <div style={{ padding: '10px 15px', color: '#666', fontStyle: 'italic' }}>
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </div>
              <input 
                className="quantity-input"
                value={itemQty} 
                onChange={e => setItemQty(e.target.value)} 
                placeholder="Qty" 
                type="number" 
                min="1" 
                style={{ width: '80px', textAlign: 'center' }}
              />
              <button 
                type="button" 
                className="small-btn" 
                onClick={handleAddItem}
                style={{ minWidth: '80px' }}
                disabled={!selectedProductId || !itemQty}
              >
                <i className="fas fa-plus"></i> Add
              </button>
            </div>
            {items.length>0 && (
              <table className="mini-table">
                <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
                <tbody>
                  {items.map((it,i)=><tr key={i}>
                    <td>{it.name}</td>
                    <td>{it.qty}</td>
                    <td>{currency(it.rate)}</td>
                    <td>{currency(it.qty*it.rate)}</td>
                  </tr>)}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" style={{textAlign: 'right'}}><strong>Subtotal:</strong></td>
                    <td>{currency(items.reduce((sum, item) => sum + (item.qty * item.rate), 0))}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{textAlign: 'right'}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                        <strong>Discount (%):</strong>
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={discount} 
                          onChange={e => setDiscount(e.target.value)}
                          style={{width: '60px', marginLeft: '10px'}}
                        />
                      </div>
                    </td>
                    <td>
                      {currency((items.reduce((sum, item) => sum + (item.qty * item.rate), 0) * discount / 100))}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{textAlign: 'right'}}><strong>Total:</strong></td>
                    <td>
                      {currency(items.reduce((sum, item) => sum + (item.qty * item.rate), 0) * (1 - discount / 100))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
            <button type="submit" className="blue fullwidth"><i className="fas fa-file-alt"></i> Generate Invoice</button>
          </form>
        </div>

        <div className="invoice-card">
          <h3><i className="fas fa-list-ul"></i> Invoices</h3>
          <ul className="invoice-list">
            {invoices.map(inv=>(
              <li key={inv.id} className="invoice-row">
                <div><strong>#{inv.id}</strong> — {inv.customer?.name || 'Customer not found'}<br /><span className="muted">{new Date(inv.created_at).toLocaleDateString()}</span></div>
                <div className="invoice-actions">
                  <span className="highlight">Total: {currency(inv.total)}</span>
                  <button className="action-btn print" onClick={()=>printInvoice(inv)} title="Print Invoice"><i className="fas fa-print"></i></button>
                  <button className="action-btn download" onClick={()=>downloadInvoice(inv)} title="Download PDF"><i className="fas fa-download"></i></button>
                  <button className="action-btn sms" onClick={()=>sendSMS(inv)} title="Send SMS"><i className="fas fa-comment-alt"></i></button>
                  <button className="action-btn copy" onClick={()=>{navigator.clipboard.writeText(JSON.stringify(inv)); alert("Copied!");}} title="Copy JSON"><i className="fas fa-copy"></i></button>
                  <button className="action-btn delete" onClick={()=>setShowDeleteConfirm(inv.id)} title="Delete Invoice"><i className="fas fa-trash"></i></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this invoice?</p>
            <div className="form-actions">
              <button className="submit-btn" onClick={() => handleDeleteInvoice(showDeleteConfirm)}>
                Confirm
              </button>
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}