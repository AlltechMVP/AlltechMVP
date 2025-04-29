window.login = async () => {
    // Test credentials for each role
    const testCredentials = {
        'test.ceo@alltech.com': {password: 'test123', role: 'ceo'},
        'test.recruiter@alltech.com': {password: 'test123', role: 'recruiter'},
        'test.client@alltech.com': {password: 'test123', role: 'client'}
    };

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    // If empty, use CEO test credentials
    if (!email && !password) {
        email = 'test.ceo@alltech.com';
        password = 'test123';
    }

    // For testing, check if credentials match test accounts
    if (testCredentials[email] && testCredentials[email].password === password) {
        const role = testCredentials[email].role;
        // Store user info in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            email,
            role,
            name: email.split('@')[0]
        }));
        
        // Redirect based on role
        switch (role) {
            case 'ceo': window.location.href = '/ceo.html'; break;
            case 'recruiter': window.location.href = '/recruiter.html'; break;
            case 'client': window.location.href = '/client.html'; break;
            default: window.location.href = '/index.html';
        }
    } else {
        alert('Invalid credentials. Use test accounts or leave empty for CEO access.');
    }
};