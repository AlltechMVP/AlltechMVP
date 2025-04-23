
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
                emailRedirectTo: "https://" + window.location.hostname
            }
        });

        if (error) throw error;
        
        // Check if the user needs email confirmation
        if (data?.user?.identities?.length === 0) {
            const { error: resendError } = await window.supabaseClient.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: "https://" + window.location.hostname
                }
            });
            if (resendError) throw resendError;
            alert('Confirmation email has been resent. Please check your inbox!');
        } else {
            alert('Check your email for the confirmation link!');
        }
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
