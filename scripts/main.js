import {
  fetchTasks,
  createTask,
  updateTask,
  reorderTasks,
  deleteTask,
  bulkDeleteTasks,
} from './storage.js';
import { renderTasks } from './render.js';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksList = document.getElementById('tasks');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');
const filtersContainer = document.querySelector('.filters');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadingStatus = document.getElementById('loading-status');

let tasks = [];
let currentFilter = 'all';

async function loadAndRender() {
  let wakeTimer;

  if (loadingStatus) {
    loadingStatus.textContent = 'Loading tasks…';
    loadingStatus.hidden = false;
    wakeTimer = setTimeout(() => {
      loadingStatus.textContent = 'Waking up free-tier server (may take ~30–50s on first visit)…';
    }, 3000);
  }

  try {
    tasks = await fetchTasks('all');
    if (loadingStatus) loadingStatus.hidden = true;
    renderTasks(tasksList, tasks, currentFilter);
  } catch (err) {
    console.error('Failed to load tasks:', err);
    if (loadingStatus) loadingStatus.hidden = true;
    tasksList.innerHTML = '<li class="task">Unable to connect to the task server.</li>';
  } finally {
    clearTimeout(wakeTimer);
  }
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  taskInput.disabled = true;
  try {
    const created = await createTask(text);
    tasks.unshift(created);
    renderTasks(tasksList, tasks, currentFilter);
    taskInput.value = '';
  } catch (err) {
    console.error('Failed to create task:', err);
    alert('Could not save task. Please try again.');
  } finally {
    taskInput.disabled = false;
    taskInput.focus();
  }
});

tasksList.addEventListener('click', async (e) => {
  const taskItem = e.target.closest('li.task');
  if (!taskItem) return;
  const id = taskItem.dataset.id;

  if (e.target.matches('input.toggle')) {
    const isCompleted = e.target.checked;
    const previous = [...tasks];
    tasks = tasks.map((t) => (t.id === id ? { ...t, completed: isCompleted } : t));
    renderTasks(tasksList, tasks, currentFilter);

    try {
      await updateTask(id, { isCompleted });
    } catch (err) {
      console.error('Failed to toggle task:', err);
      tasks = previous;
      renderTasks(tasksList, tasks, currentFilter);
    }
  } else if (e.target.matches('button.del')) {
    const previous = [...tasks];
    tasks = tasks.filter((t) => t.id !== id);
    renderTasks(tasksList, tasks, currentFilter);

    try {
      await deleteTask(id);
    } catch (err) {
      console.error('Failed to delete task:', err);
      tasks = previous;
      renderTasks(tasksList, tasks, currentFilter);
    }
  } else if (e.target.matches('button.move-up') || e.target.matches('button.move-down')) {
    const index = tasks.findIndex((t) => t.id === id);
    const swapIndex = e.target.matches('button.move-up') ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= tasks.length) return;

    const previous = [...tasks];
    [tasks[index], tasks[swapIndex]] = [tasks[swapIndex], tasks[index]];
    renderTasks(tasksList, tasks, currentFilter);

    try {
      await reorderTasks(tasks.map((t) => t.id));
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
      tasks = previous;
      renderTasks(tasksList, tasks, currentFilter);
    }
  } else if (e.target.matches('button.edit')) {
    const textSpan = taskItem.querySelector('.text');
    if (!textSpan) return;
    const originalText = textSpan.textContent;
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = originalText;
    editInput.className = 'edit-input';
    textSpan.replaceWith(editInput);
    editInput.focus();

    let canceled = false;
    editInput.addEventListener('blur', async () => {
      if (canceled) return;
      const updatedText = editInput.value.trim() || originalText;
      if (updatedText === originalText) {
        renderTasks(tasksList, tasks, currentFilter);
        return;
      }

      const previous = [...tasks];
      tasks = tasks.map((t) => (t.id === id ? { ...t, text: updatedText } : t));
      renderTasks(tasksList, tasks, currentFilter);

      try {
        await updateTask(id, { title: updatedText });
      } catch (err) {
        console.error('Failed to edit task:', err);
        tasks = previous;
        renderTasks(tasksList, tasks, currentFilter);
      }
    });

    editInput.addEventListener('keydown', (keyEvent) => {
      if (keyEvent.key === 'Enter') editInput.blur();
      if (keyEvent.key === 'Escape') {
        canceled = true;
        renderTasks(tasksList, tasks, currentFilter);
      }
    });
  }
});

filtersContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  filterButtons.forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  renderTasks(tasksList, tasks, currentFilter);
});

clearCompletedBtn.addEventListener('click', async () => {
  const previous = [...tasks];
  tasks = tasks.filter((t) => !t.completed);
  renderTasks(tasksList, tasks, currentFilter);

  try {
    await bulkDeleteTasks(true);
  } catch (err) {
    console.error('Failed to clear completed tasks:', err);
    tasks = previous;
    renderTasks(tasksList, tasks, currentFilter);
  }
});

clearAllBtn.addEventListener('click', async () => {
  if (!confirm('Delete all tasks?')) return;
  const previous = [...tasks];
  tasks = [];
  renderTasks(tasksList, tasks, currentFilter);

  try {
    await bulkDeleteTasks(false);
  } catch (err) {
    console.error('Failed to clear all tasks:', err);
    tasks = previous;
    renderTasks(tasksList, tasks, currentFilter);
  }
});

loadAndRender();