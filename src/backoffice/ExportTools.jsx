
import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getStoredInvoices } from '../data/mockInvoices';
import { getStoredTimesheets } from '../data/mockTimesheets';

export default function ExportTools() {
  const exportInvoiceAsPDF = async (invoice) => {
    const element = document.getElementById(`invoice-${invoice.id}`);
    const canvas = await html2canvas(element);
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0);
    pdf.save(`invoice-${invoice.id}.pdf`);
  };

  const exportPayrollAsCSV = () => {
    const timesheets = getStoredTimesheets();
    const csvContent = timesheets
      .map(ts => `${ts.candidateName},${ts.date},${ts.totalHours},${ts.totalHours * 17}`)
      .join('\n');
    const blob = new Blob([`Name,Date,Hours,Pay\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll.csv';
    a.click();
  };

  const invoices = getStoredInvoices();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Export Tools</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Payroll Export</h3>
        <button 
          onClick={exportPayrollAsCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Export Payroll CSV
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Invoice Exports</h3>
        {invoices.map(invoice => (
          <div 
            key={invoice.id} 
            id={`invoice-${invoice.id}`}
            className="mb-6 p-4 border rounded"
          >
            <div className="flex justify-between mb-4">
              <h4>{invoice.clientName}</h4>
              <span>#{invoice.id}</span>
            </div>
            <div className="mb-2">Total: ${invoice.totalAmount}</div>
            <button
              onClick={() => exportInvoiceAsPDF(invoice)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Export PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
