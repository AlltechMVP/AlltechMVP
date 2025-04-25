
const defaultCandidates = [
  {
    id: 1,
    name: "Jane Doe",
    contact: "jane@example.com", 
    phone: "555-1234",
    job: "Warehouse Associate",
    onboardingStep: 2,
    totalSteps: 5,
    status: "New",
    notes: "",
  },
  {
    id: 2, 
    name: "John Smith",
    contact: "john@example.com",
    phone: "555-5678",
    job: "Forklift Operator", 
    onboardingStep: 4,
    totalSteps: 5,
    status: "Submitted",
    notes: "Spanish-speaking, needs translator",
  }
];

const STORAGE_KEY = "candidatesData";

export function loadCandidates() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultCandidates;
}

export function saveCandidates(candidates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
}

export function updateCandidate(id, updates) {
  const candidates = loadCandidates();
  const updated = candidates.map(c => c.id === id ? {...c, ...updates} : c);
  saveCandidates(updated);
  return updated;
}
