
import { supabase } from './supabase.js';

async function loadOnboardingStatus() {
    try {
        const { data: candidates, error } = await supabase
            .from('candidates')
            .select('*')
            .order('name');

        if (error) throw error;

        const tbody = document.querySelector("#onboardingTable tbody");
        tbody.innerHTML = '';

        candidates.forEach(candidate => {
            const row = document.createElement("tr");
            const progress = calculateProgress(candidate);
            
            row.innerHTML = `
                <td>${candidate.name}</td>
                <td>${candidate.email}</td>
                <td>${candidate.job_title || 'N/A'}</td>
                <td>${candidate.status}</td>
                <td>${checkmark(candidate.policies_acknowledged)}</td>
                <td>${checkmark(candidate.handbook_acknowledged)}</td>
                <td>${checkmark(candidate.id_uploaded)}</td>
                <td>${checkmark(candidate.e_signed)}</td>
                <td>${progress}%</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading candidates:", error);
        alert("Error loading candidates: " + error.message);
    }
}

function checkmark(value) {
    return value ? '✓' : '✗';
}

function calculateProgress(candidate) {
    const steps = [
        candidate.policies_acknowledged,
        candidate.handbook_acknowledged,
        candidate.id_uploaded,
        candidate.e_signed
    ];
    const completed = steps.filter(step => step).length;
    return Math.round((completed / steps.length) * 100);
}

window.onload = loadOnboardingStatus;
