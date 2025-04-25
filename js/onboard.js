
import { supabase } from './supabase.js';

let currentStep = 1;
const totalSteps = 4;
let uploadedFiles = {};

async function init() {
    const candidateProfile = JSON.parse(localStorage.getItem('candidateProfile'));
    if (!candidateProfile) {
        window.location.href = 'candidate-apply.html';
        return;
    }

    // Add candidate info to the page
    const header = document.querySelector('main h2');
    header.insertAdjacentHTML('afterend', `
        <div class="candidate-info">
            <p>Candidate: ${candidateProfile.fullName}</p>
            <p>Email: ${candidateProfile.email}</p>
        </div>
    `);
    
    setupFileInputs();
    updateProgress();
}

function setupFileInputs() {
    ['idUpload', 'w4Upload', 'depositUpload'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('change', () => handleFileUpload(id));
    });
}

async function handleFileUpload(inputId) {
    const input = document.getElementById(inputId);
    const file = input.files[0];
    const statusDiv = document.getElementById(inputId.replace('Upload', 'Status'));
    
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
        statusDiv.innerHTML = '❌ File too large (max 10MB)';
        input.value = '';
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split('.').pop();
    const fileName = `${inputId.replace('Upload', '')}.${fileExt}`;
    const filePath = `documents/${user.id}/${fileName}`;

    statusDiv.innerHTML = '⏳ Uploading...';
    
    try {
        const { data, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, { upsert: true });
            
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        await supabase.from('onboarding_documents').insert({
            user_id: user.id,
            email: user.email,
            doc_type: inputId.replace('Upload', '').toUpperCase(),
            file_url: publicUrl,
            uploaded_at: new Date().toISOString()
        });

        uploadedFiles[inputId] = true;
        statusDiv.innerHTML = '✅ Uploaded successfully';
        checkStepCompletion();
    } catch (error) {
        console.error('Upload error:', error);
        statusDiv.innerHTML = '❌ Upload failed: ' + error.message;
    }
}

function updateProgress() {
    const percent = ((currentStep - 1) / totalSteps) * 100;
    document.getElementById('progress').style.width = `${percent}%`;
}

function checkStepCompletion() {
    const nextBtn = document.getElementById('nextBtn');
    
    switch(currentStep) {
        case 1:
            nextBtn.disabled = !document.getElementById('policiesCheck').checked;
            break;
        case 2:
            nextBtn.disabled = !document.getElementById('handbookCheck').checked;
            break;
        case 3:
            nextBtn.disabled = !uploadedFiles['idUpload'] || 
                             !uploadedFiles['w4Upload'] || 
                             !uploadedFiles['depositUpload'];
            break;
        case 4:
            nextBtn.disabled = !document.getElementById('signature').value.trim();
            break;
    }
}

window.nextStep = async () => {
    if (currentStep < totalSteps) {
        document.getElementById(`step${currentStep}`).style.display = 'none';
        currentStep++;
        document.getElementById(`step${currentStep}`).style.display = 'block';
        document.getElementById('prevBtn').style.display = 'block';
    } else {
        // Complete onboarding
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('onboarding_status').upsert({
            user_id: user.id,
            email: user.email,
            completed_steps: totalSteps,
            acknowledged_policies: true,
            handbook: true,
            id_uploaded: true,
            e_signed: true
        });

        showCompletion();
    }
    
    updateProgress();
    checkStepCompletion();
};

window.prevStep = () => {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).style.display = 'none';
        currentStep--;
        document.getElementById(`step${currentStep}`).style.display = 'block';
        if (currentStep === 1) {
            document.getElementById('prevBtn').style.display = 'none';
        }
    }
    updateProgress();
    checkStepCompletion();
};

function showCompletion() {
    document.querySelectorAll('.step').forEach(step => step.style.display = 'none');
    document.getElementById('completion').style.display = 'block';
    document.getElementById('prevBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    
    const summary = document.getElementById('completionSummary');
    summary.innerHTML = `
        <p>✅ Company Policies Acknowledged</p>
        <p>✅ Employee Handbook Reviewed</p>
        <p>✅ Required Documents Uploaded</p>
        <p>✅ E-Signature Completed</p>
        <p>Completed on: ${new Date().toLocaleDateString()}</p>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    ['policiesCheck', 'handbookCheck', 'signature'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', checkStepCompletion);
    });
});
