import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  ReceiptText,
  Trash2,
  Mail,
  ShoppingBag,
  Pencil,
  Eye,
  X,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

export const Customers = ({ 
  customers = [], 
  onAddCustomer, 
  onUpdateCustomer,
  onDeleteCustomer,
  onSelectCustomerForBill,
  onShowToast 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModalCustomer, setEditModalCustomer] = useState(null);
  const [viewModalCustomer, setViewModalCustomer] = useState(null);

  const [newCust, setNewCust] = useState({
    name: '',
    mobile: '',
    email: '',
    address: ''
  });

  const [editCustForm, setEditCustForm] = useState({
    name: '',
    mobile: '',
    email: '',
    address: ''
  });

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.mobile?.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  }, [customers, searchTerm]);

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCust.name.trim()) {
      onShowToast?.('Customer name is required', 'danger');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(newCust.mobile.trim())) {
      onShowToast?.('Enter a valid 10-digit mobile number', 'danger');
      return;
    }

    const created = {
      ...newCust,
      id: `cust-${Date.now()}`,
      name: newCust.name.trim(),
      mobile: newCust.mobile.trim(),
      email: newCust.email?.trim() || `${newCust.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      address: newCust.address?.trim() || '',
      totalPurchases: 0,
      billsCount: 0,
      lastPurchase: 'New Customer'
    };

    onAddCustomer?.(created);
    onShowToast?.(`Customer "${created.name}" added successfully`, 'success');
    setShowAddModal(false);
    setNewCust({ name: '', mobile: '', email: '', address: '' });
  };

  const handleOpenEdit = (cust) => {
    setEditModalCustomer(cust);
    setEditCustForm({
      name: cust.name || '',
      mobile: cust.mobile || '',
      email: cust.email || `${cust.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      address: cust.address || ''
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editCustForm.name.trim()) {
      onShowToast?.('Customer name is required', 'danger');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(editCustForm.mobile.trim())) {
      onShowToast?.('Enter a valid 10-digit mobile number', 'danger');
      return;
    }

    const updated = {
      ...editModalCustomer,
      name: editCustForm.name.trim(),
      mobile: editCustForm.mobile.trim(),
      email: editCustForm.email?.trim() || `${editCustForm.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      address: editCustForm.address?.trim() || ''
    };

    onUpdateCustomer?.(updated);
    onShowToast?.(`Customer "${updated.name}" updated successfully`, 'success');
    setEditModalCustomer(null);
  };

  const handleDelete = (cust) => {
    if (window.confirm(`Are you sure you want to delete customer "${cust.name}"?`)) {
      onDeleteCustomer?.(cust.id);
      onShowToast?.(`Customer "${cust.name}" deleted`, 'warning');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Search & Actions Banner */}
      <div className="billing-card customer-header-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="customer-header-top">
          <div className="customer-title-group">
            <Users size={18} color="#2563eb" style={{ flexShrink: 0 }} />
            <h3 className="customer-header-title">
              <span>Customers</span>
              <span className="desktop-only-inline"> Directory</span>
            </h3>
            <span className="badge badge-sky customer-header-badge">
              {customers.length}
              <span className="desktop-only-inline"> Records</span>
            </span>
          </div>

          <button 
            type="button" 
            className="btn btn-primary btn-sm customer-header-add-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} style={{ flexShrink: 0 }} />
            <span><span className="customer-btn-label-desktop">New </span>Customer</span>
          </button>
        </div>

        <div className="customer-search-box">
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.825rem' }}
              placeholder="Search customer by name, phone number, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Customer Responsive Horizontal Table (Unified for Desktop, Tablet & Mobile) */}
      <div className="customer-table-card">
        <div className="customer-table-wrapper">
          <table className="custom-table customer-responsive-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ minWidth: '180px', textAlign: 'left' }}>Customer Name</th>
                <th style={{ minWidth: '140px', textAlign: 'left' }}>Phone Number</th>
                <th style={{ minWidth: '180px', textAlign: 'left' }}>Email</th>
                <th style={{ minWidth: '115px', textAlign: 'center' }}>Total Orders</th>
                <th style={{ minWidth: '120px', textAlign: 'right' }}>Total Amount</th>
                <th style={{ minWidth: '125px', textAlign: 'center' }}>Customer Status</th>
                <th style={{ minWidth: '220px', width: '220px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Users size={36} color="#cbd5e1" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>No customer records found</span>
                      <span style={{ fontSize: '0.8rem' }}>Try adjusting your search criteria</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust, idx) => {
                  const ordersCount = cust.billsCount || cust.totalOrders || 0;
                  const totalPurchases = cust.totalPurchases || cust.totalAmount || 0;
                  const email = cust.email || `${cust.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;
                  
                  // Status badge logic
                  const status = cust.status || (totalPurchases > 15000 ? 'VIP' : ordersCount > 0 ? 'Active' : 'New');

                  return (
                    <tr key={cust.id}>
                      {/* 1. Index */}
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {idx + 1}
                      </td>

                      {/* 2. Customer Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="customer-avatar-circle">
                            {cust.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-heading)', display: 'block', fontSize: '0.88rem' }}>
                              {cust.name}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {cust.address || 'Walk-in Customer'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Phone Number */}
                      <td>
                        <span className="customer-phone-pill">
                          <Phone size={12} color="#2563eb" style={{ flexShrink: 0 }} />
                          <span>+91 {cust.mobile}</span>
                        </span>
                      </td>

                      {/* 4. Email */}
                      <td>
                        <span className="customer-email-text" title={email}>
                          <Mail size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                          <span>{email}</span>
                        </span>
                      </td>

                      {/* 5. Total Orders */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-sky" style={{ fontSize: '0.74rem', fontWeight: 700, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShoppingBag size={11} />
                          <span>{ordersCount} orders</span>
                        </span>
                      </td>

                      {/* 6. Total Amount */}
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-heading)' }}>
                        ₹{totalPurchases.toLocaleString('en-IN')}
                      </td>

                      {/* 7. Customer Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`customer-status-pill status-${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>

                      {/* 8. Actions (View / Edit / Delete) */}
                      <td style={{ textAlign: 'center', minWidth: '220px', width: '220px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                          {/* View Customer Details */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm customer-action-btn"
                            onClick={() => setViewModalCustomer(cust)}
                            title="View Customer Profile"
                          >
                            <Eye size={12} color="#2563eb" />
                            <span>View</span>
                          </button>

                          {/* Quick Bill Button */}
                          <button
                            type="button"
                            className="btn btn-primary btn-sm customer-action-btn"
                            onClick={() => onSelectCustomerForBill?.(cust)}
                            title="Create new bill for this customer"
                          >
                            <ReceiptText size={12} />
                            <span>Bill</span>
                          </button>

                          {/* Edit Customer */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm customer-action-btn"
                            onClick={() => handleOpenEdit(cust)}
                            title={`Edit ${cust.name}`}
                          >
                            <Pencil size={12} color="#2563eb" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Customer */}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm customer-action-btn delete-btn"
                            onClick={() => handleDelete(cust)}
                            title={`Delete ${cust.name}`}
                          >
                            <Trash2 size={12} />
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

      {/* View Customer Profile Modal */}
      {viewModalCustomer && (
        <div className="modal-overlay" onClick={() => setViewModalCustomer(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} color="#2563eb" />
                <span>Customer Profile</span>
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setViewModalCustomer(null)}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <div className="customer-avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                  {viewModalCustomer.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                    {viewModalCustomer.name}
                  </h4>
                  <span className="customer-phone-pill">
                    <Phone size={11} color="#2563eb" />
                    +91 {viewModalCustomer.mobile}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-page)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total Orders</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                    {viewModalCustomer.billsCount || 0} Bills
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total Purchases</span>
                  <strong style={{ fontSize: '0.95rem', color: '#16a34a', fontFamily: 'var(--font-mono)' }}>
                    ₹{(viewModalCustomer.totalPurchases || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                    {viewModalCustomer.email || `${viewModalCustomer.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Location / City</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                    {viewModalCustomer.address || '—'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setViewModalCustomer(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setViewModalCustomer(null);
                    onSelectCustomerForBill?.(viewModalCustomer);
                  }}
                >
                  <ReceiptText size={13} />
                  <span>Start New Bill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3>
                <Users size={18} color="#2563eb" />
                <span>Add Customer Record</span>
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setShowAddModal(false)}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Customer Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ramesh Chandran"
                    required
                    value={newCust.name}
                    onChange={e => setNewCust({ ...newCust, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number (10 Digits) *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    className="form-control"
                    placeholder="9876543210"
                    required
                    value={newCust.mobile}
                    onChange={e => setNewCust({ ...newCust, mobile: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. ramesh@gmail.com"
                    value={newCust.email}
                    onChange={e => setNewCust({ ...newCust, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address / Location</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 15 Gandhi Street, Madurai"
                    value={newCust.address}
                    onChange={e => setNewCust({ ...newCust, address: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editModalCustomer && (
        <div className="modal-overlay" onClick={() => setEditModalCustomer(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3>
                <Pencil size={18} color="#2563eb" />
                <span>Edit Customer Record</span>
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setEditModalCustomer(null)}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Customer Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editCustForm.name}
                    onChange={e => setEditCustForm({ ...editCustForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number (10 Digits) *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    className="form-control"
                    required
                    value={editCustForm.mobile}
                    onChange={e => setEditCustForm({ ...editCustForm, mobile: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editCustForm.email}
                    onChange={e => setEditCustForm({ ...editCustForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address / Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editCustForm.address}
                    onChange={e => setEditCustForm({ ...editCustForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setEditModalCustomer(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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

export default Customers;
