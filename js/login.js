
import { supabase } from './supabase.js';

window.login = async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Login failed: " + error.message);
        return;
    }

    if (!authData.user.email_confirmed_at) {
        alert("Please verify your email before logging in.");
        return;
    }

    // Get the logged-in user's metadata
    const { data: userData } = await supabase.auth.getUser();
    let role = userData.user?.user_metadata?.role || "unknown";

    // Check for role override
    const overrideRole = localStorage.getItem("roleOverride");
    if (overrideRole) {
        role = overrideRole;
        console.log("Dev override activated:", role);
    }

    // Redirect based on role
    switch (role) {
        case "ceo": window.location.href = "ceo.html"; break;
        case "cfo": window.location.href = "cfo.html"; break;
        case "recruiter": window.location.href = "recruiter.html"; break;
        case "client": window.location.href = "client.html"; break;
        case "sales-rep": window.location.href = "sales-rep.html"; break;
        case "sales-manager": window.location.href = "sales-manager.html"; break;
        case "branch-manager": window.location.href = "branch-manager.html"; break;
        case "director": window.location.href = "director.html"; break;
        default:
            alert("Your account does not have a valid role assigned.");
            break;
    }
};
