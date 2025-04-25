import { supabase } from './supabase.js';

async function loadOnboardingStatus() {
    try {
        const { data: candidates, error } = await supabase
            .from('onboarding_status')
            .select('*')
            .order('email');

        if (error) throw error;

        const tbody = document.querySelector("#onboardingTable tbody");
        tbody.innerHTML = '';

        candidates.forEach(candidate => {
            const row = document.createElement("tr");
            const progress = candidate.completed_steps;
            const totalSteps = 4;
            const progressColor = progress === totalSteps ? 'green' : 
                                progress > 0 ? 'orange' : 'red';

            row.innerHTML = `
                <td>${candidate.email}</td>
                <td>${candidate.job_title || 'N/A'}</td>
                <td style="color: ${progressColor}">${progress}/${totalSteps}</td>
                <td>${checkmark(candidate.acknowledged_policies)}</td>
                <td>${checkmark(candidate.handbook)}</td>
                <td>${checkmark(candidate.id_uploaded)}</td>
                <td>${checkmark(candidate.e_signed)}</td>
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

window.onload = loadOnboardingStatus;