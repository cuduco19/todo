function createTaskElement(task, index, totalCount) {
    const li = document.createElement("li");
    li.className = task.completed ? "task completed" : "task";
    li.dataset.id = task.id;

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.checked = task.completed;
    checkBox.className = "toggle";

    const span = document.createElement("span");
    span.className = "text";
    span.textContent = task.text;

    const upBtn = document.createElement("button");
    upBtn.className = "small order-btn move-up";
    upBtn.textContent = "▲";
    upBtn.setAttribute("aria-label", `Move task "${task.text}" up`);
    if (index === 0) upBtn.disabled = true;

    const downBtn = document.createElement("button");
    downBtn.className = "small order-btn move-down";
    downBtn.textContent = "▼";
    downBtn.setAttribute("aria-label", `Move task "${task.text}" down`);
    if (index === totalCount - 1) downBtn.disabled = true;

    const editBtn = document.createElement("button");
    editBtn.className = "small edit";
    editBtn.textContent = "Edit";
    editBtn.setAttribute("aria-label", `Edit task "${task.text}"`);

    const delBtn = document.createElement("button");
    delBtn.className = "small del";
    delBtn.textContent = "Delete";
    delBtn.setAttribute("aria-label", `Delete task "${task.text}"`);

    li.append(checkBox, span, upBtn, downBtn, editBtn, delBtn);
    return li;
}

function updateTaskElement(li, task, index, totalCount) {
    const expectedClass = task.completed ? "task completed" : "task";
    if (li.className !== expectedClass) {
        li.className = expectedClass;
    }

    const checkBox = li.querySelector("input.toggle");
    if (checkBox && checkBox.checked !== task.completed) {
        checkBox.checked = task.completed;
    }

    const span = li.querySelector(".text");
    if (span && span.textContent !== task.text) {
        span.textContent = task.text;
    }

    const upBtn = li.querySelector(".move-up");
    if (upBtn) upBtn.disabled = index === 0;

    const downBtn = li.querySelector(".move-down");
    if (downBtn) downBtn.disabled = index === totalCount - 1;
}

export function renderTasks(tasksList, tasks, currentFilter) {
    const startTime = performance.now();

    let filteredTasks = tasks;
    if (currentFilter === "active") {
        filteredTasks = tasks.filter((task) => !task.completed);
    } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter((task) => task.completed);
    }

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `<li class="task">There are no ${currentFilter === "all" ? "" : currentFilter} tasks.</li>`;
        return;
    }

    if (tasksList.children.length === 1 && !tasksList.children[0].dataset.id) {
        tasksList.innerHTML = "";
    }

    const existingNodesMap = new Map();
    Array.from(tasksList.children).forEach((node) => {
        if (node.dataset.id) {
            existingNodesMap.set(node.dataset.id, node);
        }
    });

    filteredTasks.forEach((task, index) => {
        const existingNode = existingNodesMap.get(task.id);
        const expectedNextNode = tasksList.children[index];

        if (existingNode) {
            updateTaskElement(existingNode, task, index, filteredTasks.length);
            if (existingNode !== expectedNextNode) {
                tasksList.insertBefore(existingNode, expectedNextNode || null);
            }
        } else {
            const newNode = createTaskElement(task, index, filteredTasks.length);
            tasksList.insertBefore(newNode, expectedNextNode || null);
        }
    });

    const filteredIds = new Set(filteredTasks.map((t) => t.id));
    existingNodesMap.forEach((node, id) => {
        if (!filteredIds.has(id)) {
            node.remove();
        }
    });

    const endTime = performance.now();
    // console.log(`Render time for ${filteredTasks.length} tasks: ${(endTime - startTime).toFixed(4)} ms`);
}