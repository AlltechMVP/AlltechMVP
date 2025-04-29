
// src/data/users.js

const mockUsers = [
  { id: 1, name: "Admin User", role: "admin", email: "admin@alltech.com" },
  { id: 2, name: "Recruiter User", role: "recruiter", email: "recruiter@alltech.com" },
  { id: 3, name: "Client User", role: "client", email: "client@alltech.com" },
  { id: 4, name: "Sales Rep", role: "sales_rep", email: "sales@alltech.com" },
  { id: 5, name: "Branch Manager", role: "branch_manager", email: "branch@alltech.com" }
];

export function loadUsers() {
  return mockUsers;
}

export function getUserById(id) {
  return mockUsers.find(user => user.id === id);
}

export function getUserByRole(role) {
  return mockUsers.filter(user => user.role === role);
}

export function addUser(userData) {
  const newUser = {
    id: mockUsers.length + 1,
    ...userData
  };
  mockUsers.push(newUser);
  return newUser;
}

export function updateUser(id, updates) {
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  }
  return null;
}

export function deleteUser(id) {
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex !== -1) {
    return mockUsers.splice(userIndex, 1)[0];
  }
  return null;
}
