
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
        
        alert('Please check your email for the confirmation link!');
        
        // Wait 5 seconds before attempting to resend
        setTimeout(async () => {
            try {
                const { error: resendError } = await window.supabaseClient.auth.resend({
                    type: 'signup',
                    email: email,
                    options: {
                        emailRedirectTo: window.location.origin
                    }
                });
                
                if (resendError) {
                    if (resendError.status === 429) {
                        alert('Please wait a few minutes before requesting another verification email.');
                    } else {
                        alert('Error sending verification email. Please try again later.');
                    }
                } else {
                    alert('Another verification email has been sent. Please check your inbox and spam folder.');
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Failed to resend verification email. Please try again later.');
            }
        }, 5000);
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
