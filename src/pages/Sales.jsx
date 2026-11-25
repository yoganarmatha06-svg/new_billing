import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Calendar, 
  Printer, 
  Eye, 
  Download, 
  RotateCcw, 
  PlusCircle, 
  Trash2, 
  TrendingUp, 
  CreditCard, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Boxes
} from 'lucide-react';

export const Sales = ({ 
  bills = [], 
  onViewInvoice, 
  onDeleteBill, 
  onNavigate, 
  onShowToast 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'
  const [customDate, setCustomDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter bills based on search query, date presets, custom date, payment method, and payment status
  const filteredBills = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const yesterdayObj = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterday = yesterdayObj.toISOString().split('T')[0];

    const weekAgoObj = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgo = weekAgoObj.toISOString().split('T')[0];

    const currentMonth = today.slice(0, 7); // YYYY-MM

    return bills.filter((bill) => {
      // 1. Search Query
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        bill.invoiceNo?.toLowerCase().includes(q) ||
        bill.customer?.name?.toLowerCase().includes(q) ||
        bill.customer?.mobile?.includes(q) ||
        bill.customer?.address?.toLowerCase().includes(q) ||
        (bill.items || []).some(item => item.name?.toLowerCase().includes(q) || item.code?.toLowerCase().includes(q));

      // 2. Date Filtering
      let matchesDate = true;
      if (customDate) {
        matchesDate = bill.date === customDate;
      } else if (datePreset === 'TODAY') {
        matchesDate = bill.date === today;
      } else if (datePreset === 'YESTERDAY') {
        matchesDate = bill.date === yesterday;
      } else if (datePreset === 'WEEK') {
        matchesDate = bill.date >= weekAgo;
      } else if (datePreset === 'MONTH') {
        matchesDate = bill.date && bill.date.startsWith(currentMonth);
      }

      // 3. Payment Method Filter
      const matchesPayment = paymentFilter === 'ALL' || bill.payment?.method === paymentFilter;

      // 4. Payment Status Filter
      const matchesStatus = statusFilter === 'ALL' || bill.payment?.status === statusFilter;

      return matchesSearch && matchesDate && matchesPayment && matchesStatus;
    });
  }, [bills, searchTerm, datePreset, customDate, paymentFilter, statusFilter]);

  // Key KPI Aggregations
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Overall metrics for current filtered view
    const filteredRevenue = filteredBills.reduce((acc, b) => acc + (b.summary?.grandTotal || 0), 0);
    const filteredUnitsSold = filteredBills.reduce((acc, b) => acc + (b.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 1), 0), 0);
    
    // Today's metrics (from all bills)
    const todayBillsList = bills.filter(b => b.date === todayStr);
    const todayRevenue = todayBillsList.reduce((acc, b) => acc + (b.summary?.grandTotal || 0), 0);

    // Payment breakdown for filtered view
    const cashTotal = filteredBills.filter(b => (b.payment?.method || 'Cash') === 'Cash').reduce((acc, b) => acc + (b.summary?.grandTotal || 0), 0);
    const digitalTotal = filteredBills.filter(b => (b.payment?.method || '') !== 'Cash').reduce((acc, b) => acc + (b.summary?.grandTotal || 0), 0);

    // Average order value
    const avgBillValue = filteredBills.length > 0 ? Math.round(filteredRevenue / filteredBills.length) : 0;

    return {
      filteredRevenue,
      filteredUnitsSold,
      todayRevenue,
      todayCount: todayBillsList.length,
      cashTotal,
      digitalTotal,
      avgBillValue
    };
  }, [bills, filteredBills]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setDatePreset('ALL');
    setCustomDate('');
    setPaymentFilter('ALL');
    setStatusFilter('ALL');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredBills.length === 0) {
      onShowToast?.('No sales records to export', 'warning');
      return;
    }

    let csv = 'Invoice No,Date,Time,Customer Name,Mobile,Items Count,Total Qty,Subtotal (Rs),Discount (Rs),GST (Rs),Grand Total (Rs),Payment Mode,Payment Status\n';

    filteredBills.forEach(b => {
      const itemsCount = b.items?.length || 0;
      const totalQty = (b.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      const custName = `"${(b.customer?.name || 'Walk-in Customer').replace(/"/g, '""')}"`;
      const custMobile = `"${b.customer?.mobile || ''}"`;
      const row = [
        `"${b.invoiceNo}"`,
        `"${b.date}"`,
        `"${b.time || ''}"`,
        custName,
        custMobile,
        itemsCount,
        totalQty,
        b.summary?.subtotal || 0,
        b.summary?.discountAmount || 0,
        b.summary?.gstAmount || 0,
        b.summary?.grandTotal || 0,
        `"${b.payment?.method || 'Cash'}"`,
        `"${b.payment?.status || 'Paid'}"`
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast?.(`Exported ${filteredBills.length} sales records to CSV`, 'success');
  };

  // Quick Print Sales Summary
  const handlePrintSales = () => {
    window.print();
  };

  // Handle Delete Confirmation
  const handleDelete = (bill) => {
    if (window.confirm(`Are you sure you want to delete invoice ${bill.invoiceNo}? Billed cracker stock will be restored to inventory.`)) {
      onDeleteBill?.(bill.id || bill.invoiceNo);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Sales Header Banner */}
      <div 
        className="billing-card" 
        style={{ 
          background: '#ffffff', 
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: 'var(--radius-sm)', 
              background: 'var(--accent-light)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid var(--primary-border)'
            }}>
              <ShoppingBag size={24} color="#2563eb" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                Sales & Invoices
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Track, filter, export and manage all cracker sales transactions and receipts
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              title="Export sales to CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePrintSales}
              title="Print Sales List"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate?.('new-billing')}
              title="Create New Bill"
            >
              <PlusCircle size={16} />
              <span>New Sale</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Sales Metrics (KPI Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Filtered Sales Revenue */}
        <div className="billing-card" style={{ padding: '16px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Filtered Revenue
            </span>
            <TrendingUp size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
            ₹{stats.filteredRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            From <strong>{filteredBills.length}</strong> invoice{filteredBills.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Today's Sales */}
        <div className="billing-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Today's Sales
            </span>
            <Clock size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
            ₹{stats.todayRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            <strong>{stats.todayCount}</strong> bills generated today
          </div>
        </div>

        {/* Units Sold */}
        <div className="billing-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Units Sold
            </span>
            <Boxes size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            {stats.filteredUnitsSold.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Crackers boxes / packs
          </div>
        </div>

        {/* Cash vs Digital Breakdown */}
        <div className="billing-card" style={{ padding: '16px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Payment Modes
            </span>
            <Wallet size={18} color="#8b5cf6" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cash:</span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                ₹{stats.cashTotal.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UPI / Card:</span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb', fontFamily: 'var(--font-mono)' }}>
                ₹{stats.digitalTotal.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div 
        className="billing-card"
        style={{
          padding: '16px 20px',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Top Row: Search Input + Date Preset Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--accent)',
                  pointerEvents: 'none'
                }} 
              />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px', height: '40px', fontSize: '0.875rem' }}
                placeholder="Search by invoice no, customer name, mobile, cracker name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Date Preset Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Time' },
                { id: 'TODAY', label: 'Today' },
                { id: 'YESTERDAY', label: 'Yesterday' },
                { id: 'WEEK', label: 'This Week' },
                { id: 'MONTH', label: 'This Month' }
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setDatePreset(preset.id);
                    setCustomDate('');
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: datePreset === preset.id && !customDate ? '#2563eb' : 'var(--border-dark)',
                    background: datePreset === preset.id && !customDate ? '#2563eb' : 'var(--bg-page)',
                    color: datePreset === preset.id && !customDate ? '#ffffff' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Date Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                className="form-control"
                style={{ height: '40px', fontSize: '0.825rem', width: '150px' }}
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setDatePreset('CUSTOM');
                }}
                title="Filter by specific date"
              />
            </div>
          </div>

          {/* Bottom Row: Payment Method, Status & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Payment Method Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Payment:</span>
                <select
                  className="form-control"
                  style={{ height: '36px', fontSize: '0.825rem', padding: '4px 10px', width: '130px' }}
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="ALL">All Modes</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              {/* Status Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
                <select
                  className="form-control"
                  style={{ height: '36px', fontSize: '0.825rem', padding: '4px 10px', width: '130px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>

            {/* Results Count & Reset Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredBills.length}</strong> of <strong>{bills.length}</strong> sales
              </span>

              {(searchTerm || datePreset !== 'ALL' || customDate || paymentFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleResetFilters}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sales Transactions Table */}
      <div 
        className="billing-card"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }}
      >
        <div className="table-responsive">
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-page)', borderBottom: '1.5px solid var(--border-dark)' }}>
                <th style={{ width: '45px', textAlign: 'center', padding: '12px 8px', color: 'var(--text-heading)', fontWeight: 800 }}>
                  #
                </th>
                <th style={{ textAlign: 'left', padding: '12px 14px', color: 'var(--text-heading)', fontWeight: 800 }}>
                  Invoice No
                </th>
                <th style={{ textAlign: 'left', padding: '12px 14px', color: 'var(--text-heading)', fontWeight: 800 }}>
                  Date & Time
                </th>
                <th style={{ textAlign: 'left', padding: '12px 14px', color: 'var(--text-heading)', fontWeight: 800 }}>
                  Customer Details
                </th>
                <th style={{ textAlign: 'left', padding: '12px 14px', color: 'var(--text-heading)', fontWeight: 800 }}>
                  Items Summary
                </th>
                <th style={{ textAlign: 'center', padding: '12px 10px', color: 'var(--text-heading)', fontWeight: 800 }}>
                  Payment Mode
                </th>
                <th style={{ textAlign: 'center', padding: '12px 10px', color: 'var(--text-heading)', fontWeight: 800 }}>
                  Status
                </th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--text-heading)', fontWeight: 800 }}>
                  Total Amount (₹)
                </th>
                <th style={{ textAlign: 'center', width: '110px', padding: '12px 10px', color: 'var(--text-heading)', fontWeight: 800 }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'var(--bg-page)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)'
                      }}>
                        <ShoppingBag size={28} />
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                        {bills.length === 0 ? 'No Sales Recorded Yet' : 'No Sales Matching Your Filters'}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, maxWidth: '420px' }}>
                        {bills.length === 0 
                          ? 'Generate bills at the New Billing checkout counter to see them recorded here.' 
                          : 'Try modifying your search keywords, payment mode or clearing date filters.'}
                      </p>
                      {bills.length === 0 ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => onNavigate?.('new-billing')}
                          style={{ marginTop: '10px' }}
                        >
                          <PlusCircle size={16} />
                          <span>Create First Bill</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleResetFilters}
                          style={{ marginTop: '8px' }}
                        >
                          <RotateCcw size={14} />
                          <span>Clear Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill, index) => {
                  const items = bill.items || [];
                  const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
                  const itemsPreview = items.slice(0, 2).map(i => i.name).join(', ') + (items.length > 2 ? ` +${items.length - 2} more` : '');
                  const paymentMethod = bill.payment?.method || 'Cash';
                  const paymentStatus = bill.payment?.status || 'Paid';

                  return (
                    <tr 
                      key={bill.id || bill.invoiceNo || index}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        background: index % 2 === 0 ? '#ffffff' : 'var(--bg-page)'
                      }}
                    >
                      {/* 1. Index */}
                      <td style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {index + 1}
                      </td>

                      {/* 2. Invoice No */}
                      <td style={{ padding: '12px 14px' }}>
                        <span 
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: '#2563eb',
                            background: 'var(--accent-light)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--primary-border)',
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FileText size={12} />
                          <span>#{bill.invoiceNo}</span>
                        </span>
                      </td>

                      {/* 3. Date & Time */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                          {bill.date}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} />
                          <span>{bill.time || 'Counter POS'}</span>
                        </div>
                      </td>

                      {/* 4. Customer Info */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                          {bill.customer?.name || 'Walk-in Customer'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {bill.customer?.mobile ? `+91 ${bill.customer.mobile}` : 'Counter Sale'}
                        </div>
                      </td>

                      {/* 5. Items Summary */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span 
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#f1f5f9',
                              color: 'var(--text-heading)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid var(--border-dark)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {items.length} items ({totalUnits} units)
                          </span>
                        </div>
                        <div 
                          title={items.map(i => `${i.name} (x${i.quantity || 1})`).join(', ')}
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                            maxWidth: '220px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {itemsPreview || 'General Crackers'}
                        </div>
                      </td>

                      {/* 6. Payment Mode */}
                      <td style={{ textAlign: 'center', padding: '12px 10px' }}>
                        <span 
                          className={`badge ${
                            paymentMethod === 'UPI' ? 'badge-blue' :
                            paymentMethod === 'Card' ? 'badge-sky' : 'badge-success'
                          }`}
                          style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                        >
                          {paymentMethod}
                        </span>
                      </td>

                      {/* 7. Payment Status */}
                      <td style={{ textAlign: 'center', padding: '12px 10px' }}>
                        <span 
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: paymentStatus === 'Paid' ? '#ecfdf5' : paymentStatus === 'Partial' ? '#fffbeb' : '#fef2f2',
                            color: paymentStatus === 'Paid' ? '#059669' : paymentStatus === 'Partial' ? '#d97706' : '#dc2626',
                            border: `1px solid ${paymentStatus === 'Paid' ? '#a7f3d0' : paymentStatus === 'Partial' ? '#fde68a' : '#fecaca'}`
                          }}
                        >
                          {paymentStatus}
                        </span>
                      </td>

                      {/* 8. Total Amount */}
                      <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                          ₹{(bill.summary?.grandTotal || 0).toLocaleString('en-IN')}
                        </div>
                        {bill.summary?.discountAmount > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                            Disc: -₹{bill.summary.discountAmount}
                          </div>
                        )}
                      </td>

                      {/* 9. Action Buttons */}
                      <td style={{ textAlign: 'center', padding: '12px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onViewInvoice?.(bill)}
                            style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                            title="View & Print Bill"
                          >
                            <Eye size={14} color="#2563eb" />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDelete(bill)}
                            style={{ padding: '5px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                            title="Delete Sale (Restores Stock)"
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;
