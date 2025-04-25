
import { supabase } from './supabase.js';

async function loadCandidateInfo() {
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError) {
        console.error('Error loading user:', authError);
        return;
    }

    const { data: candidate, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('email', user.email)
        .single();

    if (error) {
        console.error('Error loading candidate:', error);
        return;
    }

    document.getElementById('candidateInfo').innerHTML = `
        <p><strong>Name:</strong> ${candidate.name}</p>
        <p><strong>Email:</strong> ${candidate.email}</p>
        <p><strong>Status:</strong> ${candidate.status}</p>
    `;

    const checklist = document.getElementById('onboardingChecklist');
    const steps = [
        { id: 'application', label: 'Application Submitted', done: true },
        { id: 'docs', label: 'Documents Uploaded', done: candidate.id_uploaded ? true : false },
        { id: 'placement', label: 'Ready for Placement', done: candidate.status === 'Ready for Placement' }
    ];

    checklist.innerHTML = steps.map(step => `
        <li style="color: ${step.done ? 'green' : 'gray'}">
            ${step.done ? '✓' : '○'} ${step.label}
        </li>
    `).join('');
}

window.onload = loadCandidateInfo;
