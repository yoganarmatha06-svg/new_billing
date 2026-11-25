import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ReceiptText } from 'lucide-react';
import { 
  CustomerDetails, 
  BillingTable, 
  BillSummary 
} from '../components';
import { 
  generateInvoiceNumber, 
  calculateBillSummary 
} from '../data/products';

export const NewBilling = ({ 
  products = [], 
  customers = [],
  onSaveCustomer,
  onSaveBill,
  prefilledCustomer = null,
  quickProduct = null,
  onClearQuickProduct,
  onViewInvoice,
  onShowToast
}) => {
  // 1. Generated Invoice No
  const [invoiceNo, setInvoiceNo] = useState(() => generateInvoiceNumber());

  // 2. Customer Information State (Optional)
  const [customer, setCustomer] = useState(() => ({
    name: prefilledCustomer?.name || '',
    mobile: prefilledCustomer?.mobile || '',
    address: prefilledCustomer?.address || '',
    gstNo: prefilledCustomer?.gstNo || ''
  }));

  const [customerErrors, setCustomerErrors] = useState({});
  const [isCustomerSaved, setIsCustomerSaved] = useState(() => !!prefilledCustomer);
  const [savedCustomerInfo, setSavedCustomerInfo] = useState(() => {
    return prefilledCustomer ? { ...prefilledCustomer, id: prefilledCustomer.id || `CUST-${Date.now().toString().slice(-6)}` } : null;
  });

  // 3. Cart Items State (Selected Products)
  const [cartItems, setCartItems] = useState([]);

  // 4. Manual Overall Bill Discount
  const [manualDiscount, setManualDiscount] = useState(0);

  // 5. Payment Details State
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [amountPaid, setAmountPaid] = useState(0);

  // Load draft if saved in localStorage
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('sparkle_billing_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.customer && !prefilledCustomer) {
          setCustomer(parsed.customer);
          if (parsed.customer.name || parsed.customer.mobile) {
            setIsCustomerSaved(true);
            setSavedCustomerInfo({ ...parsed.customer, id: parsed.customerId || `CUST-${Date.now().toString().slice(-6)}` });
          }
        }
        if (Array.isArray(parsed.cartItems) && parsed.cartItems.length > 0) setCartItems(parsed.cartItems);
        if (parsed.manualDiscount) setManualDiscount(parsed.manualDiscount);
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        if (parsed.amountPaid) setAmountPaid(parsed.amountPaid);
      }
    } catch (e) {
      // safe fallback
    }
  }, [prefilledCustomer]);

  // Handle prefilled customer incoming from Customers
  useEffect(() => {
    if (prefilledCustomer) {
      setCustomer({
        name: prefilledCustomer.name || '',
        mobile: prefilledCustomer.mobile || '',
        address: prefilledCustomer.address || '',
        gstNo: prefilledCustomer.gstNo || ''
      });
      setIsCustomerSaved(true);
      setSavedCustomerInfo(prefilledCustomer);
      setCustomerErrors({});
    }
  }, [prefilledCustomer]);

  // Customer modification handler: update state freely and clear errors on edit
  const handleCustomerChange = (updatedCustomer) => {
    setCustomer(updatedCustomer);
    if (customerErrors.mobile) {
      setCustomerErrors(prev => {
        const next = { ...prev };
        delete next.mobile;
        return next;
      });
    }
  };

  // Save Customer Handler (validates mobile upon saving)
  const handleSaveCustomer = () => {
    const mobileTrimmed = (customer.mobile || '').trim();
    if (mobileTrimmed && !/^[6-9]\d{9}$/.test(mobileTrimmed)) {
      setCustomerErrors(prev => ({ ...prev, mobile: 'Please enter a valid 10-digit Indian mobile number' }));
      onShowToast?.('Please enter a valid 10-digit Indian mobile number', 'danger');
      return;
    }

    let savedRecord = null;
    if (onSaveCustomer && (customer.name || customer.mobile)) {
      savedRecord = onSaveCustomer(customer);
    }

    if (!savedRecord) {
      const existing = customers.find(c => c.mobile && c.mobile === (customer.mobile || '').trim());
      savedRecord = {
        ...customer,
        id: existing?.id || `CUST-${Math.floor(100000 + Math.random() * 900000)}`
      };
    }

    setCustomerErrors(prev => {
      const next = { ...prev };
      delete next.mobile;
      return next;
    });
    setIsCustomerSaved(true);
    setSavedCustomerInfo(savedRecord);
    onShowToast?.('Customer Details Saved', 'success');
  };

  // Select existing customer handler
  const handleSelectExistingCustomer = (c) => {
    setCustomer({
      name: c.name || '',
      mobile: c.mobile || '',
      address: c.address || '',
      gstNo: c.gstNo || ''
    });
    setIsCustomerSaved(true);
    setSavedCustomerInfo(c);
    setCustomerErrors({});
    onShowToast?.(`Customer ${c.name} selected`, 'success');
  };

  // Compute live billing summary
  const summary = useMemo(() => {
    return calculateBillSummary(cartItems, manualDiscount, amountPaid);
  }, [cartItems, manualDiscount, amountPaid]);

  // Sync default amount paid with grand total when grand total changes
  useEffect(() => {
    if (summary.grandTotal > 0 && amountPaid === 0) {
      setAmountPaid(summary.grandTotal);
    }
  }, [summary.grandTotal]);

  // Auto-sync payment status based on amount paid vs grand total
  useEffect(() => {
    if (summary.grandTotal === 0) {
      setPaymentStatus('Paid');
      return;
    }

    if (amountPaid >= summary.grandTotal) {
      setPaymentStatus('Paid');
    } else if (amountPaid > 0 && amountPaid < summary.grandTotal) {
      setPaymentStatus('Partial');
    } else if (amountPaid === 0) {
      setPaymentStatus('Unpaid');
    }
  }, [amountPaid, summary.grandTotal]);

  // Cart Management Handlers - Directly adds products without customer requirement
  const handleAddToCart = (product, quantityToAdd = 1, customRate = null) => {
    const finalPrice = customRate !== null && !isNaN(customRate) ? Number(customRate) : product.price;
    const addQty = Math.max(1, Number(quantityToAdd) || 1);

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      const maxStock = product.stock ?? 999;

      if (existing) {
        const newTotalQty = existing.quantity + addQty;
        if (newTotalQty > maxStock) {
          onShowToast?.(`Maximum stock reached for ${product.name} (${maxStock} units)`, 'warning');
          return prev.map(item => 
            item.id === product.id 
              ? { ...item, quantity: maxStock, price: finalPrice } 
              : item
          );
        }

        onShowToast?.(`Updated ${product.name} quantity to ${newTotalQty}`, 'info');
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: newTotalQty, price: finalPrice } 
            : item
        );
      }

      onShowToast?.(`Added ${product.name} to bill`, 'success');
      return [
        ...prev,
        {
          id: product.id,
          code: product.code,
          name: product.name,
          category: product.category,
          price: finalPrice,
          quantity: Math.min(addQty, maxStock),
          discount: product.discount || 0,
          gst: product.gst || 18,
          unit: product.unit || '1 Box',
          image: product.image,
          stock: product.stock
        }
      ];
    });
  };

  // Handle quick product incoming from catalog
  useEffect(() => {
    if (quickProduct) {
      handleAddToCart(quickProduct);
      onClearQuickProduct?.();
    }
  }, [quickProduct]);

  const handleUpdateQuantity = (itemId, newQty) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, newQty) }
          : item
      )
    );
  };

  const handleUpdateDiscount = (itemId, newDiscount) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, discount: Math.min(90, Math.max(0, newDiscount)) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    onShowToast?.('Item removed from bill', 'info');
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('Clear all products from the billing table?')) {
      setCartItems([]);
      setManualDiscount(0);
      setAmountPaid(0);
      onShowToast?.('Billing table cleared', 'info');
    }
  };

  // Construct complete invoice object
  const buildInvoiceObject = (targetInvoiceNo) => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const finalAmountPaid = Number(amountPaid) > 0 ? Number(amountPaid) : summary.grandTotal;
    const hasCustomerDetails = Boolean(customer.name?.trim() || customer.mobile?.trim());

    return {
      id: `bill-${Date.now()}`,
      invoiceNo: targetInvoiceNo || invoiceNo,
      date: currentDate,
      time: currentTime,
      customer: {
        id: savedCustomerInfo?.id || (hasCustomerDetails ? `CUST-${Date.now().toString().slice(-6)}` : ''),
        name: customer.name?.trim() || '',
        mobile: customer.mobile?.trim() || '',
        address: customer.address?.trim() || '',
        gstNo: customer.gstNo?.trim() || ''
      },
      items: cartItems.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount,
        gst: item.gst,
        unit: item.unit
      })),
      summary: {
        itemsCount: summary.itemsCount,
        subtotal: summary.subtotal,
        totalDiscount: summary.totalDiscount,
        taxableAmount: summary.taxableAmount,
        gstAmount: summary.gstAmount,
        roundOff: summary.roundOff,
        grandTotal: summary.grandTotal,
        paidAmount: finalAmountPaid,
        balanceAmount: Math.max(0, summary.grandTotal - finalAmountPaid)
      },
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        reference: `${paymentMethod.toUpperCase()}/TXN/${Date.now().toString().slice(-6)}`
      }
    };
  };

  // Button 1: Save Draft
  const handleSaveDraft = () => {
    try {
      const draftData = {
        customer,
        customerId: savedCustomerInfo?.id,
        cartItems,
        manualDiscount,
        paymentMethod,
        amountPaid,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('sparkle_billing_draft', JSON.stringify(draftData));
      onShowToast?.('Billing draft saved offline successfully!', 'success');
    } catch (e) {
      onShowToast?.('Failed to save draft', 'danger');
    }
  };

  // Button 2: Generate Bill (Works with or without customer information)
  const handleGenerateBill = () => {
    if (cartItems.length === 0) {
      onShowToast?.('Please add at least one cracker to the bill before generating', 'danger');
      return;
    }

    const mobileTrimmed = (customer.mobile || '').trim();
    if (mobileTrimmed && !/^[6-9]\d{9}$/.test(mobileTrimmed)) {
      setCustomerErrors(prev => ({ ...prev, mobile: 'Please enter a valid 10-digit Indian mobile number' }));
      onShowToast?.('Please enter a valid 10-digit Indian mobile number', 'danger');
      return;
    }

    const newBill = buildInvoiceObject(invoiceNo);

    // Save to App state & localStorage
    onSaveBill?.(newBill);

    // If customer details were entered, save them to the customers directory
    if (newBill.customer.name && onSaveCustomer) {
      onSaveCustomer(newBill.customer);
    }

    // Clear saved draft
    try {
      localStorage.removeItem('sparkle_billing_draft');
    } catch (e) {}

    // Celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    onShowToast?.(`Invoice ${invoiceNo} generated successfully!`, 'success');

    // Show preview modal
    onViewInvoice?.(newBill);

    // Reset for next bill with fresh invoice number
    setInvoiceNo(generateInvoiceNumber());
    setCustomer({ name: '', mobile: '', address: '', gstNo: '' });
    setCustomerErrors({});
    setIsCustomerSaved(false);
    setSavedCustomerInfo(null);
    setCartItems([]);
    setManualDiscount(0);
    setAmountPaid(0);
    setPaymentMethod('Cash');
    setPaymentStatus('Paid');
  };

  // Button 3: Print Invoice (Works with or without customer information)
  const handlePrintInvoice = () => {
    if (cartItems.length === 0) {
      onShowToast?.('Please add at least one cracker to the bill before printing', 'danger');
      return;
    }

    const mobileTrimmed = (customer.mobile || '').trim();
    if (mobileTrimmed && !/^[6-9]\d{9}$/.test(mobileTrimmed)) {
      setCustomerErrors(prev => ({ ...prev, mobile: 'Please enter a valid 10-digit Indian mobile number' }));
      onShowToast?.('Please enter a valid 10-digit Indian mobile number', 'danger');
      return;
    }

    const newBill = buildInvoiceObject(invoiceNo);
    onSaveBill?.(newBill);

    if (newBill.customer.name && onSaveCustomer) {
      onSaveCustomer(newBill.customer);
    }

    try {
      localStorage.removeItem('sparkle_billing_draft');
    } catch (e) {}

    onShowToast?.(`Ready to print invoice ${invoiceNo}`, 'info');

    // Open print preview
    onViewInvoice?.(newBill);
  };

  // Button 4: Clear All
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all customer information and products?')) {
      setCustomer({ name: '', mobile: '', address: '', gstNo: '' });
      setCustomerErrors({});
      setIsCustomerSaved(false);
      setSavedCustomerInfo(null);
      setCartItems([]);
      setManualDiscount(0);
      setAmountPaid(0);
      setPaymentMethod('Cash');
      setPaymentStatus('Paid');
      setInvoiceNo(generateInvoiceNumber());

      try {
        localStorage.removeItem('sparkle_billing_draft');
      } catch (e) {}

      onShowToast?.('All billing details reset', 'info');
    }
  };

  return (
    <div className="unified-billing-container">
      {/* Unified Single Billing Form */}
      <div className="unified-billing-card">
        {/* Form Header */}
        <div className="unified-billing-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ReceiptText size={20} color="#2563eb" />
            <div>
              <h2 className="unified-billing-title">Billing Form</h2>
              <span className="unified-billing-subtitle">Point of Sale • Counter #1</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="invoice-tag">#{invoiceNo}</span>
            <span className="items-badge">{cartItems.length} Products</span>
          </div>
        </div>

        {/* Section 1: Customer Information (Reduced Size Compact Strip) */}
        <div className="unified-customer-section">
          <CustomerDetails
            customer={customer}
            onChange={handleCustomerChange}
            errors={customerErrors}
            savedCustomers={customers}
            onSelectCustomer={handleSelectExistingCustomer}
            onSaveCustomer={handleSaveCustomer}
            isSaved={isCustomerSaved}
            savedCustomerInfo={savedCustomerInfo}
            onShowToast={onShowToast}
          />
        </div>

        {/* Section 2: Products Table & Live Bill Summary Grid */}
        <div className="unified-billing-main-grid">
          {/* Left Column: Product Search & Cart Table */}
          <div className="unified-products-column">
            <BillingTable
              items={cartItems}
              invoiceNo={invoiceNo}
              availableProducts={products}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateDiscount={handleUpdateDiscount}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onShowToast={onShowToast}
            />
          </div>

          {/* Right Column: Integrated Bill Summary & Checkout Actions */}
          <div className="unified-summary-column">
            <BillSummary
              summary={summary}
              manualDiscount={manualDiscount}
              onManualDiscountChange={setManualDiscount}
              onGenerateBill={handleGenerateBill}
              onPrintInvoice={handlePrintInvoice}
              onSaveDraft={handleSaveDraft}
              onClearAll={handleClearAll}
              canGenerate={cartItems.length > 0}
              itemsCount={cartItems.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBilling;
