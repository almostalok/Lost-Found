import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Important: sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized errors (token expired/invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Store token in localStorage as backup (backend also sets httpOnly cookie)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
      }));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Store token in localStorage as backup
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
      }));
    }
    return response.data;
  },

  // Logout (clear local storage, cookie will be handled by server)
  logout: async () => {
    try {
      // Ask server to clear the httpOnly cookie
      await api.post('/auth/logout');
    } catch {
      // ignore server errors for logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from server (prefers cookie) with fallback to localStorage
  me: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
  },
  // Request Aadhar verification (file upload + number)
  requestAadhar: async (form) => {
    // form should be a FormData instance with fields: aadharNumber, aadhar (file)
    const response = await api.post('/auth/me/aadhar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Admin: list pending aadhar requests
  getAadharRequests: async () => {
    const response = await api.get('/auth/aadhar/requests');
    return response.data;
  },

  // Admin: update a user's aadhar status
  updateAadharStatus: async (userId, status, reason) => {
    const response = await api.put(`/auth/aadhar/${userId}`, { status, reason });
    return response.data;
  },
};

// Lost Items API
export const lostItemsAPI = {
  // Get all lost items
  getAll: async () => {
    const response = await api.get('/lost');
    return response.data;
  },

  // Get single lost item by ID
  getById: async (id) => {
    const response = await api.get(`/lost/${id}`);
    return response.data;
  },

  // Add new lost item (requires auth)
  create: async (itemData) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', itemData.title);
    formData.append('description', itemData.description || '');
    formData.append('category', itemData.category || '');
    formData.append('location', itemData.location || '');
    formData.append('dateLost', itemData.dateLost || new Date().toISOString());
    if (itemData.image) {
      formData.append('image', itemData.image);
    }

    const response = await api.post('/lost', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  // Update lost item (owner only)
  update: async (id, itemData) => {
    const formData = new FormData();
    if (itemData.title !== undefined) formData.append('title', itemData.title);
    if (itemData.description !== undefined) formData.append('description', itemData.description);
    if (itemData.category !== undefined) formData.append('category', itemData.category);
    if (itemData.location !== undefined) formData.append('location', itemData.location);
    if (itemData.dateLost !== undefined) formData.append('dateLost', itemData.dateLost);
    if (itemData.image) formData.append('image', itemData.image);

    const response = await api.put(`/lost/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete lost item (owner only)
  delete: async (id) => {
    const response = await api.delete(`/lost/${id}`);
    return response.data;
  },

  // Claim a lost item (user found it)
  claim: async (id, message) => {
    const response = await api.post(`/lost/${id}/claim`, { message });
    return response.data;
  },

  // Get claims for a lost item (owner only)
  getClaims: async (id) => {
    const response = await api.get(`/lost/${id}/claims`);
    return response.data;
  },

  // Update claim status (owner only)
  updateClaim: async (id, claimId, status) => {
    const response = await api.put(`/lost/${id}/claims/${claimId}`, { status });
    return response.data;
  },
};

// Found Items API
export const foundItemsAPI = {
  // Get all found items
  getAll: async () => {
    const response = await api.get('/found');
    return response.data;
  },

  // Get single found item by ID
  getById: async (id) => {
    const response = await api.get(`/found/${id}`);
    return response.data;
  },

  // Add new found item (requires auth)
  create: async (itemData) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', itemData.title);
    formData.append('description', itemData.description || '');
    formData.append('category', itemData.category || '');
    formData.append('location', itemData.location || '');
    formData.append('dateFound', itemData.dateFound || new Date().toISOString());
    if (itemData.image) {
      formData.append('image', itemData.image);
    }

    const response = await api.post('/found', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  // Update found item (owner only)
  update: async (id, itemData) => {
    const formData = new FormData();
    if (itemData.title !== undefined) formData.append('title', itemData.title);
    if (itemData.description !== undefined) formData.append('description', itemData.description);
    if (itemData.category !== undefined) formData.append('category', itemData.category);
    if (itemData.location !== undefined) formData.append('location', itemData.location);
    if (itemData.dateFound !== undefined) formData.append('dateFound', itemData.dateFound);
    if (itemData.image) formData.append('image', itemData.image);

    const response = await api.put(`/found/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete found item (owner only)
  delete: async (id) => {
    const response = await api.delete(`/found/${id}`);
    return response.data;
  },

  // Claim a found item (user thinks it's theirs)
  claim: async (id, message) => {
    const response = await api.post(`/found/${id}/claim`, { message });
    return response.data;
  },

  // Get claims for a found item (owner only)
  getClaims: async (id) => {
    const response = await api.get(`/found/${id}/claims`);
    return response.data;
  },

  // Update claim status (owner only)
  updateClaim: async (id, claimId, status) => {
    const response = await api.put(`/found/${id}/claims/${claimId}`, { status });
    return response.data;
  },
};

export default api;

// Chat API
export const chatAPI = {
  // Get or create chat for an item
  getChat: async (itemType, itemId) => {
    const response = await api.get(`/chats/${itemType}/${itemId}`);
    return response.data;
  },

  // Send message for an item
  sendMessage: async (itemType, itemId, text) => {
    const response = await api.post(`/chats/${itemType}/${itemId}/messages`, { text });
    return response.data;
  },
};
