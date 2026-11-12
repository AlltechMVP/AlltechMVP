let filter = "All";

function loadCandidates() {
  return JSON.parse(localStorage.getItem("mockCandidates")) || [];
}

function saveCandidates(candidates) {
  localStorage.setItem("mockCandidates", JSON.stringify(candidates));
}

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

function setFilter(newFilter) {
  filter = newFilter;
  renderPipeline();
}
window.setFilter = setFilter;

function nextStatus(current) {
  const order = ["Application", "Submitted", "Interview", "Hired"];
  const idx = order.indexOf(current);
  if (idx === -1) return current;
  if (idx === order.length - 1) return "Hired";
  return order[idx + 1];
}

function prevStatus(current) {
  const order = ["Application", "Submitted", "Interview", "Hired"];
  const idx = order.indexOf(current);
  if (idx <= 0) return "Application";
  return order[idx - 1];
}

function updateStatus(candidateId, newStatus) {
  const candidates = loadCandidates();
  const i = candidates.findIndex(c => c.id === candidateId);
  if (i === -1) return;

  candidates[i].status = newStatus;

  if (newStatus === "Rejected" && !candidates[i].rejectReason) {
    const reason = prompt("Optional: rejection reason?");
    if (reason) candidates[i].rejectReason = reason;
  }

  saveCandidates(candidates);
  renderPipeline();
}

function toggleReady(candidateId) {
  const candidates = loadCandidates();
  const i = candidates.findIndex(c => c.id === candidateId);
  if (i === -1) return;

  candidates[i].ready = !candidates[i].ready;
  saveCandidates(candidates);
  renderPipeline();
}

function renderPipeline() {
  const candidates = loadCandidates();
  const list = document.getElementById("pipelineList");
  list.innerHTML = "";

  const visible = candidates.filter(c => {
    if (filter === "All") return true;
    return (c.status || "Application") === filter;
  });

  if (visible.length === 0) {
    list.innerHTML = "<p>No candidates in this view.</p>";
    return;
  }

  visible.forEach(c => {
    const status = c.status || "Application";
    const completed = c.completedSteps || 0;
    const cId = esc(c.id);
    const next = nextStatus(status);
    const prev = prevStatus(status);

    const card = document.createElement("div");
    card.style = "border:1px solid #ccc;padding:1rem;margin-bottom:1rem;border-radius:10px;";

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;">
        <div>
          <strong>${esc(c.name)}</strong><br>
          ${esc(c.email)}<br>
          Job Interest: ${esc(c.job)}<br>
          Onboarding: ${completed}/4<br>
          <span style="font-weight:600;">Status:</span> ${esc(status)}
          ${status === "Rejected" && c.rejectReason ? "<br><em>Reason:</em> " + esc(c.rejectReason) : ""}
        </div>

        <div style="text-align:right;">
          <div style="margin-bottom:0.5rem;">
            <button data-action="toggle" data-id="${cId}">${c.ready ? "Ready &#x2705;" : "Not Ready"}</button>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem;">
        <button data-action="status" data-id="${cId}" data-status="${esc(prev)}">Back</button>
        <button data-action="status" data-id="${cId}" data-status="${esc(next)}">Next</button>
        <button data-action="status" data-id="${cId}" data-status="Rejected">Reject</button>
        <button data-action="note" data-id="${cId}">Note</button>
      </div>
    `;

    card.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === "toggle") toggleReady(id);
      else if (action === "status") updateStatus(id, btn.dataset.status);
      else if (action === "note") editNote(id);
    });

    list.appendChild(card);
  });
}

window.updateStatus = updateStatus;
window.toggleReady = toggleReady;

function editNote(candidateId) {
  const candidates = loadCandidates();
  const i = candidates.findIndex(c => c.id === candidateId);
  if (i === -1) return;

  const note = prompt("Recruiter note:", candidates[i].note || "");
  if (note !== null) candidates[i].note = note;

  saveCandidates(candidates);
  renderPipeline();
}
window.editNote = editNote;

window.onload = renderPipeline;
