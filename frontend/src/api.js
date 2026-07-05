/**
 * Lớp giao tiếp với REST API /api/tasks của backend Spring Boot.
 */
const API_URL = '/api/tasks'

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (response.status === 204) return null

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.message || 'Đã xảy ra lỗi, vui lòng thử lại')
    error.fieldErrors = data?.errors
    throw error
  }
  return data
}

export function fetchTasks({ page, size, keyword, filter, sortBy, direction }) {
  const params = new URLSearchParams({ page, size, sortBy, direction })
  if (keyword) params.set('keyword', keyword)
  if (filter === 'completed') params.set('completed', 'true')
  if (filter === 'pending') params.set('completed', 'false')
  return request(`${API_URL}?${params}`)
}

export function createTask(payload) {
  return request(API_URL, { method: 'POST', body: JSON.stringify(payload) })
}

export function updateTask(id, payload) {
  return request(`${API_URL}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function toggleTask(id) {
  return request(`${API_URL}/${id}/toggle`, { method: 'PATCH' })
}

export function deleteTask(id) {
  return request(`${API_URL}/${id}`, { method: 'DELETE' })
}
