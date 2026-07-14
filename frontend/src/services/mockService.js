// mockService.js
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

const mockService = {
  // POST /auth/login
  // Body: { username, password }
  // Response 200: { token, user: { id, name, role } }
  // Response 401: throws { message: 'Invalid credentials' }
  login: async ({ username, password }) => {
    await delay(600);

    // Simulate a failed login for wrong credentials
    if (!username || !password) {
      throw { message: 'Username and password are required.' };
    }

    if (password === 'wrong') {
      throw { message: 'Invalid credentials.' };
    }

    // Mock users by username prefix so we can test role routing
    const roleMap = {
      admin: 'admin',
      maintenance: 'maintenance',
      operator: 'operator',
    };

    const role = roleMap[username.toLowerCase()] ?? 'operator';

    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'usr_001',
        name: username.charAt(0).toUpperCase() + username.slice(1),
        role,
      },
    };
  },

  // POST /auth/logout
  logout: async () => {
    await delay(200);
    return { success: true };
  },
};

export default mockService;