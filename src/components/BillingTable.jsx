import React, { useState, useRef } from 'react';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { calculateItemTotals } from '../data/products';
import ProductAutocomplete from './ProductAutocomplete';

export const BillingTable = ({ 
  items = [], 
  invoiceNo, 
  availableProducts = [],
  onAddToCart,
  onUpdateQuantity, 
  onUpdateDiscount, 
  onRemoveItem,
  onClearCart,
  onShowToast
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productCode, setProductCode] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState('');

  const codeInputRef = useRef(null);
  const productInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const rateInputRef = useRef(null);

  // Handle product selection from autocomplete dropdown
  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    if (prod) {
      setProductCode(prod.code || '');
      setRate(prod.price);
      setQty(1);
      setProductQuery(prod.name);
      // Focus Qty input for seamless cashier workflow
      setTimeout(() => {
        qtyInputRef.current?.focus();
        qtyInputRef.current?.select();
      }, 50);
    } else {
      setProductCode('');
      setRate('');
      setProductQuery('');
    }
  };

  // Handle typing in separate Product Code input
  const handleCodeChange = (codeVal) => {
    setProductCode(codeVal);
    const cleanCode = codeVal.trim().toLowerCase();
    if (!cleanCode) {
      if (!productQuery) {
        setSelectedProduct(null);
        setRate('');
      }
      return;
    }

    // Check exact or partial code match
    const matched = availableProducts.find(
      p => p.code?.toLowerCase() === cleanCode
    );

    if (matched) {
      setSelectedProduct(matched);
      setProductQuery(matched.name);
      setRate(matched.price);
      setQty(1);
    }
  };

  // Handle pressing Enter in Product Code input
  const handleCodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cleanCode = productCode.trim().toLowerCase();
      const matched = availableProducts.find(
        p => p.code?.toLowerCase() === cleanCode ||
             p.code?.toLowerCase().includes(cleanCode)
      );

      if (matched) {
        setSelectedProduct(matched);
        setProductCode(matched.code);
        setProductQuery(matched.name);
        setRate(matched.price);
        setQty(1);
        qtyInputRef.current?.focus();
        qtyInputRef.current?.select();
      } else {
        onShowToast?.(`No cracker found with code "${productCode}"`, 'warning');
      }
    }
  };

  // Add Item Handler with custom Qty and Rate
  const handleAddItem = () => {
    let targetProduct = selectedProduct;

    if (!targetProduct && (productCode.trim() || productQuery.trim())) {
      const c = productCode.trim().toLowerCase();
      const q = productQuery.trim().toLowerCase();
      targetProduct = availableProducts.find(
        p => (c && p.code?.toLowerCase() === c) ||
             (q && p.name?.toLowerCase() === q) ||
             (c && p.code?.toLowerCase().includes(c)) ||
             (q && p.name?.toLowerCase().includes(q))
      );
    }

    if (!targetProduct) {
      onShowToast?.('Please enter a valid product code or select a product', 'warning');
      return;
    }

    const finalQty = Math.max(1, Number(qty) || 1);
    const finalRate = rate !== '' && !isNaN(Number(rate)) ? Number(rate) : targetProduct.price;

    onAddToCart?.(targetProduct, finalQty, finalRate);

    // Reset input row for the next product
    setSelectedProduct(null);
    setProductCode('');
    setProductQuery('');
    setQty(1);
    setRate('');

    // Refocus product search input so user can instantly enter the next item
    setTimeout(() => {
      if (productInputRef.current) {
        productInputRef.current.focus();
      } else if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }, 50);
  };
  // Quantity change handler with stock boundary enforcement
  const handleQtyChange = (item, newQty) => {
    const prod = availableProducts.find(p => p.id === item.id) || item;
    const maxStock = prod?.stock ?? 999;

    if (newQty > maxStock) {
      onShowToast?.(`Cannot add more than available stock (${maxStock}) for ${item.name}`, 'warning');
      onUpdateQuantity?.(item.id, maxStock);
      return;
    }

    if (newQty < 1) {
      onUpdateQuantity?.(item.id, 1);
      return;
    }

    onUpdateQuantity?.(item.id, newQty);
  };

  return (
    <div 
      className="billing-card" 
      style={{ 
        border: '1.5px solid var(--border-dark)', 
        borderRadius: '10px', 
        overflow: 'visible',
        boxShadow: 'var(--shadow-sm)',
        background: '#ffffff'
      }}
    >
      {/* 1. Header */}
      <div 
        className="billing-card-header"
        style={{
          background: 'var(--bg-page)',
          borderBottom: '1px solid var(--border-light)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={18} color="#2563eb" />
          <span>Add Products & Selected Items ({items.length})</span>
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {invoiceNo && (
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>
              #{invoiceNo}
            </span>
          )}

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
              title="Clear all products from table"
            >
              Clear Table
            </button>
          )}
        </div>
      </div>

      <div className="billing-card-body" style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 2. Product Code, Name, Qty & Rate Entry Bar (Single Line) */}
        <div className="product-entry-bar">
          {/* Separate Product Code Input */}
          <div className="entry-field-code">
            <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', display: 'block', whiteSpace: 'nowrap' }}>
              Code
            </label>
            <input
              ref={codeInputRef}
              type="text"
              className="form-control"
              placeholder="Code"
              value={productCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleCodeKeyDown}
              style={{
                height: '44px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'uppercase'
              }}
            />
          </div>

          {/* Product Name Autocomplete Dropdown */}
          <div className="entry-field-product">
            <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', display: 'block', whiteSpace: 'nowrap' }}>
              Product Name *
            </label>
            <ProductAutocomplete
              products={availableProducts}
              query={productQuery}
              onQueryChange={(q) => {
                setProductQuery(q);
                if (selectedProduct && q !== selectedProduct.name) {
                  setSelectedProduct(null);
                  setProductCode('');
                  setRate('');
                }
              }}
              onSelectProduct={handleSelectProduct}
              cartItems={items}
              onShowToast={onShowToast}
              placeholder="Search product name..."
              inputRef={productInputRef}
              onEnterPress={handleAddItem}
            />
          </div>

          {/* Qty Input with Up/Down Spinners */}
          <div className="entry-field-qty">
            <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', display: 'block', whiteSpace: 'nowrap' }}>
              Qty *
            </label>
            <input
              ref={qtyInputRef}
              type="number"
              min="1"
              step="1"
              className="form-control"
              placeholder="Qty"
              value={qty}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                setQty(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
            />
          </div>

          {/* Rate Text Box */}
          <div className="entry-field-rate">
            <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', display: 'block', whiteSpace: 'nowrap' }}>
              Rate (₹) *
            </label>
            <input
              ref={rateInputRef}
              type="number"
              min="0"
              step="any"
              className="form-control"
              placeholder="0.00"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
            />
          </div>

          {/* Amount (₹) - Automatically calculated (Qty × Rate) */}
          <div className="entry-field-amount">
            <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', display: 'block', whiteSpace: 'nowrap' }}>
              Amount (₹)
            </label>
            <input
              type="text"
              readOnly
              className="form-control"
              placeholder="₹0.00"
              value={
                rate !== '' && !isNaN(Number(rate))
                  ? `₹${(Math.max(1, Number(qty) || 1) * Number(rate)).toFixed(2)}`
                  : '₹0.00'
              }
              title="Automatically calculated: Qty × Rate"
            />
          </div>

          {/* Add Item Button */}
          <div className="entry-field-action">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddItem}
              title="Add product to billing table"
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* 3. Selected Products Table (Directly below search input) */}
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
          <table className="cart-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-page)', borderBottom: '1.5px solid var(--border-dark)' }}>
                <th style={{ width: '45px', textAlign: 'center', padding: '10px 8px', color: 'var(--text-heading)', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                  S.No
                </th>
                <th style={{ textAlign: 'left', padding: '10px 10px', color: 'var(--text-heading)', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                  Product Name
                </th>
                <th style={{ textAlign: 'right', width: '90px', padding: '10px 8px', color: 'var(--text-heading)', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                  Price (₹)
                </th>
                <th style={{ textAlign: 'center', width: '125px', padding: '10px 8px', color: 'var(--text-heading)', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                  Quantity
                </th>
                <th style={{ textAlign: 'right', width: '105px', padding: '10px 10px', color: 'var(--text-heading)', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                  Total (₹)
                </th>
                <th style={{ textAlign: 'center', width: '50px', padding: '10px 8px', color: 'var(--text-heading)', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                  Remove
                </th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', background: '#ffffff' }}>
                    <div style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>
                      No products added to this invoice yet.
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                      Type a product name or code above and select to add items to the bill.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const prod = availableProducts.find(p => p.id === item.id) || item;
                  const maxStock = prod?.stock ?? 999;
                  const qty = Number(item.quantity) || 1;
                  const price = Number(item.price) || 0;
                  const discPercent = Number(item.discount) || 0;
                  const gstPercent = Number(item.gst) || 18;
                  const calcs = calculateItemTotals(price, qty, discPercent, gstPercent);

                  return (
                    <tr 
                      key={item.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-light)',
                        background: index % 2 === 0 ? '#ffffff' : 'var(--bg-page)'
                      }}
                    >
                      {/* 1. S.No */}
                      <td style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {index + 1}
                      </td>

                      {/* 2. Product Name with code */}
                      <td style={{ padding: '10px' }}>
                        <div>
                          <div className="item-name-cell" title={item.name} style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.875rem' }}>
                            {item.name}
                          </div>
                          <span className="item-code-badge" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {item.code} • Stock: {maxStock}
                          </span>
                        </div>
                      </td>

                      {/* 3. Price */}
                      <td style={{ textAlign: 'right', padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ₹{price}
                      </td>

                      {/* 4. Quantity with + and - buttons stepper */}
                      <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                        <div className="qty-stepper" style={{ border: '1px solid var(--border-dark)', margin: '0 auto' }}>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQtyChange(item, qty - 1)}
                            disabled={qty <= 1}
                            title="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={maxStock}
                            className="qty-input"
                            value={qty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              handleQtyChange(item, isNaN(val) ? 1 : val);
                            }}
                          />
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQtyChange(item, qty + 1)}
                            disabled={qty >= maxStock}
                            title={qty >= maxStock ? 'Max available stock reached' : 'Increase quantity'}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>

                      {/* 5. Total */}
                      <td style={{ textAlign: 'right', padding: '10px 10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-heading)' }}>
                        ₹{(price * qty).toFixed(2)}
                      </td>

                      {/* 6. Remove button */}
                      <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => onRemoveItem?.(item.id)}
                          title={`Remove ${item.name}`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingTable;
