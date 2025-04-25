
const defaultUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@alltech.com',
    role: 'admin',
    active: true,
    dateCreated: '2024-01-01'
  },
  {
    id: 2,
    name: 'John Recruiter',
    email: 'recruiter@alltech.com',
    role: 'recruiter',
    active: true,
    dateCreated: '2024-01-01'
  },
  {
    id: 3,
    name: 'Sarah Sales',
    email: 'sales@alltech.com',
    role: 'sales_rep',
    active: true,
    dateCreated: '2024-01-01'
  },
  {
    id: 4,
    name: 'Client Corp',
    email: 'client@company.com',
    role: 'client',
    active: true,
    dateCreated: '2024-01-01'
  }
];

export function loadUsers() {
  const stored = localStorage.getItem('users');
  return stored ? JSON.parse(stored) : defaultUsers;
}

export function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

export function addUser(user) {
  const users = loadUsers();
  const newUser = {
    ...user,
    id: Math.max(...users.map(u => u.id)) + 1,
    dateCreated: new Date().toISOString(),
    active: true
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(id, updates) {
  const users = loadUsers();
  const updatedUsers = users.map(user =>
    user.id === id ? { ...user, ...updates } : user
  );
  saveUsers(updatedUsers);
  return updatedUsers.find(u => u.id === id);
}

export function deleteUser(id) {
  const users = loadUsers();
  const updatedUsers = users.filter(user => user.id !== id);
  saveUsers(updatedUsers);
  return true;
}
