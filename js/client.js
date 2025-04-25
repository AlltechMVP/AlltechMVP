
import { supabase } from './supabase.js';

async function loadJobs() {
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', localStorage.getItem('clientId'));

    if (error) {
        console.error('Error loading jobs:', error);
        return;
    }

    const select = document.getElementById('jobFilter');
    select.innerHTML = '<option value="">All Jobs</option>';
    jobs.forEach(job => {
        select.innerHTML += `<option value="${job.id}">${job.title}</option>`;
    });
}

async function loadCandidates() {
    const jobId = document.getElementById('jobFilter').value;
    let query = supabase.from('candidates')
        .select('*')
        .eq('status', 'Ready for Placement');

    if (jobId) {
        query = query.eq('job_id', jobId);
    }

    const { data: candidates, error } = await query;
    if (error) {
        console.error('Error loading candidates:', error);
        return;
    }

    const tbody = document.querySelector('#candidateTable tbody');
    tbody.innerHTML = '';
    candidates.forEach(candidate => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${candidate.name}</td>
            <td>${candidate.job_title || 'Not assigned'}</td>
            <td>${candidate.status}</td>
            <td><a href="${candidate.resume_url}" target="_blank">View Resume</a></td>
            <td>
                <button onclick="reviewCandidate('${candidate.id}')" class="auth-button">Review</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function reviewCandidate(candidateId) {
    const decision = confirm('Would you like to schedule an interview with this candidate?');
    if (decision) {
        const { error } = await supabase
            .from('candidates')
            .update({ status: 'Interview Requested' })
            .eq('id', candidateId);

        if (error) {
            alert('Error updating candidate status');
            console.error(error);
            return;
        }

        alert('Interview request sent!');
        loadCandidates();
    }
}

window.onload = () => {
    loadJobs();
    loadCandidates();
};

// Make functions available globally
window.loadCandidates = loadCandidates;
window.reviewCandidate = reviewCandidate;
