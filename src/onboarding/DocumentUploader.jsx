
import React, { useState, useEffect } from 'react';

export default function DocumentUploader() {
  const [documents, setDocuments] = useState([]);
  const requiredDocs = ['W-4', 'ID', 'Voided Check'];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('mockDocuments') || '[]');
    setDocuments(stored);
  }, []);

  const handleUpload = (docType) => {
    const newDoc = {
      candidateId: 'cand123', // Mock ID
      fileName: `${docType.toLowerCase()}.pdf`,
      uploadedAt: new Date().toISOString()
    };

    const updated = [documents, newDoc];
    localStorage.setItem('mockDocuments', JSON.stringify(updated));
    setDocuments(updated);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Required Documents</h2>
      <div className="space-y-4">
        {requiredDocs.map(doc => {
          const isUploaded = documents.some(d => d.fileName.includes(doc.toLowerCase()));
          return (
            <div key={doc} className="flex items-center justify-between p-4 bg-white rounded shadow">
              <div>
                <h3 className="font-semibold">{doc}</h3>
                <p className="text-sm text-gray-500">
                  {isUploaded ? '✅ Uploaded' : '❌ Missing'}
                </p>
              </div>
              <input
                type="file"
                onChange={() => handleUpload(doc)}
                className="hidden"
                id={`upload-${doc}`}
                accept=".pdf,.jpg,.png"
              />
              <label
                htmlFor={`upload-${doc}`}
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
              >
                Upload
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
