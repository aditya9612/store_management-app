import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import '@assets/css/dashboard.css';
import InvoicesSection from '@dashboard/InvoicesSection';
import Notifications from '@dashboard/Notifications';
import OffersAdmin from '@dashboard/OffersAdmin';
import Customers from '@dashboard/Customers';

function DashboardApp () {
  const [activePage, setActivePage] = useState ('dashboard');

  const [customers, setCustomers] = useState (
    JSON.parse (localStorage.getItem ('customers')) || []
  );
  const [offers, setOffers] = useState (
    JSON.parse (localStorage.getItem ('offers')) || []
  );
  const [invoices, setInvoices] = useState (
    JSON.parse (localStorage.getItem ('invoices')) || []
  );

  const navigate = useNavigate ();

  // Protect Dashboard
  useEffect (
    () => {
      const isLoggedIn = localStorage.getItem ('isOwnerLoggedIn');
      if (!isLoggedIn) navigate ('/owner-login');
    },
    [navigate]
  );

  // Persist changes to localStorage
  useEffect (
    () => localStorage.setItem ('customers', JSON.stringify (customers)),
    [customers]
  );
  useEffect (() => localStorage.setItem ('offers', JSON.stringify (offers)), [
    offers,
  ]);
  useEffect (
    () => localStorage.setItem ('invoices', JSON.stringify (invoices)),
    [invoices]
  );

  const handleLogout = () => {
    localStorage.removeItem ('isOwnerLoggedIn');
    alert ('Logged out!');
    navigate ('/owner-login');
  };

  const activeOffersCount = offers.filter (o => o.active).length;
  const totalRevenue = invoices.reduce ((sum, inv) => sum + inv.total, 0);
  const productsSold = invoices.reduce (
    (sum, inv) => sum + inv.items.length,
    0
  );

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <h2>Store Admin</h2>
        <ul>
          <li>
            <button onClick={() => setActivePage ('dashboard')}>
              🏠 Dashboard
            </button>
          </li>
          <li>
            <button onClick={() => setActivePage ('customers')}>
              👥 Customers
            </button>
          </li>
          <li>
            <button onClick={() => setActivePage ('products')}>
              🛒 Products
            </button>
          </li>
          <li>
            <button onClick={() => setActivePage ('invoices')}>
              🧾 Invoices
            </button>
          </li>
          <li>
            <button onClick={() => setActivePage ('offersadmin')}>
              🎁 Offers
            </button>
          </li>
          <li>
            <button onClick={() => setActivePage ('notifications')}>
              📢 Notifications
            </button>
          </li>
          <li>
            <button onClick={() => setActivePage ('reports')}>
              📊 Reports
            </button>
          </li>
          <li><button onClick={handleLogout}>🚪 Logout</button></li>
        </ul>
      </div>

      <div className="main-content">
        {activePage === 'dashboard' &&
          <div>
            <h1>Dashboard 🎉</h1>
            <div className="grid-4">
              <div className="card">
                👥 Customers <span>{customers.length}</span>
              </div>
              <div className="card">
                🎁 Active Offers <span>{activeOffersCount}</span>
              </div>
              <div className="card">
                🛒 Products Sold <span>{productsSold}</span>
              </div>
              <div className="card">
                💰 Total Revenue
                {' '}
                <span>
                  ₹
                  {totalRevenue.toLocaleString (undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

            </div>
          </div>}

        {activePage === 'customers' &&
          <Customers customers={customers} setCustomers={setCustomers} />}

        {activePage === 'products' && <div>Products Page</div>}

        {activePage === 'invoices' &&
          <InvoicesSection invoices={invoices} setInvoices={setInvoices} />}

        {activePage === 'offersadmin' &&
          <OffersAdmin offers={offers} setOffers={setOffers} />}

        {activePage === 'notifications' && <Notifications />}

        {activePage === 'reports' &&
          <div>
            <h1>Reports 📊</h1>
            <div className="grid-4">
              <div className="card">Total Revenue: ₹{totalRevenue}</div>
              <div className="card">Products Sold: {productsSold}</div>
              <div className="card">Customers: {customers.length}</div>
              <div className="card">Active Offers: {activeOffersCount}</div>
            </div>
          </div>}
      </div>
    </div>
  );
}

export default DashboardApp;
