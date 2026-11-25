import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Tag, 
  Check, 
  AlertTriangle
} from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../data/products';

export const Products = ({ 
  products = [], 
  onAddProduct, 
  onUpdateProduct,
  onDeleteProduct, 
  onQuickBillProduct,
  onShowToast 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // New product form state
  const [newProd, setNewProd] = useState({
    code: `CRK-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    category: 'Sparklers',
    price: '',
    discount: 0,
    gst: 18,
    stock: 50,
    unit: '10 Pcs/Box',
    description: ''
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        p.name?.toLowerCase().includes(q) || 
        p.code?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, searchTerm]);

  // Create new product
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProd.name.trim() || !newProd.price) {
      onShowToast?.('Please enter product name and MRP price', 'danger');
      return;
    }

    const created = {
      ...newProd,
      id: `prod-${Date.now()}`,
      price: parseFloat(newProd.price),
      discount: parseFloat(newProd.discount) || 0,
      gst: parseFloat(newProd.gst) || 18,
      stock: parseInt(newProd.stock, 10) || 50
    };

    onAddProduct?.(created);
    onShowToast?.(`Added "${created.name}" to Product`, 'success');
    setShowAddModal(false);

    // Reset form
    setNewProd({
      code: `CRK-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Sparklers',
      price: '',
      discount: 0,
      gst: 18,
      stock: 50,
      unit: '10 Pcs/Box',
      description: ''
    });
  };

  // Open Edit Product Modal
  const handleOpenEdit = (product) => {
    setEditingProduct({
      ...product,
      price: product.price,
      discount: product.discount ?? 15,
      gst: product.gst ?? 18,
      stock: product.stock ?? 50,
      unit: product.unit || '1 Box'
    });
  };

  // Save Edited Product
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingProduct.name?.trim() || !editingProduct.price) {
      onShowToast?.('Please enter product name and MRP price', 'danger');
      return;
    }

    const updated = {
      ...editingProduct,
      price: parseFloat(editingProduct.price),
      discount: parseFloat(editingProduct.discount) || 0,
      gst: parseFloat(editingProduct.gst) || 18,
      stock: parseInt(editingProduct.stock, 10) || 0
    };

    onUpdateProduct?.(updated);
    onShowToast?.(`Updated "${updated.name}" successfully!`, 'success');
    setEditingProduct(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Actions */}
      <div className="billing-card">
        <div className="billing-card-header">
          <h3>
            <Boxes size={20} color="#2563eb" />
            <span>Crackers Inventory & Pricing</span>
          </h3>
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>Add New Cracker</span>
          </button>
        </div>

        <div className="billing-card-body">
          <div className="products-filter-bar">
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="Search crackers by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                className="form-control"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table & Mobile Cards */}
      <div className="transactions-card">
        {/* Desktop Table View */}
        <div className="desktop-table-view table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Cracker Item</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>MRP (₹)</th>
                <th style={{ textAlign: 'center' }}>Stock</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-light)', fontWeight: 600 }}>{idx + 1}</td>
                  <td>
                    <div>
                      <strong style={{ color: 'var(--text-heading)', display: 'block', fontSize: '0.925rem' }}>{p.name}</strong>
                      <span className="item-code-badge" style={{ marginTop: '2px', display: 'inline-block' }}>{p.code} • {p.unit || '1 Box'}</span>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-blue">{p.category}</span>
                  </td>

                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                    ₹{p.price}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${p.stock < 30 ? 'badge-warning' : 'badge-success'}`}>
                      {p.stock} Units
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {/* 1. Edit Cracker Button */}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                        onClick={() => handleOpenEdit(p)}
                        title={`Edit ${p.name}`}
                      >
                        <Edit2 size={13} color="var(--accent)" />
                        <span>Edit</span>
                      </button>

                      {/* 2. Delete Button */}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center' }}
                        onClick={() => {
                          if (window.confirm(`Delete "${p.name}"?`)) {
                            onDeleteProduct(p.id);
                            onShowToast?.(`Deleted ${p.name}`, 'warning');
                          }
                        }}
                        title="Delete product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="mobile-cards-view">
          {filteredProducts.length === 0 ? (
            <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No crackers found matching search.
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div key={p.id} className="mobile-data-card">
                <div className="mobile-data-card-header">
                  <div>
                    <h4 className="mobile-data-card-title">{p.name}</h4>
                    <span className="mobile-data-card-subtitle" style={{ fontFamily: 'var(--font-mono)' }}>
                      {p.code} • {p.unit || '1 Box'}
                    </span>
                  </div>
                  <span className="badge badge-blue">{p.category}</span>
                </div>

                <div className="mobile-data-card-body">
                  <div className="mobile-data-row">
                    <span className="mobile-data-label">MRP Rate</span>
                    <span className="mobile-data-value highlight-amount">₹{p.price}</span>
                  </div>
                  <div className="mobile-data-row">
                    <span className="mobile-data-label">Stock Inventory</span>
                    <span className={`badge ${p.stock < 30 ? 'badge-warning' : 'badge-success'}`}>
                      {p.stock} Units
                    </span>
                  </div>
                </div>

                <div className="mobile-data-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEdit(p)}
                  >
                    <Edit2 size={13} color="var(--accent)" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (window.confirm(`Delete "${p.name}"?`)) {
                        onDeleteProduct(p.id);
                        onShowToast?.(`Deleted ${p.name}`, 'warning');
                      }
                    }}
                    style={{ flex: '0 0 44px' }}
                    title={`Delete ${p.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} color="#2563eb" />
                <span>Edit Cracker: {editingProduct.name}</span>
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setEditingProduct(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Product Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editingProduct.code || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, code: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    value={editingProduct.category || 'Sparklers'}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    {PRODUCT_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">MRP Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    required
                    value={editingProduct.price || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Available Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={editingProduct.stock ?? 0}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Packaging Unit</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 10 Pcs/Box or 1 Box"
                    value={editingProduct.unit || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3>
                <Boxes size={20} color="#2563eb" />
                <span>Add New Cracker to Inventory</span>
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Product Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={newProd.code}
                    onChange={e => setNewProd({ ...newProd, code: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    value={newProd.category}
                    onChange={e => setNewProd({ ...newProd, category: e.target.value })}
                  >
                    {PRODUCT_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5000 Wala Mega Red Garland"
                    required
                    value={newProd.name}
                    onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">MRP Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="e.g. 850"
                    required
                    value={newProd.price}
                    onChange={e => setNewProd({ ...newProd, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={newProd.stock}
                    onChange={e => setNewProd({ ...newProd, stock: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Packaging Unit</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 10 Pcs/Box or 1 Box"
                    value={newProd.unit}
                    onChange={e => setNewProd({ ...newProd, unit: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Cracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
