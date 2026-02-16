import React from "react";

const PERIODS = ["all_time", "today", "this_week", "this_month"];

export default function ReportsTab({ reports, reportPeriod, onChangePeriod, onLoad, loading }) {
  return (
    <div className="admin-section">
      <div className="section-header">
        <h1>Reports</h1>
        <p className="section-subtitle">High-level performance metrics</p>
      </div>

      <div className="toolbar">
        <div className="segmented">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              className={reportPeriod === p ? "active" : ""}
              onClick={() => onChangePeriod(p)}
            >
              {p.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <button type="button" className="btn-secondary" onClick={onLoad} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {reports ? (
        <div className="reports-grid">
          <div className="report-card">
            <h3>Total Sales</h3>
            <p className="value">₹{reports.total_sales || 0}</p>
          </div>
          <div className="report-card">
            <h3>Total Orders</h3>
            <p className="value">{reports.total_orders || 0}</p>
          </div>
          <div className="report-card">
            <h3>Total Customers</h3>
            <p className="value">{reports.total_customers || 0}</p>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>No reports loaded.</p>
          <button type="button" className="btn-primary" onClick={onLoad} disabled={loading}>
            {loading ? "Loading..." : "Load Reports"}
          </button>
        </div>
      )}
    </div>
  );
}
