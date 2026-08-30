const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(method, url, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${url}`, options);
  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || 'Request failed');
    error.status = response.status;
    error.data = result;
    throw error;
  }

  return { data: result };
}

const api = {
  get: (url) => request('GET', url),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  delete: (url) => request('DELETE', url),
};

export default api;
