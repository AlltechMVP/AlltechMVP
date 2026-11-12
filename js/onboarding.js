function submitOnboarding() {
  const candidateProfile = JSON.parse(localStorage.getItem("candidateProfile"));

  if (!candidateProfile) {
    window.location.href = "candidate-apply.html";
    return;
  }

  const candidates = JSON.parse(localStorage.getItem("mockCandidates")) || [];
  const idx = candidates.findIndex(c => c.email === candidateProfile.email);

  if (idx !== -1) {
    candidates[idx].completedSteps = 4;
    candidates[idx].ready = true;
    localStorage.setItem("mockCandidates", JSON.stringify(candidates));
  }

  alert("Onboarding complete!");
  window.location.href = "pipeline.html";
}

window.submitOnboarding = submitOnboarding;
