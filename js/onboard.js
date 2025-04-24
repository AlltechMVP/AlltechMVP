
import { supabase } from './supabase.js';

export async function submitOnboarding() {
    const ackPolicy = document.getElementById("ack_policy").checked;
    const ackHandbook = document.getElementById("ack_handbook").checked;
    const idFile = document.getElementById("id_upload").files[0];
    const eSign = document.getElementById("e_sign").checked;

    if (!ackPolicy || !ackHandbook || !idFile || !eSign) {
        alert("Please complete all fields and acknowledge all items.");
        return;
    }

    try {
        // Upload ID document
        const fileExt = idFile.name.split('.').pop();
        const filePath = `id_documents/${Date.now()}.${fileExt}`;

        let { error: uploadError } = await supabase.storage
            .from("onboarding_docs")
            .upload(filePath, idFile);
            
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from("onboarding_docs")
            .getPublicUrl(filePath);

        // Save onboarding data
        const { error: insertError } = await supabase
            .from("onboarding")
            .insert({
                policy_acknowledged: ackPolicy,
                handbook_acknowledged: ackHandbook,
                id_document_url: publicUrl,
                e_signed: eSign,
                completed_at: new Date().toISOString()
            });

        if (insertError) throw insertError;

        alert("Onboarding completed successfully!");
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Error:", error);
        alert("Error submitting onboarding: " + error.message);
    }
}

// Make function available globally
window.submitOnboarding = submitOnboarding;
