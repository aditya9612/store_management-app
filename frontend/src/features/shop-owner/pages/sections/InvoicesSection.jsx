import React, { useState, useEffect } from "react";
import { AuthService } from "@/utils/auth";
import "@/features/shop-owner/styles/shop-owner-invoice.css";
import { authService, productsApi, ordersApi, api } from "@/utils/api";

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
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [itemQty, setItemQty] = useState("");
  const [manualEntry, setManualEntry] = useState(false);
  const [manualProduct, setManualProduct] = useState({
    name: "",
    price: "",
    description: ""
  });
  const [discount, setDiscount] = useState(0);
  const [shopDetails] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  
  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#4338ca'
    }
  };

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
  }, [shopKey, selectedShop?.id]); // Removed setCustomers and setInvoices from dependency array

  // Effect for handling clicks outside customer dropdown and escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowCustomerDropdown(false);
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideCustomer);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideCustomer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCustomerDropdown]);

  // Effect for handling clicks outside product dropdown
  useEffect(() => {
    const handleClickOutsideProduct = (event) => {
      if (!event.target.closest('.product-search-container')) {
        setShowProductDropdown(false);
      }
    };

    if (showProductDropdown) {
      document.addEventListener('mousedown', handleClickOutsideProduct);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideProduct);
    };
  }, [showProductDropdown]);

  const handleCustomerInputFocus = () => {
    setShowCustomerDropdown(true);
    if (!customerSearch.trim()) {
      // Show all customers when input is focused and empty
      setCustomerSearch('');
    }
  };

  // Handle clicking outside the customer dropdown
  const handleClickOutsideCustomer = (event) => {
    const customerSelector = document.querySelector('.customer-selector');
    if (customerSelector && !customerSelector.contains(event.target)) {
      setShowCustomerDropdown(false);
    }
  };

  const handleCustomerSelection = (selectedCustomer) => {
    setCustomer(selectedCustomer.id);
    setCustomerSearch(selectedCustomer.name);
    setShowCustomerDropdown(false);
    // Auto-fill customer details
    setPhone(selectedCustomer.phone || "");
    setEmail(selectedCustomer.email || "");
    setAddress(selectedCustomer.address || "");
    // Hide add customer form if it was shown
    setShowAddCustomerForm(false);
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) return false;
    // Check if it's exactly 10 digits and starts with 6-9
    return /^[6-9]\d{9}$/.test(phone);
  };

  const handlePhoneChange = (e) => {
    // Get only digits and limit to 10 characters
    let value = e.target.value.replace(/\D/g, '').slice(0, 10);
    
    // If first digit is 1-5, don't update the value
    if (value.length > 0 && /^[1-5]/.test(value)) {
      return;
    }
    
    setNewCustomer({...newCustomer, phone: value});
  };

  const handlePhoneBlur = (e) => {
    const value = e.target.value;
    // Only show error if field is not empty and doesn't match the pattern
    if (value && !/^[6-9]\d{0,9}$/.test(value)) {
      e.target.setCustomValidity('Please enter a valid 10-digit number starting with 6-9');
    } else {
      e.target.setCustomValidity('');
    }
  };

  const getPhoneBorderColor = (phone) => {
    if (!phone) return inputStyle.borderColor;
    if (phone.length === 10 && !validatePhoneNumber(phone)) {
      return '#ef4444'; // Red for invalid complete number
    }
    return inputStyle.borderColor; // Default border color for valid or in-progress numbers
  };

  const handleAddNewCustomer = async (e) => {
    e.preventDefault();
    
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Name and phone number are required');
      return;
    }
    
    if (!validatePhoneNumber(newCustomer.phone)) {
      alert('Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9');
      return;
    }

    try {
      const storeId = selectedShop?.id;
      if (!storeId) {
        throw new Error('No shop selected');
      }

      // Create customer with store association
      const response = await authService.createCustomer({
        ...newCustomer,
        store_id: storeId
      });

      if (response && response.data) {
        // Update local state
        const createdCustomer = response.data;
        setCustomers([...customers, createdCustomer]);
        
        // Select the newly created customer
        handleCustomerSelection(createdCustomer);
        
        // Reset form
        setNewCustomer({
          name: "",
          phone: "",
          email: "",
          address: ""
        });
        
        // Hide the add form
        setShowAddCustomerForm(false);
        
        alert('Customer added successfully!');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert(`Failed to add customer: ${error.message || 'Unknown error'}`);
    }
  };

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

  // Function to download invoice as HTML file
  const downloadInvoice = async (invoice) => {
    try {
      console.log('Downloading HTML invoice:', invoice.id);

      const subtotal = invoice.items.reduce((s, it) => s + (it.quantity||it.qty) * (it.price||it.rate), 0);
      const discountPercent = invoice.discount || 0;
      const discountAmount = subtotal * (discountPercent / 100);
      const total = subtotal - discountAmount;

      // Use real shop details from selectedShop prop
      const currentShop = selectedShop || {};
      const shopOwner = loggedInOwner || {};

      // Use only real data from shop and customer - no fallbacks
      const storeAddress = currentShop.address || currentShop.location || "";
      const gstin = currentShop.gstin || shopOwner.gstin || "";
      const corporateAddress = currentShop.corporate_address || shopOwner.corporate_address || "";
      const storeName = currentShop.name || currentShop.store_name || "";

      const customerNumber = invoice.customer?.phone || "";
      const landmarkRewards = invoice.customer?.loyalty_number || "";
      const customerId = invoice.customer?.id || "";

      // Use real store and transaction details - no fallbacks
      const storeId = currentShop.id ? String(currentShop.id).padStart(5, '0') : "";
      const posNo = currentShop.pos_id || "";
      const cashierName = shopOwner.name || "";
      const cashierId = shopOwner.employee_id || "";
      const transactionNo = invoice.id ? String(invoice.id).padStart(7, '0') : "";
      const tillNo = currentShop.till_id || "";

      const invoiceDate = new Date(invoice.created_at).toLocaleDateString('en-IN');
      const invoiceTime = new Date(invoice.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const fullDateTime = `${invoiceDate} ${invoiceTime}`;

      // Calculate tax details for different tax categories
      const cgstRate = 9;
      const sgstRate = 9;

      // Calculate tax for different categories (A/B for main items, C/D for bags, E/F for contributions)
      const mainItemsSubtotal = subtotal * 0.95; // 95% of subtotal for A/B category
      const bagAmount = 13.00; // Bag amount for C/D category
      const contributionAmount = 2.00; // Contribution amount for E/F category

      const cgstAmountA = (mainItemsSubtotal * 9) / 100;
      const sgstAmountA = (mainItemsSubtotal * 9) / 100;
      const cgstAmountC = (bagAmount * 2.5) / 100;
      const sgstAmountC = (bagAmount * 2.5) / 100;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tax Invoice - ${invoice.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.3;
              padding: 15px;
              max-width: 80mm;
              margin: 0 auto;
              color: #000;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .header h1 {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .store-info {
              margin-bottom: 12px;
              line-height: 1.2;
            }
            .store-info p {
              margin-bottom: 2px;
            }
            .store-info .label {
              font-weight: bold;
            }
            .invoice-details {
              display: table;
              width: 100%;
              margin-bottom: 12px;
              border-collapse: collapse;
            }
            .invoice-details td {
              padding: 1px 0;
              vertical-align: top;
              font-size: 10px;
            }
            .invoice-details .label {
              font-weight: bold;
              width: 45%;
            }
            .customer-info {
              margin-bottom: 12px;
              padding: 6px;
              border: 1px solid #000;
              background: #f9f9f9;
            }
            .customer-info p {
              margin-bottom: 2px;
            }
            .item-table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            .item-table th,
            .item-table td {
              border: 1px solid #000;
              padding: 3px;
              text-align: left;
              font-size: 10px;
            }
            .item-table th {
              font-weight: bold;
              background-color: #f0f0f0;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-section {
              margin-top: 12px;
              padding: 6px;
              border: 1px solid #000;
              background: #f9f9f9;
            }
            .total-section p {
              margin-bottom: 2px;
            }
            .tax-table {
              width: 100%;
              border-collapse: collapse;
              margin: 8px 0;
            }
            .tax-table th,
            .tax-table td {
              border: 1px solid #000;
              padding: 2px;
              font-size: 9px;
            }
            .tax-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 9px;
              border-top: 1px solid #000;
              padding-top: 8px;
            }
            .terms-conditions {
              margin-top: 15px;
              padding: 8px;
              border-top: 1px solid #000;
              font-size: 7px;
              line-height: 1.1;
              page-break-inside: avoid;
            }
            .terms-title {
              font-weight: bold;
              font-size: 8px;
              margin-bottom: 3px;
              text-align: center;
              text-decoration: underline;
            }
            .terms-list {
              list-style-type: decimal;
              padding-left: 8px;
              margin: 0;
            }
            .terms-list li {
              margin-bottom: 1px;
              text-align: justify;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <h1>Tax Invoice/Bill of Supply</h1>
          </div>

          <!-- Store Information -->
          <div class="store-info">
            ${storeName ? `<p><span class="label">Store Name:</span> ${storeName}</p>` : ''}
            ${storeAddress ? `<p><span class="label">Store Address:</span></p><p>${storeAddress}</p>` : ''}
            <p><span class="label">Billing Location:</span> MAHARASHTRA</p>
          </div>

          <!-- Customer Information -->
          <div class="customer-info">
            ${invoice.customer?.name || invoice.customer_name ? `<p><span class="label">Customer Name:</span> ${invoice.customer?.name || invoice.customer_name}</p>` : ''}
            ${customerNumber ? `<p><span class="label">Customer No.:</span> ${customerNumber}</p>` : ''}
            ${customerId ? `<p><span class="label">Customer Id:</span> ${customerId}</p>` : ''}
          </div>

          <!-- Invoice Details Table -->
          <table class="invoice-details">
            ${invoice.id ? `<tr><td class="label">Invoice No.:</td><td>${String(invoice.id).padStart(15, '0')}</td></tr>` : ''}
            ${storeId ? `<tr><td class="label">Store ID:</td><td>${storeId}</td></tr>` : ''}
            ${cashierName ? `<tr><td class="label">Cashier Name:</td><td>${cashierName}</td></tr>` : ''}
            ${transactionNo ? `<tr><td class="label">Transaction No:</td><td>${transactionNo}</td></tr>` : ''}
            <tr><td class="label">Invoice Date:</td><td>${fullDateTime}</td></tr>
          </table>

          <!-- Items Table -->
          <table class="item-table">
            <thead>
              <tr>
                <th>ITEM_NAME</th>
                <th>ITEM_CODE</th>
                <th>HSN</th>
                <th>QTY</th>
                <th>MRP</th>
                <th>RSP</th>
                <th>TAX</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((it, index) => {
                const itemCode = `89092710${String(it.product_id || index).padStart(4, '0')}`;
                const hsnCode = index < 3 ? "62034300" : index === 3 ? "48192090" : "49029020";
                const mrp = (it.price || it.rate).toFixed(2);
                const rsp = index < 3 ? (mrp * 0.886).toFixed(2) : mrp; // 11.4% discount for main items
                const taxCategory = index < 3 ? "A/B" : index === 3 ? "C/D" : "E/F";
                const itemName = it.name || it.product_name || it.product?.name || 'Product';
                return `
                <tr>
                  <td>${itemName}</td>
                  <td>${itemCode}</td>
                  <td>${hsnCode}</td>
                  <td class="text-center">${it.quantity || it.qty}</td>
                  <td class="text-right">${mrp}</td>
                  <td class="text-right">${rsp}</td>
                  <td class="text-center">${taxCategory}</td>
                </tr>
                ${index < 3 && it.quantity > 0 ? `
                <tr>
                  <td colspan="7" style="font-size: 9px; padding: 1px 3px;">Discount ${(parseFloat(mrp) - parseFloat(rsp)).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="7" style="font-size: 9px; padding: 1px 3px;">Color: ${it.color || 'MIX'} Size: ${it.size || 'MIX'}</td>
                </tr>` : index === 3 ? `
                <tr>
                  <td colspan="7" style="font-size: 9px; padding: 1px 3px;">LS-PAPER CARRY BAG BROWN L 38 CM X 45 CM X 11 CM</td>
                </tr>
                <tr>
                  <td colspan="7" style="font-size: 9px; padding: 1px 3px;">Color: ${it.color || 'BROWN'} Size: ${it.size || 'L'}</td>
                </tr>` : `
                <tr>
                  <td colspan="7" style="font-size: 9px; padding: 1px 3px;">Contribution for Landmark Cares</td>
                </tr>
                <tr>
                  <td colspan="7" style="font-size: 9px; padding: 1px 3px;">Color: ${it.color || 'MIX'} Size: ${it.size || 'MIX'}</td>
                </tr>`}
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Tax Tables -->
          <div style="margin-top: 10px;">
            <p><strong>Total Taxable Value</strong></p>

            <table class="tax-table">
              <thead>
                <tr>
                  <th>TAX</th>
                  <th>TAX CODE</th>
                  <th>TAXABLE AMT</th>
                  <th>RATE</th>
                  <th>TAX AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CGST</td>
                  <td>A</td>
                  <td class="text-right">${mainItemsSubtotal.toFixed(2)}</td>
                  <td class="text-right">${cgstRate}%</td>
                  <td class="text-right">${cgstAmountA.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>SGST</td>
                  <td>B</td>
                  <td class="text-right">${mainItemsSubtotal.toFixed(2)}</td>
                  <td class="text-right">${sgstRate}%</td>
                  <td class="text-right">${sgstAmountA.toFixed(2)}</td>
                </tr>
                ${bagAmount > 0 ? `
                <tr>
                  <td>CGST</td>
                  <td>C</td>
                  <td class="text-right">${bagAmount.toFixed(2)}</td>
                  <td class="text-right">2.50%</td>
                  <td class="text-right">${cgstAmountC.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>SGST</td>
                  <td>D</td>
                  <td class="text-right">${bagAmount.toFixed(2)}</td>
                  <td class="text-right">2.50%</td>
                  <td class="text-right">${sgstAmountC.toFixed(2)}</td>
                </tr>` : ''}
                ${contributionAmount > 0 ? `
                <tr>
                  <td>CGST</td>
                  <td>E</td>
                  <td class="text-right">${contributionAmount.toFixed(2)}</td>
                  <td class="text-right">0.00%</td>
                  <td class="text-right">0.00</td>
                </tr>
                <tr>
                  <td>SGST</td>
                  <td>F</td>
                  <td class="text-right">${contributionAmount.toFixed(2)}</td>
                  <td class="text-right">0.00%</td>
                  <td class="text-right">0.00</td>
                </tr>` : ''}
              </tbody>
            </table>
          </div>

          <!-- Summary Section -->
          <div class="total-section">
            <p><strong>Total Savings:</strong> ${discountAmount.toFixed(2)}</p>
            <p><strong>Rounded off Amount:</strong> ${Math.round(total).toFixed(2)}</p>
            <p><strong>Total Numbers of Items:</strong> ${invoice.items.reduce((sum, it) => sum + (it.quantity || it.qty), 0)}/5</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Date and Time: ${fullDateTime}</p>
            <p>Txn/Auth/Order: ${transactionNo}</p>
            <p>PHONE PE-P ${Math.round(total).toFixed(2)}</p>
            <p>${Math.round(total).toFixed(2)}</p>
          </div>

          <!-- Terms and Conditions -->
          <div class="terms-conditions">
            <div class="terms-title">🧾 Shop / Store Terms & Conditions</div>
            <ol class="terms-list">
              <li>Merchandise can be exchanged within 7–30 days from purchase date if unused, undamaged, with original tag & invoice. Exchange only at purchase store & subject to stock availability.</li>
              <li>No exchange/return for undergarments, cosmetics, perfumes, accessories, food items, electronics, or discounted/sale products.</li>
              <li>No cash refunds. Only credit notes or exchanges offered equal to invoiced value of returned item.</li>
              <li>Credit notes valid for 90 days from issue & must be presented in original. No duplicates issued.</li>
              <li>Shop not responsible for damage, loss, or injury from product use. Please check items before leaving counter.</li>
              <li>All warranties as per manufacturer's terms only. Defective items must be reported within 24–48 hours.</li>
              <li>Store reserves right to change terms, prices, or refuse service for fraud/misuse cases.</li>
              <li>All disputes subject to local court jurisdiction. Retain original invoice for all claims.</li>
            </ol>
          </div>
        </body>
        </html>
      `;

      // Create blob and trigger download
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoice.id}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('Invoice HTML downloaded successfully');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert(`Error downloading invoice: ${err.message}`);
    }
  };

  // Function to print invoice
  const printInvoice = async (invoice) => {
    try {
      console.log('Print invoice data:', invoice);
      console.log('Print invoice items:', invoice.items);

      const subtotal = invoice.items.reduce((s, it) => s + (it.quantity||it.qty) * (it.price||it.rate), 0);
      const discountPercent = invoice.discount || 0;
      const discountAmount = subtotal * (discountPercent / 100);
      const total = subtotal - discountAmount;

      // Use real shop details from selectedShop prop
      const currentShop = selectedShop || {};
      const shopOwner = loggedInOwner || {};

      // Use only real data from shop and customer - no fallbacks
      const storeAddress = currentShop.address || currentShop.location || "";
      const gstin = currentShop.gstin || shopOwner.gstin || "";
      const corporateAddress = currentShop.corporate_address || shopOwner.corporate_address || "";
      const storeName = currentShop.name || currentShop.store_name || "";

      const customerNumber = invoice.customer?.phone || "";
      const landmarkRewards = invoice.customer?.loyalty_number || "";
      const customerId = invoice.customer?.id || "";

      // Use real store and transaction details - no fallbacks
      const storeId = currentShop.id ? String(currentShop.id).padStart(5, '0') : "";
      const posNo = currentShop.pos_id || "";
      const cashierName = shopOwner.name || "";
      const cashierId = shopOwner.employee_id || "";
      const transactionNo = invoice.id ? String(invoice.id).padStart(7, '0') : "";
      const tillNo = currentShop.till_id || "";

      const invoiceDate = new Date(invoice.created_at).toLocaleDateString('en-IN');
      const invoiceTime = new Date(invoice.created_at).toLocaleTimeString('en-IN');

      // Calculate tax details for different tax categories
      const cgstRate = 9;
      const sgstRate = 9;

      // Calculate tax for different categories (A/B for main items, C/D for bags, E/F for contributions)
      const mainItemsSubtotal = subtotal * 0.95; // 95% of subtotal for A/B category
      const bagAmount = 13.00; // Bag amount for C/D category
      const contributionAmount = 2.00; // Contribution amount for E/F category

      const cgstAmountA = (mainItemsSubtotal * 9) / 100;
      const sgstAmountA = (mainItemsSubtotal * 9) / 100;
      const cgstAmountC = (bagAmount * 2.5) / 100;
      const sgstAmountC = (bagAmount * 2.5) / 100;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tax Invoice - ${invoice.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.3;
              padding: 15px;
              max-width: 80mm;
              margin: 0 auto;
              color: #000;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .header h1 {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .store-info {
              margin-bottom: 12px;
              line-height: 1.2;
            }
            .store-info p {
              margin-bottom: 2px;
            }
            .store-info .label {
              font-weight: bold;
            }
            .invoice-details {
              display: table;
              width: 100%;
              margin-bottom: 12px;
              border-collapse: collapse;
            }
            .invoice-details td {
              padding: 1px 0;
              vertical-align: top;
              font-size: 10px;
            }
            .invoice-details .label {
              font-weight: bold;
              width: 45%;
            }
            .customer-info {
              margin-bottom: 12px;
              padding: 6px;
              border: 1px solid #000;
              background: #f9f9f9;
            }
            .customer-info p {
              margin-bottom: 2px;
            }
            .item-table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            .item-table th,
            .item-table td {
              border: 1px solid #000;
              padding: 3px;
              text-align: left;
              font-size: 10px;
            }
            .item-table th {
              font-weight: bold;
              background-color: #f0f0f0;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-section {
              margin-top: 12px;
              padding: 6px;
              border: 1px solid #000;
              background: #f9f9f9;
            }
            .total-section p {
              margin-bottom: 2px;
            }
            .tax-table {
              width: 100%;
              border-collapse: collapse;
              margin: 8px 0;
            }
            .tax-table th,
            .tax-table td {
              border: 1px solid #000;
              padding: 2px;
              font-size: 9px;
            }
            .tax-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 9px;
              border-top: 1px solid #000;
              padding-top: 8px;
            }
            .terms-conditions {
              margin-top: 15px;
              padding: 8px;
              border-top: 1px solid #000;
              font-size: 7px;
              line-height: 1.1;
              page-break-inside: avoid;
            }
            .terms-title {
              font-weight: bold;
              font-size: 8px;
              margin-bottom: 3px;
              text-align: center;
              text-decoration: underline;
            }
            .terms-list {
              list-style-type: decimal;
              padding-left: 8px;
              margin: 0;
            }
            .terms-list li {
              margin-bottom: 1px;
              text-align: justify;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <h1>Tax Invoice/Bill of Supply</h1>
          </div>

          <!-- Store Information -->
          <div class="store-info">
            ${storeName ? `<p><span class="label">Store Name:</span> ${storeName}</p>` : ''}
            ${storeAddress ? `<p><span class="label">Store Address:</span></p><p>${storeAddress}</p>` : ''}
            ${gstin ? `<p><span class="label">GSTIN No.</span> ${gstin}</p>` : ''}
            ${corporateAddress ? `<p><span class="label">Corporate Address:</span></p><p>${corporateAddress}</p>` : ''}
            <p><span class="label">Billing Location:</span> MAHARASHTRA</p>
          </div>

          <!-- Customer Information -->
          <div class="customer-info">
            ${invoice.customer?.name || invoice.customer_name ? `<p><span class="label">Customer Name:</span> ${invoice.customer?.name || invoice.customer_name}</p>` : ''}
            ${customerNumber ? `<p><span class="label">Customer No.:</span> ${customerNumber}</p>` : ''}
            ${landmarkRewards ? `<p><span class="label">Landmark Rewards No:</span> ${landmarkRewards}</p>` : ''}
            ${customerId ? `<p><span class="label">Customer Id:</span> ${customerId}</p>` : ''}
          </div>

          <!-- Invoice Details Table -->
          <table class="invoice-details">
            ${invoice.id ? `<tr><td class="label">Invoice No.:</td><td>${String(invoice.id).padStart(15, '0')}</td></tr>` : ''}
            ${storeId ? `<tr><td class="label">Store ID:</td><td>${storeId}</td></tr>` : ''}
            ${posNo ? `<tr><td class="label">Pos No:</td><td>${posNo}</td></tr>` : ''}
            ${cashierName ? `<tr><td class="label">Cashier Name:</td><td>${cashierName}</td></tr>` : ''}
            ${cashierId ? `<tr><td class="label">Cashier ID:</td><td>${cashierId}</td></tr>` : ''}
            ${transactionNo ? `<tr><td class="label">Transaction No:</td><td>${transactionNo}</td></tr>` : ''}
            <tr><td class="label">Invoice Date:</td><td>${invoiceDate} ${invoiceTime}</td></tr>
            ${tillNo ? `<tr><td class="label">Till No:</td><td>${tillNo}</td></tr>` : ''}
          </table>

          <!-- Items Table -->
          <table class="item-table">
            <thead>
              <tr>
                <th>ITEM_NAME</th>
                <th>ITEM_CODE</th>
                <th>HSN</th>
                <th>QTY</th>
                <th>MRP</th>
                <th>RSP</th>
                <th>TAX</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((it, index) => {
                console.log('Processing item:', it); // Debug log
                const itemCode = `89092710${String(it.product_id || index).padStart(4, '0')}`;
                const hsnCode = index < 3 ? "62034300" : index === 3 ? "48192090" : "49029020";
                const mrp = (it.price || it.rate).toFixed(2);
                const rsp = index < 3 ? (mrp * 0.886).toFixed(2) : mrp; // 11.4% discount for main items
                const taxCategory = index < 3 ? "A/B" : index === 3 ? "C/D" : "E/F";
                const itemName = it.name || it.product_name || it.product?.name || 'Product';
                console.log('Item name:', itemName); // Debug log
                return `
                <tr>
                  <td>${itemName}</td>
                  <td>${itemCode}</td>
                  <td>${hsnCode}</td>
                  <td class="text-center">${it.quantity || it.qty}</td>
                  <td class="text-right">${mrp}</td>
                  <td class="text-right">${rsp}</td>
                  <td class="text-center">${taxCategory}</td>
                </tr>
                ${index < 3 && it.quantity > 0 ? `
                <tr>
                  <td colspan="7" class="small">Discount ${(parseFloat(mrp) - parseFloat(rsp)).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="7" class="small">Color: ${it.color || 'MIX'} Size: ${it.size || 'MIX'}</td>
                </tr>` : index === 3 ? `
                <tr>
                  <td colspan="7" class="small">LS-PAPER CARRY BAG BROWN L 38 CM X 45 CM X 11 CM</td>
                </tr>
                <tr>
                  <td colspan="7" class="small">Color: ${it.color || 'BROWN'} Size: ${it.size || 'L'}</td>
                </tr>` : `
                <tr>
                  <td colspan="7" class="small">Contribution for Landmark Cares</td>
                </tr>
                <tr>
                  <td colspan="7" class="small">Color: ${it.color || 'MIX'} Size: ${it.size || 'MIX'}</td>
                </tr>`}
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Tax Tables -->
          <div style="margin-top: 10px;">
            <p><strong>Total Taxable Value</strong></p>

            <table class="tax-table">
              <thead>
                <tr>
                  <th>TAX</th>
                  <th>TAX CODE</th>
                  <th>TAXABLE AMT</th>
                  <th>RATE</th>
                  <th>TAX AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CGST</td>
                  <td>A</td>
                  <td class="text-right">${mainItemsSubtotal.toFixed(2)}</td>
                  <td class="text-right">${cgstRate}%</td>
                  <td class="text-right">${cgstAmountA.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>SGST</td>
                  <td>B</td>
                  <td class="text-right">${mainItemsSubtotal.toFixed(2)}</td>
                  <td class="text-right">${sgstRate}%</td>
                  <td class="text-right">${sgstAmountA.toFixed(2)}</td>
                </tr>
                ${bagAmount > 0 ? `
                <tr>
                  <td>CGST</td>
                  <td>C</td>
                  <td class="text-right">${bagAmount.toFixed(2)}</td>
                  <td class="text-right">2.50%</td>
                  <td class="text-right">${cgstAmountC.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>SGST</td>
                  <td>D</td>
                  <td class="text-right">${bagAmount.toFixed(2)}</td>
                  <td class="text-right">2.50%</td>
                  <td class="text-right">${sgstAmountC.toFixed(2)}</td>
                </tr>` : ''}
                ${contributionAmount > 0 ? `
                <tr>
                  <td>CGST</td>
                  <td>E</td>
                  <td class="text-right">${contributionAmount.toFixed(2)}</td>
                  <td class="text-right">0.00%</td>
                  <td class="text-right">0.00</td>
                </tr>
                <tr>
                  <td>SGST</td>
                  <td>F</td>
                  <td class="text-right">${contributionAmount.toFixed(2)}</td>
                  <td class="text-right">0.00%</td>
                  <td class="text-right">0.00</td>
                </tr>` : ''}
              </tbody>
            </table>
          </div>

          <!-- Summary Section -->
          <div class="total-section">
            <p><strong>Total Savings:</strong> ${discountAmount.toFixed(2)}</p>
            <p><strong>Rounded off Amount:</strong> ${Math.round(total).toFixed(2)}</p>
            <p><strong>Total Numbers of Items:</strong> ${invoice.items.reduce((sum, it) => sum + (it.quantity || it.qty), 0)}/5</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Date and Time: ${invoiceDate} ${invoiceTime}</p>
            <p>Txn/Auth/Order: ${transactionNo}</p>
            <p>PHONE PE-P ${Math.round(total).toFixed(2)}</p>
            <p>${Math.round(total).toFixed(2)}</p>
          </div>

          <!-- Terms and Conditions -->
          <div class="terms-conditions">
            <div class="terms-title">🧾 Shop / Store Terms & Conditions</div>
            <ol class="terms-list">
              <li>Merchandise can be exchanged within 7–30 days from purchase date if unused, undamaged, with original tag & invoice. Exchange only at purchase store & subject to stock availability.</li>
              <li>No exchange/return for undergarments, cosmetics, perfumes, accessories, food items, electronics, or discounted/sale products.</li>
              <li>No cash refunds. Only credit notes or exchanges offered equal to invoiced value of returned item.</li>
              <li>Credit notes valid for 90 days from issue & must be presented in original. No duplicates issued.</li>
              <li>Shop not responsible for damage, loss, or injury from product use. Please check items before leaving counter.</li>
              <li>All warranties as per manufacturer's terms only. Defective items must be reported within 24–48 hours.</li>
              <li>Store reserves right to change terms, prices, or refuse service for fraud/misuse cases.</li>
              <li>All disputes subject to local court jurisdiction. Retain original invoice for all claims.</li>
            </ol>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      // Open in new window and trigger print
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (!printWindow) {
        alert("Pop-up blocked! Please allow pop-ups for this site and try again.");
        return;
      }

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      console.log('Invoice opened for printing successfully');
    } catch (err) {
      console.error('Error printing invoice:', err);
      alert(`Error printing invoice: ${err.message}`);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();

    if (manualEntry) {
      // Handle manual entry with validation
      if (!manualProduct.name || !manualProduct.price || !itemQty) {
        alert('Please fill in all fields: Product Name, Price, and Quantity');
        return;
      }

      if (Number(manualProduct.price) <= 0) {
        alert('Price must be greater than 0');
        return;
      }

      if (Number(itemQty) <= 0) {
        alert('Quantity must be greater than 0');
        return;
      }

      setItems([...items, {
        product_id: `manual_${Date.now()}`,
        name: manualProduct.name.trim(),
        qty: Number(itemQty),
        rate: Number(manualProduct.price),
        description: manualProduct.description?.trim() || ''
      }]);

      // Reset manual form
      setManualProduct({
        name: "",
        price: "",
        description: ""
      });
    } else {
      // Handle product selection with validation
      if (!selectedProductId || !itemQty) {
        alert('Please select a product and enter quantity');
        return;
      }

      if (Number(itemQty) <= 0) {
        alert('Quantity must be greater than 0');
        return;
      }

      const product = availableProducts.find(p => String(p.id) === String(selectedProductId));
      if (!product) {
        alert('Selected product not found');
        return;
      }

      setItems([...items, {
        product_id: product.id,
        name: product.name,
        qty: Number(itemQty),
        rate: Number(product.price),
        description: product.description || ''
      }]);

      setSelectedProductId("");
    }

    setItemQty("");
    setProductSearch("");
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    const storeId = selectedShop?.id;
    if (!storeId || !customer || items.length === 0) {
      alert('Please select a customer and add at least one item');
      return;
    }

    try {
      // Prepare items with proper type checking
      const preparedItems = items.map((it, index) => {
        console.log(`Processing item ${index + 1}:`, it); // Debug logging

        // Safely handle product_id - ensure it's a string before calling startsWith
        const productIdValue = it.product_id;
        const isManualProduct = (typeof productIdValue === 'string' && productIdValue && productIdValue.startsWith('manual_'));
        const productId = isManualProduct ? null :
                         (productIdValue ? Number(productIdValue) : null);

        console.log(`Item ${index + 1} - isManual: ${isManualProduct}, productId: ${productId}`); // Debug logging

        // Ensure quantity is a positive number
        const quantity = Math.max(1, Number(it.qty) || 1);

        // Ensure price is a valid number
        const price = parseFloat(it.rate || 0);

        // Validate required fields
        if (!it.name || it.name.trim() === '') {
          throw new Error(`Item ${index + 1} is missing a name`);
        }

        if (price <= 0) {
          throw new Error(`Item ${index + 1} (${it.name}) has invalid price: ${price}`);
        }

        if (quantity <= 0) {
          throw new Error(`Item ${index + 1} (${it.name}) has invalid quantity: ${quantity}`);
        }

        // Build the item object matching backend schema
        const item = {
          product_id: productId,
          name: it.name.trim(),
          quantity: quantity,
          price: price,
          description: it.description ? it.description.trim() : null
        };

        console.log(`Item ${index + 1} processed:`, item); // Debug logging
        return item;
      });

      // Prepare the final payload matching backend schema
      const payload = {
        store_id: storeId,
        customer_id: Number(customer),
        discount: Number(discount) || 0,
        items: preparedItems
      };

      // Log the payload for debugging
      console.group('Invoice Payload');
      console.log('Raw payload:', payload);
      console.log('Stringified payload:', JSON.stringify(payload, null, 2));
      console.log('Items:', preparedItems);
      console.groupEnd();
      
      // Make the API call using ordersApi
      console.log('Sending order payload:', JSON.stringify(payload, null, 2));
      
      const response = await ordersApi.create(payload);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Get the order ID from response
      const orderId = response.data.id;
      console.log('Order created successfully with ID:', orderId);

      // Show success message
      alert(`Invoice generated successfully! Order ID: ${orderId}`);

      // Reset form
      setCustomer("");
      setPhone("");
      setEmail("");
      setAddress("");
      setItems([]);
      setDiscount(0);
      setProductSearch("");
      setSelectedProductId("");
      setManualProduct({ name: "", price: "", description: "" });
      setItemQty("");

      // Add a download button to the success message
      const downloadInvoice = async () => {
        try {
          console.log('Generating PDF invoice...');
          await ordersApi.generateInvoice(orderId);
          
          // Small delay to ensure PDF is ready
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const downloadResponse = await ordersApi.downloadInvoice(orderId);
          
          // Create blob and trigger download
          const blob = new Blob([downloadResponse.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `invoice_${orderId}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          
          console.log('PDF downloaded successfully');
        } catch (pdfError) {
          console.error('PDF generation/download failed:', pdfError);
          alert('Failed to download invoice. Please try again.');
        }
      };
      
      // Show success message with download button
      if (window.confirm('Invoice generated successfully! Click OK to download the invoice.')) {
        await downloadInvoice();
      }
      
      // Refresh the invoices list
      try {
        console.log('Refreshing invoices list...');
        const listResponse = await ordersApi.listByStore(storeId);
        setInvoices(listResponse.data || []);
        console.log('Invoices list refreshed');
      } catch (refreshError) {
        console.error('Error refreshing invoices list:', refreshError);
        // Try to continue even if refresh fails
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      let errorMessage = 'Failed to generate invoice.\n\n';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);

        const responseData = error.response.data;

        if (responseData.detail) {
          // Handle FastAPI validation errors
          if (Array.isArray(responseData.detail)) {
            // Pydantic validation errors
            errorMessage += 'Validation errors:\n';
            errorMessage += responseData.detail.map(err =>
              `- ${err.loc ? err.loc.join(' > ') + ': ' : ''}${err.msg || 'Unknown error'}`
            ).join('\n');
          } else if (typeof responseData.detail === 'string') {
            // Simple string error
            errorMessage += `Error: ${responseData.detail}`;
          } else {
            // Object error
            errorMessage += 'Validation error. Please check your input.';
            errorMessage += `\nDetails: ${JSON.stringify(responseData.detail, null, 2)}`;
          }
        } else if (responseData.message) {
          errorMessage += `Error: ${responseData.message}`;
        } else if (error.response.status === 422) {
          errorMessage += 'Validation error. Please check all required fields are filled correctly.';
          errorMessage += `\nReceived: ${JSON.stringify(responseData, null, 2)}`;
        } else {
          errorMessage += `Server error (${error.response.status}): ${error.response.statusText}`;
          errorMessage += `\nDetails: ${JSON.stringify(responseData, null, 2)}`;
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        console.error('Error setting up request:', error.message);
        errorMessage += `Request error: ${error.message}`;
      }

      alert(errorMessage);
    }
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

  const sendSMS = async (invoice) => {
    try {
      const total = invoice.items.reduce((s, it) => s + it.qty * it.rate * (1 - it.discount / 100), 0).toFixed(2);
      const customerName = invoice.customer?.name || invoice.customer_name || 'Customer';
      const customerPhone = invoice.customer?.phone || '9876543210'; // Fallback phone number

      const message = `Invoice #${invoice.id} for ${customerName}: Total ₹${total}. Thank you for shopping with us!`;

      const res = await fetch("http://localhost:5000/send-sms", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({to: customerPhone, body: message})
      });

      const data = await res.json();
      if(data.success) {
        alert("SMS sent successfully!");
      } else {
        alert(`Failed to send SMS: ${data.error}`);
      }
    } catch(err) {
      alert(`Error sending SMS: ${err.message}`);
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
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onClick={() => setShowCustomerDropdown(true)}
                  placeholder="Search customer..."
                  className="fullwidth"
                  style={{ flex: 1 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCustomerForm(!showAddCustomerForm);
                    setShowCustomerDropdown(false);
                  }}
                  style={{
                    background: showAddCustomerForm ? '#4f46e5' : '#e5e7eb',
                    color: showAddCustomerForm ? 'white' : '#4b5563',
                    border: '1px solid #e5e7eb',
                    padding: '0 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {showAddCustomerForm ? 'Cancel' : '+ New Customer'}
                </button>
              </div>

              {showAddCustomerForm ? (
                <div className="add-customer-form" style={{
                  padding: '15px',
                  margin: '10px 0',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Add New Customer</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      placeholder="Full Name *"
                      required
                      style={inputStyle}
                    />
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={newCustomer.phone}
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        placeholder="Phone Number *"
                        pattern="[6-9][0-9]{9}"
                        title="Please enter a valid 10-digit number starting with 6, 7, 8, or 9"
                        required
                        style={{
                          ...inputStyle,
                          borderColor: getPhoneBorderColor(newCustomer.phone),
                          paddingRight: '30px',
                          WebkitAppearance: 'textfield',
                          MozAppearance: 'textfield',
                          appearance: 'textfield'
                        }}
                        onKeyPress={(e) => {
                          // Prevent typing if first character is 1-5
                          const currentValue = newCustomer.phone || '';
                          if (currentValue.length === 0 && /^[1-5]$/.test(e.key)) {
                            e.preventDefault();
                            return;
                          }
                          
                          // Allow only numbers, backspace, tab, delete, and arrow keys
                          if (!/[0-9\b]/.test(e.key) && 
                              e.key !== 'Backspace' && 
                              e.key !== 'Delete' && 
                              e.key !== 'Tab' && 
                              !e.key.startsWith('Arrow')) {
                            e.preventDefault();
                          }
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280',
                        fontSize: '0.8em',
                        pointerEvents: 'none'
                      }}>
                        {newCustomer.phone ? `(${newCustomer.phone.length}/10)` : ''}
                      </span>
                      {newCustomer.phone && newCustomer.phone.length === 10 && !validatePhoneNumber(newCustomer.phone) && (
                        <div style={{
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          Must be 10 digits starting with 6-9
                        </div>
                      )}
                    </div>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      placeholder="Email"
                      style={inputStyle}
                    />
                    <textarea
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                      placeholder="Address"
                      rows="2"
                      style={{...inputStyle, minHeight: '60px', resize: 'vertical'}}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '5px' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddCustomerForm(false)}
                        style={{
                          background: '#e5e7eb',
                          color: '#4b5563',
                          border: '1px solid #d1d5db',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNewCustomer}
                        style={{
                          background: '#4f46e5',
                          color: 'white',
                          border: 'none',
                          padding: '6px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Add Customer
                      </button>
                    </div>
                  </div>
                </div>
              ) : showCustomerDropdown && (
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
                      !customerSearch.trim() ||
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      (c.phone && c.phone.includes(customerSearch)) ||
                      (c.email && c.email.toLowerCase().includes(customerSearch.toLowerCase()))
                    )
                    .map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleCustomerSelection(c)}
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
                        <span style={{ fontSize: '0.85em', color: '#666' }}>
                          {c.phone} {c.email ? `• ${c.email}` : ''}
                        </span>
                      </div>
                    ))}
                  {customers.filter(c =>
                    !customerSearch.trim() ||
                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                    (c.phone && c.phone.includes(customerSearch)) ||
                    (c.email && c.email.toLowerCase().includes(customerSearch.toLowerCase()))
                  ).length === 0 && (
                    <div style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      color: '#666',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <p style={{ margin: '0 0 10px' }}>No customers found</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomerDropdown(false);
                          setShowAddCustomerForm(true);
                          setNewCustomer(prev => ({
                            ...prev,
                            name: customerSearch,
                            phone: ''
                          }));
                        }}
                        style={{
                          background: '#4f46e5',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9em'
                        }}
                      >
                        Add "{customerSearch}" as new customer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <label>Phone Number</label>
            <input value={phone} placeholder="Customer phone" readOnly disabled />
            <label>Email</label>
            <input value={email} placeholder="Customer email" type="email" readOnly disabled />
            <label>Address</label>
            <input value={address} placeholder="Customer address" readOnly disabled />
            <hr />
            <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>Add Item</h4>
              <div className="toggle-buttons" style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button"
                  className={`small-btn ${!manualEntry ? 'active' : ''}`}
                  onClick={() => setManualEntry(false)}
                  style={{
                    background: !manualEntry ? '#4f46e5' : '#e5e7eb',
                    color: !manualEntry ? 'white' : '#4b5563',
                    border: '1px solid #e5e7eb',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                >
                  Search Product
                </button>
                <button 
                  type="button"
                  className={`small-btn ${manualEntry ? 'active' : ''}`}
                  onClick={() => setManualEntry(true)}
                  style={{
                    background: manualEntry ? '#4f46e5' : '#e5e7eb',
                    color: manualEntry ? 'white' : '#4b5563',
                    border: '1px solid #e5e7eb',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                >
                  Add Manually
                </button>
              </div>
            </div>
            <div className="item-form">
              {!manualEntry ? (
                <div className="product-search-container" style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={selectedProductId ? availableProducts.find(p => p.id === selectedProductId)?.name || '' : productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowProductDropdown(false);
                    }
                  }}
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
              ) : (
                <div className="manual-entry-form" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={manualProduct.name}
                    onChange={e => setManualProduct({...manualProduct, name: e.target.value})}
                    placeholder="Product Name"
                    className="fullwidth"
                    style={{ marginBottom: 0 }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      value={manualProduct.price}
                      onChange={e => setManualProduct({...manualProduct, price: e.target.value})}
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      style={{ flex: 1, textAlign: 'right' }}
                    />
                    <input 
                      className="quantity-input"
                      value={itemQty} 
                      onChange={e => setItemQty(e.target.value)} 
                      placeholder="Qty" 
                      type="number" 
                      min="1" 
                      style={{ width: '75px', textAlign: 'center' }}
                    />
                  </div>
                  <input
                    type="text"
                    value={manualProduct.description}
                    onChange={e => setManualProduct({...manualProduct, description: e.target.value})}
                    placeholder="Description (optional)"
                    className="fullwidth"
                    style={{ marginBottom: 0 }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  className="quantity-input"
                  value={itemQty} 
                  onChange={e => setItemQty(e.target.value)} 
                  placeholder="Qty" 
                  type="number" 
                  min="1" 
                  style={{ width: '75px', textAlign: 'center', display: manualEntry ? 'none' : 'block' }}
                />
                <button 
                  type="button" 
                  className="small-btn" 
                  onClick={handleAddItem}
                  style={{ minWidth: '75px' }}
                  disabled={manualEntry ? (!manualProduct.name || !manualProduct.price || !itemQty) : (!selectedProductId || !itemQty)}
                >
                  <i className="fas fa-plus"></i> Add
                </button>
              </div>
            </div>
            {items.length>0 && (
              <div className="invoice-preview-container">
                <div className="invoice-preview-header">
                  <h4><i className="fas fa-receipt"></i> Invoice Preview</h4>
                  <span className="item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="invoice-items-section">
                  <table className="mini-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{textAlign: 'center'}}>Qty</th>
                        <th style={{textAlign: 'right'}}>Rate</th>
                        <th style={{textAlign: 'right'}}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it,i)=><tr key={i}>
                        <td>
                          <div className="item-name">{it.name}</div>
                          {it.description && <div className="item-description">{it.description}</div>}
                        </td>
                        <td style={{textAlign: 'center'}}>{it.qty}</td>
                        <td style={{textAlign: 'right'}}>{currency(it.rate)}</td>
                        <td style={{textAlign: 'right', fontWeight: 'bold'}}>{currency(it.qty*it.rate)}</td>
                      </tr>)}
                    </tbody>
                  </table>
                </div>

                <div className="invoice-calculations-section">
                  <div className="calculation-row subtotal-row">
                    <span className="calc-label">Subtotal:</span>
                    <span className="calc-value">{currency(items.reduce((sum, item) => sum + (item.qty * item.rate), 0))}</span>
                  </div>

                  {discount > 0 && (
                    <div className="calculation-row discount-row">
                      <span className="calc-label">
                        Discount ({discount.toFixed(2)}%):
                      </span>
                      <span className="calc-value discount-amount">
                        -{currency((items.reduce((sum, item) => sum + (item.qty * item.rate), 0) * discount / 100))}
                      </span>
                    </div>
                  )}

                  <div className="calculation-row total-row">
                    <span className="calc-label">
                      <strong>Total{discount > 0 ? ` (after ${discount.toFixed(2)}% discount)` : ''}:</strong>
                    </span>
                    <span className="calc-value total-amount">
                      <strong>{currency(items.reduce((sum, item) => sum + (item.qty * item.rate), 0) * (1 - discount / 100))}</strong>
                    </span>
                  </div>
                </div>

                <div className="discount-input-section">
                  <label className="discount-label">Apply Discount (%)</label>
                  <div className="discount-input-wrapper">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={discount}
                      onChange={e => {
                        const value = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                        setDiscount(value);
                      }}
                      className="discount-input"
                      placeholder="0.00"
                    />
                    <span className="discount-unit">%</span>
                  </div>
                </div>
              </div>
            )}
            <button type="submit" className="blue fullwidth"><i className="fas fa-file-alt"></i> Generate Invoice</button>
          </form>
        </div>

        <div className="invoice-card">
          <h3><i className="fas fa-list-ul"></i> Invoices</h3>
          <ul className="invoice-list">
            {invoices.length === 0 ? (
              <li className="no-invoices">
                <i className="fas fa-file-invoice"></i>
                <p>No invoices found</p>
                <small>Create your first invoice using the form above</small>
              </li>
            ) : (
              invoices.map(inv => {
                console.log('Rendering invoice:', inv); // Debug logging
                const customerName = inv.customer?.name || inv.customer_name || 'Customer not found';
                return (
                  <li key={inv.id} className="invoice-row">
                    <div>
                      <strong>#{inv.id}</strong> — {customerName}
                      <br />
                      <span className="muted">{new Date(inv.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="invoice-actions">
                      <span className="highlight">Total: {currency(inv.total)}</span>
                      <button className="action-btn print" onClick={() => printInvoice(inv)} title="Print Invoice">
                        <i className="fas fa-print"></i>
                      </button>
                      <button className="action-btn download" onClick={() => downloadInvoice(inv)} title="Download PDF">
                        <i className="fas fa-download"></i>
                      </button>
                      <button className="action-btn sms" onClick={() => alert('SMS functionality coming soon!')} title="Send SMS">
                        <i className="fas fa-comment-alt"></i>
                      </button>
                      <button className="action-btn delete" onClick={() => setShowDeleteConfirm(inv.id)} title="Delete Invoice">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </li>
                );
              })
            )}
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