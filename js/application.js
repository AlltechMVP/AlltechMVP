
import { supabase } from './supabase.js';

export async function submitApplication() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const resumeFile = document.getElementById("resume").files[0];

    if (!resumeFile || !name || !email || !phone) {
        alert("Please complete all fields.");
        return;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please log in to submit your application");
            return;
        }

        const fileExt = resumeFile.name.split('.').pop();
        const filePath = `resumes/${Date.now()}.${fileExt}`;

        let { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, resumeFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("resumes").getPublicUrl(filePath);

        const { error: insertError } = await supabase.from("candidates").insert({
            name,
            email,
            phone,
            resume_url: publicUrl,
            status: "Applied"
        });

        if (insertError) throw insertError;

        alert("Application submitted! Proceeding to onboarding...");
        window.location.href = "onboard.html";
    } catch (error) {
        console.error("Error:", error);
        alert("Error submitting application: " + error.message);
    }
}

// Make function available globally
window.submitApplication = submitApplication;
