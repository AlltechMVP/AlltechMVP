import { loadCandidates, updateCandidate } from './data-store.js';

function renderCandidates() {
    const candidates = loadCandidates();
    const container = document.getElementById('candidatesList');

    container.innerHTML = candidates.map(c => `
        <div class="candidate-card">
            <div class="candidate-name">${c.name}</div>
            <div>${c.contact} | ${c.phone}</div>
            <div class="job-title">Job: ${c.job}</div>
            <div class="progress-bar">
                <div class="progress" style="width: ${(c.onboardingStep / c.totalSteps) * 100}%"></div>
            </div>
            <select onchange="window.handleStatusChange(${c.id}, this.value)" class="status-select">
                ${['New', 'In Review', 'Submitted', 'Hired', 'Rejected']
                    .map(status => `<option value="${status}" ${status === c.status ? 'selected' : ''}>${status}</option>`)
                    .join('')}
            </select>
            <textarea 
                onchange="window.handleNoteChange(${c.id}, this.value)"
                placeholder="Add notes..."
                class="notes-field"
            >${c.notes}</textarea>
            <button onclick="window.handleSubmitToClient(${c.id})" class="submit-btn">
                Submit to Client
            </button>
        </div>
    `).join('');
}

window.handleStatusChange = (id, status) => {
    updateCandidate(id, { status });
    renderCandidates();
};

window.handleNoteChange = (id, notes) => {
    updateCandidate(id, { notes });
};

window.handleSubmitToClient = (id) => {
    updateCandidate(id, { status: 'Submitted' });
    renderCandidates();
};

document.addEventListener('DOMContentLoaded', renderCandidates);

//This part is necessary to handle the export to CSV functionality in the new structure.  It's a best guess based on the original code and the new structure, it may need adjustments based on the actual data structure.

function exportToCSV() {
    const candidates = loadCandidates();
    const rows = [["Name", "Email", "Phone", "Status", "Job", "Notes"]];
    candidates.forEach(candidate => {
        rows.push([
            candidate.name,
            candidate.contact, // Assuming contact is the email
            candidate.phone,
            candidate.status,
            candidate.job,
            candidate.notes
        ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "candidates_export.csv");
    document.body.appendChild(link);
    link.click();
}

window.exportToCSV = exportToCSV; //Make the function available globally