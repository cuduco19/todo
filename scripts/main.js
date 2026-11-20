import { loadTasks, saveTasks, uid } from "./storage.js";
import { renderTasks } from "./dom.js";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const tasksList = document.getElementById("tasks");
const clearCompletedBtn = document.getElementById("clear-completed");
const clearAllBtn = document.getElementById("clear-all");
const filtersContainer = document.querySelector(".filters");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = loadTasks();
let currentFilter = "all";

function sync() {
    saveTasks(tasks);
    renderTasks(tasksList, tasks, currentFilter);
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    tasks.unshift({
        id: uid(),
        text,
        completed: false,
    });

    sync();
    input.value = "";
    input.focus();
});

tasksList.addEventListener("click", (e) => {
    const li = e.target.closest("li.task");
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.matches("input.toggle")) {
        tasks = tasks.map((t) => (t.id === id ? { ...t, completed: e.target.checked } : t));
        sync();
    } else if (e.target.matches("button.del")) {
        tasks = tasks.filter((t) => t.id !== id);
        sync();
    } else if (e.target.matches("button.move-up")) {
        const index = tasks.findIndex((t) => t.id === id);
        if (index > 0) {
            [tasks[index], tasks[index - 1]] = [tasks[index - 1], tasks[index]];
            sync();
        }
    } else if (e.target.matches("button.move-down")) {
        const index = tasks.findIndex((t) => t.id === id);
        if (index < tasks.length - 1) {
            [tasks[index], tasks[index + 1]] = [tasks[index + 1], tasks[index]];
            sync();
        }
    } else if (e.target.matches("button.edit")) {
        const span = li.querySelector(".text");
        if (!span) return;

        const oldText = span.textContent;
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = oldText;
        editInput.className = "edit-input";
        span.replaceWith(editInput);
        editInput.focus();

        let isCancelling = false;

        editInput.addEventListener("blur", () => {
            if (isCancelling) return;
            const newText = editInput.value.trim() || oldText;
            tasks = tasks.map((t) => (t.id === id ? { ...t, text: newText } : t));
            sync();
        });

        editInput.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") editInput.blur();
            if (ev.key === "Escape") {
                isCancelling = true;
                renderTasks(tasksList, tasks, currentFilter);
            }
        });
    }
});

filtersContainer.addEventListener("click", (e) => {
    const clickedBtn = e.target.closest(".filter-btn");
    if (!clickedBtn) return;

    filterButtons.forEach((btn) => btn.classList.remove("active"));
    clickedBtn.classList.add("active");

    currentFilter = clickedBtn.dataset.filter;
    renderTasks(tasksList, tasks, currentFilter);
});

clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter((t) => !t.completed);
    sync();
});

clearAllBtn.addEventListener("click", () => {
    if (confirm("Delete all tasks?")) {
        tasks = [];
        sync();
    }
});

// Initial render
renderTasks(tasksList, tasks, currentFilter);