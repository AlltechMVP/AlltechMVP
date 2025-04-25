import { supabase } from './supabase.js';

export async function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: role
                }
            }
        });

        if (error) throw error;
        alert("Check your email for a verification link");
    } catch (err) {
        alert("Error signing up: " + err.message);
    }
}

export async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        window.location.href = '/dashboard.html';
    } catch (err) {
        alert("Error logging in: " + err.message);
    }
}

export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/index.html';
    } catch (err) {
        alert("Error logging out: " + err.message);
    }
}

async function resetPassword() {
    const email = document.getElementById("email").value;
    if (!email) {
        alert("Please enter your email address");
        return;
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-success.html',
        });

        if (error) throw error;
        alert("Password reset email sent. Please check your inbox.");
    } catch (error) {
        alert(error.message);
    }
}

// Make functions globally available
window.signUp = signUp;
window.login = login;
window.logout = logout;
window.resetPassword = resetPassword;