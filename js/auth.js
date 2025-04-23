async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
          data: { role }
      }
  });

  if (error) {
      alert(error.message);
  } else {
      alert("Sign up successful! Please verify your email.");
  }
}

async function login() {
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