
// Dev override unlock using localStorage
export function unlockDevTools() {
    const passcode = prompt("Dev Mode: Enter override passcode");
    
    if (passcode === "alltechadmin") {
        document.getElementById("devOverride").style.display = "block";
        localStorage.setItem("alltechDevOverride", "true");
        alert("Dev override enabled.");
    } else {
        alert("Invalid passcode");
    }
}

// Auto-show override if previously unlocked
function checkDevOverride() {
    if (localStorage.getItem("alltechDevOverride") === "true") {
        const devOverride = document.getElementById("devOverride");
        if (devOverride) {
            devOverride.style.display = "block";
        }
    }
}

window.onload = checkDevOverride;

// Function to proceed to login
export const proceedToLogin = () => {
    window.location.href = '/index.html';
};

// Make functions available globally
window.unlockDevTools = unlockDevTools;
window.proceedToLogin = proceedToLogin;
