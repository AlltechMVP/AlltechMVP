
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
                emailRedirectTo: "https://" + window.location.host
            }
        });

        if (error) throw error;
        
        alert('Please check your email for the confirmation link!');
        
        // Immediately resend verification email
        const { error: resendError } = await window.supabaseClient.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: "https://" + window.location.hostname
            }
        });
        
        if (resendError) {
            console.error('Error resending email:', resendError);
            alert('Error sending verification email. Please try signing up again.');
        } else {
            alert('Verification email has been sent. Please check your inbox and spam folder.');
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
