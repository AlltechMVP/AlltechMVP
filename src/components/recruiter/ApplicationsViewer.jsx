
import React, { useState, useEffect, useCallback } from 'react';
import { mockJobs } from '../../data/mockJobs';

export default function ApplicationsViewer() {
  // Add retry mechanism for data loading
  const [retryCount, setRetryCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const storedApplications = JSON.parse(localStorage.getItem('applications') || '[]');
      if (!Array.isArray(storedApplications)) {
        throw new Error('Invalid applications data format');
      }
      setApplications(storedApplications);
    } catch (err) {
      console.error('Applications load error:', err);
      setError('Failed to load applications data. Please try again.');
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const getJobDetails = (jobId) => {
    if (!jobId) return { title: 'Unknown', location: 'N/A' };
    const job = mockJobs.find(job => job.id === jobId);
    return job || { title: 'Unknown', location: 'N/A' };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    try {
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const getStatusBadgeClass = (status) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status?.toLowerCase()) {
      case 'approved': return `${baseClass} bg-green-100 text-green-800`;
      case 'rejected': return `${baseClass} bg-red-100 text-red-800`;
      case 'pending': return `${baseClass} bg-yellow-100 text-yellow-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center" role="status" aria-busy="true">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 mb-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          <div aria-live="polite">Loading applications</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6" role="alert" aria-live="assertive">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => {
              setRetryCount(0);
              loadApplications();
            }}
            className="mt-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Job Applications</h1>
      {applications.length === 0 ? (
        <p className="text-gray-500 text-center py-8" role="status">No applications submitted yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table 
            className="min-w-full divide-y divide-gray-200" 
            aria-label="Job Applications"
            aria-describedby="applications-table-desc"
          >
          <caption id="applications-table-desc" className="sr-only">
            List of all job applications with their details including job title, location, application date, status and notes
          </caption>
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app, index) => {
                const job = getJobDetails(app.jobId);
                return (
                  <tr key={app.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{job.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{job.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(app.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(app.status)}>
                        {app.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.note || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
