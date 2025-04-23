import { supabase } from './supabase.js';

window.signUp = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: role
        },
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;
    alert('Check your email for the confirmation link!');
  } catch (error) {
    alert(error.message);
  }
}

window.login = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
  });

  if (error) {
      alert(error.message);
  } else {
      window.location.href = "dashboard.html";
  }
}