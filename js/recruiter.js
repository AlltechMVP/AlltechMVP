
import { supabase } from './supabase.js';

async function loadCandidates() {
    const status = document.getElementById("statusFilter").value;
    let query = supabase.from("candidates").select("*");

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
        console.error("Error loading candidates:", error);
        return;
    }

    const tbody = document.querySelector("#candidatesTable tbody");
    tbody.innerHTML = "";

    data.forEach(candidate => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${candidate.name}</td>
            <td>${candidate.email}</td>
            <td>${candidate.phone}</td>
            <td>
                <select onchange="updateStatus('${candidate.email}', this.value)">
                    <option value="Applied" ${candidate.status === 'Applied' ? 'selected' : ''}>Applied</option>
                    <option value="Ready for Placement" ${candidate.status === 'Ready for Placement' ? 'selected' : ''}>Ready for Placement</option>
                </select>
            </td>
            <td><a href="${candidate.resume_url}" target="_blank">Resume</a></td>
            <td>${candidate.id_uploaded ? `<a href="${candidate.id_uploaded}" target="_blank">ID</a>` : '—'}</td>
            <td><input type="text" value="${candidate.notes || ''}" id="note-${candidate.email}" /></td>
            <td><button onclick="updateNote('${candidate.email}')">Save</button></td>
        `;
        tbody.appendChild(row);
    });
}

async function updateStatus(email, newStatus) {
    const { error } = await supabase
        .from("candidates")
        .update({ status: newStatus })
        .eq("email", email);
    if (error) console.error("Status update failed:", error);
}

async function updateNote(email) {
    const note = document.getElementById(`note-${email}`).value;
    const { error } = await supabase
        .from("candidates")
        .update({ notes: note })
        .eq("email", email);
    if (error) console.error("Note update failed:", error);
}

function exportToCSV() {
    const rows = [["Name", "Email", "Phone", "Status", "Resume", "ID Upload", "Notes"]];
    document.querySelectorAll("#candidatesTable tbody tr").forEach(row => {
        const cols = row.querySelectorAll("td");
        const status = cols[3].querySelector("select").value;
        const note = cols[6].querySelector("input").value;
        rows.push([
            cols[0].innerText,
            cols[1].innerText,
            cols[2].innerText,
            status,
            cols[4].innerText,
            cols[5].innerText,
            note
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

window.onload = loadCandidates;

// Make functions available globally
window.loadCandidates = loadCandidates;
window.updateStatus = updateStatus;
window.updateNote = updateNote;
window.exportToCSV = exportToCSV;
