import React from 'react';
import { Calendar, Hash, RotateCcw } from 'lucide-react';

export const BillingHeader = ({ 
  invoiceNo, 
  itemsCount = 0, 
  onReset 
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="billing-banner-card">
      {/* Centered Logo Banner with fireworks, rocket, cart & receipt illustration */}
      <div className="banner-logo-center-wrapper">
        <img 
          src="/billing-logo.jpg" 
          alt="New Billing Logo Banner" 
          className="banner-hero-logo-img" 
        />
      </div>

      {/* Meta Bar */}
      <div className="banner-meta-bar">
        <div className="meta-box">
          <span>Date</span>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} color="#2563eb" />
            {currentDate}
          </strong>
        </div>

        <div className="meta-box">
          <span>Invoice No</span>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Hash size={14} color="#2563eb" />
            {invoiceNo}
          </strong>
        </div>

        <div className="meta-box">
          <span>Total Items</span>
          <strong style={{ color: '#16a34a' }}>{itemsCount} Pcs</strong>
        </div>

        {itemsCount > 0 && (
          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            onClick={onReset}
            title="Reset Cart & Details"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BillingHeader;
