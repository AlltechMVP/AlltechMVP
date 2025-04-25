
import { supabase } from './supabase.js';

function updateProgress() {
    const completed = {
        policies: document.getElementById("ack_policy").checked,
        handbook: document.getElementById("ack_handbook").checked,
        idUploaded: document.getElementById("id_upload").files.length > 0,
        eSigned: document.getElementById("e_sign").checked
    };
    updateProgressBar(completed);
}

function updateProgressBar(completed) {
    const total = 4;
    const count = [
        completed.policies,
        completed.handbook,
        completed.idUploaded,
        completed.eSigned
    ].filter(Boolean).length;

    const percent = (count / total) * 100;
    document.getElementById("progressFill").style.width = `${percent}%`;
    document.getElementById("progressText").innerText = `${count} of ${total} steps completed`;
}

["ack_policy", "ack_handbook", "id_upload", "e_sign"].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener("change", updateProgress);
    }
});

document.getElementById("onboardingForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const policies = document.getElementById("ack_policy").checked;
    const handbook = document.getElementById("ack_handbook").checked;
    const idUpload = document.getElementById("id_upload").files[0];
    const eSign = document.getElementById("e_sign").checked;

    if (!policies || !handbook || !idUpload || !eSign) {
        alert("Please complete all onboarding steps.");
        return;
    }

    try {
        // Upload ID
        const fileExt = idUpload.name.split('.').pop();
        const filePath = `id_uploads/${Date.now()}.${fileExt}`;
        let { error: uploadError } = await supabase.storage.from("id_uploads").upload(filePath, idUpload);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("id_uploads").getPublicUrl(filePath);

        // Hide form and show summary
        document.getElementById("onboardingForm").style.display = "none";
        const summary = document.getElementById("onboardingSummary");
        summary.style.display = "block";
        summary.innerHTML = `
            <h3>Onboarding Complete</h3>
            <p>Policies: ✓</p>
            <p>Handbook: ✓</p>
            <p>ID Uploaded: ✓</p>
            <p>E-Signature: ✓</p>
            <br>
            <a href="candidate.html" class="auth-button">Go to Dashboard</a>
        `;

        // Update candidate status
        const { user } = await supabase.auth.getUser();
        if (user) {
            await supabase.from("candidates")
                .update({
                    status: "Ready for Placement",
                    id_uploaded: publicUrl,
                    onboarding_completed: true
                })
                .eq("email", user.email);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Error completing onboarding: " + error.message);
    }
});
