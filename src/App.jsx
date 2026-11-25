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

import './styles/global.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/billing.css';

export function App() {
  // Navigation active page
  const [activePage, setActivePage] = useState('dashboard');

  // LocalStorage persistence for Bills
  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem('sparkle_bills');
      return saved ? JSON.parse(saved) : INITIAL_BILLS;
    } catch (e) {
      return INITIAL_BILLS;
    }
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

  // Sidebar open/collapse state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Pre-filled customer for New Billing
  const [prefilledCustomer, setPrefilledCustomer] = useState(null);

  // Quick product to bill
  const [quickProduct, setQuickProduct] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Persist bills whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('sparkle_bills', JSON.stringify(bills));
    } catch (e) {
      console.error('Failed to save bills to localStorage', e);
    }
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
    // 1. Add to bills list
    setBills((prev) => [newBill, ...prev]);

    // 2. Decrement inventory stock for billed products
    if (newBill.items && newBill.items.length > 0) {
      setProducts((prevProds) =>
        prevProds.map((p) => {
          const billedItem = newBill.items.find((item) => item.id === p.id);
          if (billedItem) {
            const newStock = Math.max(0, p.stock - (billedItem.quantity || 1));
            return { ...p, stock: newStock };
          }
          return p;
        })
      );
    }

    // 3. Update or create customer record
    if (newBill.customer?.mobile) {
      setCustomers((prevCusts) => {
        const existingIdx = prevCusts.findIndex(
          (c) => c.mobile === newBill.customer.mobile
        );
        const grandTotal = newBill.summary?.grandTotal || 0;

        if (existingIdx > -1) {
          const updated = [...prevCusts];
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
          return updated;
        } else {
          const newCustRecord = {
            id: `cust-${Date.now()}`,
            name: newBill.customer.name || 'Counter Customer',
            mobile: newBill.customer.mobile,
            address: newBill.customer.address || '',
            gstNo: newBill.customer.gstNo || '',
            totalPurchases: grandTotal,
            billsCount: 1,
            lastPurchase: newBill.date
          };
          return [newCustRecord, ...prevCusts];
        }
      });
    }
  };

  // Bill deletion handler (cancels bill and restores inventory stock)
  const handleDeleteBill = (billId) => {
    const billToDelete = bills.find((b) => b.id === billId || b.invoiceNo === billId);
    if (!billToDelete) return;

    // Restore product stock if items exist
    if (billToDelete.items && billToDelete.items.length > 0) {
      setProducts((prevProds) =>
        prevProds.map((p) => {
          const item = billToDelete.items.find((i) => i.id === p.id);
          if (item) {
            return { ...p, stock: (p.stock || 0) + (Number(item.quantity) || 1) };
          }
          return p;
        })
      );
    }

    setBills((prev) => prev.filter((b) => b.id !== billId && b.invoiceNo !== billId));
    showToast(`Invoice #${billToDelete.invoiceNo} deleted & stock restored`, 'info');
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
    <div className="app-layout">
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
