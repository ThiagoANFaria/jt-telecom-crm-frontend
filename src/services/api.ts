
// API Service for JT VOX
export const apiService = {
  async login(email: string, password: string) {
    // Simulated login response - replace with real API call
    console.log('Login attempt:', email);
    
    // Mock successful login response
    return {
      access_token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'Admin User',
        email: email,
        user_level: 'admin' as const,
        tenant_id: '1'
      }
    };
  },

  async getTenants() {
    return [
      { id: '1', name: 'JT Telecom', domain: 'jttelecom.com.br', created_at: '2024-01-01', active: true }
    ];
  },

  async getUsers() {
    return [
      { id: '1', name: 'Admin User', email: 'admin@jttelecom.com.br' }
    ];
  }
};
