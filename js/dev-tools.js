
export const unlockDevTools = () => {
    const passcode = prompt("Dev Mode: Enter override passcode");
    
    if (passcode === "alltechadmin") {
        document.getElementById("devOverride").style.display = "block";
        alert("Override enabled!");
    } else {
        alert("Invalid passcode.");
    }
};

// Make function available globally
window.unlockDevTools = unlockDevTools;
