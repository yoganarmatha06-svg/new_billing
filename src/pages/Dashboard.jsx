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
  CreditCard,
  CheckCircle2,
  Phone,
  User,
  Calendar,
  Printer
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
      {/* 1. Hero Quick Action Banner */}
      <div className="dashboard-hero-banner">
        <div className="hero-left">
          <h1>Diwali & Festive Crackers Billing Terminal</h1>
          <p>
            Welcome back to {SHOP_DETAILS.name}. Fast POS checkout with real-time GST calculations, inventory tracking, and instant receipts.
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

      {/* 2. KPI Stats Cards - 2 Columns on Mobile with Equal Heights & Aligned Icons */}
      <div className="kpi-grid">
        {/* Total Sales Today */}
        <div className="kpi-card sales">
          <div className="kpi-card-top">
            <span className="kpi-title">Sales Today</span>
            <div className="kpi-icon-box">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">₹{totalSalesToday.toLocaleString('en-IN')}</div>
          <div className="kpi-trend trend-up">
            <TrendingUp size={12} />
            <span>{totalBillsTodayCount} orders today</span>
          </div>
        </div>

        {/* Total Bills Today */}
        <div className="kpi-card bills">
          <div className="kpi-card-top">
            <span className="kpi-title">Bills Today</span>
            <div className="kpi-icon-box">
              <Receipt size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalBillsTodayCount}</div>
          <div className="kpi-trend trend-neutral">
            <span>{bills.length} total sales</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="kpi-card products">
          <div className="kpi-card-top">
            <span className="kpi-title">Products</span>
            <div className="kpi-icon-box">
              <Boxes size={18} />
            </div>
          </div>
          <div className="kpi-value">{products.length}</div>
          <div className="kpi-trend trend-neutral">
            <span>In stock catalog</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="kpi-card customers">
          <div className="kpi-card-top">
            <span className="kpi-title">Customers</span>
            <div className="kpi-icon-box">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value">{customers.length}</div>
          <div className="kpi-trend trend-up">
            <Users size={12} />
            <span>Saved buyers</span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Recent Transactions & Analytics Charts */}
      <div className="dashboard-main-grid">
        {/* Recent Transactions Card */}
        <div className="transactions-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h3>
                <Receipt size={18} color="#2563eb" />
                <span>Recent Orders & Sales</span>
              </h3>
              <p>Latest customer receipts generated at checkout</p>
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

          {/* Desktop Table View (visible on screen > 768px) */}
          <div className="desktop-table-view table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order / Bill No</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                      No transactions recorded yet. Click "New Billing" to generate your first invoice.
                    </td>
                  </tr>
                ) : (
                  bills.slice(0, 5).map((bill) => (
                    <tr key={bill.id || bill.invoiceNo}>
                      <td>
                        <span className="invoice-link-code">#{bill.invoiceNo}</span>
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
                        ₹{(bill.summary?.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${
                          (bill.payment?.status || 'Paid') === 'Paid' ? 'badge-success' : 'badge-sky'
                        }`}>
                          {bill.payment?.status || 'Paid'}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (visible on screen <= 768px) */}
          <div className="mobile-cards-view">
            {bills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No transactions recorded yet. Click "New Billing" to start.
              </div>
            ) : (
              <div className="mobile-invoice-scroll-container">
                <div className="mobile-invoice-scroll-inner">
                  {/* Mobile Column Headers for Perfect Alignment */}
                  <div className="mobile-invoice-header-row">
                    <div className="invoice-hdr-sec-1">
                      <span style={{ width: '140px', textAlign: 'center' }}>BILL NUMBER</span>
                      <span style={{ width: '130px', textAlign: 'left', paddingLeft: '6px' }}>CUSTOMER NAME</span>
                      <span style={{ width: '130px', textAlign: 'center' }}>PHONE NUMBER</span>
                    </div>
                    <div className="invoice-hdr-sec-2">DATE & TIME</div>
                    <div className="invoice-hdr-sec-3">ITEMS</div>
                    <div className="invoice-hdr-sec-4">TOTAL AMOUNT</div>
                    <div className="invoice-hdr-sec-5">PAYMENT STATUS</div>
                    <div className="invoice-hdr-sec-6 dashboard-invoice-sec-6" style={{ textAlign: 'center' }}>ACTION</div>
                  </div>

                  {bills.slice(0, 5).map((bill) => {
                    const pMethod = bill.payment?.method || 'Cash';
                    const pStatus = bill.payment?.status || 'Paid';
                    const itemsCount = bill.items?.length || 0;
                    const totalUnits = bill.items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || itemsCount;

                    return (
                      <div key={bill.id || bill.invoiceNo} className="mobile-invoice-row-card">
                        {/* Section 1: Invoice Number, Customer Name, Phone Number */}
                        <div className="invoice-sec-1">
                          <span className="invoice-link-code">#{bill.invoiceNo}</span>
                          <span className="invoice-customer-name" title={bill.customer?.name || 'Walk-in Customer'}>
                            <User size={13} className="invoice-col-icon" />
                            <span>{bill.customer?.name || 'Walk-in Customer'}</span>
                          </span>
                          {bill.customer?.mobile ? (
                            <span className="invoice-customer-phone">
                              <Phone size={11} className="invoice-phone-icon" />
                              <span>+91 {bill.customer.mobile}</span>
                            </span>
                          ) : (
                            <span className="invoice-phone-empty">-</span>
                          )}
                        </div>

                        {/* Section 2: Date & Time */}
                        <div className="invoice-sec-2">
                          <Calendar size={12} className="invoice-col-icon" />
                          <span>{bill.date} • {bill.time}</span>
                        </div>

                        {/* Section 3: Items Count */}
                        <div className="invoice-sec-3">
                          <span className="invoice-items-pill">
                            {itemsCount} items ({totalUnits} units)
                          </span>
                        </div>

                        {/* Section 4: Total Amount */}
                        <div className="invoice-sec-4">
                          <span className="invoice-total-amount">
                            ₹{(bill.summary?.grandTotal || 0).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Section 5: Payment Status (Cash / Partial) */}
                        <div className="invoice-sec-5">
                          <span className={`badge ${
                            pMethod === 'UPI' ? 'badge-blue' :
                            pMethod === 'Card' ? 'badge-sky' : 'badge-success'
                          }`}>
                            {pMethod}
                          </span>
                          <span className={`invoice-status-pill status-${pStatus.toLowerCase()}`}>
                            {pStatus}
                          </span>
                        </div>

                        {/* Section 6: View & Print Bill button */}
                        <div className="invoice-sec-6 dashboard-invoice-sec-6">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm invoice-btn-view-print"
                            onClick={() => onViewInvoice(bill)}
                            title="View & Print Bill"
                          >
                            <Eye size={13} />
                            <Printer size={13} />
                            <span>View & Print Bill</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
