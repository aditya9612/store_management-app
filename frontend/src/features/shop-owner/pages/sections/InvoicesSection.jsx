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
      console.log('Download invoice data:', invoice);
      console.log('Download invoice items:', invoice.items);

      const subtotal = invoice.items.reduce((s, it) => s + (it.quantity||it.qty) * (it.price||it.rate), 0);
      const discountPercent = invoice.discount || 0;
      const discountAmount = subtotal * (discountPercent / 100);
      const total = subtotal - discountAmount;

      // Use real shop details from selectedShop prop
      const currentShop = selectedShop || {};
      const shopOwner = loggedInOwner || {};

      // Use only real data from shop and customer - no fallbacks
      const storeAddress = currentShop.location || currentShop.address || "";
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
            .highlight { font-weight: bold; }
            .small { font-size: 9px; }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
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
            ${storeName ? `<p><span class="label">Store Address:</span></p><p>${storeName}</p>` : ''}
            ${storeAddress ? `<p>${storeAddress}</p>` : ''}
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
                console.log('Download processing item:', it); // Debug log
                const itemCode = `89092710${String(it.product_id || index).padStart(4, '0')}`;
                const hsnCode = index < 3 ? "62034300" : index === 3 ? "48192090" : "49029020";
                const mrp = (it.price || it.rate).toFixed(2);
                const rsp = index < 3 ? (mrp * 0.886).toFixed(2) : mrp; // 11.4% discount for main items
                const taxCategory = index < 3 ? "A/B" : index === 3 ? "C/D" : "E/F";
                const itemName = it.name || it.product_name || it.product?.name || 'Product';
                console.log('Download item name:', itemName); // Debug log
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
        </body>
        </html>
      `;

      // Create a blob with the HTML content
      const blob = new Blob([html], { type: 'text/html' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoice.id}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      console.log('Invoice downloaded successfully');
    } catch (err) {
      console.error('Error downloading invoice:', err);
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
      items: items.map(it => ({ 
        product_id: it.product_id, 
        quantity: it.qty, 
        price: it.rate,
        name: it.name // Include product name in payload
      }))
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
    console.log('Invoice data:', invoice);
    console.log('Invoice items:', invoice.items);

    const subtotal = invoice.items.reduce((s, it) => s + (it.quantity||it.qty) * (it.price||it.rate), 0);
    const discountPercent = invoice.discount || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;

    // Use real shop details from selectedShop prop
    const currentShop = selectedShop || {};
    const shopOwner = loggedInOwner || {};

    // Use only real data from shop and customer - no fallbacks
    const storeAddress = currentShop.location || currentShop.address || "";
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
          .highlight { font-weight: bold; }
          .small { font-size: 9px; }
          @media print {
            body { margin: 0; padding: 10px; }
            .no-print { display: none; }
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
          ${storeName ? `<p><span class="label">Store Address:</span></p><p>${storeName}</p>` : ''}
          ${storeAddress ? `<p>${storeAddress}</p>` : ''}
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

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Pop-up blocked! Please allow pop-ups for this site.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
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
                <div><strong>#{inv.id}</strong> — {inv.customer?.name || inv.customer_name || 'Customer not found'}<br /><span className="muted">{new Date(inv.created_at).toLocaleDateString()}</span></div>
                <div className="invoice-actions">
                  <span className="highlight">Total: {currency(inv.total)}</span>
                  <button className="action-btn print" onClick={()=>printInvoice(inv)} title="Print Invoice"><i className="fas fa-print"></i></button>
                  <button className="action-btn download" onClick={()=>downloadInvoice(inv)} title="Download PDF"><i className="fas fa-download"></i></button>
                  <button className="action-btn sms" onClick={()=>sendSMS(inv)} title="Send SMS"><i className="fas fa-comment-alt"></i></button>
                  {/* <button className="action-btn copy" onClick={()=>{navigator.clipboard.writeText(JSON.stringify(inv)); alert("Copied!");}} title="Copy JSON"><i className="fas fa-copy"></i></button> */}
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