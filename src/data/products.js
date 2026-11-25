// Crackers Shop Product Catalog and Mock Data

export const SHOP_DETAILS = {
  name: "New Billing",
  tagline: "Govt. Approved Licensed Wholesale & Retail Depot",
  licenseNo: "LIC/EXP-2024/SVKS-8942",
  gstin: "33AAACS5514F1ZP",
  phone: "9988765543",
  email: "newbillng@gmail.com",
  address: "Sivakasi, Tamil Nadu - 626123",
  website: "www.sparkleboomcrackers.com",
  terms: "1. Goods once sold will not be taken back. 2. Store in cool, dry place away from children. 3. Burst outdoors only under adult supervision."
};

export const PRODUCT_CATEGORIES = [
  "All Categories",
  "Sparklers",
  "Ground Chakkars",
  "Flower Pots (Anar)",
  "Aerial Sky Shots",
  "Sound Crackers",
  "Rockets",
  "Fancy & Novelty",
  "Festive Gift Boxes"
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-laxmi-312",
    code: "CRK-099",
    name: '3 12" Laxmi',
    category: "Sound Crackers",
    price: 30,
    discount: 0,
    gst: 18,
    stock: 200,
    unit: "1 Box",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    description: "Classic 3 1/2 inch single sound Lakshmi cracker."
  },
  {
    id: "prod-1",
    code: "CRK-101",
    name: "10 cm Electric Sparklers",
    category: "Sparklers",
    price: 120,
    discount: 15,
    gst: 18,
    stock: 250,
    unit: "10 Pcs/Box",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    description: "Bright golden sparks with steady burning time."
  },
  {
    id: "prod-2",
    code: "CRK-102",
    name: "15 cm Green & Red Sparklers",
    category: "Sparklers",
    price: 180,
    discount: 20,
    gst: 18,
    stock: 180,
    unit: "10 Pcs/Box",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?w=400&auto=format&fit=crop&q=80",
    description: "Vibrant dual-colour chemical sparkles with low smoke emission."
  },
  {
    id: "prod-3",
    code: "CRK-103",
    name: "30 cm Deluxe Color Sparklers",
    category: "Sparklers",
    price: 320,
    discount: 25,
    gst: 18,
    stock: 120,
    unit: "5 Pcs/Box",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=80",
    description: "Extra long burning luxury sparklers for night celebrations."
  },
  {
    id: "prod-4",
    code: "CRK-201",
    name: "Ground Chakkar Deluxe",
    category: "Ground Chakkars",
    price: 240,
    discount: 15,
    gst: 18,
    stock: 150,
    unit: "10 Pcs/Box",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&auto=format&fit=crop&q=80",
    description: "High speed rotating ground wheel producing silver fire circles."
  },
  {
    id: "prod-5",
    code: "CRK-202",
    name: "Ground Chakkar Special (Whistling)",
    category: "Ground Chakkars",
    price: 350,
    discount: 20,
    gst: 18,
    stock: 95,
    unit: "10 Pcs/Box",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80",
    description: "Whistling musical sound with dazzling multicolour spinning rings."
  },
  {
    id: "prod-6",
    code: "CRK-301",
    name: "Flower Pots Special (Medium)",
    category: "Flower Pots (Anar)",
    price: 260,
    discount: 20,
    gst: 18,
    stock: 140,
    unit: "10 Pcs/Box",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
    description: "Classic high altitude golden shower anar with sparkling fountain."
  },
  {
    id: "prod-7",
    code: "CRK-302",
    name: "Colour Koti Ashoka Fountain",
    category: "Flower Pots (Anar)",
    price: 450,
    discount: 25,
    gst: 18,
    stock: 80,
    unit: "5 Pcs/Box",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&auto=format&fit=crop&q=80",
    description: "Tri-stage fountain shifting through Crimson Red, Emerald Green and Silver."
  },
  {
    id: "prod-8",
    code: "CRK-401",
    name: "12 Shots Sky King Night Multi-Color",
    category: "Aerial Sky Shots",
    price: 650,
    discount: 30,
    gst: 18,
    stock: 65,
    unit: "1 Box",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1533230307785-5a1e8a867ec4?w=400&auto=format&fit=crop&q=80",
    description: "12 consecutive high-altitude aerial breaks with glittering palm effects."
  },
  {
    id: "prod-9",
    code: "CRK-402",
    name: "30 Shots Mega Spectacular Stunner",
    category: "Aerial Sky Shots",
    price: 1450,
    discount: 30,
    gst: 18,
    stock: 40,
    unit: "1 Box",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80",
    description: "Continuous rapid firing 30 aerial bursts filling the night sky with brocade crowns."
  },
  {
    id: "prod-10",
    code: "CRK-403",
    name: "120 Shots Royal Gala Finale",
    category: "Aerial Sky Shots",
    price: 4800,
    discount: 35,
    gst: 18,
    stock: 18,
    unit: "1 Box",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=80",
    description: "Grand celebration aerial repeater show with titanium salutes and gold willow bursts."
  },
  {
    id: "prod-11",
    code: "CRK-501",
    name: "Red Bijili Crackers (Strip)",
    category: "Sound Crackers",
    price: 85,
    discount: 10,
    gst: 18,
    stock: 300,
    unit: "100 Pcs/Pack",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
    description: "Traditional crisp sound red bijili sound crackers."
  },
  {
    id: "prod-12",
    code: "CRK-502",
    name: "28 Deluxe Giant Sound Crackers",
    category: "Sound Crackers",
    price: 160,
    discount: 15,
    gst: 18,
    stock: 160,
    unit: "28 Pcs/Box",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1576400883215-7083980b6197?w=400&auto=format&fit=crop&q=80",
    description: "Loud booming single sound shots tested under safety decibel norms."
  },
  {
    id: "prod-13",
    code: "CRK-503",
    name: "1000 Wala Deluxe Celebration Garland",
    category: "Sound Crackers",
    price: 820,
    discount: 25,
    gst: 18,
    stock: 45,
    unit: "1 Roll",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    description: "Thousand-shot festive celebration roll with non-stop rhythmic thunder."
  },
  {
    id: "prod-14",
    code: "CRK-601",
    name: "Baby Rocket Silver Whistle",
    category: "Rockets",
    price: 210,
    discount: 15,
    gst: 18,
    stock: 110,
    unit: "10 Pcs/Box",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=80",
    description: "High climbing whistle rocket with golden sparkle blast."
  },
  {
    id: "prod-15",
    code: "CRK-602",
    name: "Parachute Rocket with Night Illumination",
    category: "Rockets",
    price: 490,
    discount: 20,
    gst: 18,
    stock: 55,
    unit: "5 Pcs/Box",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
    description: "Ascends to 150 ft and releases a floating lit silk parachute."
  },
  {
    id: "prod-16",
    code: "CRK-701",
    name: "Magic Peacock Feathers Display",
    category: "Fancy & Novelty",
    price: 340,
    discount: 20,
    gst: 18,
    stock: 75,
    unit: "2 Pcs/Box",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&auto=format&fit=crop&q=80",
    description: "Fascinating fan shape opening resembling dancing peacock feathers in colored fire."
  },
  {
    id: "prod-17",
    code: "CRK-702",
    name: "Dazzling Butterfly Spinner",
    category: "Fancy & Novelty",
    price: 280,
    discount: 15,
    gst: 18,
    stock: 90,
    unit: "10 Pcs/Box",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&auto=format&fit=crop&q=80",
    description: "Flies upward 15 feet while spinning in multicolored sparks."
  },
  {
    id: "prod-18",
    code: "CRK-801",
    name: "Royal Family Festive Mega Gift Box (35 Items)",
    category: "Festive Gift Boxes",
    price: 3600,
    discount: 35,
    gst: 18,
    stock: 35,
    unit: "1 Box",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80",
    description: "Complete family combo with Sparklers, Flower Pots, Chakkars, Rockets & Sky Shots."
  },
  {
    id: "prod-19",
    code: "CRK-802",
    name: "Grand Imperial VIP Gift Box (55 Items)",
    category: "Festive Gift Boxes",
    price: 6999,
    discount: 40,
    gst: 18,
    stock: 20,
    unit: "1 Box",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=80",
    description: "Luxury corporate & family celebration hamper containing premium crackers."
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Rajesh Kumar",
    mobile: "9876543210",
    address: "45 Anna Nagar, West Extension, Chennai",
    gstNo: "33AABCR1234F1Z1",
    totalPurchases: 18450,
    billsCount: 3,
    lastPurchase: "2026-11-23"
  },
  {
    id: "cust-2",
    name: "Priya Sundaram",
    mobile: "9841029384",
    address: "12 Gandhi Road, Alwarpet, Chennai",
    gstNo: "",
    totalPurchases: 9240,
    billsCount: 2,
    lastPurchase: "2026-11-24"
  },
  {
    id: "cust-3",
    name: "Arunachalam & Sons",
    mobile: "9443217890",
    address: "88 Bazaar Street, Madurai",
    gstNo: "33AAACA9876M1ZG",
    totalPurchases: 34800,
    billsCount: 4,
    lastPurchase: "2026-11-24"
  },
  {
    id: "cust-4",
    name: "Kavitha Natarajan",
    mobile: "9789012345",
    address: "21 Nehru Street, Coimbatore",
    gstNo: "",
    totalPurchases: 4500,
    billsCount: 1,
    lastPurchase: "2026-11-22"
  }
];

export const INITIAL_BILLS = [
  {
    id: "bill-1001",
    invoiceNo: "INV-20261124-1001",
    date: "2026-11-24",
    time: "10:15 AM",
    customer: {
      name: "Rajesh Kumar",
      mobile: "9876543210",
      address: "45 Anna Nagar, West Extension, Chennai",
      gstNo: "33AABCR1234F1Z1"
    },
    items: [
      {
        id: "prod-8",
        code: "CRK-401",
        name: "12 Shots Sky King Night Multi-Color",
        price: 650,
        quantity: 2,
        discount: 30,
        gst: 18,
        discountAmount: 390,
        subtotal: 910,
        gstAmount: 163.8,
        total: 1073.8
      },
      {
        id: "prod-1",
        code: "CRK-101",
        name: "10 cm Electric Sparklers",
        price: 120,
        quantity: 5,
        discount: 15,
        gst: 18,
        discountAmount: 90,
        subtotal: 510,
        gstAmount: 91.8,
        total: 601.8
      },
      {
        id: "prod-6",
        code: "CRK-301",
        name: "Flower Pots Special (Medium)",
        price: 260,
        quantity: 3,
        discount: 20,
        gst: 18,
        discountAmount: 156,
        subtotal: 624,
        gstAmount: 112.32,
        total: 736.32
      }
    ],
    summary: {
      itemsCount: 10,
      subtotal: 2680,
      totalDiscount: 636,
      taxableAmount: 2044,
      gstAmount: 367.92,
      roundOff: -0.92,
      grandTotal: 2411,
      paidAmount: 2411,
      balanceAmount: 0
    },
    payment: {
      method: "UPI",
      status: "Paid",
      reference: "UPI/TXN/998471203"
    }
  },
  {
    id: "bill-1002",
    invoiceNo: "INV-20261124-1002",
    date: "2026-11-24",
    time: "11:05 AM",
    customer: {
      name: "Priya Sundaram",
      mobile: "9841029384",
      address: "12 Gandhi Road, Alwarpet, Chennai",
      gstNo: ""
    },
    items: [
      {
        id: "prod-18",
        code: "CRK-801",
        name: "Royal Family Festive Mega Gift Box (35 Items)",
        price: 3600,
        quantity: 1,
        discount: 35,
        gst: 18,
        discountAmount: 1260,
        subtotal: 2340,
        gstAmount: 421.2,
        total: 2761.2
      },
      {
        id: "prod-4",
        code: "CRK-201",
        name: "Ground Chakkar Deluxe",
        price: 240,
        quantity: 2,
        discount: 15,
        gst: 18,
        discountAmount: 72,
        subtotal: 408,
        gstAmount: 73.44,
        total: 481.44
      }
    ],
    summary: {
      itemsCount: 3,
      subtotal: 4080,
      totalDiscount: 1332,
      taxableAmount: 2748,
      gstAmount: 494.64,
      roundOff: 0.36,
      grandTotal: 3243,
      paidAmount: 3243,
      balanceAmount: 0
    },
    payment: {
      method: "Card",
      status: "Paid",
      reference: "CARD/AUTH/771290"
    }
  },
  {
    id: "bill-1003",
    invoiceNo: "INV-20261123-0985",
    date: "2026-11-23",
    time: "05:40 PM",
    customer: {
      name: "Arunachalam & Sons",
      mobile: "9443217890",
      address: "88 Bazaar Street, Madurai",
      gstNo: "33AAACA9876M1ZG"
    },
    items: [
      {
        id: "prod-10",
        code: "CRK-403",
        name: "120 Shots Royal Gala Finale",
        price: 4800,
        quantity: 2,
        discount: 35,
        gst: 18,
        discountAmount: 3360,
        subtotal: 6240,
        gstAmount: 1123.2,
        total: 7363.2
      },
      {
        id: "prod-13",
        code: "CRK-503",
        name: "1000 Wala Deluxe Celebration Garland",
        price: 820,
        quantity: 4,
        discount: 25,
        gst: 18,
        discountAmount: 820,
        subtotal: 2460,
        gstAmount: 442.8,
        total: 2902.8
      }
    ],
    summary: {
      itemsCount: 6,
      subtotal: 12880,
      totalDiscount: 4180,
      taxableAmount: 8700,
      gstAmount: 1566,
      roundOff: 0,
      grandTotal: 10266,
      paidAmount: 10000,
      balanceAmount: 266
    },
    payment: {
      method: "Bank Transfer",
      status: "Partial",
      reference: "NEFT/HDFC229910"
    }
  }
];

// Helper to generate new unique invoice number
export const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}${month}${day}-${randomSuffix}`;
};

// Calculation helpers
export const calculateItemTotals = (price, quantity, discountPercent = 0, gstPercent = 18) => {
  const gross = Number(price) * Number(quantity);
  const discountAmount = gross * (Number(discountPercent) / 100);
  const taxableAmount = gross - discountAmount;
  const gstAmount = taxableAmount * (Number(gstPercent) / 100);
  const total = taxableAmount + gstAmount;

  return {
    gross: Number(gross.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    total: Number(total.toFixed(2))
  };
};

export const calculateBillSummary = (items, overallDiscount = 0, amountPaid = 0, gstConfig = null) => {
  let subtotal = 0; // Gross MRP total
  let totalItemDiscount = 0;
  let totalGst = 0;
  let taxableTotal = 0;
  let totalItemsCount = 0;

  items.forEach(item => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const discPercent = Number(item.discount) || 0;
    const gstPercent = Number(item.gst) || 18;

    const calc = calculateItemTotals(price, qty, discPercent, gstPercent);
    subtotal += calc.gross;
    totalItemDiscount += calc.discountAmount;
    taxableTotal += calc.taxableAmount;
    totalGst += calc.gstAmount;
    totalItemsCount += qty;
  });

  // Additional manual / overall bill discount
  const manualDiscount = Number(overallDiscount) || 0;

  // Custom GST typed by the cashier in Billing Summary
  let effectiveGstRate = 18;
  if (gstConfig !== null && gstConfig !== undefined) {
    if (typeof gstConfig === 'object') {
      const type = gstConfig.type || 'percent';
      const rawVal = gstConfig.value;
      if (rawVal === '' || rawVal === null || rawVal === undefined) {
        totalGst = 0;
        effectiveGstRate = 0;
      } else {
        const numVal = Math.max(0, parseFloat(rawVal) || 0);
        if (type === 'percent') {
          effectiveGstRate = numVal;
          totalGst = (taxableTotal * numVal) / 100;
        } else {
          // Flat amount in ₹
          totalGst = numVal;
          effectiveGstRate = taxableTotal > 0 ? Number(((numVal / taxableTotal) * 100).toFixed(2)) : 0;
        }
      }
    } else if (!isNaN(Number(gstConfig))) {
      const numVal = Math.max(0, Number(gstConfig));
      effectiveGstRate = numVal;
      totalGst = (taxableTotal * numVal) / 100;
    }
  }

  const grandTotalRaw = Math.max(0, taxableTotal + totalGst - manualDiscount);
  const grandTotal = Math.round(grandTotalRaw);
  const roundOff = Number((grandTotal - grandTotalRaw).toFixed(2));
  
  const paid = Number(amountPaid) || 0;
  const balance = Math.max(0, grandTotal - paid);

  return {
    itemsCount: totalItemsCount,
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number((totalItemDiscount + manualDiscount).toFixed(2)),
    itemDiscount: Number(totalItemDiscount.toFixed(2)),
    manualDiscount,
    taxableAmount: Number(taxableTotal.toFixed(2)),
    gstRate: effectiveGstRate,
    gstAmount: Number(totalGst.toFixed(2)),
    roundOff,
    grandTotal,
    paidAmount: paid,
    balanceAmount: Number(balance.toFixed(2))
  };
};
