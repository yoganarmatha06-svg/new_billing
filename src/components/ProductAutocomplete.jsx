import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, AlertCircle, Sparkles, ChevronDown } from 'lucide-react';

export const ProductAutocomplete = ({
  products = [],
  onSelectProduct,
  cartItems = [],
  onShowToast,
  placeholder = "Type product name or code...",
  query: externalQuery,
  onQueryChange: externalOnQueryChange,
  onEnterPress,
  inputRef: externalInputRef
}) => {
  const [internalQuery, setInternalQuery] = useState('');
  const query = externalQuery !== undefined ? externalQuery : internalQuery;
  const setQuery = externalOnQueryChange || setInternalQuery;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const localInputRef = useRef(null);
  const inputRef = externalInputRef || localInputRef;
  const listRef = useRef(null);

  // Cart item quantities map for quick reference
  const cartLookup = useMemo(() => {
    const map = {};
    cartItems.forEach(item => {
      map[item.id] = item.quantity;
    });
    return map;
  }, [cartItems]);

  // Dynamically filter suggestions while typing or show top catalog items when empty
  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products.slice(0, 20); // Top products list when dropdown is opened without typing

    const terms = q.split(/\s+/).filter(Boolean);
    return products.filter(p => {
      const name = p.name?.toLowerCase() || '';
      const code = p.code?.toLowerCase() || '';
      const cat = p.category?.toLowerCase() || '';

      // Direct substring match or all search terms match
      return (
        name.includes(q) ||
        code.includes(q) ||
        cat.includes(q) ||
        terms.every(term => name.includes(term) || code.includes(term) || cat.includes(term))
      );
    }).slice(0, 25); // Top matches
  }, [products, query]);

  // Handle click / touch outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Scroll highlighted item into view if navigating with arrows
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeElem = listRef.current.children[activeIndex];
      if (activeElem) {
        activeElem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // Select product handler
  const handleSelect = (product) => {
    if ((product.stock || 0) <= 0) {
      onShowToast?.(`${product.name} is currently out of stock!`, 'danger');
      return;
    }

    onSelectProduct?.(product);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  // Keyboard navigation: ArrowDown, ArrowUp, Enter, Escape
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && query.trim()) {
        setIsOpen(true);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onEnterPress?.();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div 
      ref={wrapperRef} 
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Search Input Bar */}
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Search 
          size={16} 
          style={{
            position: 'absolute',
            left: '11px',
            color: 'var(--accent)',
            pointerEvents: 'none',
            zIndex: 2
          }}
        />

        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onClick={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          style={{
            paddingLeft: '34px',
            paddingRight: '48px',
            height: '44px',
            fontSize: '0.875rem',
            borderRadius: 'var(--radius-sm)',
            border: isOpen ? '1.5px solid var(--accent)' : '1.5px solid var(--border-dark)',
            boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : 'var(--shadow-xs)',
            background: '#ffffff',
            fontWeight: 500,
            color: 'var(--text-main)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          autoComplete="off"
        />

        <div style={{ position: 'absolute', right: '8px', display: 'flex', alignItems: 'center', gap: '2px', zIndex: 3 }}>
          {query && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuery('');
                onSelectProduct?.(null);
                setIsOpen(false);
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '50%'
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(prev => !prev);
              inputRef.current?.focus();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: isOpen ? '#2563eb' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              transition: 'transform 0.2s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
            title={isOpen ? "Close dropdown" : "Open product dropdown"}
            aria-label="Toggle product dropdown"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown Suggestions Menu */}
      {isOpen && (
        <div
          className="product-autocomplete-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            minWidth: '260px',
            maxWidth: 'min(520px, calc(100vw - 32px))',
            background: '#ffffff',
            border: '1.5px solid var(--border-dark)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px -4px rgba(37, 99, 235, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08)',
            zIndex: 1000,
            maxHeight: '340px',
            overflowY: 'auto',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {suggestions.length === 0 ? (
            /* 12. Show "No products found" when there are no matching results */
            <div 
              style={{
                padding: '24px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
              }}
            >
              <AlertCircle size={28} color="#2563eb" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginBottom: '4px' }}>
                No products found
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                No cracker matching "{query}". Try checking the name or code (e.g. CRK-101).
              </div>
            </div>
          ) : (
            <div ref={listRef} style={{ padding: '6px' }}>
              <div 
                style={{
                  padding: '6px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border-light)',
                  marginBottom: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{query.trim() ? `Matching Products (${suggestions.length})` : `All Products List (${suggestions.length})`}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'none', fontWeight: 500 }}>
                  Click to select
                </span>
              </div>

              {suggestions.map((product, idx) => {
                const isActive = activeIndex === idx;
                const inCartQty = cartLookup[product.id] || 0;
                const isOutOfStock = (product.stock || 0) <= 0;
                const isLowStock = !isOutOfStock && (product.stock || 0) <= 15;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'var(--bg-hover)' : 'transparent',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.6 : 1,
                      transition: 'background 0.1s ease',
                      border: isActive ? '1px solid var(--border-hover)' : '1px solid transparent'
                    }}
                  >
                    {/* Left: Product Name, Code & Details (No image) */}
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.92rem', lineHeight: 1.25 }}>
                        {product.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span 
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            background: '#e0f2fe',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-xs)'
                          }}
                        >
                          {product.code}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {product.unit || '1 Box'}
                        </span>
                        {product.discount > 0 && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '1px 5px', borderRadius: '4px' }}>
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Price & Available Stock */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {/* Selling Price */}
                      <div 
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-heading)'
                        }}
                      >
                        ₹{product.price}
                      </div>

                      {/* Available Stock badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '2px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
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

                        {inCartQty > 0 && (
                          <span 
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: '#2563eb',
                              background: '#e0f2fe',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-xs)'
                            }}
                          >
                            In Bill ({inCartQty})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductAutocomplete;
