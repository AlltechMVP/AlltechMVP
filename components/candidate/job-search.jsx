
import React, { useState } from 'react';

export default function JobSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [showThankYou, setShowThankYou] = useState(false);

  const mockJobs = [
    { id: 1, title: 'Warehouse Associate', location: 'Dallas, TX', payRate: 18, description: 'Entry level warehouse position, forklift experience a plus' },
    { id: 2, title: 'Administrative Assistant', location: 'Houston, TX', payRate: 22, description: 'Support office operations and manage schedules' },
    { id: 3, title: 'Customer Service Rep', location: 'Austin, TX', payRate: 20, description: 'Handle customer inquiries and provide support' },
    { id: 4, title: 'Delivery Driver', location: 'San Antonio, TX', payRate: 21, description: 'Local delivery routes, CDL not required' },
    { id: 5, title: 'Assembly Worker', location: 'Fort Worth, TX', payRate: 19, description: 'Assembly line work in manufacturing facility' }
  ];

  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowThankYou(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission
    setTimeout(() => {
      setShowThankYou(true);
      setApplicationForm({ fullName: '', email: '', phone: '' });
    }, 500);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Job Search</h1>
      
      <input
        type="text"
        placeholder="Search jobs by title or location..."
        className="w-full p-3 border rounded mb-6"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="space-y-4">
        {filteredJobs.map(job => (
          <div key={job.id} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-600">{job.location}</p>
            <p className="text-green-600 font-semibold">${job.payRate}/hr</p>
            <p className="mt-2">{job.description}</p>
            <button
              onClick={() => handleApply(job)}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Apply Now
            </button>

            {selectedJob?.id === job.id && !showThankYou && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Apply for {job.title}</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 border rounded"
                      value={applicationForm.fullName}
                      onChange={(e) => setApplicationForm({...applicationForm, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full p-2 border rounded"
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      className="w-full p-2 border rounded"
                      value={applicationForm.phone}
                      onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Resume</label>
                    <button
                      type="button"
                      className="w-full p-2 border rounded text-left text-gray-600 hover:bg-gray-50"
                      onClick={() => alert('Resume upload feature coming soon!')}
                    >
                      Upload Resume
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                  >
                    Submit Application
                  </button>
                </form>
              </div>
            )}

            {selectedJob?.id === job.id && showThankYou && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded">
                Thank you for applying! We'll review your application and contact you soon.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
