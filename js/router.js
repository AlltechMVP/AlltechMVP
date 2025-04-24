
window.onload = async () => {
    try {
        const { data, error } = await supabase.auth.getUser();
        console.log("Supabase getUser result:", data);

        if (error) {
            console.error("Auth error:", error);
            document.getElementById("roleContent").innerText = "Error: " + error.message;
            return;
        }

        if (!data.user) {
            console.log("No user found");
            document.getElementById("roleContent").innerText = "Not logged in.";
            window.location.href = '/index.html';
            return;
        }

        const user = data.user;
        const role = user.user_metadata?.role || "unknown";

        console.log("User Role:", role);
        document.getElementById("roleContent").innerHTML = `
            <strong>Logged in as:</strong> ${user.email}<br>
            <strong>Role:</strong> ${role}<br><br>
            This is your dashboard for the <em>${role}</em> role.
        `;
    } catch (err) {
        console.error('Error:', err);
        document.getElementById("roleContent").innerText = "An error occurred while loading user data.";
    }
};

window.logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/index.html';
};
