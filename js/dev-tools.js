
// Dev override unlock using localStorage
export const unlockDevTools = () => {
    const passcode = prompt("Dev Mode: Enter override passcode");

    if (passcode === "alltechadmin") {
        localStorage.setItem("alltechDevOverride", "true");
        document.getElementById("devOverride").style.display = "block";
        alert("Override enabled!");
    } else {
        alert("Invalid passcode.");
    }
};

// Auto-show override if previously unlocked
window.onload = () => {
    if (localStorage.getItem("alltechDevOverride") === "true") {
        document.getElementById("devOverride").style.display = "block";
    }
};

// Make function available globally
window.unlockDevTools = unlockDevTools;
