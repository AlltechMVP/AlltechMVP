
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
        
        if (data) {
            alert('Please check your email for the confirmation link!');
            
            // Add a retry option after 5 seconds if email hasn't arrived
            setTimeout(async () => {
                try {
                    await window.supabaseClient.auth.resend({
                        type: 'signup',
                        email: email,
                        options: {
                            emailRedirectTo: window.location.origin
                        }
                    });
                } catch (resendError) {
                    console.error('Error resending email:', resendError);
                }
            }, 5000);
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
