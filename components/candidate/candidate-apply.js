document.getElementById("applicationForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const mockCandidateProfile = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    job: document.getElementById("job").value.trim(),
    availability: document.getElementById("availability").value,
    resume: document.getElementById("resume").files[0]?.name || "Not uploaded",
    completedSteps: 0,
    ready: false
  };

  const candidates = JSON.parse(localStorage.getItem("mockCandidates")) || [];
  candidates.push(mockCandidateProfile);
  localStorage.setItem("mockCandidates", JSON.stringify(candidates));
  localStorage.setItem("candidateProfile", JSON.stringify(mockCandidateProfile));

  window.location.href = '/onboarding';
});