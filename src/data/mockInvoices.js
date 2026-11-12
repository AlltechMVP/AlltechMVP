
const defaultInvoices = [];

export const getStoredInvoices = () => {
  return JSON.parse(localStorage.getItem("mockInvoices") || JSON.stringify(defaultInvoices));
};

export const saveInvoices = (invoices) => {
  localStorage.setItem("mockInvoices", JSON.stringify(invoices));
};
