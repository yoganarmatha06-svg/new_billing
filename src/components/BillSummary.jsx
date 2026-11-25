import React from 'react';
import { Calculator, FileText, Save, RotateCcw } from 'lucide-react';

export const BillSummary = ({ 
  summary = {}, 
  discountType = 'percent',
  onDiscountTypeChange,
  customDiscountValue = '0',
  onCustomDiscountChange,
  gstType = 'percent',
  onGstTypeChange,
  customGstValue = '18',
  onCustomGstChange,
  onGenerateBill,
  onPrintInvoice,
  onSaveDraft,
  onClearAll,
  canGenerate = false,
  itemsCount: passedItemsCount
}) => {
  const {
    itemsCount = passedItemsCount || 0,
    subtotal = 0,
    totalDiscount = 0,
    taxableAmount = 0,
    gstAmount = 0,
    roundOff = 0,
    grandTotal = 0
  } = summary;

  // Auto-detect discount mode: Double digit (1-2 digits) => %, 3 digits or more => ₹
  const intDigits = String(customDiscountValue || '').trim().split('.')[0].replace(/\D/g, '');
  const currentDiscountType = intDigits.length >= 3 
    ? 'amount' 
    : (intDigits.length > 0 ? 'percent' : (summary.discountType || discountType || 'percent'));

  return (
    <div className="billing-card">
      <div className="billing-card-header">
        <h3>
          <Calculator size={18} color="#2563eb" />
          <span>Billing Summary</span>
        </h3>
        <span className="badge badge-blue">{itemsCount} Items</span>
      </div>

      <div className="billing-card-body">
        <div className="bill-summary-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1. Subtotal */}
          <div className="summary-line-item">
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal (Gross MRP)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-heading)' }}>
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          {/* 2. Manual Typeable Discount (Auto: 1-2 digits = %, 3+ digits = ₹) */}
          <div className="summary-line-item" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 600 }}>
                Discount
              </span>

              {/* Mode Toggle: Highlights % for double digits, ₹ for 3+ digits */}
              <div style={{ display: 'inline-flex', borderRadius: '4px', border: '1px solid var(--border-dark)', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => onDiscountTypeChange && onDiscountTypeChange('percent')}
                  title="Double digit (1-99) = % Percentage"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: currentDiscountType === 'percent' ? '#2563eb' : '#f8fafc',
                    color: currentDiscountType === 'percent' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => onDiscountTypeChange && onDiscountTypeChange('amount')}
                  title="3 digits or more (100+) = ₹ Rupee"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: currentDiscountType === 'amount' ? '#2563eb' : '#f8fafc',
                    color: currentDiscountType === 'amount' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  ₹
                </button>
              </div>

              {/* Typeable Discount Input Field */}
              <div className="manual-discount-input-group" style={{ gap: '2px' }}>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="manual-disc-input"
                  style={{ width: '65px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                  placeholder="0"
                  value={customDiscountValue}
                  onChange={(e) => onCustomDiscountChange(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {currentDiscountType === 'percent' ? '%' : '₹'}
                </span>
              </div>
            </div>

            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: totalDiscount > 0 ? '#16a34a' : 'var(--text-secondary)' }}>
              - ₹{totalDiscount.toFixed(2)}
            </span>
          </div>

          {/* Taxable Amount */}
          <div className="summary-line-item">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Taxable Value</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}>
              ₹{taxableAmount.toFixed(2)}
            </span>
          </div>

          {/* 3. Editable GST Amount & Rate */}
          <div className="summary-line-item" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 600 }}>
                GST
              </span>

              {/* Mode Toggle: % or ₹ */}
              {onGstTypeChange && (
                <div style={{ display: 'inline-flex', borderRadius: '4px', border: '1px solid var(--border-dark)', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => onGstTypeChange('percent')}
                    title="Calculate GST by percentage (%)"
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: gstType === 'percent' ? '#2563eb' : '#f8fafc',
                      color: gstType === 'percent' ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => onGstTypeChange('amount')}
                    title="Enter custom GST in rupees (₹)"
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: gstType === 'amount' ? '#2563eb' : '#f8fafc',
                      color: gstType === 'amount' ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ₹
                  </button>
                </div>
              )}

              {/* Typeable GST Input Field */}
              {onCustomGstChange ? (
                <div className="manual-discount-input-group" style={{ gap: '2px' }}>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="manual-disc-input"
                    style={{ width: '65px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                    placeholder={gstType === 'percent' ? '18' : '0.00'}
                    value={customGstValue}
                    onChange={(e) => onCustomGstChange(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {gstType === 'percent' ? '%' : '₹'}
                  </span>
                </div>
              ) : (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  ({summary.gstRate ?? 18}%)
                </span>
              )}
            </div>

            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
              + ₹{gstAmount.toFixed(2)}
            </span>
          </div>

          {/* Round Off Adjustment */}
          {roundOff !== 0 && (
            <div className="summary-line-item" style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
              <span>Round Off</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                {roundOff > 0 ? `+ ₹${roundOff}` : `- ₹${Math.abs(roundOff)}`}
              </span>
            </div>
          )}

          {/* 4. Grand Total */}
          <div className="grand-total-highlight-card" style={{ marginTop: '8px' }}>
            <div>
              <span>Grand Total</span>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                All taxes & discounts included
              </p>
            </div>
            <h2>₹{grandTotal}</h2>
          </div>

          {/* 5. Action Buttons (Generate Bill, Print Invoice, Save Draft, Clear All) */}
          {(onGenerateBill || onPrintInvoice) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
              <div className="billing-action-buttons-row">
                {/* Save Bill Button */}
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
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                  title="Save bill and record sale"
                >
                  <Save size={18} />
                  <span>Save Bill</span>
                </button>

                {/* Print Invoice Button */}
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

              <div className="billing-action-subrow">
                {/* Save Draft Button */}
                {onSaveDraft && (
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
                )}

                {/* Clear All Button */}
                {onClearAll && (
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
                    title="Reset all billing details"
                  >
                    <RotateCcw size={15} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillSummary;
