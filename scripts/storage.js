const STORAGE_KEY = "tasks";

export function loadTasks() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}