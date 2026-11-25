import React from 'react';
import { Search, X, Layers } from 'lucide-react';

export const ProductSearch = ({ 
  searchQuery, 
  onSearchChange, 
  categories = [], 
  selectedCategory, 
  onSelectCategory,
  totalResults = 0
}) => {
  return (
    <div className="product-search-section">
      <div className="product-search-wrapper">
        <Search size={18} className="search-icon-inside" />
        <input
          type="text"
          className="form-control search-input-field"
          placeholder="Search crackers by name or code (e.g. Sparklers, CRK-101)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button 
            type="button" 
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="category-chips-scroll">
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSearch;
