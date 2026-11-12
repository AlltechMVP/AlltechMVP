
const defaultInvoices = [];

export const getStoredInvoices = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("mockInvoices") || JSON.stringify(defaultInvoices));
    return Array.isArray(parsed) ? parsed : defaultInvoices;
  } catch {
    return defaultInvoices;
  }
};

export const saveInvoices = (invoices) => {
  localStorage.setItem("mockInvoices", JSON.stringify(invoices));
};
