
const defaultCandidates = [
  {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-0123',
    status: 'Onboarding',
    onboardingStep: 1,
    jobId: 1,
    submittedDate: '2024-01-15',
    notes: []
  }
];

export function loadCandidates() {
  const stored = localStorage.getItem('candidates');
  return stored ? JSON.parse(stored) : defaultCandidates;
}

export function saveCandidates(candidates) {
  localStorage.setItem('candidates', JSON.stringify(candidates));
}

export function updateCandidate(id, updates) {
  const candidates = loadCandidates();
  const updatedCandidates = candidates.map(candidate =>
    candidate.id === id ? { ...candidate, ...updates } : candidate
  );
  saveCandidates(updatedCandidates);
  return updatedCandidates.find(c => c.id === id);
}

export function addCandidateNote(id, note) {
  const candidates = loadCandidates();
  const updatedCandidates = candidates.map(candidate => {
    if (candidate.id === id) {
      return {
        ...candidate,
        notes: [...candidate.notes, { text: note, timestamp: new Date().toISOString() }]
      };
    }
    return candidate;
  });
  saveCandidates(updatedCandidates);
  return updatedCandidates.find(c => c.id === id);
}

export function updateOnboardingStep(id, step) {
  return updateCandidate(id, { onboardingStep: step });
}
