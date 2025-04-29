
import { supabase } from '../src/lib/supabase.js';

async function resetPassword() {
    const email = document.getElementById("email").value;
    const result = document.getElementById("result");
    
    if (!email) {
        result.textContent = "Please enter your email address";
        result.style.color = "red";
        return;
    }

    try {
        const redirectPath = window.location.host 
            ? `${window.location.protocol}//${window.location.host}/reset-success.html`
            : '/reset-success.html';
            
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectPath
        });

        if (error) throw error;
        
        result.textContent = "Password reset email sent. Please check your inbox.";
        result.style.color = "green";
    } catch (error) {
        result.textContent = error.message;
        result.style.color = "red";
    }
}

// Make function available globally
window.resetPassword = resetPassword;
