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
  calculateBillSummary,
  calculateItemTotals
} from '../data/products';

export const NewBilling = ({ 
  products = [], 
  customers = [],
  onSaveCustomer,
  onSaveBill,
  onUpdateBill,
  editingBill = null,
  onClearEditingBill,
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

  // 4. Manual Overall Bill Discount Configuration (Typeable in Billing Summary)
  const [discountType, setDiscountType] = useState('percent'); // 'percent' | 'amount'
  const [customDiscountValue, setCustomDiscountValue] = useState('0');

  // Handle discount change with automatic double digit (%) vs 3 digits (₹) detection
  const handleDiscountChange = (val) => {
    setCustomDiscountValue(val);
    const clean = String(val).trim().split('.')[0].replace(/\D/g, '');
    if (clean.length >= 3) {
      setDiscountType('amount');
    } else {
      setDiscountType('percent');
    }
  };

  // 5. Custom GST Configuration (Typeable in Billing Summary)
  const [gstType, setGstType] = useState('percent'); // 'percent' | 'amount'
  const [customGstValue, setCustomGstValue] = useState('18');

  // 6. Payment Details State
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [amountPaid, setAmountPaid] = useState(0);

  // 7. Submission guard state (prevents duplicate sales records)
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (parsed.cartItems) setCartItems(parsed.cartItems);
        if (parsed.discountType) setDiscountType(parsed.discountType);
        if (parsed.customDiscountValue !== undefined) setCustomDiscountValue(parsed.customDiscountValue);
        else if (parsed.manualDiscount) setCustomDiscountValue(String(parsed.manualDiscount));
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

  // Handle editing bill passed from Sales
  useEffect(() => {
    if (editingBill) {
      if (editingBill.invoiceNo) setInvoiceNo(editingBill.invoiceNo);
      if (editingBill.customer) {
        setCustomer({
          name: editingBill.customer.name || '',
          mobile: editingBill.customer.mobile || '',
          address: editingBill.customer.address || '',
          gstNo: editingBill.customer.gstNo || ''
        });
        setIsCustomerSaved(true);
        setSavedCustomerInfo(editingBill.customer);
      }
      if (editingBill.items && Array.isArray(editingBill.items)) {
        setCartItems(editingBill.items);
      }
      if (editingBill.summary?.discountRate !== undefined) {
        setCustomDiscountValue(String(editingBill.summary.discountRate));
        setDiscountType(editingBill.summary.discountType || 'percent');
      }
      if (editingBill.payment?.method) {
        setPaymentMethod(editingBill.payment.method);
      }
      if (editingBill.payment?.status) {
        setPaymentStatus(editingBill.payment.status);
      }
      if (editingBill.summary?.paidAmount !== undefined) {
        setAmountPaid(editingBill.summary.paidAmount);
      }
      setCustomerErrors({});
      onShowToast?.(`Loaded Invoice #${editingBill.invoiceNo} for editing`, 'info');
    }
  }, [editingBill]);

  // Customer modification handler: update state freely and clear errors on edit
  const handleCustomerChange = (updatedCustomer) => {
    setCustomer(updatedCustomer);
    setCustomerErrors(prev => {
      const next = { ...prev };
      if (updatedCustomer.name?.trim()) delete next.name;
      if (updatedCustomer.mobile?.trim()) delete next.mobile;
      if (updatedCustomer.address?.trim()) delete next.address;
      return next;
    });
  };

  // Validate Customer Information (Required fields: Name, 10-digit Mobile & Address)
  const validateCustomer = () => {
    const cleanName = (customer.name || '').trim();
    const rawMobile = customer.mobile || '';
    const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);
    const cleanAddress = (customer.address || '').trim();

    const errors = {};
    if (!cleanName) {
      errors.name = 'Customer name is required *';
    }

    if (!rawMobile.trim()) {
      errors.mobile = 'Mobile number is required *';
    } else if (cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      errors.mobile = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!cleanAddress) {
      errors.address = 'City / Address is required *';
    }

    if (Object.keys(errors).length > 0) {
      setCustomerErrors(errors);
      if (errors.name) {
        onShowToast?.('Customer Name is required *', 'danger');
        document.getElementById('customer-name-input')?.focus();
      } else if (errors.mobile) {
        onShowToast?.(errors.mobile, 'danger');
        document.getElementById('customer-mobile-input')?.focus();
      } else if (errors.address) {
        onShowToast?.('City / Address is required *', 'danger');
        document.getElementById('customer-address-input')?.focus();
      }
      return false;
    }

    setCustomerErrors({});
    return true;
  };

  // Save Customer Handler (validates customer information upon saving)
  const handleSaveCustomer = () => {
    if (!validateCustomer()) return;

    const rawMobile = customer.mobile || '';
    const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);

    const customerToSave = {
      ...customer,
      name: customer.name.trim(),
      mobile: cleanMobile || customer.mobile?.trim() || '',
      address: customer.address?.trim() || ''
    };

    let savedRecord = null;
    if (onSaveCustomer) {
      savedRecord = onSaveCustomer(customerToSave);
    }

    if (!savedRecord) {
      const existing = customers.find(c => c.mobile && c.mobile === customerToSave.mobile);
      savedRecord = {
        ...customerToSave,
        id: existing?.id || `CUST-${Math.floor(100000 + Math.random() * 900000)}`
      };
    }

    setCustomer(customerToSave);
    setCustomerErrors({});
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
    return calculateBillSummary(cartItems, {
      type: discountType,
      value: customDiscountValue
    }, amountPaid, {
      type: gstType,
      value: customGstValue
    });
  }, [cartItems, discountType, customDiscountValue, amountPaid, gstType, customGstValue]);

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
          discount: 0,
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
      setDiscountType('percent');
      setCustomDiscountValue('0');
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
    const cleanMobile = (customer.mobile || '').replace(/\D/g, '').slice(-10);
    const hasCustomerDetails = Boolean(customer.name?.trim() || cleanMobile);

    return {
      id: `bill-${Date.now()}`,
      invoiceNo: targetInvoiceNo || invoiceNo,
      date: currentDate,
      time: currentTime,
      customer: {
        id: savedCustomerInfo?.id || (hasCustomerDetails ? `CUST-${Date.now().toString().slice(-6)}` : ''),
        name: customer.name?.trim() || '',
        mobile: cleanMobile || customer.mobile?.trim() || '',
        address: customer.address?.trim() || '',
        gstNo: customer.gstNo?.trim() || ''
      },
      items: cartItems.map(item => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const disc = Number(item.discount) || 0;
        const gst = Number(item.gst) || 18;
        const itemTotals = calculateItemTotals(price, qty, disc, gst);

        return {
          id: item.id,
          code: item.code || '',
          name: item.name,
          category: item.category || 'General',
          price: price,
          quantity: qty,
          discount: disc,
          discountAmount: itemTotals.discountAmount,
          taxableAmount: itemTotals.taxableAmount,
          gst: gst,
          gstAmount: itemTotals.gstAmount,
          itemTotal: itemTotals.total,
          total: itemTotals.total,
          unit: item.unit || '1 Box'
        };
      }),
      summary: {
        itemsCount: summary.itemsCount,
        subtotal: summary.subtotal,
        totalDiscount: summary.totalDiscount,
        discountRate: summary.discountRate,
        discountType: summary.discountType,
        taxableAmount: summary.taxableAmount,
        gstRate: summary.gstRate,
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
        discountType,
        customDiscountValue,
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

  // Button 2: Generate / Save Bill (Automatically records to Sales)
  const handleGenerateBill = () => {
    if (isSubmitting) return;

    // 1. Validate Customer Information first (Required)
    if (!validateCustomer()) {
      return;
    }

    // 2. Validate Cart Items
    if (cartItems.length === 0) {
      onShowToast?.('Please add at least one cracker to the bill before generating', 'danger');
      return;
    }

    setIsSubmitting(true);

    try {
      const newBill = buildInvoiceObject(invoiceNo);

      // Automatically save sales record permanently and update inventory
      if (editingBill) {
        onUpdateBill?.(newBill);
        onClearEditingBill?.();
        onShowToast?.(`Invoice #${newBill.invoiceNo} Updated Successfully`, 'success');
      } else {
        onSaveBill?.(newBill);
        onShowToast?.('Bill Saved Successfully', 'success');
      }

      // Save customer to the customers directory
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

      onShowToast?.('Bill Saved Successfully', 'success');

      // Show preview modal with the generated bill format
      onViewInvoice?.(newBill);

      // Reset for next bill with fresh invoice number
      setInvoiceNo(generateInvoiceNumber());
      setCustomer({ name: '', mobile: '', address: '', gstNo: '' });
      setCustomerErrors({});
      setIsCustomerSaved(false);
      setSavedCustomerInfo(null);
      setCartItems([]);
      setDiscountType('percent');
      setCustomDiscountValue('0');
      setCustomGstValue('18');
      setGstType('percent');
      setAmountPaid(0);
      setPaymentMethod('Cash');
      setPaymentStatus('Paid');
    } catch (err) {
      console.error('Error generating bill:', err);
      onShowToast?.('Failed to save bill. Please try again.', 'danger');
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  // Button 3: Print Invoice (Requires customer information and at least one item)
  const handlePrintInvoice = () => {
    // 1. Validate Customer Information first (Required)
    if (!validateCustomer()) {
      return;
    }

    // 2. Validate Cart Items
    if (cartItems.length === 0) {
      onShowToast?.('Please add at least one cracker to the bill before printing', 'danger');
      return;
    }

    try {
      const newBill = buildInvoiceObject(invoiceNo);

      try {
        localStorage.removeItem('sparkle_billing_draft');
      } catch (e) {}

      onShowToast?.(`Previewing invoice ${invoiceNo}`, 'info');

      // Open print preview
      onViewInvoice?.(newBill);
    } catch (err) {
      console.error('Error printing invoice:', err);
      onShowToast?.('Failed to preview invoice. Please try again.', 'danger');
    }
  };

  // Button 4: Clear All
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all customer information and products?')) {
      setCustomer({ name: '', mobile: '', address: '', gstNo: '' });
      setCustomerErrors({});
      setIsCustomerSaved(false);
      setSavedCustomerInfo(null);
      setCartItems([]);
      setDiscountType('percent');
      setCustomDiscountValue('0');
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
        </div>

        {/* Editing Banner */}
        {editingBill && (
          <div style={{
            margin: '12px 20px 0',
            background: '#eff6ff',
            border: '1.5px solid #93c5fd',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>✏️</span>
              <div>
                <strong style={{ color: '#1e40af', fontSize: '0.875rem' }}>
                  Editing Invoice #{editingBill.invoiceNo}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', display: 'block' }}>
                  Customer details, items, quantities and payment will be updated for this invoice.
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClearEditingBill?.();
                handleClearAll();
              }}
              style={{ fontSize: '0.75rem', padding: '5px 12px' }}
            >
              Cancel Edit
            </button>
          </div>
        )}

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
              discountType={discountType}
              onDiscountTypeChange={setDiscountType}
              customDiscountValue={customDiscountValue}
              onCustomDiscountChange={handleDiscountChange}
              gstType={gstType}
              onGstTypeChange={setGstType}
              customGstValue={customGstValue}
              onCustomGstChange={setCustomGstValue}
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
