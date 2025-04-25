
let step = 1;
let onboardingData = {
    policies: false,
    handbook: false,
    idUploaded: false,
    eSigned: false
};

function updateStepIndicators() {
    for (let i = 1; i <= 4; i++) {
        const el = document.getElementById(`s${i}`);
        if (el) {
            el.classList.toggle("active", i === step);
        }
    }
}

function renderStep() {
    const container = document.getElementById("stepContainer");
    const progressText = document.getElementById("progressText");
    const fill = document.getElementById("progressFill");
    
    updateStepIndicators();

    const totalSteps = 4;
    progressText.innerText = `Step ${step} of ${totalSteps}`;
    fill.style.width = `${(step / totalSteps) * 100}%`;

    switch (step) {
        case 1:
            container.innerHTML = `
                <p><strong>Step 1:</strong> Acknowledge company policies.</p>
                <label><input type="checkbox" id="policies" class="input-field"> I acknowledge company policies.</label><br><br>
                <button onclick="nextStep()" class="auth-button">Next</button>
            `;
            break;
        case 2:
            container.innerHTML = `
                <p><strong>Step 2:</strong> Acknowledge employee handbook.</p>
                <label><input type="checkbox" id="handbook" class="input-field"> I have read the handbook.</label><br><br>
                <button onclick="prevStep()" class="auth-button">Back</button>
                <button onclick="nextStep()" class="auth-button">Next</button>
            `;
            break;
        case 3:
            container.innerHTML = `
                <p><strong>Step 3:</strong> Upload a photo ID.</p>
                <input type="file" id="idUpload" class="input-field" accept=".pdf,.jpg,.jpeg,.png"><br><br>
                <button onclick="prevStep()" class="auth-button">Back</button>
                <button onclick="nextStep()" class="auth-button">Next</button>
            `;
            break;
        case 4:
            container.innerHTML = `
                <p><strong>Step 4:</strong> Type your name as your electronic signature.</p>
                <input type="text" id="signature" placeholder="Type your name" class="input-field"><br><br>
                <button onclick="prevStep()" class="auth-button">Back</button>
                <button onclick="submitOnboarding()" class="auth-button">Finish</button>
            `;
            break;
        case 5:
            container.innerHTML = `
                <h3>Onboarding Complete</h3>
                <ul>
                    <li>Policies: ${onboardingData.policies ? "✓" : "✗"}</li>
                    <li>Handbook: ${onboardingData.handbook ? "✓" : "✗"}</li>
                    <li>ID Uploaded: ${onboardingData.idUploaded ? "✓" : "✗"}</li>
                    <li>eSigned: ${onboardingData.eSigned ? "✓" : "✗"}</li>
                </ul>
                <a href="candidate.html" class="auth-button">Return to Dashboard</a>
            `;
            break;
    }
}

async function nextStep() {
    let canProceed = true;
    
    if (step === 1) {
        onboardingData.policies = document.getElementById("policies").checked;
        if (!onboardingData.policies) {
            alert("Please acknowledge the company policies to continue.");
            canProceed = false;
        }
    }
    if (step === 2) {
        onboardingData.handbook = document.getElementById("handbook").checked;
        if (!onboardingData.handbook) {
            alert("Please acknowledge reading the handbook to continue.");
            canProceed = false;
        }
    }
    if (step === 3) {
        onboardingData.idUploaded = document.getElementById("idUpload").files.length > 0;
        if (!onboardingData.idUploaded) {
            alert("Please upload your ID to continue.");
            canProceed = false;
        }
    }
    
    if (canProceed && step < 4) step++;
    renderStep();
}

function prevStep() {
    if (step > 1) step--;
    renderStep();
}

async function submitOnboarding() {
    const sig = document.getElementById("signature").value.trim();
    if (!sig) {
        alert("Please type your name as signature to complete the onboarding.");
        return;
    }
    
    onboardingData.eSigned = true;
    try {
        const { user } = await supabase.auth.getUser();
        if (user) {
            // Upload ID if present
            const idUpload = document.getElementById("idUpload").files[0];
            if (idUpload) {
                const fileExt = idUpload.name.split('.').pop();
                const filePath = `id_uploads/${Date.now()}.${fileExt}`;
                let { error: uploadError } = await supabase.storage
                    .from("id_uploads")
                    .upload(filePath, idUpload);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("id_uploads")
                    .getPublicUrl(filePath);

                // Update candidate status
                await supabase.from("candidates")
                    .update({
                        status: "Ready for Placement",
                        id_uploaded: publicUrl,
                        onboarding_completed: true
                    })
                    .eq("email", user.email);
            }
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error completing onboarding: " + error.message);
        return;
    }

    step = 5;
    renderStep();
}

window.onload = renderStep;
