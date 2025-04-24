
import { supabase } from './js/supabase.js'

async function signUp() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const role = document.getElementById('role').value

    try {
        const { user, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: role
                }
            }
        })
        
        if (error) throw error
        alert('Signup successful! Please check your email for verification.')
    } catch (error) {
        alert(error.message)
    }
}

async function login() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    try {
        const { user, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        
        if (error) throw error
        alert('Login successful!')
        window.location.href = "dashboard.html"
    } catch (error) {
        alert(error.message)
    }
}

// Make functions available globally
window.signUp = signUp
window.login = login
