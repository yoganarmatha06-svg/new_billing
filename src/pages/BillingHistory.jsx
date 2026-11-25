import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  Printer, 
  Eye, 
  Filter, 
  Download, 
  RotateCcw,
  Receipt,
  ArrowUpDown
} from 'lucide-react';

export const BillingHistory = ({ bills = [], onViewInvoice, onShowToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter bills based on search query, date, payment method and status
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        bill.invoiceNo.toLowerCase().includes(q) ||
        bill.customer?.name?.toLowerCase().includes(q) ||
        bill.customer?.mobile?.includes(q) ||
        bill.customer?.address?.toLowerCase().includes(q);

      const matchesDate = !dateFilter || bill.date === dateFilter;

      const matchesPayment = paymentFilter === 'ALL' || bill.payment?.method === paymentFilter;

      const matchesStatus = statusFilter === 'ALL' || bill.payment?.status === statusFilter;

      return matchesSearch && matchesDate && matchesPayment && matchesStatus;
    });
  }, [bills, searchTerm, dateFilter, paymentFilter, statusFilter]);

  // Aggregate statistics for filtered list
  const totalAmount = filteredBills.reduce((sum, b) => sum + (b.summary?.grandTotal || 0), 0);
  const totalItemsSold = filteredBills.reduce((sum, b) => sum + (b.summary?.itemsCount || 0), 0);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setPaymentFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Card */}
      <div className="billing-card">
        <div className="billing-card-header">
          <h3>
            <History size={20} color="#2563eb" />
            <span>Billing History & Invoices</span>
          </h3>
          <span className="badge badge-blue">{filteredBills.length} Invoices</span>
        </div>

        <div className="billing-card-body">
          {/* Quick Stats Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
            padding: '16px',
            background: 'var(--bg-page)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Revenue
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-main)' }}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Invoices
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {filteredBills.length}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Crackers Units Sold
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>
                {totalItemsSold} Boxes
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Search Input */}
            <div className="form-group" style={{ position: 'relative' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--accent)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Search invoice #, customer, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="form-group">
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            {/* Payment Mode Filter */}
            <div className="form-group">
              <select
                className="form-control"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="ALL">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI QR</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-group">
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(searchTerm || dateFilter || paymentFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
                style={{ height: '40px' }}
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="transactions-card">
        <div className="table-responsive">
          {filteredBills.length === 0 ? (
            <div className="empty-cart-state">
              <Receipt size={40} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
              <h4>No Invoices Found</h4>
              <p>No billing records matched your search or date criteria.</p>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Invoice No</th>
                  <th>Date & Time</th>
                  <th>Customer Info</th>
                  <th>Items Details</th>
                  <th style={{ textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ textAlign: 'center' }}>Payment</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center', width: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill, index) => (
                  <tr key={bill.id}>
                    <td style={{ color: 'var(--text-light)', fontWeight: 600 }}>{index + 1}</td>
                    <td>
                      <span className="invoice-link-code">{bill.invoiceNo}</span>
                      {bill.customer?.gstNo && (
                        <span style={{ display: 'block', fontSize: '0.675rem', color: 'var(--accent)' }}>
                          B2B GST
                        </span>
                      )}
                    </td>

                    <td style={{ fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{bill.date}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{bill.time}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                        {bill.customer?.name || 'Walk-in'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {bill.customer?.mobile ? `+91 ${bill.customer.mobile}` : 'Direct Sale'}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>{bill.items?.length || 0} cracker items</span>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                        {bill.items?.slice(0, 2).map(i => i.name).join(', ')}
                        {bill.items?.length > 2 ? ' ...' : ''}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                      ₹{bill.summary?.grandTotal || 0}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${
                        bill.payment?.method === 'UPI' ? 'badge-blue' :
                        bill.payment?.method === 'Card' ? 'badge-sky' : 'badge-success'
                      }`}>
                        {bill.payment?.method || 'Cash'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${
                        bill.payment?.status === 'Paid' ? 'badge-success' :
                        bill.payment?.status === 'Partial' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {bill.payment?.status || 'Paid'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px' }}
                          onClick={() => onViewInvoice(bill)}
                          title="View Invoice"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          style={{ padding: '5px 8px' }}
                          onClick={() => onViewInvoice(bill)}
                          title="Print Invoice"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingHistory;
