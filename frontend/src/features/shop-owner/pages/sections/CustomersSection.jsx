import React, { useState, useEffect, useCallback } from 'react';
import { authService, ordersApi, customersApi, api } from '@/utils/api';
import { toast } from 'react-toastify';
import axios from 'axios';
import '@/features/shop-owner/styles/shop-owner-dashboard.css';
import '@/features/shop-owner/styles/customer-section.css';

export default function CustomersSection({ selectedShop, customers, setCustomers }) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchCustomers = useCallback(async () => {
    if (!selectedShop?.id) return;
    
    try {
      setLoading(true);
      const response = await authService.getCustomersByStore(selectedShop.id);
      setCustomers(response.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedShop?.id, setCustomers]);
  
  const fetchCustomerOrders = async (customerId) => {
    try {
      setLoadingOrders(true);
      
      // Fetch orders for this customer from this store
      const response = await ordersApi.listByCustomer(customerId);
      
      // Filter orders by store if needed
      const filteredOrders = response.data.filter(order => order.store_id === selectedShop.id);
      
      setCustomerOrders(filteredOrders);
      setSelectedCustomer(customers.find(c => c.id === customerId));
    } catch (error) {
      toast.error('Failed to fetch customer orders');
      console.error(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (selectedShop?.id) {
      fetchCustomers();
    }
  }, [selectedShop?.id, fetchCustomers]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!selectedShop?.id) {
      toast.error('No shop selected');
      return;
    }
    
    try {
      const formData = {
        name: e.target.name.value.trim(),
        email: e.target.email.value.trim(),
        phone: e.target.phone.value.trim(),
        address: e.target.address.value.trim(),
        store_id: selectedShop.id
      };

      await authService.createCustomer(formData);
      toast.success('Customer added successfully');
      fetchCustomers();
      setShowAddForm(false);
      e.target.reset();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];

    // Reset the input value to allow re-uploading the same file
    e.target.value = null;

    if (!file) return;

    if (!selectedShop?.id) {
      toast.error('No shop selected');
      return;
    }

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx?)$/i)) {
      toast.error('Please upload a valid CSV or Excel file');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size should not exceed 5MB');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Frontend is running on:', window.location.origin);
      console.log('📤 Attempting to upload to:', `http://localhost:8000/customers/upload-bulk/?store_id=${selectedShop.id}`);

      // Use the authService bulk upload function
      const response = await authService.bulkUploadCustomers(selectedShop.id, file);

      // The backend returns data in the format: { data: { count: number }, message: string }
      const processedCount = response.data?.count || 0;

      toast.success(`Successfully uploaded ${processedCount} customers`);
      if (response.errors && response.errors.length > 0) {
        console.warn('Some records had errors:', response.errors);
        toast.warning(`${response.errors.length} records had errors. Check console for details.`);
      }

      // Refresh the customers list
      await fetchCustomers();
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error(error.message || 'Failed to upload customers. Please check the file format and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      const formData = {
        name: e.target.name.value.trim(),
        email: e.target.email.value.trim(),
        phone: e.target.phone.value.trim(),
        address: e.target.address.value.trim(),
      };

      await customersApi.update(editingCustomer.id, formData);
      toast.success('Customer updated successfully');
      fetchCustomers();
      setEditingCustomer(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await customersApi.remove(customerId);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error(error.message);
    }
    setShowDeleteConfirm(null);
  };

  const downloadTemplate = () => {
    // Sample data for the template
    const headers = 'name,email,phone,address\n';
    const sampleData = [
      'John Doe,john@example.com,9876543210,123 Main St, City, State',
      'Jane Smith,jane@example.com,9876543211,456 Oak Ave, Town, State',
      'Bob Johnson,bob@example.com,9876543212,789 Pine Rd, Village, State'
    ].join('\n');
    
    const csvContent = headers + sampleData;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set the download attributes
    const fileName = `customer_import_template_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    // Append to body, trigger click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Template downloaded successfully');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  if (!selectedShop?.id) return <p className="no-store-message">Please select a shop to view customers.</p>;

  return (
    <div className="customers-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-users"></i>
          Customer Management
        </h2>
        <div className="header-actions">
          <button 
            className="add-btn"
            onClick={() => setShowAddForm(true)}
          >
            <i className="fas fa-plus"></i>
            Add Customer
          </button>
          <div className="bulk-actions">
            <button 
              className="template-btn"
              onClick={downloadTemplate}
            >
              <i className="fas fa-download"></i>
              Download Template
            </button>
            <div className="upload-btn-wrapper">
              <label className="upload-label">
                <button 
                  className="upload-btn"
                  type="button"
                  disabled={loading}
                  onClick={() => document.getElementById('bulk-upload').click()}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload"></i>
                      Bulk Upload
                    </>
                  )}
                </button>
                <input 
                  type="file" 
                  id="bulk-upload"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleBulkUpload}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search customers by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-customer-form">
            <h3>
              <i className="fas fa-user-plus"></i>
              Add New Customer
            </h3>
            <form onSubmit={handleAddCustomer}>
              <div className="form-group">
                <label>
                  <i className="fas fa-user"></i>
                  Name
                </label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder="Enter customer name"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-envelope"></i>
                  Email
                </label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-phone"></i>
                  Phone
                </label>
                <input 
                  name="phone" 
                  type="tel" 
                  required 
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-map-marker-alt"></i>
                  Address
                </label>
                <textarea 
                  name="address" 
                  required 
                  placeholder="Enter complete address"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <i className="fas fa-check"></i>
                  Add Customer
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCustomer && (
        <div className="modal-overlay">
          <div className="add-customer-form">
            <h3>
              <i className="fas fa-user-edit"></i>
              Edit Customer
            </h3>
            <form onSubmit={handleUpdateCustomer}>
              <div className="form-group">
                <label>
                  <i className="fas fa-user"></i>
                  Name
                </label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  defaultValue={editingCustomer.name}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-envelope"></i>
                  Email
                </label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  defaultValue={editingCustomer.email}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-phone"></i>
                  Phone
                </label>
                <input 
                  name="phone" 
                  type="tel" 
                  required 
                  defaultValue={editingCustomer.phone}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-map-marker-alt"></i>
                  Address
                </label>
                <textarea 
                  name="address" 
                  required 
                  defaultValue={editingCustomer.address}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <i className="fas fa-check"></i>
                  Update Customer
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setEditingCustomer(null)}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this customer?</p>
            <div className="form-actions">
              <button className="submit-btn" onClick={() => handleDeleteCustomer(showDeleteConfirm)}>
                Confirm
              </button>
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="customers-table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users-slash"></i>
            <h3>No Customers Found</h3>
            <p>{searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first customer or uploading a bulk list.'}</p>
          </div>
        ) : (
          <table className="customers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, idx) => (
                <tr 
                  key={customer.id} 
                  onClick={() => fetchCustomerOrders(customer.id)}
                  className={selectedCustomer?.id === customer.id ? 'selected-row' : ''}
                >
                  <td>{idx + 1}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address || "-"}</td>
                  <td className="actions">
                    <button className="action-btn edit" title="Edit" onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); }}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="action-btn delete" title="Delete" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(customer.id); }}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedCustomer && (
        <div className="customer-orders-section">
          <h3>
            <i className="fas fa-shopping-cart"></i>
            Orders for {selectedCustomer.name}
          </h3>
          
          {loadingOrders ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              Loading orders...
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open"></i>
              <h4>No Orders Found</h4>
              <p>This customer hasn't placed any orders yet.</p>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td>₹{order.total?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`status ${order.status?.toLowerCase()}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}