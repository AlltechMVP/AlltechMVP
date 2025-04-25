
const defaultJobs = [
  {
    id: 1,
    title: "Warehouse Associate",
    location: "Dallas, TX",
    payRate: 18,
    client: "Metro Logistics",
    description: "Entry level warehouse position, forklift experience a plus",
    totalOpenings: 10,
    currentFilled: 4,
    urgency: "High",
    recruiterIds: [],
    submittedCandidates: [],
    notes: [],
    clientApprovalStatus: 'pending',
    clientFeedback: '',
    sourceVMS: null
  },
  {
    id: 2,
    title: "Assembly Line Lead",
    location: "Houston, TX",
    payRate: 22,
    client: "TechManufacturing Inc",
    description: "Lead a team of 5-7 assembly workers on second shift",
    totalOpenings: 5,
    currentFilled: 2,
    urgency: "Medium",
    recruiterIds: [],
    submittedCandidates: [],
    notes: []
  }
];

export function loadJobOrders() {
  const stored = localStorage.getItem('jobOrders');
  return stored ? JSON.parse(stored) : defaultJobs;
}

export function saveJobOrders(jobs) {
  localStorage.setItem('jobOrders', JSON.stringify(jobs));
}

export function updateJobOrder(id, updates) {
  const jobs = loadJobOrders();
  const updatedJobs = jobs.map(job => 
    job.id === id ? { ...job, ...updates } : job
  );
  saveJobOrders(updatedJobs);
  return updatedJobs;
}

export function addNoteToJob(id, note) {
  const jobs = loadJobOrders();
  const updatedJobs = jobs.map(job => {
    if (job.id === id) {
      return {
        ...job,
        notes: [...job.notes, { text: note, timestamp: new Date().toISOString() }]
      };
    }
    return job;
  });
  saveJobOrders(updatedJobs);
  return updatedJobs;
}

export function removeCandidateFromJob(id, candidateId) {
  const jobs = loadJobOrders();
  const updatedJobs = jobs.map(job => {
    if (job.id === id) {
      return {
        ...job,
        submittedCandidates: job.submittedCandidates.filter(cid => cid !== candidateId)
      };
    }
    return job;
  });
  saveJobOrders(updatedJobs);
  return updatedJobs;
}

export function markJobFilled(id) {
  const jobs = loadJobOrders();
  const updatedJobs = jobs.map(job => {
    if (job.id === id) {
      return { ...job, currentFilled: job.totalOpenings };
    }
    return job;
  });
  saveJobOrders(updatedJobs);
  return updatedJobs;
}


export function approveJobByClient(id, feedback) {
  const jobs = loadJobOrders();
  const updatedJobs = jobs.map(job => {
    if (job.id === id) {
      return {
        ...job,
        clientApprovalStatus: 'approved',
        clientFeedback: feedback
      };
    }
    return job;
  });
  saveJobOrders(updatedJobs);
  return updatedJobs.find(j => j.id === id);
}

export function rejectJobByClient(id, feedback) {
  const jobs = loadJobOrders();
  const updatedJobs = jobs.map(job => {
    if (job.id === id) {
      return {
        ...job,
        clientApprovalStatus: 'rejected',
        clientFeedback: feedback
      };
    }
    return job;
  });
  saveJobOrders(updatedJobs);
  return updatedJobs.find(j => j.id === id);
}

export function tagJobWithVMS(id, sourceVMS) {
  const jobs = loadJobOrders();
  const updatedJobs = jobs.map(job => {
    if (job.id === id) {
      return {
        ...job,
        sourceVMS
      };
    }
    return job;
  });
  saveJobOrders(updatedJobs);
  return updatedJobs.find(j => j.id === id);
}
