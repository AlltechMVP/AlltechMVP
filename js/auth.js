
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
            password
        });

        if (error) throw error;
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }
}

export async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/index.html';
}

// Make functions available globally
window.signUp = signUp;
window.login = login;
window.logout = logout;
