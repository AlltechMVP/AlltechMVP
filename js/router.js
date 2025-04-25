import { supabase } from './supabase.js';

window.onload = async () => {
    try {
        const { data, error } = await supabase.auth.getUser();
        console.log("Supabase getUser result:", data);

        if (error) {
            console.error("Auth error:", error);
            window.location.href = '/index.html';
            return;
        }

        if (!data.user) {
            console.log("No user found");
            window.location.href = '/index.html';
            return;
        }

        const user = data.user;
        let role = user.user_metadata?.role;

        // Check for role override
        const override = document.getElementById("overrideRole");
        if (override && override.value !== "") {
            role = override.value;
            console.log("Role override activated:", role);
        } else if (override && override.value === "") {
            // Use stored role when "Use my actual role" is selected
            role = user.user_metadata?.role;
            console.log("Using stored role:", role);
        }

        if (!role) {
            window.location.href = '/index.html';
            return;
        }

        console.log("User Role:", role);

        switch (role) {
            case "ceo":
                window.location.href = "/ceo.html";
                break;
            case "cfo":
                window.location.href = "/cfo.html";
                break;
            case "director":
                window.location.href = "/director.html";
                break;
            case "branch_manager":
                window.location.href = "/branch-manager.html";
                break;
            case "sales_manager":
                window.location.href = "/sales-manager.html";
                break;
            case "sales_rep":
                window.location.href = "/sales-rep.html";
                break;
            case "recruiter":
                window.location.href = "/recruiter.html";
                break;
            case "client":
                window.location.href = "/client.html";
                break;
            case "candidate":
                window.location.href = "/candidate.html";
                break;
            default:
                console.error("Unknown role:", role);
                break;
        }
    } catch (err) {
        console.error("Router error:", err);
        alert("Error loading user data");
    }
};

window.logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/index.html';
};