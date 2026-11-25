import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { SHOP_DETAILS } from '../data/products';

// Helper: Convert number to Indian currency words
export const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'Zero Rupees Only';

  const convert = (val) => {
    if (val < 20) return a[val];
    if (val < 100) return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : ' ');
    if (val < 1000) return a[Math.floor(val / 100)] + 'Hundred ' + (val % 100 !== 0 ? 'and ' + convert(val % 100) : '');
    return '';
  };

  let str = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = n % 1000;

  if (crore > 0) str += convert(crore) + 'Crore ';
  if (lakh > 0) str += convert(lakh) + 'Lakh ';
  if (thousand > 0) str += convert(thousand) + 'Thousand ';
  if (hundred > 0) str += convert(hundred);

  return str.trim() + ' Rupees Only';
};

// Format date to DD-MM-YYYY (e.g., 20-11-2026)
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

// Extract or format clean estimate number (e.g. 1001)
const getEstimateNo = (invNo) => {
  if (!invNo) return '1001';
  if (/^\d+$/.test(invNo)) return invNo;
  const parts = String(invNo).split('-');
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return invNo;
};

export const PrintBill = ({ bill, format = 'standard' }) => {
  if (!bill) return null;

  const {
    invoiceNo = 'INV-1001',
    date = new Date().toISOString().split('T')[0],
    time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    customer = {},
    items = [],
    summary = {},
    payment = {}
  } = bill;

  const isPaid = payment.status === 'Paid';

  // --------------------------------------------------------------------------
  // 1. 80mm Thermal Slip Layout
  // --------------------------------------------------------------------------
  if (format === 'thermal') {
    return (
      <div className="thermal-receipt print-area-wrapper">
        {/* Header */}
        <div className="thermal-center">
          <div className="thermal-shop-name">{SHOP_DETAILS.name}</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{SHOP_DETAILS.tagline}</div>
          <div style={{ fontSize: '9px', marginTop: '2px', color: '#333' }}>{SHOP_DETAILS.address}</div>
          <div style={{ fontSize: '9px', color: '#333' }}>Ph: {SHOP_DETAILS.phone}</div>
          <div style={{ fontSize: '9px', color: '#333' }}>Email: {SHOP_DETAILS.email}</div>
        </div>

        <div className="thermal-divider-double"></div>

        <div className="thermal-center" style={{ fontWeight: 900, fontSize: '13px', letterSpacing: '0.05em', textDecoration: 'underline' }}>
          Estimate
        </div>

        <div className="thermal-divider"></div>

        {/* Invoice Meta */}
        <div className="thermal-row">
          <span>Estimate No:</span>
          <strong>{getEstimateNo(invoiceNo)}</strong>
        </div>
        <div className="thermal-row">
          <span>Date:</span>
          <span>{formatDate(date)}</span>
        </div>
        <div className="thermal-row">
          <span>Customer:</span>
          <strong>{customer.name?.trim() ? customer.name.trim().toUpperCase() : 'CASH CUSTOMER'}</strong>
        </div>
        {customer.address?.trim() && (
          <div className="thermal-row">
            <span>Address:</span>
            <span>{customer.address}</span>
          </div>
        )}
        {customer.mobile?.trim() && (
          <div className="thermal-row">
            <span>Mobile:</span>
            <span>{customer.mobile.trim().length === 10 ? `0${customer.mobile.trim()}` : customer.mobile.trim()}</span>
          </div>
        )}

        <div className="thermal-divider-double"></div>

        {/* Products Table */}
        <div className="thermal-row" style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '3px' }}>
          <span style={{ width: '24px' }}>#</span>
          <span style={{ flex: 2 }}>Product</span>
          <span style={{ width: '30px', textAlign: 'center' }}>Qty</span>
          <span style={{ width: '48px', textAlign: 'right' }}>Rate</span>
          <span style={{ width: '56px', textAlign: 'right' }}>Total</span>
        </div>

        <div style={{ marginTop: '4px' }}>
          {items.map((item, idx) => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            const disc = Number(item.discount) || 0;
            const total = price * qty - (price * qty * (disc / 100));

            return (
              <div key={idx} className="thermal-item">
                <div className="thermal-row" style={{ color: '#000', padding: '2px 0' }}>
                  <span style={{ width: '24px' }}>{idx + 1}</span>
                  <span style={{ flex: 2, fontWeight: 600 }}>{item.name}</span>
                  <span style={{ width: '30px', textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                  <span style={{ width: '48px', textAlign: 'right' }}>{price}</span>
                  <span style={{ width: '56px', textAlign: 'right', fontWeight: 700 }}>₹{total.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="thermal-divider"></div>

        {/* Totals Summary */}
        <div className="thermal-row">
          <span>Sub Total:</span>
          <span>₹{(summary.subtotal || 0).toFixed(2)}</span>
        </div>
        <div className="thermal-row">
          <span>Discount:</span>
          <span>- ₹{(summary.totalDiscount || 0).toFixed(2)}</span>
        </div>
        <div className="thermal-row">
          <span>Packing:</span>
          <span>₹0.00</span>
        </div>

        <div className="thermal-divider-double"></div>

        <div className="thermal-row" style={{ fontSize: '13px', fontWeight: 900 }}>
          <span>Net Amount:</span>
          <span>₹{(summary.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="thermal-divider"></div>

        <div className="thermal-center" style={{ fontSize: '9px', marginTop: '6px', lineHeight: '1.4' }}>
          <p style={{ fontWeight: 800, fontSize: '10px' }}>✨ HAPPY & SAFE DIWALI! ✨</p>
          <p>Thank you for your visit!</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. Official Sivakasi "Estimate" Bill Format (Matches Uploaded Format 100%)
  // --------------------------------------------------------------------------
  const estimateNo = getEstimateNo(invoiceNo);
  const formattedDate = formatDate(date);
  const customerName = customer.name?.trim() ? customer.name.trim().toUpperCase() : 'CASH CUSTOMER';
  const customerAddress = customer.address?.trim() || '';
  const customerPhone = customer.mobile?.trim()
    ? (customer.mobile.trim().length === 10 ? `0${customer.mobile.trim()}` : customer.mobile.trim())
    : '';

  const subTotal = summary.subtotal !== undefined
    ? Number(summary.subtotal)
    : items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

  const discountAmount = Number(summary.totalDiscount) || 0;
  const discountPercent = summary.discountRate !== undefined
    ? Math.round(Number(summary.discountRate))
    : (subTotal > 0 && discountAmount > 0
        ? Math.round((discountAmount / subTotal) * 100)
        : 0);

  const netAmount = summary.grandTotal !== undefined
    ? Number(summary.grandTotal)
    : Math.max(0, subTotal - discountAmount);

  return (
    <div className="estimate-bill-sheet print-area-wrapper">
      <table className="estimate-main-table">
        <colgroup>
          <col style={{ width: '6%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '48%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '16%' }} />
        </colgroup>

        <tbody>
          {/* Row 1: Header (Shop Name on left, Phone/Email on right) */}
          <tr className="row-header">
            <td colSpan={4} className="cell-shop-info">
              <h1 className="estimate-shop-name">
                {SHOP_DETAILS.name || 'NEW BILLING'}
              </h1>
            </td>
            <td colSpan={2} className="cell-contact-info">
              <div className="contact-line">
                <Phone size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                <span>{SHOP_DETAILS.phone || '9988765543'}</span>
              </div>
              <div className="contact-line" style={{ marginTop: '5px' }}>
                <Mail size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                <span>{SHOP_DETAILS.email || 'newbillng@gmail.com'}</span>
              </div>
            </td>
          </tr>

          {/* Row 2: Estimate Title Bar */}
          <tr className="row-estimate-title">
            <td colSpan={6} className="cell-estimate-title">
              <span>Estimate</span>
            </td>
          </tr>

          {/* Row 3: Customer & Meta Details */}
          <tr className="row-customer-meta">
            <td colSpan={4} className="cell-customer">
              <div className="customer-to-line">
                <span className="estimate-to-badge">To</span>
                <strong className="customer-name">{customerName}</strong>
              </div>
              {customerAddress && (
                <div className="customer-sub">{customerAddress}</div>
              )}
              {customerPhone && (
                <div className="customer-sub customer-phone">{customerPhone}</div>
              )}
            </td>
            <td colSpan={2} className="cell-meta">
              <div className="meta-line">
                <strong>Estimate No: </strong>
                <span>{estimateNo}</span>
              </div>
              <div className="meta-line" style={{ marginTop: '4px' }}>
                <strong>Date : </strong>
                <span>{formattedDate}</span>
              </div>
            </td>
          </tr>

          {/* Row 4: Products Table Header */}
          <tr className="row-table-headers">
            <th style={{ textAlign: 'center' }}>S.No.</th>
            <th style={{ textAlign: 'center' }}>Code</th>
            <th style={{ textAlign: 'center' }}>Product</th>
            <th style={{ textAlign: 'center' }}>Qty</th>
            <th style={{ textAlign: 'center' }}>Rate (Rs.) / Content</th>
            <th style={{ textAlign: 'center' }}>Total ₹</th>
          </tr>

          {/* Item Rows */}
          {items.map((item, idx) => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            const disc = Number(item.discount) || 0;
            const gross = price * qty;
            const itemTotal = gross - (gross * (disc / 100));
            const code = item.code ? (item.code.replace(/^[^\d]*-?/, '') || item.code) : String(idx + 1);
            const unit = item.unit ? item.unit.replace(/^1\s*/i, '') : 'Box';

            return (
              <tr key={idx} className="row-item">
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ textAlign: 'center', fontWeight: 800 }}>{code}</td>
                <td style={{ textAlign: 'left', paddingLeft: '8px' }}>{item.name}</td>
                <td style={{ textAlign: 'center', fontWeight: 800 }}>{qty}</td>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>
                  {price} / {unit}
                </td>
                <td style={{ textAlign: 'right', paddingRight: '8px', fontWeight: 700 }}>
                  {itemTotal.toFixed(2)}
                </td>
              </tr>
            );
          })}

          {/* Filler Row: Continues all vertical borders down to the summary box */}
          <tr className="row-filler">
            <td style={{ textAlign: 'center' }}>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>

          {/* Summary Row 1: Sub Total */}
          <tr className="row-summary">
            <td colSpan={4} rowSpan={4} className="cell-summary-empty">
              &nbsp;
            </td>
            <td className="cell-sum-label">Sub Total</td>
            <td className="cell-sum-val">
              {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>

          {/* Summary Row 2: Discount */}
          <tr className="row-summary">
            <td className="cell-sum-label">Discount ({discountPercent}%)</td>
            <td className="cell-sum-val">
              {discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>

          {/* Summary Row 3: Packing */}
          <tr className="row-summary">
            <td className="cell-sum-label">Packing (0%)</td>
            <td className="cell-sum-val">0.00</td>
          </tr>

          {/* Summary Row 4: Net Amount */}
          <tr className="row-summary row-net-amount">
            <td className="cell-sum-label net-label">Net Amount</td>
            <td className="cell-sum-val net-val">
              {netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PrintBill;
