// apps.js
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const tasksList = document.getElementById('tasks');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');

// NEW: Select all filter buttons and their container
const filtersContainer = document.querySelector('.filters');
const filterButtons = document.querySelectorAll('.filter-btn');


let tasks = []; //{id, text, completed}
let currentFilter = 'all'; // NEW: Track the currently active filter ('all', 'active', 'completed')

// Load tasks from local storage
function loadTasks() {
    const data = localStorage.getItem('tasks');
    if(data){
        tasks = JSON.parse(data);
    }
}

// Save tasks to local storage
function saveTasks(){
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks to DOM
function renderTasks(){
    tasksList.innerHTML = ''; // clear

    // NEW: Filter the tasks array based on the active filter state before rendering
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
   
    // Check if the filtered list is empty
    if(filteredTasks.length === 0){
        tasksList.innerHTML = `<li class="task">There are no ${currentFilter === 'all' ? '' : currentFilter} tasks.</li>`;
        return;
    }

    // Render only the filtered set of tasks
    filteredTasks.forEach((task,index) => {      
        const li = document.createElement('li');
        li.className = task.completed? 'task completed': 'task';
        li.dataset.id = task.id;

        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.checked = task.completed;
        checkBox.className = 'toggle';

        const span = document.createElement('span');
        span.className = 'text';
        span.textContent = task.text;

         // Up Button
        const upBtn = document.createElement('button');
        upBtn.className = 'small order-btn move-up';
        upBtn.textContent = '▲';
        upBtn.setAttribute('aria-label', `Move task "${task.text}" up`); // FIXED: Added accessible label
        if (index === 0) upBtn.disabled = true; // Disable if first in the current view

          // Down Button
        const downBtn = document.createElement('button');
        downBtn.className = 'small order-btn move-down';
        downBtn.textContent = '▼';
        downBtn.setAttribute('aria-label', `Move task "${task.text}" down`); // FIXED: Added accessible label
        if (index === filteredTasks.length - 1) downBtn.disabled = true; // Disable if last in the current view

        const editBtn = document.createElement('button');
        editBtn.className = 'small edit';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('aria-label', `Edit task "${task.text}"`); // FIXED: Clarifies button target

        const delBtn = document.createElement('button');
        delBtn.className = 'small del';
        delBtn.textContent = 'Delete';
        delBtn.setAttribute('aria-label', `Delete task "${task.text}"`); // FIXED: Clarifies button target

        li.appendChild(checkBox);
        li.appendChild(span);
        li.appendChild(upBtn);
        li.appendChild(downBtn);
        li.appendChild(editBtn);
        li.appendChild(delBtn);

        tasksList.appendChild(li);
    });
}

// Utility to generate unique id
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Add task;
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = input.value.trim();
    
    if(!text) 
        return;

    const task = { 
        id: uid(), 
        text, 
        completed: false
    };

    tasks.unshift(task); // newest first;
    
    saveTasks();

    renderTasks();
    
    input.value = '';

    input.focus();
});

// Event delegation for task actions
tasksList.addEventListener('click', (e) => {
    const li = e.target.closest('li.task');

    if(!li)
        return;

    const id = li.dataset.id;

    if(e.target.matches('input.toggle')){
        // toggle complete
        tasks = tasks.map(t => t.id === id? {...t, completed: e.target.checked } : t);

        saveTasks();

        renderTasks();
    } else if(e.target.matches('button.del')){
        // delete
        tasks = tasks.filter(t => t.id !== id);

        saveTasks();

        renderTasks();
    } else if(e.target.matches('button.move-up')){
        // Reorder Up logic
        const index = tasks.findIndex(t => t.id === id);
        if (index > 0) {
            // Modern array swap
            [tasks[index], tasks[index - 1]] = [tasks[index - 1], tasks[index]];
            saveTasks();
            renderTasks();
        }

    } else if(e.target.matches('button.move-down')){
        // Reorder Down logic
        const index = tasks.findIndex(t => t.id === id);
        if (index < tasks.length - 1) {
            // Modern array swap
            [tasks[index], tasks[index + 1]] = [tasks[index + 1], tasks[index]];
            saveTasks();
            renderTasks();
        }

    } else if(e.target.matches('button.edit')){
        // edit: replace text with input, that is, replace span element with input element.
        const span = li.querySelector('.text');
        const oldText = span.textContent;
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = oldText;
        editInput.className = 'edit-input';
        span.replaceWith(editInput);
        editInput.focus();

        // Tracker flag to prevent Escape key from triggering the save flow on blur
        let isCancelling = false;

        editInput.addEventListener('blur', () => {
            // If Escape was pressed, skip saving completely!
            if (isCancelling) return;
            
            const newText = editInput.value.trim() || oldText;
            
            console.log('newText: ', newText);
            tasks = tasks.map(t => t.id === id? { ...t, text: newText } : t);
            
            saveTasks();

            renderTasks();
        });

        editInput.addEventListener('keydown', (ev) => {
            
            if(ev.key === 'Enter')
                editInput.blur();

            if(ev.key === 'Escape'){
                isCancelling = true; // Flag that we want to cancel before tearing down DOM
                renderTasks(); // cancel;
            }
        });
    }
});

// NEW: Event delegation layout for filter buttons switching
filtersContainer.addEventListener('click', (e) => {
    const clickedBtn = e.target.closest('.filter-btn');
    if (!clickedBtn) return;

    // 1. Update active styling class on buttons
    filterButtons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');

    // 2. Change the current active filter string value
    currentFilter = clickedBtn.dataset.filter;

    // 3. Trigger a re-render cycle to show filtered tasks
    renderTasks();
});

// Clear completed
clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    
    saveTasks();
    
    renderTasks();
});

// Clear all with confirmation
clearAllBtn.addEventListener('click', () => {
    if(confirm('Delete all tasks?')){
        tasks = [];
        saveTasks();
        renderTasks();
    }
});

// Initialization
loadTasks();

renderTasks();