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
                <td>
                    <button onclick="viewDocuments('${candidate.user_id}')" class="view-docs-btn">
                        View Documents
                    </button>
                </td>
            `;

            const docsModal = document.createElement('div');
            docsModal.id = `docs-${candidate.user_id}`;
            docsModal.className = 'modal';
            docsModal.style.display = 'none';
            docsModal.innerHTML = `
                <div class="modal-content">
                    <h3>Documents for ${candidate.email}</h3>
                    <div id="docsList-${candidate.user_id}"></div>
                    <button onclick="closeDocuments('${candidate.user_id}')">Close</button>
                </div>
            `;
            document.body.appendChild(docsModal);
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

window.viewDocuments = async (userId) => {
    const modal = document.getElementById(`docs-${userId}`);
    const docsList = document.getElementById(`docsList-${userId}`);
    
    const { data: docs, error } = await supabase
        .from('onboarding_documents')
        .select('*')
        .eq('user_id', userId);
        
    if (error) {
        console.error('Error fetching documents:', error);
        return;
    }
    
    docsList.innerHTML = docs.map(doc => `
        <div class="doc-item">
            <strong>${doc.doc_type}</strong>
            <a href="${doc.file_url}" target="_blank">View</a>
            <span>Uploaded: ${new Date(doc.uploaded_at).toLocaleDateString()}</span>
            <textarea 
                placeholder="Add notes..." 
                onchange="saveNotes('${doc.id}', this.value)"
            >${doc.notes || ''}</textarea>
        </div>
    `).join('');
    
    modal.style.display = 'block';
};

window.closeDocuments = (userId) => {
    document.getElementById(`docs-${userId}`).style.display = 'none';
};

window.saveNotes = async (docId, notes) => {
    const { error } = await supabase
        .from('onboarding_documents')
        .update({ notes })
        .eq('id', docId);
        
    if (error) {
        console.error('Error saving notes:', error);
        alert('Failed to save notes');
    }
};

window.onload = loadOnboardingStatus;