// =============================================
// API Client Module - Menfess PWA
// =============================================

const BASE_URL = window.location.origin + '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.hash = '#/login';
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const API = {
  // Auth endpoints
  login(username, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  register(username, whatsapp, password) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, whatsapp, password })
    });
  },

  getMe() {
    return request('/auth/me');
  },

  updateProfile(data) {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  changePassword(oldPassword, newPassword) {
    return request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  },

  // Confess endpoints
  createConfess(data) {
    return request('/confess', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getConfession(uniqueId) {
    return request(`/confess/${uniqueId}`);
  },

  getMyConfessions() {
    return request('/confess/my');
  },

  getInbox() {
    return request('/confess/inbox');
  },

  createReply(confessionId, message) {
    return request(`/confess/${confessionId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  getReplies(confessionId) {
    return request(`/confess/${confessionId}/replies`);
  },

  deleteReply(replyId) {
    return request(`/confess/reply/${replyId}`, {
      method: 'DELETE'
    });
  },

  deleteChat(confessionId) {
    return request(`/confess/${confessionId}`, {
      method: 'DELETE'
    });
  }
};

export default API;
