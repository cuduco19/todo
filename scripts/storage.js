const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5119/api/tasks'
  : '/api/tasks';

async function request(url = '', options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function fetchTasks(filter = 'all') {
  return request(`?filter=${encodeURIComponent(filter)}`);
}

export function createTask(title) {
  return request('', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export function updateTask(id, updates) {
  return request(`/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export function reorderTasks(orderedIds) {
  return request('/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ orderedIds }),
  });
}

export function deleteTask(id) {
  return request(`/${id}`, {
    method: 'DELETE',
  });
}

export function bulkDeleteTasks(completedOnly = false) {
  return request(`?completedOnly=${completedOnly}`, {
    method: 'DELETE',
  });
}