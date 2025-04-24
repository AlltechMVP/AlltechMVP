
window.onload = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        document.getElementById("roleContent").innerText = "Not logged in.";
        return;
    }

    const user = data.user;
    const role = user.user_metadata?.role || "unknown";

    document.getElementById("roleContent").innerHTML = `
        <strong>Logged in as:</strong> ${user.email}<br>
        <strong>Role:</strong> ${role}<br><br>
        This is your dashboard for the <em>${role}</em> role.
    `;
};
