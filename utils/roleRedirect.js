
export function roleRedirect(userRole) {
  const roleRoutes = {
    'recruiter': '/recruiter-dashboard',
    'sales-rep': '/sales-rep-dashboard',
    'sales-manager': '/sales-manager-dashboard',
    'candidate': '/candidate-dashboard',
    'client': '/client-dashboard',
    'branch-manager': '/branch-manager-dashboard',
    'director': '/director-dashboard',
    'cfo': '/executive-dashboard',
    'ceo': '/executive-dashboard'
  };

  return roleRoutes[userRole] || '/';
}
