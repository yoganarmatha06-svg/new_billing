import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText,
  ShoppingBag,
  Boxes, 
  Users, 
  BarChart3, 
  Settings,
  CircleDot,
  ChevronLeft
} from 'lucide-react';

export const Sidebar = ({ activePage, onNavigate, isOpen = true, onToggle }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'new-billing',
      label: 'New Billing',
      icon: ReceiptText
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingBag
    },
    {
      id: 'products',
      label: 'Product',
      icon: Boxes
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <aside className={`app-sidebar no-print ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <img 
            src="/billing-logo.jpg" 
            alt="New Billing Logo" 
            className="sidebar-brand-avatar" 
          />
          <div className="brand-info">
            <h2>New Billing</h2>
            <span>Crackers POS</span>
          </div>
        </div>
        {onToggle && (
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggle}
            title="Close Sidebar"
            aria-label="Close Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">Menu Overview</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <div className="nav-item-left">
                <Icon size={18} className="nav-icon" />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="cashier-avatar">
          CK
        </div>
        <div className="cashier-info">
          <div className="cashier-name">Cashier Counter #1</div>
          <div className="cashier-role">
            <CircleDot size={10} color="#16a34a" />
            <span>Active Session</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
