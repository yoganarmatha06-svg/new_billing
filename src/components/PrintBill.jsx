import React from 'react';
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

export const PrintBill = ({ bill, format = 'standard' }) => {
  if (!bill) return null;

  const {
    invoiceNo = 'INV-0000',
    date = new Date().toISOString().split('T')[0],
    time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    customer = {},
    items = [],
    summary = {},
    payment = {}
  } = bill;

  const isPaid = payment.status === 'Paid';
  const hasCustomer = Boolean(customer.name?.trim() || customer.mobile?.trim() || customer.address?.trim());

  // --------------------------------------------------------------------------
  // 1. 80mm Thermal Slip Layout
  // --------------------------------------------------------------------------
  if (format === 'thermal') {
    return (
      <div className="thermal-receipt print-area-wrapper">
        {/* Header */}
        <div className="thermal-center">
          <img 
            src="/billing-logo.jpg" 
            alt="Shop Logo" 
            style={{ width: '44px', height: 'auto', marginBottom: '4px', objectFit: 'contain' }} 
          />
          <div className="thermal-shop-name">{SHOP_DETAILS.name}</div>
          <div style={{ fontSize: '10px', color: '#444' }}>{SHOP_DETAILS.tagline}</div>
          <div style={{ fontSize: '9px', marginTop: '2px', color: '#333' }}>{SHOP_DETAILS.address}</div>
          <div style={{ fontSize: '9px', color: '#333' }}>Ph: {SHOP_DETAILS.phone}</div>
          <div style={{ fontSize: '9px', color: '#333' }}>GSTIN: {SHOP_DETAILS.gstin} | Lic: {SHOP_DETAILS.licenseNo}</div>
        </div>

        <div className="thermal-divider-double"></div>

        <div className="thermal-center" style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '0.05em' }}>
          TAX INVOICE / CASH MEMO
        </div>

        <div className="thermal-divider"></div>

        {/* Invoice Meta */}
        <div className="thermal-row">
          <span>Inv No:</span>
          <strong>#{invoiceNo}</strong>
        </div>
        <div className="thermal-row">
          <span>Date & Time:</span>
          <span>{date} {time}</span>
        </div>
        <div className="thermal-row">
          <span>Customer:</span>
          <strong>{customer.name?.trim() || 'Walk-in Customer'}</strong>
        </div>
        {customer.mobile?.trim() && (
          <div className="thermal-row">
            <span>Mobile:</span>
            <span>+91 {customer.mobile}</span>
          </div>
        )}
        {customer.address?.trim() && (
          <div className="thermal-row">
            <span>Address:</span>
            <span>{customer.address}</span>
          </div>
        )}
        {customer.gstNo?.trim() && (
          <div className="thermal-row">
            <span>Cust GSTIN:</span>
            <span>{customer.gstNo}</span>
          </div>
        )}

        <div className="thermal-divider-double"></div>

        {/* Products Table */}
        <div className="thermal-row" style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '3px' }}>
          <span style={{ flex: 2 }}>Item Description</span>
          <span style={{ width: '32px', textAlign: 'center' }}>Qty</span>
          <span style={{ width: '45px', textAlign: 'right' }}>Rate</span>
          <span style={{ width: '38px', textAlign: 'center' }}>Disc</span>
          <span style={{ width: '55px', textAlign: 'right' }}>Total</span>
        </div>

        <div style={{ marginTop: '4px' }}>
          {items.map((item, idx) => {
            const qty = item.quantity || 1;
            const price = Number(item.price) || 0;
            const gross = price * qty;
            const discountAmt = gross * ((item.discount || 0) / 100);
            const taxable = gross - discountAmt;
            const gstAmt = taxable * ((item.gst || 18) / 100);
            const itemTotal = taxable + gstAmt;

            return (
              <div key={idx} className="thermal-item">
                <div className="thermal-item-title">{idx + 1}. {item.name}</div>
                <div className="thermal-row" style={{ color: '#222' }}>
                  <span style={{ flex: 2, fontSize: '9.5px', color: '#555' }}>[{item.code || `CRK-${idx + 1}`}]</span>
                  <span style={{ width: '32px', textAlign: 'center' }}>{qty}</span>
                  <span style={{ width: '45px', textAlign: 'right' }}>{price}</span>
                  <span style={{ width: '38px', textAlign: 'center' }}>{item.discount ? `${item.discount}%` : '-'}</span>
                  <span style={{ width: '55px', textAlign: 'right', fontWeight: 700 }}>₹{itemTotal.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="thermal-divider"></div>

        {/* Totals Summary */}
        <div className="thermal-row">
          <span>Gross Subtotal:</span>
          <span>₹{(summary.subtotal || 0).toFixed(2)}</span>
        </div>
        <div className="thermal-row">
          <span>Total Discount:</span>
          <span>- ₹{(summary.totalDiscount || 0).toFixed(2)}</span>
        </div>
        <div className="thermal-row">
          <span>Taxable Value:</span>
          <span>₹{(summary.taxableAmount || 0).toFixed(2)}</span>
        </div>
        <div className="thermal-row">
          <span>CGST (9%):</span>
          <span>+ ₹{((summary.gstAmount || 0) / 2).toFixed(2)}</span>
        </div>
        <div className="thermal-row">
          <span>SGST (9%):</span>
          <span>+ ₹{((summary.gstAmount || 0) / 2).toFixed(2)}</span>
        </div>
        {summary.roundOff !== 0 && (
          <div className="thermal-row">
            <span>Round Off:</span>
            <span>₹{summary.roundOff}</span>
          </div>
        )}

        <div className="thermal-divider-double"></div>

        <div className="thermal-row" style={{ fontSize: '13px', fontWeight: 900 }}>
          <span>NET PAYABLE:</span>
          <span>₹{(summary.grandTotal || 0).toLocaleString('en-IN')}</span>
        </div>

        <div className="thermal-divider"></div>

        {/* Payment & Status */}
        <div className="thermal-row">
          <span>Payment Mode:</span>
          <strong>{payment.method || 'Cash'}</strong>
        </div>
        <div className="thermal-row">
          <span>Payment Status:</span>
          <strong style={{ color: isPaid ? '#15803d' : '#b45309' }}>
            {payment.status || 'Paid'}
          </strong>
        </div>
        <div className="thermal-row">
          <span>Amount Paid:</span>
          <span>₹{summary.paidAmount ?? summary.grandTotal}</span>
        </div>
        {summary.balanceAmount > 0 && (
          <div className="thermal-row" style={{ color: '#dc2626', fontWeight: 700 }}>
            <span>Balance Due:</span>
            <span>₹{summary.balanceAmount}</span>
          </div>
        )}

        {/* Barcode & Thank you */}
        <div className="thermal-barcode">
          <div className="barcode-stripes"></div>
          <span style={{ fontSize: '9px', letterSpacing: '0.1em' }}>*{invoiceNo}*</span>
        </div>

        <div className="thermal-divider"></div>

        <div className="thermal-center" style={{ fontSize: '9px', marginTop: '6px', lineHeight: '1.4' }}>
          <p style={{ fontWeight: 800, fontSize: '10px' }}>✨ HAPPY & SAFE DIWALI! ✨</p>
          <p>Thank you for shopping with us! Visit again!</p>
          <p>Goods once sold will not be taken back.</p>
          <p>Always burst crackers outdoors under adult supervision.</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. Standard Professional A4 GST Tax Invoice
  // --------------------------------------------------------------------------
  return (
    <div className="tax-invoice-sheet print-area-wrapper">
      {/* Paid / Unpaid Watermark */}
      <div className={`status-watermark ${isPaid ? 'watermark-paid' : 'watermark-unpaid'}`}>
        {payment.status || 'PAID'}
      </div>

      {/* Top Shop Banner */}
      <div className="invoice-top-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src="/billing-logo.jpg" 
            alt="Shop Logo" 
            style={{ 
              width: '74px', 
              height: '74px', 
              borderRadius: '8px', 
              objectFit: 'contain',
              border: '1.5px solid var(--border-light)',
              padding: '2px',
              background: '#ffffff'
            }}
          />
          <div className="shop-title">
            <h2>{SHOP_DETAILS.name}</h2>
            <div className="shop-tagline">{SHOP_DETAILS.tagline}</div>
            <div className="shop-meta-text">
              <div>{SHOP_DETAILS.address}</div>
              <div><strong>Phone:</strong> {SHOP_DETAILS.phone} • <strong>Email:</strong> {SHOP_DETAILS.email}</div>
              <div><strong>GSTIN:</strong> {SHOP_DETAILS.gstin} • <strong>PESO Lic:</strong> {SHOP_DETAILS.licenseNo}</div>
            </div>
          </div>
        </div>

        <div className="invoice-badge-title">
          <h1>TAX INVOICE</h1>
          <div className="invoice-no-display">
            #{invoiceNo}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Original for Recipient
          </div>
          <div style={{ marginTop: '6px' }}>
            <span className={`badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
              ● {payment.status || 'Paid'}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid: Customer (Billed To) & Invoice Meta */}
      <div className="invoice-details-grid">
        {/* Customer Information (Left) */}
        <div className="invoice-info-col">
          <h4>Billed To (Customer Details)</h4>
          {hasCustomer ? (
            <>
              <div className="invoice-info-row">
                <span>Customer Name:</span>
                <strong>{customer.name?.trim() || 'Walk-in Customer'}</strong>
              </div>
              <div className="invoice-info-row">
                <span>Mobile Number:</span>
                <span>{customer.mobile?.trim() ? `+91 ${customer.mobile.trim()}` : '—'}</span>
              </div>
              {customer.address?.trim() && (
                <div className="invoice-info-row">
                  <span>Address:</span>
                  <span>{customer.address.trim()}</span>
                </div>
              )}
              {customer.gstNo?.trim() ? (
                <div className="invoice-info-row">
                  <span>GSTIN:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{customer.gstNo.trim()}</strong>
                </div>
              ) : (
                <div className="invoice-info-row">
                  <span>Customer Type:</span>
                  <span style={{ color: 'var(--text-muted)' }}>Consumer / Retail</span>
                </div>
              )}
              <div className="invoice-info-row">
                <span>State & Code:</span>
                <span>Tamil Nadu (33)</span>
              </div>
            </>
          ) : (
            <>
              <div className="invoice-info-row">
                <span>Customer:</span>
                <strong>Walk-in Customer (Cash Sale)</strong>
              </div>
              <div className="invoice-info-row">
                <span>Mobile:</span>
                <span style={{ color: 'var(--text-muted)' }}>— (Optional / Not Provided)</span>
              </div>
              <div className="invoice-info-row">
                <span>Sale Type:</span>
                <span>Over-the-counter Retail Sale</span>
              </div>
              <div className="invoice-info-row">
                <span>State & Code:</span>
                <span>Tamil Nadu (33)</span>
              </div>
            </>
          )}
        </div>

        {/* Invoice Meta (Right) */}
        <div className="invoice-info-col">
          <h4>Invoice & Payment Meta</h4>
          <div className="invoice-info-row">
            <span>Invoice No:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>#{invoiceNo}</strong>
          </div>
          <div className="invoice-info-row">
            <span>Billing Date:</span>
            <strong>{date}</strong>
          </div>
          <div className="invoice-info-row">
            <span>Billing Time:</span>
            <span>{time}</span>
          </div>
          <div className="invoice-info-row">
            <span>Payment Mode:</span>
            <strong>{payment.method || 'Cash'}</strong>
          </div>
          <div className="invoice-info-row">
            <span>Payment Status:</span>
            <strong style={{ color: isPaid ? 'var(--success)' : 'var(--warning)' }}>
              {payment.status || 'Paid'}
            </strong>
          </div>
          <div className="invoice-info-row">
            <span>Place of Supply:</span>
            <span>Sivakasi, Tamil Nadu</span>
          </div>
        </div>
      </div>

      {/* Product Items Table */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th style={{ width: '36px', textAlign: 'center' }}>#</th>
            <th>Product Name & Description</th>
            <th style={{ width: '80px', textAlign: 'center' }}>Code</th>
            <th className="text-center" style={{ width: '55px' }}>Qty</th>
            <th className="text-right" style={{ width: '80px' }}>Rate (₹)</th>
            <th className="text-center" style={{ width: '65px' }}>Disc %</th>
            <th className="text-right" style={{ width: '85px' }}>Taxable (₹)</th>
            <th className="text-right" style={{ width: '80px' }}>GST 18%</th>
            <th className="text-right" style={{ width: '95px' }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const qty = item.quantity || 1;
            const price = Number(item.price) || 0;
            const gross = price * qty;
            const discountAmt = gross * ((item.discount || 0) / 100);
            const taxable = gross - discountAmt;
            const gstAmt = taxable * ((item.gst || 18) / 100);
            const itemTotal = taxable + gstAmt;

            return (
              <tr key={idx}>
                <td style={{ textAlign: 'center', color: 'var(--text-light)' }}>{idx + 1}</td>
                <td>
                  <strong style={{ color: 'var(--text-heading)', display: 'block', fontSize: '0.825rem' }}>
                    {item.name}
                  </strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {item.category || 'Crackers'} • {item.unit || '1 Box'}
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textAlign: 'center' }}>
                  {item.code || `CRK-${idx + 1}`}
                </td>
                <td className="text-center" style={{ fontWeight: 700 }}>{qty}</td>
                <td className="text-right" style={{ fontFamily: 'var(--font-mono)' }}>₹{price.toFixed(2)}</td>
                <td className="text-center">{item.discount ? `${item.discount}%` : '0%'}</td>
                <td className="text-right" style={{ fontFamily: 'var(--font-mono)' }}>₹{taxable.toFixed(2)}</td>
                <td className="text-right" style={{ fontFamily: 'var(--font-mono)' }}>₹{gstAmt.toFixed(2)}</td>
                <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  ₹{itemTotal.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Invoice Bottom: Terms / Thank You & Totals */}
      <div className="invoice-bottom-grid">
        {/* Left Column: Amount in Words, Greetings, Safety Notice & Terms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Amount in words */}
          <div className="amount-words-box">
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Amount Chargeable (in words):
            </span>
            <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.82rem', marginTop: '2px' }}>
              {numberToWords(summary.grandTotal || 0)}
            </div>
          </div>

          {/* Thank you note */}
          <div className="thank-you-card">
            <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '3px' }}>
              ✨ Thank You for Shopping with Us! ✨
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
              We appreciate your business and wish you and your family a safe, spark-filled, and prosperous Diwali!
            </p>
          </div>

          {/* Safety Notice */}
          <div className="safety-warning-box">
            <div style={{ fontWeight: 700, fontSize: '0.74rem', color: '#b45309', marginBottom: '2px' }}>
              ⚠️ PESO Safety Instructions:
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <li>Store crackers in a cool, dry place away from heat & fire.</li>
              <li>Burst fireworks outdoors only under adult supervision.</li>
              <li>Always keep a bucket of clean water and sand nearby for emergency.</li>
            </ul>
          </div>

          {/* Terms & Conditions */}
          <div className="terms-box">
            <h5>Terms & Conditions:</h5>
            <p>{SHOP_DETAILS.terms}</p>
          </div>
        </div>

        {/* Right Column: Totals Breakup Card & Signature */}
        <div>
          <div className="invoice-totals-box">
            <div className="totals-row">
              <span>Gross Subtotal:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(summary.subtotal || 0).toFixed(2)}</span>
            </div>

            <div className="totals-row" style={{ color: 'var(--accent)' }}>
              <span>Total Discount:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>- ₹{(summary.totalDiscount || 0).toFixed(2)}</span>
            </div>

            <div className="totals-row">
              <span>Taxable Amount:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(summary.taxableAmount || 0).toFixed(2)}</span>
            </div>

            <div className="totals-row">
              <span>CGST (9%):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{((summary.gstAmount || 0) / 2).toFixed(2)}</span>
            </div>

            <div className="totals-row">
              <span>SGST (9%):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{((summary.gstAmount || 0) / 2).toFixed(2)}</span>
            </div>

            {summary.roundOff !== 0 && (
              <div className="totals-row" style={{ fontSize: '0.75rem' }}>
                <span>Round Off:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{summary.roundOff}</span>
              </div>
            )}

            <div className="totals-row grand-total-row">
              <span>Grand Total:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                ₹{(summary.grandTotal || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="totals-row" style={{ marginTop: '10px', fontSize: '0.8rem' }}>
              <span>Amount Paid:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                ₹{(summary.paidAmount ?? summary.grandTotal).toLocaleString('en-IN')}
              </span>
            </div>

            {summary.balanceAmount > 0 && (
              <div className="totals-row" style={{ color: 'var(--danger)', fontWeight: 700 }}>
                <span>Balance Due:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{summary.balanceAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Authorized Signature Block */}
          <div className="sign-area">
            <div className="sign-line"></div>
            <div>For <strong>{SHOP_DETAILS.name}</strong></div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '2px' }}>
              Authorized Signatory / Cashier
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintBill;
