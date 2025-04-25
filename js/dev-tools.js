
// Dev override unlock using localStorage
export function unlockDevTools() {
    const passcode = prompt("Dev Mode: Enter override passcode");
    
    if (passcode === "alltechadmin") {
        const devOverride = document.getElementById("devOverride");
        if (devOverride) {
            devOverride.style.display = "block";
            localStorage.setItem("alltechDevOverride", "true");
            alert("Dev override enabled.");
        }
    } else {
        alert("Invalid passcode");
    }
}

// Auto-show override if previously unlocked
export function checkDevOverride() {
    if (localStorage.getItem("alltechDevOverride") === "true") {
        const devOverride = document.getElementById("devOverride");
        if (devOverride) {
            devOverride.style.display = "block";
        }
    }
}

// Initialize dev tools
document.addEventListener('DOMContentLoaded', () => {
  checkDevOverride();
  window.unlockDevTools = unlockDevTools;
});
