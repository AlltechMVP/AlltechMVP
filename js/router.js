
import { supabase } from './supabase.js';

async function checkUserRole() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const roleContent = document.getElementById('roleContent');
    const role = user.user_metadata.role;

    switch(role) {
        case 'recruiter':
            roleContent.innerHTML = '<h3>Recruiter Dashboard</h3><p>Manage candidates and job postings here.</p>';
            break;
        case 'candidate':
            roleContent.innerHTML = '<h3>Candidate Portal</h3><p>View job applications and status here.</p>';
            break;
        case 'sales_rep':
            roleContent.innerHTML = '<h3>Sales Dashboard</h3><p>Track your sales activities and leads here.</p>';
            break;
        default:
            roleContent.innerHTML = '<h3>Welcome</h3><p>Please contact admin to set up your role.</p>';
    }
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

window.logout = logout;
checkUserRole();
