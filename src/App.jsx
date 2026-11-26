import React, { useState, useEffect } from 'react';
import { 
  Sidebar, 
  Navbar,
  InvoicePreview 
} from './components';
import { 
  Dashboard, 
  NewBilling, 
  BillingHistory, 
  Sales,
  Products, 
  Customers,
  Reports,
  Settings 
} from './pages';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_BILLS 
} from './data/products';
import { salesService } from './services/salesService';

import './styles/global.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/billing.css';

export function App() {
  // Navigation active page
  const [activePage, setActivePage] = useState('dashboard');

  // Permanent Database & LocalStorage persistence for Bills
  const [bills, setBills] = useState(() => {
    return salesService.getSales();
  });

  // LocalStorage persistence for Products
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('sparkle_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  // LocalStorage persistence for Customers
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('sparkle_customers');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch (e) {
      return INITIAL_CUSTOMERS;
    }
  });

  // Active invoice for preview/printing modal
  const [previewBill, setPreviewBill] = useState(null);
  const [previewFormat, setPreviewFormat] = useState('standard');

  // Sidebar open/collapse state (auto-closed on mobile/tablet, open on desktop)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth > 900 : true;
  });

  // Pre-filled customer for New Billing
  const [prefilledCustomer, setPrefilledCustomer] = useState(null);

  // Quick product to bill
  const [quickProduct, setQuickProduct] = useState(null);

  // Active bill being edited in New Billing
  const [editingBill, setEditingBill] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Persist bills to database / storage whenever updated
  useEffect(() => {
    salesService.saveAllSales(bills);
  }, [bills]);

  // Persist products whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('sparkle_products', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  // Persist customers whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('sparkle_customers', JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers to localStorage', e);
    }
  }, [customers]);

  // Helper to show transient toast message
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Handler when a new bill is generated
  const handleSaveBill = (newBill) => {
    if (!newBill || !newBill.invoiceNo) return;

    // 1. Synchronously persist to localStorage and update bills state
    const updatedSales = salesService.saveSale(newBill);
    setBills(updatedSales);

    // 2. Decrement inventory stock for billed products automatically
    if (newBill.items && newBill.items.length > 0) {
      setProducts((prevProds) => {
        const updated = prevProds.map((p) => {
          const billedItem = newBill.items.find((item) => item.id === p.id);
          if (billedItem) {
            const newStock = Math.max(0, p.stock - (billedItem.quantity || 1));
            return { ...p, stock: newStock };
          }
          return p;
        });
        try {
          localStorage.setItem('sparkle_products', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    // 3. Update or create customer record
    if (newBill.customer?.mobile) {
      setCustomers((prevCusts) => {
        const cleanMobile = newBill.customer.mobile.trim();
        const existingIdx = prevCusts.findIndex(
          (c) => c.mobile === cleanMobile
        );
        const grandTotal = newBill.summary?.grandTotal || 0;
        let updated;

        if (existingIdx > -1) {
          updated = [...prevCusts];
          const current = updated[existingIdx];
          updated[existingIdx] = {
            ...current,
            name: newBill.customer.name || current.name,
            address: newBill.customer.address || current.address,
            gstNo: newBill.customer.gstNo || current.gstNo,
            totalPurchases: (current.totalPurchases || 0) + grandTotal,
            billsCount: (current.billsCount || 0) + 1,
            lastPurchase: newBill.date
          };
        } else {
          const newCustRecord = {
            id: `cust-${Date.now()}`,
            name: newBill.customer.name || 'Counter Customer',
            mobile: cleanMobile,
            address: newBill.customer.address || '',
            gstNo: newBill.customer.gstNo || '',
            totalPurchases: grandTotal,
            billsCount: 1,
            lastPurchase: newBill.date
          };
          updated = [newCustRecord, ...prevCusts];
        }
        try {
          localStorage.setItem('sparkle_customers', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  };

  // Bill deletion handler (cancels bill and restores inventory stock)
  const handleDeleteBill = (billId) => {
    const billToDelete = bills.find((b) => b.id === billId || b.invoiceNo === billId);
    if (!billToDelete) return;

    // Restore product stock if items exist
    if (billToDelete.items && billToDelete.items.length > 0) {
      setProducts((prevProds) => {
        const updated = prevProds.map((p) => {
          const item = billToDelete.items.find((i) => i.id === p.id);
          if (item) {
            return { ...p, stock: (p.stock || 0) + (Number(item.quantity) || 1) };
          }
          return p;
        });
        try {
          localStorage.setItem('sparkle_products', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    const updated = salesService.deleteSale(billId);
    setBills(updated);
    showToast(`Invoice #${billToDelete.invoiceNo} deleted & stock restored`, 'info');
  };

  // Bill update handler (modifies existing bill in permanent storage)
  const handleUpdateBill = (updatedBill) => {
    if (!updatedBill || !updatedBill.invoiceNo) return;
    const updated = salesService.updateSale(updatedBill);
    setBills(updated);
    showToast(`Invoice #${updatedBill.invoiceNo} updated successfully`, 'success');
  };

  // Product management handlers
  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) => prev.map((p) => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Customer management handlers: Save or update customer record in database permanently
  const handleSaveCustomerRecord = (customerData) => {
    let savedRecord = null;
    const cleanMobile = (customerData.mobile || '').trim();

    setCustomers((prevCusts) => {
      const existingIdx = prevCusts.findIndex(c => c.mobile === cleanMobile);

      if (existingIdx > -1) {
        // Update existing customer record
        const existing = prevCusts[existingIdx];
        savedRecord = {
          ...existing,
          name: customerData.name?.trim() || existing.name,
          address: customerData.address?.trim() || existing.address,
          gstNo: customerData.gstNo?.trim() || existing.gstNo
        };
        const updated = [...prevCusts];
        updated[existingIdx] = savedRecord;
        return updated;
      } else {
        // Create new unique customer
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        savedRecord = {
          id: `CUST-${randomNum}`,
          name: customerData.name?.trim(),
          mobile: cleanMobile,
          address: customerData.address?.trim() || '',
          gstNo: customerData.gstNo?.trim() || '',
          totalPurchases: 0,
          billsCount: 0,
          lastPurchase: 'New Customer'
        };
        return [savedRecord, ...prevCusts];
      }
    });

    return savedRecord;
  };

  const handleAddCustomer = (newCustomer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const handleUpdateCustomer = (updatedCustomer) => {
    setCustomers((prev) => prev.map((c) => c.id === updatedCustomer.id ? { ...c, ...updatedCustomer } : c));
  };

  const handleDeleteCustomer = (customerId) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  // Quick Action: Customer selects "Create Bill"
  const handleSelectCustomerForBill = (customer) => {
    setPrefilledCustomer(customer);
    setActivePage('new-billing');
    showToast(`Started bill for ${customer.name}`, 'info');
  };

  // Quick Action: Product catalog "Bill" button
  const handleQuickBillProduct = (product) => {
    setQuickProduct(product);
    setActivePage('new-billing');
    showToast(`Added ${product.name} to bill`, 'info');
  };

  const handleOpenInvoice = (bill, format = 'standard') => {
    setPreviewBill(bill);
    setPreviewFormat(format);
  };

  return (
    <div className={`app-layout ${previewBill ? 'has-invoice-open' : ''} ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop no-print" 
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true" 
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        stats={{
          billsCount: bills.length,
          productsCount: products.length,
          customersCount: customers.length
        }}
      />

      <div className="main-content">
        {/* Global Top Navbar with Sidebar Toggle */}
        <Navbar
          activePage={activePage}
          onNavigate={setActivePage}
          onQuickBilling={() => {
            setActivePage('new-billing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Page Views */}
        <main className="page-wrapper">
          {activePage === 'dashboard' && (
            <Dashboard
              bills={bills}
              products={products}
              customers={customers}
              onNavigate={setActivePage}
              onViewInvoice={handleOpenInvoice}
            />
          )}

          {activePage === 'new-billing' && (
            <NewBilling
              products={products}
              customers={customers}
              onSaveCustomer={handleSaveCustomerRecord}
              onSaveBill={handleSaveBill}
              onUpdateBill={handleUpdateBill}
              editingBill={editingBill}
              onClearEditingBill={() => setEditingBill(null)}
              prefilledCustomer={prefilledCustomer}
              quickProduct={quickProduct}
              onClearQuickProduct={() => setQuickProduct(null)}
              onViewInvoice={handleOpenInvoice}
              onShowToast={showToast}
            />
          )}

          {(activePage === 'sales' || activePage === 'billing-history') && (
            <Sales
              bills={bills}
              onViewInvoice={handleOpenInvoice}
              onDeleteBill={handleDeleteBill}
              onUpdateBill={handleUpdateBill}
              onEditBill={(bill) => {
                setEditingBill(bill);
                setActivePage('new-billing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigate={setActivePage}
              onShowToast={showToast}
            />
          )}

          {activePage === 'products' && (
            <Products
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onQuickBillProduct={handleQuickBillProduct}
              onShowToast={showToast}
            />
          )}

          {activePage === 'customers' && (
            <Customers
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onSelectCustomerForBill={handleSelectCustomerForBill}
              onShowToast={showToast}
            />
          )}

          {activePage === 'reports' && (
            <Reports
              bills={bills}
              products={products}
              onShowToast={showToast}
            />
          )}

          {activePage === 'settings' && (
            <Settings
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Invoice Modal Preview & Printing */}
      {previewBill && (
        <InvoicePreview
          bill={previewBill}
          initialFormat={previewFormat}
          onClose={() => setPreviewBill(null)}
        />
      )}

      {/* Transient Toast Notification */}
      {toast && (
        <div className="toast-container no-print">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
