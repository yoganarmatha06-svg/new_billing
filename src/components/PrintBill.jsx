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
  const discountPercent = subTotal > 0 && discountAmount > 0
    ? Math.round((discountAmount / subTotal) * 100)
    : 0;

  const netAmount = summary.grandTotal !== undefined
    ? Number(summary.grandTotal)
    : Math.max(0, subTotal - discountAmount);

  return (
    <div className="estimate-bill-sheet print-area-wrapper">
      <div className="estimate-box">
        {/* Top Header Block */}
        <div className="estimate-header-grid">
          {/* Shop Name & Address (Left) */}
          <div className="estimate-shop-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '68px', padding: '10px 14px' }}>
            <h1 className="estimate-shop-name" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '1px', margin: 0, textTransform: 'uppercase' }}>
              {SHOP_DETAILS.name || 'NEW BILLING'}
            </h1>
          </div>

          {/* Contact Details (Right) */}
          <div className="estimate-contact-info">
            <div className="estimate-contact-row">
              <Phone size={13} className="estimate-icon" />
              <div>
                <div>{SHOP_DETAILS.phone || '9988765543'}</div>
              </div>
            </div>

            <div className="estimate-contact-row" style={{ marginTop: '8px' }}>
              <Mail size={13} className="estimate-icon" />
              <div style={{ wordBreak: 'break-all' }}>{SHOP_DETAILS.email || 'newbillng@gmail.com'}</div>
            </div>
          </div>
        </div>

        {/* Estimate Title Bar */}
        <div className="estimate-title-bar">
          <span>Estimate</span>
        </div>

        {/* Customer & Estimate Meta Row */}
        <div className="estimate-meta-grid">
          {/* Customer Details (Left) */}
          <div className="estimate-customer-box">
            <div className="estimate-customer-to-row">
              <span className="estimate-to-badge">To</span>
              <span className="estimate-customer-name">
                {customerName}
              </span>
            </div>
            {customerAddress && (
              <div className="estimate-customer-sub">
                {customerAddress}
              </div>
            )}
            {customerPhone && (
              <div className="estimate-customer-sub estimate-customer-phone">
                {customerPhone}
              </div>
            )}
          </div>

          {/* Estimate No & Date (Right) */}
          <div className="estimate-no-date-box">
            <div className="estimate-meta-row">
              <span className="estimate-meta-label">Estimate No:</span>
              <span className="estimate-meta-val">{estimateNo}</span>
            </div>
            <div className="estimate-meta-row">
              <span className="estimate-meta-label">Date :</span>
              <span className="estimate-meta-val">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="estimate-table-wrapper">
          <table className="estimate-table">
            <thead>
              <tr>
                <th style={{ width: '6%', textAlign: 'center' }}>S.No.</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Code</th>
                <th style={{ width: '48%', textAlign: 'center' }}>Product</th>
                <th style={{ width: '6%', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '16%', textAlign: 'center' }}>Rate (Rs.) / Content</th>
                <th style={{ width: '16%', textAlign: 'center' }}>Total ₹</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const qty = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                const disc = Number(item.discount) || 0;
                const gross = price * qty;
                const itemTotal = gross - (gross * (disc / 100));
                const code = item.code ? (item.code.replace(/^[^\d]*-?/, '') || item.code) : String(idx + 1);
                const unit = item.unit ? item.unit.replace(/^1\s*/i, '') : 'Box';

                return (
                  <tr key={idx} className="estimate-item-row">
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>{code}</td>
                    <td style={{ textAlign: 'left', paddingLeft: '8px' }}>{item.name}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>{qty}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>
                      {price} / {unit}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '10px', fontWeight: 700 }}>
                      {itemTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}

              {/* Stretch vertical border lines downwards like the original estimate sheet */}
              <tr className="estimate-filler-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Block at Bottom Right */}
        <div className="estimate-summary-container">
          <div className="estimate-summary-blank-space"></div>
          <div className="estimate-summary-table-box">
            <table className="estimate-summary-table">
              <tbody>
                <tr>
                  <td className="estimate-sum-label">Sub Total</td>
                  <td className="estimate-sum-val">
                    {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="estimate-sum-label">Discount ({discountPercent}%)</td>
                  <td className="estimate-sum-val">
                    {discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="estimate-sum-label">Packing (0%)</td>
                  <td className="estimate-sum-val">0.00</td>
                </tr>
                <tr className="estimate-sum-net-row">
                  <td className="estimate-sum-label estimate-net-label">Net Amount</td>
                  <td className="estimate-sum-val estimate-net-val">
                    {netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintBill;
