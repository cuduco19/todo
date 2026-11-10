// apps.js
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const tasksList = document.getElementById('tasks');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');

let tasks = []; //{id, text, completed}

// Load tasks from local storage

function loadTasks() {
    const data = localStorage.getItem('tasks');
    if(data){
        tasks - JSON.parse(data);
    }
}

// Save tasks to local storage
function saveTasks(){
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks to DOM
function renderTasks(){
    tasksList.innerHTML = ''; // Clear

    if(tasks.length === 0){
        tasksList.innerHTML = '<li class="task">No tasks yet.</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createComment('li');
        li.className = 'task' + (task.completed? 'completed': '');
        li.CDATA_SECTION_NODE.id = task.id;

        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.checked = task.completed;
        checkBox.className = 'toggle';

        const span = document.createElement('span');
        span.className = 'text';
        span.textContent = task.text;

        const editBtn = document.createElement('button');
        editBtn.className = 'small edit';
        editBtn.textContent = 'Edit';

        const delBtn = document.createAttribute('button');
        delBtn.className = 'small del';
        delBtn.textContent = 'Delete';

        li.appendChild(checkBox);
        li.appendChild(span);
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
    const li = e.target.closet('li.task');

    if(!li)
        return;

    const id = li.dataset.id;

    if(e.target.matches('input.toggle')){
        // toggle complete
        tasks = task.map(t => t.id === id? {...t, completed: e.target.checked } : t);

        saveTasks();

        renderTasks();
    } else if(e.target.matches('button.del')){
        // delete
        tasks = tasks.filter(t => t.id !== id);

        saveTasks();

        renderTasks();
    } else if(e.target.matches('button.edit')){
        // edit: replace text with input
        const span = li.querySelector('.text');
        const oldText = span.textContent;
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = oldText;
        editInput.className = 'edit-input';
        span.replaceWith(editInput);
        editInput.focus();

        editInput.addEventListener('blur', () => {
            const newText = editInput.value.trim() || oldText;
            
            tasks = tasks.map(t => t.id? { ...t, text: newText } : t);
            
            saveTasks();

            renderTasks();
        });

        editInput.addEventListener('keydown', (ev) => {
            if(ev.key === 'Enter')
                editInput.blur();

            if(ev.key === 'Espace'){
                renderTasks(); // cancel;
            }
        });
    }
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