
import { supabase } from './supabase.js';

async function loadCandidates() {
    const statusFilter = document.getElementById('statusFilter').value;
    let query = supabase.from('candidates').select('*');
    
    if (statusFilter) {
        query = query.eq('status', statusFilter);
    }

    const { data: candidates, error } = await query;
    
    if (error) {
        console.error('Error loading candidates:', error);
        return;
    }

    const tbody = document.getElementById('candidatesTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    candidates.forEach(candidate => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${candidate.name}</td>
            <td>${candidate.email}</td>
            <td>${candidate.phone}</td>
            <td>${candidate.status}</td>
            <td><a href="${candidate.resume_url}" target="_blank">View Resume</a></td>
            <td>${candidate.id_uploaded ? `<a href="${candidate.id_uploaded}" target="_blank">View ID</a>` : 'Not uploaded'}</td>
        `;
    });
}

// Load candidates when page loads
window.addEventListener('load', loadCandidates);

// Make function available globally
window.loadCandidates = loadCandidates;
