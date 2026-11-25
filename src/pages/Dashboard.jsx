import React from 'react';
import { 
  TrendingUp, 
  Receipt, 
  Boxes, 
  Users, 
  PlusCircle, 
  ArrowUpRight, 
  Eye, 
  Sparkles,
  CreditCard
} from 'lucide-react';
import { SHOP_DETAILS } from '../data/products';

export const Dashboard = ({ 
  bills = [], 
  products = [], 
  customers = [], 
  onNavigate,
  onViewInvoice 
}) => {
  // Compute Today's Stats
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayBills = bills.filter(b => b.date === todayStr);
  const totalSalesToday = todayBills.reduce((acc, b) => acc + (b.summary?.grandTotal || 0), 0);
  const totalBillsTodayCount = todayBills.length;



  return (
    <div className="dashboard-container">
      {/* Hero Quick Action Banner */}
      <div className="dashboard-hero-banner">
        <div className="hero-left">
          <h1>Diwali & Festive Crackers Billing Terminal</h1>
          <p>
            Welcome back to {SHOP_DETAILS.name}. Fast point-of-sale checkout with real-time GST calculations, inventory stock tracking, and thermal receipt printing.
          </p>
        </div>
        <div className="hero-actions">
          <button 
            type="button" 
            className="btn btn-billing"
            onClick={() => onNavigate('new-billing')}
          >
            <PlusCircle size={18} />
            <span>New Billing</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards - White with subtle shadows & light blue accents */}
      <div className="kpi-grid">
        {/* Total Sales Today */}
        <div className="kpi-card sales">
          <div className="kpi-info">
            <span>Sales Today</span>
            <div className="kpi-value">₹{totalSalesToday.toLocaleString('en-IN')}</div>
            <div className="kpi-trend trend-up">
              <TrendingUp size={13} />
              <span>{totalBillsTodayCount} orders placed</span>
            </div>
          </div>
          <div className="kpi-icon-box">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Total Bills Today */}
        <div className="kpi-card bills">
          <div className="kpi-info">
            <span>Total Bills Today</span>
            <div className="kpi-value">{totalBillsTodayCount}</div>
            <div className="kpi-trend trend-neutral">
              <span>{bills.length} all-time bills</span>
            </div>
          </div>
          <div className="kpi-icon-box">
            <Receipt size={24} />
          </div>
        </div>

        {/* Total Products */}
        <div className="kpi-card products">
          <div className="kpi-info">
            <span>Total Products</span>
            <div className="kpi-value">{products.length}</div>
            <div className="kpi-trend trend-neutral">
              <span>Active inventory items</span>
            </div>
          </div>
          <div className="kpi-icon-box">
            <Boxes size={24} />
          </div>
        </div>

        {/* Total Customers */}
        <div className="kpi-card customers">
          <div className="kpi-info">
            <span>Total Customers</span>
            <div className="kpi-value">{customers.length}</div>
            <div className="kpi-trend trend-up">
              <Users size={13} />
              <span>Active buyer directory</span>
            </div>
          </div>
          <div className="kpi-icon-box">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Transactions & Category Breakdown */}
      <div className="dashboard-main-grid">
        {/* Recent Transactions Table */}
        <div className="transactions-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h3>
                <Receipt size={18} color="#2563eb" />
                <span>Recent Transactions</span>
              </h3>
              <p>Latest customer invoices generated at the counter</p>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('sales')}
            >
              <span>View All Sales</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="desktop-table-view table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.slice(0, 5).map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <span className="invoice-link-code">{bill.invoiceNo}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-heading)', display: 'block' }}>
                        {bill.customer?.name || 'Walk-in'}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {bill.customer?.mobile ? `+91 ${bill.customer.mobile}` : 'Counter Sale'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {bill.date} • {bill.time}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {bill.items?.length || 0} items
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-heading)' }}>
                      ₹{bill.summary?.grandTotal || 0}
                    </td>
                    <td>
                      <span className={`badge ${
                        bill.payment?.method === 'UPI' ? 'badge-blue' :
                        bill.payment?.method === 'Card' ? 'badge-sky' : 'badge-success'
                      }`}>
                        {bill.payment?.method || 'Cash'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 10px' }}
                        onClick={() => onViewInvoice(bill)}
                        title="View & Print Invoice"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-cards-view">
            {bills.slice(0, 5).map((bill) => (
              <div key={bill.id} className="mobile-data-card">
                <div className="mobile-data-card-header">
                  <div>
                    <span className="invoice-link-code" style={{ fontSize: '0.78rem' }}>
                      #{bill.invoiceNo}
                    </span>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-heading)', marginTop: '3px' }}>
                      {bill.customer?.name || 'Walk-in Customer'}
                    </strong>
                  </div>
                  <span className={`badge ${
                    bill.payment?.method === 'UPI' ? 'badge-blue' :
                    bill.payment?.method === 'Card' ? 'badge-sky' : 'badge-success'
                  }`}>
                    {bill.payment?.method || 'Cash'}
                  </span>
                </div>

                <div className="mobile-data-card-body">
                  <div className="mobile-data-row">
                    <span className="mobile-data-label">Date & Time</span>
                    <span className="mobile-data-value">{bill.date} • {bill.time}</span>
                  </div>
                  <div className="mobile-data-row">
                    <span className="mobile-data-label">Items Count</span>
                    <span className="mobile-data-value">{bill.items?.length || 0} items</span>
                  </div>
                  <div className="mobile-data-row">
                    <span className="mobile-data-label">Grand Total</span>
                    <span className="mobile-data-value highlight-amount">₹{bill.summary?.grandTotal || 0}</span>
                  </div>
                </div>

                <div className="mobile-data-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onViewInvoice(bill)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Eye size={14} />
                    <span>View & Print Invoice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
