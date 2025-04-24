
import { supabase } from './supabase.js';

async function loadCandidates() {
    const status = document.getElementById("statusFilter").value;
    let query = supabase.from("candidates").select("*");

    if (status) {
        query = query.eq("status", status);
    }

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
            <td>${candidate.status}</td>
            <td><a href="${candidate.resume_url}" target="_blank">Resume</a></td>
            <td>${candidate.id_uploaded ? `<a href="${candidate.id_uploaded}" target="_blank">ID</a>` : '—'}</td>
        `;
        tbody.appendChild(row);
    });
}

window.onload = loadCandidates;

// Make function available globally
window.loadCandidates = loadCandidates;
