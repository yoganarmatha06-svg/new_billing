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
  Boxes,
  User,
  Phone,
  Pencil,
  X,
  ExternalLink
} from 'lucide-react';

export const Sales = ({ 
  bills = [], 
  onViewInvoice, 
  onDeleteBill, 
  onUpdateBill,
  onEditBill,
  onNavigate, 
  onShowToast 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'
  const [customDate, setCustomDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit Bill Modal State
  const [editModalBill, setEditModalBill] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    mobile: '',
    address: '',
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    amountPaid: 0
  });

  const handleOpenEdit = (bill) => {
    setEditModalBill(bill);
    setEditForm({
      name: bill.customer?.name || '',
      mobile: bill.customer?.mobile || '',
      address: bill.customer?.address || '',
      paymentMethod: bill.payment?.method || 'Cash',
      paymentStatus: bill.payment?.status || 'Paid',
      amountPaid: bill.summary?.paidAmount !== undefined ? bill.summary.paidAmount : (bill.summary?.grandTotal || 0)
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      onShowToast?.('Customer Name is required *', 'danger');
      return;
    }
    const cleanMobile = editForm.mobile.replace(/\D/g, '').slice(-10);
    if (!editForm.mobile.trim() || cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      onShowToast?.('Please enter a valid 10-digit mobile number *', 'danger');
      return;
    }
    if (!editForm.address.trim()) {
      onShowToast?.('City / Address is required *', 'danger');
      return;
    }

    const grandTotal = editModalBill.summary?.grandTotal || 0;
    const paid = Number(editForm.amountPaid) || 0;
    const balance = Math.max(0, grandTotal - paid);

    const updatedBill = {
      ...editModalBill,
      customer: {
        ...editModalBill.customer,
        name: editForm.name.trim(),
        mobile: cleanMobile,
        address: editForm.address.trim()
      },
      payment: {
        ...editModalBill.payment,
        method: editForm.paymentMethod,
        status: editForm.paymentStatus
      },
      summary: {
        ...editModalBill.summary,
        paidAmount: paid,
        balanceAmount: balance
      }
    };

    onUpdateBill?.(updatedBill);
    setEditModalBill(null);
  };

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
        className="billing-card sales-header-banner" 
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
          <div className="sales-header-actions">
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
      <div className="sales-kpi-grid">
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
        <div className="sales-filter-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Top Row: Search Input + Date Preset Pills + Custom Date */}
          <div className="sales-filter-top-row">
            {/* Search Input */}
            <div className="sales-search-input-wrapper" style={{ position: 'relative' }}>
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
                placeholder="Search by bill number, cracker name, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Date Preset Buttons */}
            <div className="sales-date-presets">
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
            <div className="sales-custom-date-wrapper">
              <input
                type="date"
                className="form-control"
                style={{ height: '40px', fontSize: '0.825rem' }}
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
          <div className="sales-filter-bottom-row">
            <div className="sales-filter-dropdowns">
              {/* Payment Method Selector */}
              <div className="sales-filter-select-group">
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Payment:</span>
                <select
                  className="form-control"
                  style={{ height: '36px', fontSize: '0.825rem', padding: '4px 10px' }}
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
              <div className="sales-filter-select-group">
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
                <select
                  className="form-control"
                  style={{ height: '36px', fontSize: '0.825rem', padding: '4px 10px' }}
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
            <div className="sales-filter-meta">
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
          boxShadow: 'var(--shadow-xs)',
          border: '1px solid var(--border-light)'
        }}
      >
        {/* Desktop Table View */}
        <div className="desktop-table-view table-responsive" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '960px', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-page)', borderBottom: '1.5px solid var(--border-dark)' }}>
                <th style={{ width: '38px', textAlign: 'center', padding: '12px 6px', color: 'var(--text-heading)', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  #
                </th>
                <th style={{ textAlign: 'left', padding: '12px 10px', color: 'var(--text-heading)', fontWeight: 800, whiteSpace: 'nowrap', minWidth: '130px' }}>
                  Bill Number
                </th>
                <th style={{ textAlign: 'left', padding: '12px 10px', color: 'var(--text-heading)', fontWeight: 800, whiteSpace: 'nowrap', minWidth: '125px' }}>
                  Customer Name
                </th>
                <th style={{ textAlign: 'left', padding: '12px 10px', color: 'var(--text-heading)', fontWeight: 800, whiteSpace: 'nowrap', minWidth: '120px' }}>
                  Phone Number
                </th>
                <th style={{ textAlign: 'left', padding: '12px 10px', color: 'var(--text-heading)', fontWeight: 800, whiteSpace: 'nowrap', minWidth: '130px' }}>
                  Items
                </th>
                <th style={{ textAlign: 'center', padding: '12px 6px', color: 'var(--text-heading)', fontWeight: 800, whiteSpace: 'nowrap', minWidth: '85px' }}>
                  Payment Mode
                </th>
                <th style={{ textAlign: 'center', padding: '12px 6px', color: 'var(--text-heading)', fontWeight: 800, whiteSpace: 'nowrap', minWidth: '80px' }}>
                  Status
                </th>
                <th style={{ textAlign: 'right', padding: '12px 10px', color: 'var(--text-heading)', fontWeight: 800, whiteSpace: 'nowrap', minWidth: '95px' }}>
                  Grand Total (₹)
                </th>
                <th style={{ textAlign: 'center', width: '185px', minWidth: '185px', padding: '12px 8px', color: 'var(--text-heading)', fontWeight: 800, whiteSpace: 'nowrap' }}>
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
                      <td style={{ textAlign: 'center', padding: '10px 6px', color: 'var(--text-muted)', fontWeight: 700, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        {index + 1}
                      </td>

                      {/* 2. Bill Number */}
                      <td style={{ padding: '10px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span 
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: '#2563eb',
                            background: 'var(--accent-light)',
                            padding: '3px 7px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--primary-border)',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <FileText size={12} style={{ flexShrink: 0 }} />
                          <span>#{bill.invoiceNo}</span>
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', whiteSpace: 'nowrap' }}>
                          {bill.date} • {bill.time}
                        </div>
                      </td>

                      {/* 3. Customer Name */}
                      <td style={{ padding: '10px 10px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <User size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.85rem' }}>
                            {bill.customer?.name || 'Walk-in Customer'}
                          </span>
                        </div>
                        {bill.customer?.address && (
                          <div 
                            title={bill.customer.address}
                            style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', paddingLeft: '18px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {bill.customer.address}
                          </div>
                        )}
                      </td>

                      {/* 4. Phone Number */}
                      <td style={{ padding: '10px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        {bill.customer?.mobile ? (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#1e40af',
                              background: '#eff6ff',
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid #bfdbfe',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Phone size={11} color="#2563eb" style={{ flexShrink: 0 }} />
                            <span>+91 {bill.customer.mobile}</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      {/* 5. Items Summary */}
                      <td style={{ padding: '10px 10px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                            fontSize: '0.74rem',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {itemsPreview || 'General Crackers'}
                        </div>
                      </td>

                      {/* 6. Payment Mode */}
                      <td style={{ textAlign: 'center', padding: '10px 8px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span 
                          className={`badge ${
                            paymentMethod === 'UPI' ? 'badge-blue' :
                            paymentMethod === 'Card' ? 'badge-sky' : 'badge-success'
                          }`}
                          style={{ fontSize: '0.74rem', padding: '3px 8px', display: 'inline-block' }}
                        >
                          {paymentMethod}
                        </span>
                      </td>

                      {/* 7. Payment Status */}
                      <td style={{ textAlign: 'center', padding: '10px 8px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span 
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-block',
                            background: paymentStatus === 'Paid' ? '#ecfdf5' : paymentStatus === 'Partial' ? '#fffbeb' : '#fef2f2',
                            color: paymentStatus === 'Paid' ? '#059669' : paymentStatus === 'Partial' ? '#d97706' : '#dc2626',
                            border: `1px solid ${paymentStatus === 'Paid' ? '#a7f3d0' : paymentStatus === 'Partial' ? '#fde68a' : '#fecaca'}`
                          }}
                        >
                          {paymentStatus}
                        </span>
                      </td>

                      {/* 8. Total Amount */}
                      <td style={{ textAlign: 'right', padding: '10px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-heading)' }}>
                          ₹{(bill.summary?.grandTotal || 0).toLocaleString('en-IN')}
                        </div>
                        {bill.summary?.discountAmount > 0 && (
                          <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600, marginTop: '1px' }}>
                            Disc: -₹{bill.summary.discountAmount}
                          </div>
                        )}
                      </td>

                      {/* 9. Action Buttons */}
                      <td style={{ textAlign: 'center', padding: '10px 8px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onViewInvoice?.(bill, 'standard')}
                            style={{ padding: '5px 7px', fontSize: '0.72rem', gap: '3px' }}
                            title="View Bill Details"
                          >
                            <Eye size={12} color="#2563eb" />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(bill)}
                            style={{ padding: '5px 7px', fontSize: '0.72rem', gap: '3px', color: '#1e40af', background: '#eff6ff', borderColor: '#bfdbfe' }}
                            title="Edit Customer, Payment & Bill Details"
                          >
                            <Pencil size={12} color="#2563eb" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => onViewInvoice?.(bill, 'standard')}
                            style={{ padding: '5px 7px', fontSize: '0.72rem', gap: '3px' }}
                            title="Print Original Invoice"
                          >
                            <Printer size={12} />
                            <span>Print</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleDelete(bill)}
                            style={{ padding: '5px 7px', fontSize: '0.72rem', gap: '3px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                            title="Delete Sale (Restores Stock)"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
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

        {/* Mobile Cards View */}
        <div className="mobile-cards-view">
          {filteredBills.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No sales matching your filters.
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
                  <div className="invoice-hdr-sec-6">ACTIONS</div>
                </div>

                {filteredBills.map((bill) => {
                  const items = bill.items || [];
                  const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
                  const itemsPreview = items.slice(0, 2).map(i => i.name).join(', ') + (items.length > 2 ? ` +${items.length - 2} more` : '');
                  const paymentMethod = bill.payment?.method || 'Cash';
                  const paymentStatus = bill.payment?.status || 'Paid';

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
                          {items.length} items ({totalUnits} units)
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
                          paymentMethod === 'UPI' ? 'badge-blue' :
                          paymentMethod === 'Card' ? 'badge-sky' : 'badge-success'
                        }`}>
                          {paymentMethod}
                        </span>
                        <span className={`invoice-status-pill status-${paymentStatus.toLowerCase()}`}>
                          {paymentStatus}
                        </span>
                      </div>

                      {/* Section 6: View & Print Bill button */}
                      <div className="invoice-sec-6">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm invoice-btn-view-print"
                          onClick={() => onViewInvoice?.(bill, 'standard')}
                          title="View & Print Bill"
                        >
                          <Eye size={13} />
                          <Printer size={13} />
                          <span>View & Print</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm invoice-action-icon-btn"
                          onClick={() => handleOpenEdit(bill)}
                          title="Edit Invoice"
                          aria-label="Edit Invoice"
                        >
                          <Pencil size={12} color="#2563eb" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm invoice-action-icon-btn"
                          onClick={() => handleDelete(bill)}
                          title="Delete Invoice"
                          aria-label="Delete Invoice"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
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

      {/* Edit Sale Modal */}
      {editModalBill && (
        <div className="modal-overlay no-print" onClick={() => setEditModalBill(null)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '560px', width: '100%', padding: '0', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              background: 'var(--bg-page)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={18} color="#2563eb" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                    Edit Bill #{editModalBill.invoiceNo}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {editModalBill.date} • {editModalBill.time}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditModalBill(null)}
                style={{ padding: '4px 8px', borderRadius: '50%' }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEdit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Customer Details */}
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                  Customer Details *
                </span>
                <div className="edit-modal-customer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Customer Name..."
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Mobile (10 digits) *
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      className="form-control"
                      value={editForm.mobile}
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="10 digit mobile..."
                      required
                    />
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    City / Address *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="City / Address..."
                    required
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                  Payment Information
                </span>
                <div className="edit-modal-payment-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Payment Mode
                    </label>
                    <select
                      className="form-control"
                      value={editForm.paymentMethod}
                      onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI / GPay</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Payment Status
                    </label>
                    <select
                      className="form-control"
                      value={editForm.paymentStatus}
                      onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editForm.amountPaid}
                      onChange={(e) => setEditForm({ ...editForm, amountPaid: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Crackers Overview */}
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Items ({editModalBill.items?.length || 0} crackers)
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      onEditBill?.(editModalBill);
                      setEditModalBill(null);
                    }}
                    style={{ fontSize: '0.72rem', padding: '3px 8px', gap: '4px', color: '#1e40af' }}
                    title="Edit cracker items in New Billing"
                  >
                    <ExternalLink size={12} />
                    <span>Edit Items in Billing</span>
                  </button>
                </div>
                <div style={{
                  background: 'var(--bg-page)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {(editModalBill.items || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '4px 0', borderBottom: idx < editModalBill.items.length - 1 ? '1px dashed var(--border-light)' : 'none' }}>
                      <span>{item.name} × {item.quantity || 1}</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{(item.total || item.price * (item.quantity || 1)).toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                  Grand Total: ₹{(editModalBill.summary?.grandTotal || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '6px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-light)'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModalBill(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
