import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard,
  ReceiptText,
  ShoppingBag,
  Boxes,
  Users,
  BarChart3,
  Settings,
  PlusCircle,
  Menu,
  X,
  Bell,
  User
} from 'lucide-react';
import { SHOP_DETAILS } from '../data/products';

// Complete navigation list matching all app routes
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new-billing', label: 'New Billing', icon: ReceiptText },
  { id: 'sales', label: 'Sales', icon: ShoppingBag },
  { id: 'products', label: 'Product', icon: Boxes },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export const Navbar = ({ 
  activePage = 'dashboard', 
  onNavigate, 
  onQuickBilling,
  sidebarOpen = true,
  onToggleSidebar
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close mobile slide-down menu when screen is resized to desktop width (> 900px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Navigate and smoothly close the mobile menu
  const handleNavClick = (pageId) => {
    if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    onNavigate?.(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="app-navbar no-print">
      <div className="navbar-container">
        {/* Left Side: Shop Logo & Name */}
        <div className="navbar-left">
          {/* Desktop Sidebar Toggle (hidden on mobile) */}
          {onToggleSidebar && (
            <button
              type="button"
              className="sidebar-toggle-btn desktop-only"
              onClick={onToggleSidebar}
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Shop Logo & Name */}
          <div 
            className="navbar-brand-group"
            onClick={() => handleNavClick('dashboard')}
            role="button"
            tabIndex={0}
            title="Go to Dashboard"
          >
            <img 
              src="/billing-logo.jpg" 
              alt="New Billing Logo" 
              className="navbar-brand-img" 
            />
            <div className="navbar-title">
              <span>{SHOP_DETAILS.name || 'New Billing'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons, Notifications, Profile & Hamburger Menu */}
        <div className="navbar-right">
          {/* Desktop New Billing Quick Button (hidden on mobile screens) */}
          {activePage !== 'new-billing' && (
            <button 
              className="btn btn-primary btn-sm desktop-only-inline" 
              onClick={onQuickBilling}
              title="Create New Bill"
            >
              <PlusCircle size={16} />
              <span>New Billing</span>
            </button>
          )}

          {/* Notification Icon Button */}
          <button
            type="button"
            className="navbar-icon-btn"
            onClick={() => handleNavClick('reports')}
            title="Sales & Business Reports"
            aria-label="Reports & Notifications"
          >
            <Bell size={18} />
            <span className="navbar-notification-dot" />
          </button>

          {/* Profile / Shop Settings Icon Button */}
          <button
            type="button"
            className="navbar-icon-btn navbar-profile-btn"
            onClick={() => handleNavClick('settings')}
            title="Shop Profile & Settings"
            aria-label="Shop Profile"
          >
            <User size={18} />
          </button>

          {/* Mobile Hamburger Menu Toggle Button (Right Side) */}
          <button
            type="button"
            className={`mobile-hamburger-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
            title={mobileMenuOpen ? "Close Menu" : "Open Navigation Menu"}
          >
            {mobileMenuOpen ? (
              <X size={22} className="hamburger-icon" />
            ) : (
              <Menu size={22} className="hamburger-icon" />
            )}
          </button>
        </div>
      </div>

      {/* Smooth Slide-Down Mobile Navigation Menu */}
      <div 
        ref={dropdownRef}
        className={`mobile-nav-dropdown ${mobileMenuOpen ? 'open' : ''}`}
        inert={!mobileMenuOpen}
      >
        <div className="mobile-nav-header">
          <span className="mobile-nav-title">Menu Navigation</span>
          <span className="mobile-nav-badge">{String(activePage).toUpperCase()}</span>
        </div>

        <nav className="mobile-nav-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <div className="mobile-nav-link-left">
                  <div className={`mobile-nav-icon-wrapper ${isActive ? 'active' : ''}`}>
                    <Icon size={18} />
                  </div>
                  <span className="mobile-nav-link-text">{item.label}</span>
                </div>
                {isActive && <span className="mobile-nav-active-dot"></span>}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Button in Mobile Menu */}
        {activePage !== 'new-billing' && (
          <div className="mobile-nav-footer">
            <button
              type="button"
              className="btn btn-primary mobile-quick-bill-btn"
              onClick={() => {
                onQuickBilling?.();
                setMobileMenuOpen(false);
              }}
            >
              <PlusCircle size={16} />
              <span>+ Quick New Billing</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Backdrop Overlay when Menu is Open */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Navbar;
