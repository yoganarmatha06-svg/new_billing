import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Store, 
  Printer, 
  Database, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { SHOP_DETAILS } from '../data/products';

export const Settings = ({ onShowToast }) => {
  // Local storage persisted shop profile
  const [shopProfile, setShopProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('sparkle_shop_profile');
      return saved ? JSON.parse(saved) : SHOP_DETAILS;
    } catch (e) {
      return SHOP_DETAILS;
    }
  });

  // Invoice Preferences
  const [printFormat, setPrintFormat] = useState(() => {
    return localStorage.getItem('sparkle_print_format') || 'a4';
  });

  const [showGstBreakdown, setShowGstBreakdown] = useState(true);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('sparkle_shop_profile', JSON.stringify(shopProfile));
      localStorage.setItem('sparkle_print_format', printFormat);
      onShowToast?.('Settings & Shop Profile saved successfully!', 'success');
    } catch (err) {
      onShowToast?.('Failed to save settings', 'danger');
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      shopProfile: shopProfile,
      bills: JSON.parse(localStorage.getItem('sparkle_bills') || '[]'),
      products: JSON.parse(localStorage.getItem('sparkle_products') || '[]'),
      customers: JSON.parse(localStorage.getItem('sparkle_customers') || '[]')
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `new_billing_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast?.('Full database backup exported to JSON!', 'success');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear stored bills history? This cannot be undone.')) {
      localStorage.removeItem('sparkle_bills');
      onShowToast?.('Billing history cleared from localStorage', 'info');
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div className="billing-card">
        <div className="billing-card-header">
          <h3>
            <SettingsIcon size={20} color="#2563eb" />
            <span>Application & Billing Settings</span>
          </h3>
          <span className="badge badge-blue">Configuration</span>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Shop Information Card */}
        <div className="billing-card">
          <div className="billing-card-header">
            <h3>
              <Store size={18} color="#2563eb" />
              <span>Shop & Counter Profile</span>
            </h3>
          </div>

          <div className="billing-card-body">
            <div className="customer-form-grid">
              <div className="form-group">
                <label className="form-label">Shop / Business Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={shopProfile.name}
                  onChange={(e) => setShopProfile({ ...shopProfile, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline / Subheading</label>
                <input
                  type="text"
                  className="form-control"
                  value={shopProfile.tagline}
                  onChange={(e) => setShopProfile({ ...shopProfile, tagline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GSTIN Number</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
                  value={shopProfile.gstin}
                  onChange={(e) => setShopProfile({ ...shopProfile, gstin: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Explosives / PESO License No</label>
                <input
                  type="text"
                  className="form-control"
                  value={shopProfile.licenseNo}
                  onChange={(e) => setShopProfile({ ...shopProfile, licenseNo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone Numbers</label>
                <input
                  type="text"
                  className="form-control"
                  value={shopProfile.phone}
                  onChange={(e) => setShopProfile({ ...shopProfile, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Support Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={shopProfile.email}
                  onChange={(e) => setShopProfile({ ...shopProfile, email: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Physical Shop Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={shopProfile.address}
                  onChange={(e) => setShopProfile({ ...shopProfile, address: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice & Print Settings */}
        <div className="billing-card">
          <div className="billing-card-header">
            <h3>
              <Printer size={18} color="#2563eb" />
              <span>Invoice & Printing Preferences</span>
            </h3>
          </div>

          <div className="billing-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Default Invoice Layout</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <input
                    type="radio"
                    name="printFormat"
                    value="a4"
                    checked={printFormat === 'a4'}
                    onChange={(e) => setPrintFormat(e.target.value)}
                  />
                  <span>A4 Full Page GST Tax Invoice</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <input
                    type="radio"
                    name="printFormat"
                    value="thermal"
                    checked={printFormat === 'thermal'}
                    onChange={(e) => setPrintFormat(e.target.value)}
                  />
                  <span>80mm Thermal Receipt (POS Slip)</span>
                </label>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Terms & Safety Instructions on Bills</label>
              <textarea
                className="form-control"
                rows={3}
                style={{ fontFamily: 'var(--font-main)', fontSize: '0.85rem' }}
                value={shopProfile.terms || ''}
                onChange={(e) => setShopProfile({ ...shopProfile, terms: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => {
              setShopProfile(SHOP_DETAILS);
              onShowToast?.('Reset to factory defaults', 'info');
            }}
          >
            <RotateCcw size={16} />
            <span>Reset Defaults</span>
          </button>

          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Database & Data Management */}
      <div className="billing-card">
        <div className="billing-card-header">
          <h3>
            <Database size={18} color="#2563eb" />
            <span>Data Backup & Maintenance</span>
          </h3>
        </div>

        <div className="billing-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '0.925rem', color: 'var(--text-heading)', marginBottom: '4px' }}>
              Full JSON Database Export
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Download a complete offline copy of your products, customers, and invoice records.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadBackup}
            >
              <Download size={15} />
              <span>Export Backup JSON</span>
            </button>

            <button 
              type="button" 
              className="btn btn-danger btn-sm"
              onClick={handleClearHistory}
            >
              <AlertTriangle size={15} />
              <span>Clear Bills Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
