
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
                data: { role }
            }
        });

        if (error) throw error;
        alert("Sign up successful! Please verify your email.");
    } catch (error) {
        alert(error.message);
    }
}

export async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
                persistSession: true
            }
        });

        if (error) throw error;
        localStorage.setItem('lastLoginEmail', email);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }
}

// Auto-fill last used email
window.onload = () => {
    const lastEmail = localStorage.getItem('lastLoginEmail');
    if (lastEmail) {
        const emailInput = document.getElementById("email");
        if (emailInput) emailInput.value = lastEmail;
    }
};

export async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/index.html';
}

export async function resetPassword() {
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

// Make functions available globally
window.signUp = signUp;
window.login = login;
window.logout = logout;
window.resetPassword = resetPassword;
