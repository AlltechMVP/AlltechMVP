
export const loadJobOrders = () => {
  const stored = localStorage.getItem('jobOrders');
  return stored ? JSON.parse(stored) : [];
};

export const tagJobWithVMS = (jobId, vmsData) => {
  const jobs = loadJobOrders();
  const jobIndex = jobs.findIndex(j => j.id === jobId);
  
  if (jobIndex >= 0) {
    jobs[jobIndex].vmsData = vmsData;
    localStorage.setItem('jobOrders', JSON.stringify(jobs));
  }
};

export const saveJobOrder = (jobData) => {
  const jobs = loadJobOrders();
  jobs.push({
    id: Date.now(),
    ...jobData,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('jobOrders', JSON.stringify(jobs));
};
