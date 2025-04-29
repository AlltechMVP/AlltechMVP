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

};