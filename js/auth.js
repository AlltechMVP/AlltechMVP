
async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: { role },
                emailRedirectTo: window.location.origin
            }
        });

        if (error) throw error;
        alert('Check your email for the confirmation link!');
    } catch (error) {
        alert(error.message);
    }
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert(error.message);
    }
}

window.signUp = signUp;
window.login = login;
