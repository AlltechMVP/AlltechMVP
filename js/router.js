
import { supabase } from './supabase.js';

window.onload = async () => {
    try {
        const { data, error } = await supabase.auth.getUser();
        console.log("Supabase getUser result:", data);

        const roleContent = document.getElementById("roleContent");

        if (error) {
            console.error("Auth error:", error);
            if (roleContent) roleContent.innerText = "Error: " + error.message;
            return;
        }

        if (!data.user) {
            console.log("No user found");
            if (roleContent) roleContent.innerText = "Not logged in.";
            window.location.href = '/index.html';
            return;
        }

        const user = data.user;
        const role = user.user_metadata?.role || "unknown";

        console.log("User Role:", role);
        if (role === "ceo") {
            window.location.href = "ceo.html";
        } else if (roleContent) {
            roleContent.innerHTML = `
                <strong>Logged in as:</strong> ${user.email}<br>
                <strong>Role:</strong> ${role}<br><br>
                This is your dashboard for the <em>${role}</em> role.
            `;
        }
    } catch (err) {
    console.error("Full error caught:", err); // Add this
        alert("DEBUG: " + err.message); // Optional popup
        document.getElementById("roleContent").innerText = "An error occurred while loading user data.";
    }
};

window.logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/index.html';
};
