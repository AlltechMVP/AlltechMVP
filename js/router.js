import { supabase } from './supabase.js';

window.onload = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
        document.getElementById("roleContent").innerText = "Not logged in.";
        return;
    }

    const role = user.user_metadata.role || "unknown";
    document.getElementById("roleContent").innerHTML = `
        <strong>Logged in as:</strong> ${user.email}<br>
        <strong>Role:</strong> ${role}<br><br>
        This is your dashboard for the <em>${role}</em> role.
    `;
};

async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

window.logout = logout;