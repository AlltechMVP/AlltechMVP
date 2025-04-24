
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
        let role = user.user_metadata?.role || "unknown";

        // Check for role override
        const override = document.getElementById("overrideRole");
        if (override && override.value) {
            role = override.value;
            console.log("Role override activated:", role);
        }

        console.log("User Role:", role);

        switch (role) {
            case "ceo":
                window.location.href = "ceo.html";
                break;
            case "cfo":
                window.location.href = "cfo.html";
                break;
            case "director":
                window.location.href = "director.html";
                break;
            case "branch_manager":
                window.location.href = "branch-manager.html";
                break;
            case "sales_manager":
                window.location.href = "sales-manager.html";
                break;
            case "sales_rep":
                window.location.href = "sales-rep.html";
                break;
            case "recruiter":
                window.location.href = "recruiter.html";
                break;
            case "client":
                window.location.href = "client.html";
                break;
            case "candidate":
                window.location.href = "candidate.html";
                break;
            default:
                if (roleContent) {
                    roleContent.innerHTML = `
                        <strong>Logged in as:</strong> ${user.email}<br>
                        <strong>Role:</strong> ${role}<br><br>
                        This role does not have a dashboard assigned yet.
                    `;
                }
                break;
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
