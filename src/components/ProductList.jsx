import React from 'react';
import { Plus, Check, ShoppingBag, Sparkles } from 'lucide-react';

export const ProductList = ({ 
  products = [], 
  onAddToCart, 
  cartItems = [] 
}) => {
  if (products.length === 0) {
    return (
      <div className="empty-cart-state" style={{ padding: '30px 10px' }}>
        <Sparkles size={36} color="#2563eb" style={{ margin: '0 auto 10px' }} />
        <h4>No Crackers Found</h4>
        <p>Try searching for a different item name or switch category.</p>
      </div>
    );
  }

  // Create lookup for quantity in cart
  const cartQuantities = {};
  cartItems.forEach(item => {
    cartQuantities[item.id] = (cartQuantities[item.id] || 0) + item.quantity;
  });

  return (
    <div className="products-selection-grid">
      {products.map((product) => {
        const inCartQty = cartQuantities[product.id] || 0;

        return (
          <div key={product.id} className="product-picker-card" style={{ padding: '14px' }}>
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

            <div className="product-meta-content">
              <h4 title={product.name}>{product.name}</h4>
              <div className="product-unit-info">
                <span>{product.unit || '1 Box'}</span> • <span>GST {product.gst || 18}%</span>
              </div>
            </div>

            <div className="product-price-action-row">
              <div className="product-price-group">
                <span className="mrp-label">MRP</span>
                <span className="mrp-amount">₹{product.price}</span>
              </div>

              <button
                type="button"
                className="btn-add-item"
                onClick={() => onAddToCart(product)}
                title={`Add ${product.name} to bill`}
              >
                {inCartQty > 0 ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>+{inCartQty}</span>
                ) : (
                  <Plus size={18} />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;
