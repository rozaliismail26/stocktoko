// src/api.js - semua pemanggilan ke backend ada di sini
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.');
  return data;
}

export const api = {
  getProducts: () => request('/api/products'),
  getSummary: () => request('/api/summary'),
  getMovements: (limit = 12) => request(`/api/movements?limit=${limit}`),
  createProduct: (data) => request('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
  addMovement: (id, data) =>
    request(`/api/products/${id}/movements`, { method: 'POST', body: JSON.stringify(data) }),
};
