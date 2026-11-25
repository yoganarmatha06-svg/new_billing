import React from 'react';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  Landmark, 
  Printer, 
  Save, 
  FileText, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const PaymentDetails = ({ 
  paymentMethod = 'Cash', 
  onPaymentMethodChange, 
  amountPaid = 0,
  onAmountPaidChange,
  grandTotal = 0,
  paymentStatus = 'Paid', 
  onPaymentStatusChange, 
  onSaveDraft,
  onGenerateBill, 
  onPrintInvoice,
  onClearAll,
  canGenerate = false,
  itemsCount = 0
}) => {
  const methods = [
    { id: 'Cash', label: 'Cash', icon: Banknote },
    { id: 'UPI', label: 'UPI QR', icon: QrCode },
    { id: 'Card', label: 'Card', icon: CreditCard },
    { id: 'Bank Transfer', label: 'Bank', icon: Landmark }
  ];

  const statuses = ['Paid', 'Partial', 'Unpaid'];

  // Balance calculation
  const numericPaid = Number(amountPaid) || 0;
  const balance = grandTotal - numericPaid;

  return (
    <div className="billing-card">
      <div className="billing-card-header">
        <h3>
          <CreditCard size={18} color="#2563eb" />
          <span>Payment & Checkout</span>
        </h3>
        <span className="badge badge-blue">{paymentMethod}</span>
      </div>

      <div className="billing-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 1. Payment Method Selector */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            Payment Method
          </label>
          <div className="payment-methods-grid" style={{ marginBottom: 0 }}>
            {methods.map((m) => {
              const Icon = m.icon;
              const isActive = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`payment-method-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onPaymentMethodChange(m.id)}
                >
                  <Icon size={18} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Amount Paid & Balance Calculation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Amount Paid (₹)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder={String(grandTotal)}
                value={amountPaid === 0 ? '' : amountPaid}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onAmountPaidChange(isNaN(val) ? 0 : Math.max(0, val));
                }}
                style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Balance Amount</label>
            <div 
              className={`balance-card ${balance > 0 ? 'has-due' : 'settled'}`}
              style={{ height: '42px', padding: '8px 12px' }}
            >
              <span style={{ fontSize: '0.8rem' }}>
                {balance > 0 
                  ? 'Balance Due' 
                  : numericPaid > grandTotal 
                    ? 'Return Change' 
                    : 'Settled'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                ₹{Math.abs(balance).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Payment Status */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            Payment Status
          </label>
          <div className="payment-status-row" style={{ marginBottom: 0 }}>
            {statuses.map((status) => (
              <label key={status} className="status-radio-label">
                <input
                  type="radio"
                  name="paymentStatus"
                  value={status}
                  checked={paymentStatus === status}
                  onChange={() => onPaymentStatusChange(status)}
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4. Action Buttons: Save Draft, Generate Bill, Print Invoice, Clear All */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '10px' }}>
            {/* Save Bill */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={onGenerateBill}
              style={{
                padding: '12px 16px',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              title="Save bill and record sale"
            >
              <Save size={18} />
              <span>Save Bill</span>
            </button>

            {/* Print Invoice */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onPrintInvoice}
              style={{
                padding: '12px 14px',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              title="Preview & print 80mm thermal receipt"
            >
              <FileText size={16} />
              <span>Print Invoice</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Save Draft */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onSaveDraft}
              style={{
                padding: '10px 12px',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              title="Save current billing form as draft"
            >
              <Save size={15} />
              <span>Save Draft</span>
            </button>

            {/* Clear All */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClearAll}
              style={{
                padding: '10px 12px',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: 'var(--danger)'
              }}
              title="Reset customer, products and payments"
            >
              <RotateCcw size={15} />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
