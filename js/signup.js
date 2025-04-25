
import { supabase } from './supabase.js';

window.signUp = async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const messageDiv = document.getElementById("message");

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: "candidate"
                }
            }
        });

        if (error) throw error;

        messageDiv.style.display = "block";
        messageDiv.style.color = "green";
        messageDiv.innerHTML = "Please check your email for a confirmation link before logging in.";
        document.getElementById("signupForm").reset();
    } catch (err) {
        messageDiv.style.display = "block";
        messageDiv.style.color = "red";
        messageDiv.innerHTML = "Error signing up: " + err.message;
    }
};
