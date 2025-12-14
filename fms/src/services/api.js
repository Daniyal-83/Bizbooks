// src/services/api.js
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${baseURL}${endpoint}`;
  const isForm = options.body instanceof FormData;
  const config = {
    credentials: 'include',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !isForm) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.response = {
      status: response.status,
      data: await response.json().catch(() => ({ message: 'Unknown error' }))
    };
    throw error;
  }

  return {
    data: await response.json()
  };
};

export const registerUser = (userData) => apiCall("/auth/register", {
  method: 'POST',
  body: userData
});

export const loginUser = (userData) => apiCall("/auth/login", {
  method: 'POST',
  body: userData
});

export const getProfile = () => apiCall("/users/profile", {
  method: 'GET'
});

export const logoutUser = () => apiCall("/auth/logout", {
  method: 'POST'
});

// Files
export const uploadFile = (formData) => apiCall('/files', {
  method: 'POST',
  body: formData
});

export const listFiles = () => apiCall('/files', {
  method: 'GET'
});

export const updateFile = (id, data) => apiCall(`/files/${id}`, {
  method: 'PUT',
  body: data
});

export const deleteFile = (id) => apiCall(`/files/${id}`, {
  method: 'DELETE'
});

export const getFileCategorySummary = () => apiCall('/files/summary/categories', {
  method: 'GET'
});

export const getPdfText = (fileId) => apiCall(`/files/${fileId}/text`, {
  method: 'GET',
});

export const updatePdfText = (fileId, text) => apiCall(`/files/${fileId}/text`, {
  method: 'PUT',
  body: { text },
});

// Overlays (draw text onto existing PDF)
export const updatePdfOverlays = (fileId, overlays) => apiCall(`/files/${fileId}/overlays`, {
  method: 'PUT',
  body: { overlays },
});

// Structured data
export const getStructuredData = (fileId) => apiCall(`/files/${fileId}/structured`, {
  method: 'GET',
});

export const listStructuredData = () => apiCall('/files/structured', {
  method: 'GET',
});

export const getStructuredSummary = () => apiCall('/files/summary/structured', {
  method: 'GET',
});
