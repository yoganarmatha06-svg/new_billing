import React, { useState, useMemo } from 'react';
import { 
  PackageSearch, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  AlertTriangle, 
  ShoppingCart,
  Sparkles,
  Layers
} from 'lucide-react';
import { calculateItemTotals, PRODUCT_CATEGORIES } from '../data/products';

export const AddProducts = ({
  products = [],
  cartItems = [],
  onAddToCart,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemoveItem,
  onClearCart,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Filter products by search query (name or code) & category
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory && selectedCategory !== 'All Categories') {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.code.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, searchQuery, selectedCategory]);

  // Lookup for cart item quantity & product max stock
  const cartLookup = useMemo(() => {
    const map = {};
    cartItems.forEach(item => {
      map[item.id] = item.quantity;
    });
    return map;
  }, [cartItems]);

  const handleAddProductClick = (product) => {
    const currentQty = cartLookup[product.id] || 0;
    const maxStock = product.stock || 0;

    if (maxStock <= 0) {
      onShowToast?.(`${product.name} is currently out of stock!`, 'danger');
      return;
    }

    if (currentQty >= maxStock) {
      onShowToast?.(`Cannot add more than available stock (${maxStock} ${product.unit || 'boxes'}) for ${product.name}`, 'warning');
      return;
    }

    onAddToCart(product);
  };

  const handleQuantityChange = (itemId, newQty) => {
    const item = cartItems.find(i => i.id === itemId);
    const product = products.find(p => p.id === itemId) || item;
    const maxStock = product?.stock ?? 999;

    if (newQty > maxStock) {
      onShowToast?.(`Available stock for ${item.name} is ${maxStock}. Quantity adjusted.`, 'warning');
      onUpdateQuantity(itemId, maxStock);
      return;
    }

    if (newQty < 1) {
      onUpdateQuantity(itemId, 1);
      return;
    }

    onUpdateQuantity(itemId, newQty);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Add Products Picker Card */}
      <div className="billing-card">
        <div className="billing-card-header">
          <h3>
            <PackageSearch size={18} color="#2563eb" />
            <span>Add Products</span>
          </h3>
          <span className="badge badge-blue">
            {filteredProducts.length} Crackers Available
          </span>
        </div>

        <div className="billing-card-body">
          {/* Search bar & Category Chips */}
          <div className="product-search-wrapper" style={{ marginBottom: '12px' }}>
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              className="form-control search-input-field"
              placeholder="Search products by product name or product code (e.g. Sparklers, CRK-101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Chips Scroll */}
          <div className="category-chips-scroll" style={{ marginBottom: '16px' }}>
            {PRODUCT_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Selection Grid */}
          {filteredProducts.length === 0 ? (
            <div className="empty-cart-state" style={{ padding: '24px 10px' }}>
              <Sparkles size={32} color="#2563eb" style={{ margin: '0 auto 8px' }} />
              <h4>No Products Matching "{searchQuery}"</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Try searching with another cracker name, code, or select "All Categories".
              </p>
            </div>
          ) : (
            <div 
              className="products-selection-grid" 
              style={{ 
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', 
                maxHeight: '340px' 
              }}
            >
              {filteredProducts.map(product => {
                const inCartQty = cartLookup[product.id] || 0;
                const isOutOfStock = (product.stock || 0) <= 0;
                const isLowStock = !isOutOfStock && (product.stock || 0) <= 15;

                return (
                  <div key={product.id} className="product-picker-card">
                    {/* Tags */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="product-code-tag" style={{ position: 'static' }}>
                        {product.code}
                      </span>
                      {product.discount > 0 && (
                        <span className="product-discount-tag" style={{ position: 'static' }}>
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Product Name, Category & Stock */}
                    <div className="product-meta-content" style={{ marginBottom: '10px' }}>
                      <h4 title={product.name} style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                        {product.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {product.unit || '1 Box'}
                        </span>
                        <span 
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-xs)',
                            background: isOutOfStock ? 'var(--danger-light)' : isLowStock ? 'var(--warning-light)' : '#f0fdf4',
                            color: isOutOfStock ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'var(--success)',
                            border: `1px solid ${isOutOfStock ? 'var(--danger-border)' : isLowStock ? 'var(--warning-border)' : '#bbf7d0'}`
                          }}
                        >
                          {isOutOfStock ? 'Out of Stock' : `Stock: ${product.stock}`}
                        </span>
                      </div>
                    </div>

                    {/* Price & Add Product Button */}
                    <div className="product-price-action-row">
                      <div className="product-price-group">
                        <span className="mrp-label">Price</span>
                        <span className="mrp-amount" style={{ fontSize: '1.05rem' }}>₹{product.price}</span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => handleAddProductClick(product)}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? 'Out of Stock' : `Add ${product.name} to bill`}
                        style={{
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          opacity: isOutOfStock ? 0.5 : 1,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Plus size={14} />
                        <span>{inCartQty > 0 ? `Add (${inCartQty})` : 'Add Product'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Billing Table (Selected Products) */}
      <div className="billing-card">
        <div className="billing-card-header">
          <h3>
            <ShoppingCart size={18} color="#2563eb" />
            <span>Selected Billing Items ({cartItems.length})</span>
          </h3>

          {cartItems.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClearCart}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              title="Clear all cart products"
            >
              Clear Table
            </button>
          )}
        </div>

        <div className="billing-card-body" style={{ padding: 0 }}>
          {cartItems.length === 0 ? (
            <div className="empty-cart-state" style={{ padding: '36px 20px' }}>
              <div className="empty-cart-icon">🛒</div>
              <h4 style={{ color: 'var(--text-heading)' }}>No Products Added to Bill</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Search and click <strong>"Add Product"</strong> above to add crackers to this bill.
              </p>
            </div>
          ) : (
            <div className="billing-table-wrapper">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>S.No</th>
                    <th>Product Name</th>
                    <th style={{ textAlign: 'right', width: '85px' }}>Price (₹)</th>
                    <th style={{ textAlign: 'center', width: '130px' }}>Quantity</th>
                    <th style={{ textAlign: 'right', width: '95px' }}>Total (₹)</th>
                    <th style={{ textAlign: 'center', width: '45px' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => {
                    const product = products.find(p => p.id === item.id) || item;
                    const maxStock = product?.stock ?? 999;
                    const qty = Number(item.quantity) || 1;
                    const price = Number(item.price) || 0;
                    const discPercent = Number(item.discount) || 0;
                    const gstPercent = Number(item.gst) || 18;
                    const calcs = calculateItemTotals(price, qty, discPercent, gstPercent);

                    return (
                      <tr key={item.id}>
                        {/* 1. S.No */}
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {index + 1}
                        </td>

                        {/* 2. Product Name */}
                        <td>
                          <div>
                            <div className="item-name-cell" title={item.name}>
                              {item.name}
                            </div>
                            <span className="item-code-badge">
                              {item.code} • Max Stock: {maxStock}
                            </span>
                          </div>
                        </td>

                        {/* 3. Price */}
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          ₹{price}
                        </td>

                        {/* 4. Quantity with stepper & max stock enforcement */}
                        <td style={{ textAlign: 'center' }}>
                          <div className="qty-stepper">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleQuantityChange(item.id, qty - 1)}
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
                                handleQuantityChange(item.id, isNaN(val) ? 1 : val);
                              }}
                            />

                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleQuantityChange(item.id, qty + 1)}
                              disabled={qty >= maxStock}
                              title={qty >= maxStock ? 'Max available stock reached' : 'Increase quantity'}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>

                        {/* 5. Total */}
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-heading)' }}>
                          ₹{calcs.total}
                        </td>

                        {/* 6. Remove */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-remove-item"
                            onClick={() => onRemoveItem(item.id)}
                            title={`Remove ${item.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProducts;
