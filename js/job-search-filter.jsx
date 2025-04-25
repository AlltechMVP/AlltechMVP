
import React, { useState, useEffect } from 'react';
import { loadJobOrders } from './jobOrders';

export default function JobSearchFilter() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    client: '',
    urgency: ''
  });

  useEffect(() => {
    const allJobs = loadJobOrders();
    setJobs(allJobs);
    setFilteredJobs(allJobs);
  }, []);

  useEffect(() => {
    let results = jobs;
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.location) {
      results = results.filter(job => 
        job.location === filters.location
      );
    }
    
    if (filters.client) {
      results = results.filter(job => 
        job.client === filters.client
      );
    }
    
    if (filters.urgency) {
      results = results.filter(job => 
        job.urgency === filters.urgency
      );
    }
    
    setFilteredJobs(results);
  }, [filters, jobs]);

  const uniqueLocations = [...new Set(jobs.map(job => job.location))];
  const uniqueClients = [...new Set(jobs.map(job => job.client))];
  const urgencyLevels = ['High', 'Medium', 'Low'];

  return (
    <div className="p-4">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search jobs..."
          className="w-full p-2 border rounded mb-4"
          value={filters.search}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="p-2 border rounded"
            value={filters.location}
            onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          
          <select
            className="p-2 border rounded"
            value={filters.client}
            onChange={e => setFilters(prev => ({ ...prev, client: e.target.value }))}
          >
            <option value="">All Clients</option>
            {uniqueClients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
          
          <select
            className="p-2 border rounded"
            value={filters.urgency}
            onChange={e => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
          >
            <option value="">All Urgency Levels</option>
            {urgencyLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-600">{job.location}</p>
            <p className="text-gray-700">{job.client}</p>
            <span className={`inline-block px-2 py-1 rounded text-sm ${
              job.urgency === 'High' ? 'bg-red-100 text-red-800' :
              job.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {job.urgency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
