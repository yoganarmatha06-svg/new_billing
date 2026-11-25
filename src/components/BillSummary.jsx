import React from 'react';
import { Calculator, Tag, Printer, FileText, Save, RotateCcw } from 'lucide-react';

export const BillSummary = ({ 
  summary = {}, 
  manualDiscount = 0, 
  onManualDiscountChange,
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

          {/* 2. Total Discount */}
          <div className="summary-line-item discount-highlight">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={13} color="var(--accent)" />
              <span>Total Discount</span>
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              - ₹{totalDiscount.toFixed(2)}
            </span>
          </div>

          {/* Manual Extra Bill Discount if provided */}
          {onManualDiscountChange && (
            <div className="summary-line-item">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Extra Bill Discount (₹)
              </span>
              <div className="manual-discount-input-group">
                <input
                  type="number"
                  min="0"
                  max={Math.max(0, taxableAmount)}
                  className="manual-disc-input"
                  placeholder="0"
                  value={manualDiscount === 0 ? '' : manualDiscount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onManualDiscountChange(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                />
              </div>
            </div>
          )}

          {/* Taxable Amount */}
          <div className="summary-line-item">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Taxable Value</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}>
              ₹{taxableAmount.toFixed(2)}
            </span>
          </div>

          {/* 3. GST Amount */}
          <div className="summary-line-item">
            <span style={{ color: 'var(--text-secondary)' }}>GST Amount (18%)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '10px' }}>
                {/* Generate Bill Button */}
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
                >
                  <Printer size={18} />
                  <span>Generate Bill</span>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
