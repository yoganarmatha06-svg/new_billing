import React from 'react';
import { User, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const CustomerDetails = ({ 
  customer = { name: '', mobile: '', address: '', gstNo: '' }, 
  onChange, 
  errors = {},
  savedCustomers = [],
  onSelectCustomer,
  onSaveCustomer,
  isSaved = false
}) => {
  const isMobileValid = /^[6-9]\d{9}$/.test(customer.mobile?.trim() || '');

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange({ ...customer, mobile: val });

    // Auto-fill if typing 10 digits matches a saved customer
    if (val.length === 10 && savedCustomers && onSelectCustomer) {
      const match = savedCustomers.find(c => c.mobile === val);
      if (match) {
        onSelectCustomer(match);
      }
    }
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    onSaveCustomer?.();
  };

  return (
    <div className="customer-compact-card">
      {/* Slim Header Line */}
      <div className="customer-compact-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={15} color="#2563eb" />
          <span className="customer-compact-title">
            Customer Information <span style={{ color: 'var(--danger)', fontWeight: 800 }}>*</span>
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            (* Required)
          </span>
        </div>

        {isSaved && (
          <span 
            className="badge" 
            style={{ 
              background: '#f0fdf4', 
              color: '#16a34a', 
              border: '1px solid #bbf7d0',
              fontSize: '0.68rem',
              padding: '2px 8px',
              fontWeight: 700
            }}
          >
            <CheckCircle2 size={11} />
            <span>Saved ✓</span>
          </span>
        )}
      </div>

      {/* Reduced Size Horizontal Form Grid */}
      <div className="customer-compact-grid">
        {/* Customer Name */}
        <div className="compact-field">
          <label htmlFor="customer-name-input" className="compact-field-label">
            Customer Name <span style={{ color: 'var(--danger)', fontWeight: 800 }}>*</span>
          </label>
          <input
            id="customer-name-input"
            type="text"
            className={`form-control form-control-sm ${errors.name ? 'error' : ''}`}
            placeholder="Enter customer name *"
            value={customer.name || ''}
            onChange={(e) => onChange({ ...customer, name: e.target.value })}
            required
          />
          {errors.name && (
            <span className="error-text" style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Mobile Number (+91) */}
        <div className="compact-field">
          <label htmlFor="customer-mobile-input" className="compact-field-label">
            Mobile Number <span style={{ color: 'var(--danger)', fontWeight: 800 }}>*</span>
          </label>
          <div className="phone-input-wrapper compact-phone-wrapper">
            <span className="phone-prefix compact-prefix">+91</span>
            <input
              id="customer-mobile-input"
              type="tel"
              className={`form-control phone-control form-control-sm ${errors.mobile ? 'error' : ''}`}
              placeholder="10 digits *"
              maxLength={10}
              value={customer.mobile || ''}
              onChange={handleMobileChange}
              required
            />
            {errors.mobile ? (
              <AlertCircle size={14} className="phone-invalid-icon" />
            ) : (
              customer.mobile?.length === 10 && isMobileValid && (
                <CheckCircle2 size={14} className="phone-valid-icon" />
              )
            )}
          </div>
          {errors.mobile && (
            <span className="error-text" style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>
              {errors.mobile}
            </span>
          )}
        </div>

        {/* Customer Address */}
        <div className="compact-field">
          <label htmlFor="customer-address-input" className="compact-field-label">
            City / Address <span style={{ color: 'var(--danger)', fontWeight: 800 }}>*</span>
          </label>
          <input
            id="customer-address-input"
            type="text"
            className={`form-control form-control-sm ${errors.address ? 'error' : ''}`}
            placeholder="City / Address *"
            value={customer.address || ''}
            onChange={(e) => onChange({ ...customer, address: e.target.value })}
            required
          />
          {errors.address && (
            <span className="error-text" style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>
              {errors.address}
            </span>
          )}
        </div>

        {/* Optional Save Details Button */}
        {(customer.name?.trim() || customer.mobile?.trim()) && (
          <div className="compact-field compact-action-field">
            <label className="compact-field-label" style={{ visibility: 'hidden', userSelect: 'none' }}>
              Save
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-sm compact-save-btn"
              onClick={handleSaveClick}
              title="Save customer details to records"
            >
              <Save size={13} />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
