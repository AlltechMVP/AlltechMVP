
// Dev override unlock using localStorage
export function unlockDevTools() {
    const passcode = prompt("Dev Mode: Enter override passcode");
    
    if (passcode === "alltechadmin") {
        const devOverride = document.getElementById("devOverride");
        if (devOverride) {
            devOverride.style.display = "block";
            localStorage.setItem("alltechDevOverride", "true");
            alert("Dev override enabled. Select a role and login with credentials.");
        }
    } else {
        alert("Invalid passcode");
    }
}

// Handle role override selection
export function handleRoleOverride(e) {
    const selectedRole = e.target.value;
    if (selectedRole) {
        localStorage.setItem("roleOverride", selectedRole);
        // Clear any existing auth
        localStorage.removeItem("supabase.auth.token");
        // Redirect to login page
        window.location.href = "/index.html";
    }
}

// Auto-show override if previously unlocked
export function checkDevOverride() {
    if (localStorage.getItem("alltechDevOverride") === "true") {
        const devOverride = document.getElementById("devOverride");
        if (devOverride) {
            devOverride.style.display = "block";
            // Set up role override handler
            const roleSelect = document.getElementById("overrideRole");
            if (roleSelect) {
                roleSelect.value = localStorage.getItem("roleOverride") || "";
                roleSelect.addEventListener("change", handleRoleOverride);
            }
        }
    }
}

// Initialize dev tools
document.addEventListener('DOMContentLoaded', () => {
    checkDevOverride();
    window.unlockDevTools = unlockDevTools;
});
