
import { supabase } from './supabase.js';

export async function submitOnboarding() {
    const policy = document.getElementById("ack_policy").checked;
    const handbook = document.getElementById("ack_handbook").checked;
    const eSign = document.getElementById("e_sign").checked;
    const idFile = document.getElementById("id_upload").files[0];

    if (!policy || !handbook || !eSign || !idFile) {
        alert("Please complete all onboarding steps.");
        return;
    }

    const fileExt = idFile.name.split('.').pop();
    const filePath = `id_uploads/${Date.now()}.${fileExt}`;
    let { error: uploadError } = await supabase.storage.from("id_uploads").upload(filePath, idFile);

    if (uploadError) {
        alert("Error uploading ID.");
        console.error(uploadError);
        return;
    }

    const { data: { publicUrl } } = supabase.storage.from("id_uploads").getPublicUrl(filePath);

    const email = prompt("Enter your email to confirm identity:");
    if (!email) return;

    const { error: updateError } = await supabase
        .from("candidates")
        .update({ status: "Ready for Placement", id_uploaded: publicUrl })
        .eq("email", email);

    if (updateError) {
        alert("Error updating onboarding status.");
        console.error(updateError);
        return;
    }

    alert("Onboarding complete! You are ready for placement.");
    window.location.href = "/index.html";
}

// Make function available globally
window.submitOnboarding = submitOnboarding;
