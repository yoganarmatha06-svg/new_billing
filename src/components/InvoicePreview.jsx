import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  Download, 
  Receipt, 
  FileText,
  Check
} from 'lucide-react';
import PrintBill from './PrintBill';

export const InvoicePreview = ({ 
  bill, 
  onClose, 
  initialFormat = 'standard' 
}) => {
  const [format, setFormat] = useState(initialFormat); // 'standard' (A4) or 'thermal' (80mm)
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Set document title to Invoice No so default suggested filename in browser PDF save is Invoice-INV-XXXX
    const prevTitle = document.title;
    document.title = `Invoice-${bill.invoiceNo || 'bill'}`;
    setDownloadSuccess(true);
    
    window.print();

    setTimeout(() => {
      document.title = prevTitle;
      setDownloadSuccess(false);
    }, 2500);
  };

  return (
    <div className="modal-overlay print-mode-modal" onClick={onClose}>
      <div className="modal-content invoice-preview-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar (Hidden on actual print) */}
        <div className="invoice-modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={22} color="#2563eb" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                Estimate Bill Preview
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Estimate #{bill.invoiceNo?.split('-').pop() || bill.invoiceNo} • {bill.date}
              </span>
            </div>
          </div>

          <div className="invoice-modal-actions">
            {/* Format Switcher: Estimate vs 80mm Thermal */}
            <div className="format-switcher">
              <button
                type="button"
                className={`format-btn ${format === 'standard' ? 'active' : ''}`}
                onClick={() => setFormat('standard')}
                title="Switch to Estimate Bill Format"
              >
                <FileText size={14} style={{ display: 'inline', marginRight: '5px' }} />
                <span>Estimate Bill</span>
              </button>
              <button
                type="button"
                className={`format-btn ${format === 'thermal' ? 'active' : ''}`}
                onClick={() => setFormat('thermal')}
                title="Switch to 80mm Thermal Receipt Format"
              >
                <Receipt size={14} style={{ display: 'inline', marginRight: '5px' }} />
                <span>80mm Thermal Slip</span>
              </button>
            </div>

            {/* Download PDF Button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadPdf}
              title="Save / Download as PDF"
              style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {downloadSuccess ? (
                <>
                  <Check size={15} color="#16a34a" />
                  <span style={{ color: '#16a34a' }}>Saving PDF...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Print Bill Button */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              title="Print Bill"
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} />
              <span>Print Bill</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ padding: '6px 10px' }}
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Canvas */}
        <div className={`invoice-modal-body ${format === 'thermal' ? 'body-thermal' : 'body-standard'}`}>
          <PrintBill bill={bill} format={format} />
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
