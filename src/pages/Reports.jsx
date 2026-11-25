import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  TrendingUp, 
  IndianRupee, 
  Receipt, 
  CreditCard,
  Wallet,
  QrCode
} from 'lucide-react';

export const Reports = ({ bills = [], products = [], onShowToast }) => {
  const [period, setPeriod] = useState('all'); // 'today' | 'week' | 'month' | 'all'

  // Filter bills based on selected period
  const filteredBills = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    if (period === 'today') {
      return bills.filter(b => b.date === today);
    }

    if (period === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return bills.filter(b => b.date >= oneWeekAgo);
    }

    if (period === 'month') {
      const currentMonth = today.slice(0, 7);
      return bills.filter(b => b.date && b.date.startsWith(currentMonth));
    }

    return bills;
  }, [bills, period]);

  // Aggregate metrics
  const totalRevenue = useMemo(() => {
    return filteredBills.reduce((acc, b) => acc + (b.summary?.grandTotal || 0), 0);
  }, [filteredBills]);

  const totalTax = useMemo(() => {
    return filteredBills.reduce((acc, b) => acc + (b.summary?.gstAmount || 0), 0);
  }, [filteredBills]);

  const paymentStats = useMemo(() => {
    const res = { Cash: 0, UPI: 0, Card: 0, Bank: 0 };
    filteredBills.forEach(b => {
      const mode = b.payment?.method || 'Cash';
      const amt = b.summary?.grandTotal || 0;
      if (res[mode] !== undefined) {
        res[mode] += amt;
      } else {
        res.Cash += amt;
      }
    });
    return res;
  }, [filteredBills]);

  // Top selling products aggregation
  const topProducts = useMemo(() => {
    const countMap = {};
    filteredBills.forEach(b => {
      (b.items || []).forEach(item => {
        if (!countMap[item.id]) {
          countMap[item.id] = {
            id: item.id,
            name: item.name,
            code: item.code,
            qty: 0,
            revenue: 0
          };
        }
        countMap[item.id].qty += (item.quantity || 1);
        countMap[item.id].revenue += ((item.quantity || 1) * (item.price || 0));
      });
    });

    return Object.values(countMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredBills]);

  // Export summary as CSV
  const handleExportCSV = () => {
    if (filteredBills.length === 0) {
      onShowToast?.('No sales data available to export', 'info');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Invoice No,Date,Time,Customer,Payment Mode,Status,Items Count,Total Amount\n';

    filteredBills.forEach(b => {
      const row = [
        `"${b.invoiceNo}"`,
        `"${b.date}"`,
        `"${b.time || ''}"`,
        `"${b.customer?.name || 'Walk-in'}"`,
        `"${b.payment?.method || 'Cash'}"`,
        `"${b.payment?.status || 'Paid'}"`,
        b.items?.length || 0,
        b.summary?.grandTotal || 0
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_report_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast?.('Sales report exported to CSV', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="billing-card">
        <div className="billing-card-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={20} color="#2563eb" />
              <span>Sales & Business Reports</span>
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Summary of daily revenue, tax collections, payment breakdown and top crackers
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'var(--bg-page)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All Time' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPeriod(opt.id)}
                  className="btn btn-sm"
                  style={{
                    background: period === opt.id ? '#ffffff' : 'transparent',
                    color: period === opt.id ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: period === opt.id ? 700 : 500,
                    boxShadow: period === opt.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    border: 'none',
                    padding: '6px 14px'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        <div className="kpi-card sales">
          <div className="kpi-info">
            <span>Total Sales Revenue</span>
            <div className="kpi-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="kpi-trend trend-up">
              <TrendingUp size={13} />
              <span>{filteredBills.length} Invoices</span>
            </div>
          </div>
          <div className="kpi-icon-box">
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="kpi-card products">
          <div className="kpi-info">
            <span>GST Tax Collected</span>
            <div className="kpi-value">₹{Math.round(totalTax).toLocaleString('en-IN')}</div>
            <div className="kpi-trend trend-neutral">
              <span>CGST (9%) + SGST (9%)</span>
            </div>
          </div>
          <div className="kpi-icon-box">
            <Receipt size={24} />
          </div>
        </div>

        <div className="kpi-card bills">
          <div className="kpi-info">
            <span>Cash Transactions</span>
            <div className="kpi-value">₹{(paymentStats.Cash || 0).toLocaleString('en-IN')}</div>
            <div className="kpi-trend trend-neutral">
              <span>Counter Physical Cash</span>
            </div>
          </div>
          <div className="kpi-icon-box">
            <Wallet size={24} />
          </div>
        </div>

        <div className="kpi-card customers">
          <div className="kpi-info">
            <span>UPI & Online Pay</span>
            <div className="kpi-value">₹{((paymentStats.UPI || 0) + (paymentStats.Card || 0)).toLocaleString('en-IN')}</div>
            <div className="kpi-trend trend-up">
              <QrCode size={13} />
              <span>Digital QR & Card</span>
            </div>
          </div>
          <div className="kpi-icon-box">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Top Selling Products & Invoices Table */}
      <div className="reports-main-grid">
        {/* Top Crackers Card */}
        <div className="transactions-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h3>
                <TrendingUp size={18} color="#2563eb" />
                <span>Top Selling Crackers</span>
              </h3>
              <p>Best performing inventory by demand</p>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px 0' }}>
              No item sales data for this period yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topProducts.map((p, idx) => (
                <div 
                  key={p.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-page)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.9rem', width: '20px' }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.875rem' }}>
                        {p.name}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Code: {p.code}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-sky" style={{ fontWeight: 700 }}>
                      {p.qty} boxes sold
                    </span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtered Invoices List */}
        <div className="transactions-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h3>
                <Receipt size={18} color="#2563eb" />
                <span>Billed Invoices ({filteredBills.length})</span>
              </h3>
              <p>Breakdown for selected filter ({period})</p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="desktop-table-view table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th style={{ textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No bills found for the selected time range.
                    </td>
                  </tr>
                ) : (
                  filteredBills.slice(0, 8).map(bill => (
                    <tr key={bill.id}>
                      <td>
                        <span className="invoice-link-code">{bill.invoiceNo}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{bill.customer?.name || 'Walk-in'}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {bill.date}
                      </td>
                      <td>
                        <span className={`badge ${
                          bill.payment?.method === 'UPI' ? 'badge-blue' :
                          bill.payment?.method === 'Card' ? 'badge-sky' : 'badge-success'
                        }`}>
                          {bill.payment?.method || 'Cash'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        ₹{(bill.summary?.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-cards-view">
            {filteredBills.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No bills found for the selected time range.
              </div>
            ) : (
              filteredBills.slice(0, 8).map(bill => (
                <div key={bill.id} className="mobile-data-card">
                  <div className="mobile-data-card-header">
                    <div>
                      <span className="invoice-link-code" style={{ fontSize: '0.78rem' }}>
                        #{bill.invoiceNo}
                      </span>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-heading)', marginTop: '2px' }}>
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
                      <span className="mobile-data-label">Date</span>
                      <span className="mobile-data-value">{bill.date}</span>
                    </div>
                    <div className="mobile-data-row">
                      <span className="mobile-data-label">Total Amount</span>
                      <span className="mobile-data-value highlight-amount">
                        ₹{(bill.summary?.grandTotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
