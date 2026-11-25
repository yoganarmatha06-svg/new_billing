/**
 * Pure Frontend Sales Persistence Service using Browser localStorage
 * Key: 'sparkle_bills'
 * Persists all completed bills permanently in the client browser.
 */

const STORAGE_KEY = 'sparkle_bills';

export const salesService = {
  /**
   * Fetches all saved sales records from browser localStorage
   * Uses the same 'sparkle_bills' key.
   * @returns {Array} List of all saved sales records (no dummy data)
   */
  getSales: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error reading sales records from localStorage:', error);
    }
    return [];
  },

  /**
   * Saves a new bill to browser localStorage
   * Prevents duplicate bill saving by invoice number and id
   * @param {Object} newBill Complete bill details
   * @returns {Array} Updated list of sales records
   */
  saveSale: (newBill) => {
    if (!newBill || !newBill.invoiceNo) {
      return salesService.getSales();
    }

    const currentSales = salesService.getSales();

    // Duplicate check: ensure the same bill is never saved twice
    const isDuplicate = currentSales.some(
      (b) => b.invoiceNo === newBill.invoiceNo || b.id === newBill.id
    );

    if (isDuplicate) {
      return currentSales;
    }

    const updated = [newBill, ...currentSales];
    salesService.saveAllSales(updated);
    return updated;
  },

  /**
   * Writes all sales records permanently to localStorage under 'sparkle_bills'
   * @param {Array} salesList 
   */
  saveAllSales: (salesList) => {
    try {
      if (Array.isArray(salesList)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(salesList));
      }
    } catch (error) {
      console.error('Failed to write sales records to localStorage:', error);
    }
  },

  /**
   * Deletes a sale by ID or invoice number from localStorage
   * @param {string} billId 
   * @returns {Array} Updated sales list
   */
  deleteSale: (billId) => {
    const currentSales = salesService.getSales();
    const filtered = currentSales.filter(
      (b) => b.id !== billId && b.invoiceNo !== billId
    );
    salesService.saveAllSales(filtered);
    return filtered;
  }
};

export default salesService;
