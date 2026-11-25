import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  ReceiptText,
  Trash2
} from 'lucide-react';

export const Customers = ({ 
  customers = [], 
  onAddCustomer, 
  onDeleteCustomer,
  onSelectCustomerForBill,
  onShowToast 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newCust, setNewCust] = useState({
    name: '',
    mobile: '',
    address: ''
  });

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.mobile?.includes(q) ||
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
      totalPurchases: 0,
      billsCount: 0,
      lastPurchase: 'New Customer'
    };

    onAddCustomer(created);
    onShowToast?.(`Customer ${created.name} added`, 'success');
    setShowAddModal(false);
    setNewCust({ name: '', mobile: '', address: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="billing-card">
        <div className="billing-card-header">
          <h3>
            <Users size={20} color="#2563eb" />
            <span>Customers</span>
          </h3>
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>New Customer</span>
          </button>
        </div>

        <div className="billing-card-body">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search customer by name, mobile, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="transactions-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>City / Address</th>
                <th style={{ textAlign: 'right' }}>Total Purchases (₹)</th>
                <th style={{ textAlign: 'center' }}>Bills</th>
                <th style={{ textAlign: 'center', width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust, idx) => (
                <tr key={cust.id}>
                  <td style={{ color: 'var(--text-light)', fontWeight: 600 }}>{idx + 1}</td>
                  <td>
                    <strong style={{ color: 'var(--text-heading)', display: 'block' }}>
                      {cust.name}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Last visit: {cust.lastPurchase || 'Recent'}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} color="#2563eb" />
                      +91 {cust.mobile}
                    </span>
                  </td>

                  <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    {cust.address || '—'}
                  </td>

                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                    ₹{(cust.totalPurchases || 0).toLocaleString('en-IN')}
                  </td>

                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    <span className="badge badge-sky">{cust.billsCount || 0}</span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                        onClick={() => onSelectCustomerForBill(cust)}
                        title="Create new bill for this customer"
                      >
                        <ReceiptText size={13} />
                        <span>Bill</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => {
                          onDeleteCustomer?.(cust.id);
                          onShowToast?.(`Customer "${cust.name}" deleted`, 'warning');
                        }}
                        title={`Delete ${cust.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3>
                <Users size={20} color="#2563eb" />
                <span>Add Customer Record</span>
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
    </div>
  );
};

export default Customers;
