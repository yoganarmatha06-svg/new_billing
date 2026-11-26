import React from 'react';
import { 
  PlusCircle,
  Menu
} from 'lucide-react';
import { SHOP_DETAILS } from '../data/products';

export const Navbar = ({ 
  activePage, 
  onNavigate, 
  onQuickBilling,
  sidebarOpen = true,
  onToggleSidebar
}) => {
  return (
    <header className="app-navbar no-print">
      <div className="navbar-left">
        {onToggleSidebar && (
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img 
            src="/billing-logo.jpg" 
            alt="New Billing Logo" 
            className="navbar-brand-img" 
          />
          <div>
            <div className="navbar-title">
              <span>{SHOP_DETAILS.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {activePage !== 'new-billing' && (
          <button 
            className="btn btn-primary btn-sm" 
            onClick={onQuickBilling}
            title="Create New Bill"
          >
            <PlusCircle size={16} />
            <span>New Billing</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
