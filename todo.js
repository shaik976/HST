document.addEventListener('DOMContentLoaded', async () => {
    const todoList = document.getElementById('todo-list');

    // Fetch prioritized tasks from the backend
    async function fetchPrioritizedTasks() {
        try {
            const response = await fetch('http://127.0.0.1:5000/prioritize-tasks');
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return { prioritized_tasks: [] }; // Return an empty array if fetching fails
        }
    }

    // Determine the priority class based on the priority score
    function getPriorityClass(priorityScore) {
        if (priorityScore > 0.7) return 'high';
        if (priorityScore > 0.4) return 'medium';
        return 'low';
    }

    // Render the prioritized todo list
    async function renderTodoList() {
        todoList.innerHTML = ""; // Clear existing tasks

        const data = await fetchPrioritizedTasks();
        const tasks = data.prioritized_tasks;

        if (tasks.length === 0) {
            todoList.innerHTML = '<li>No tasks found. Add study sessions first!</li>';
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${getPriorityClass(task.priority)}`;
            
            li.innerHTML = `
                <div class="task-header">
                    <span class="subject">${task.subject}</span>
                    <span class="priority">${getPriorityClass(task.priority).toUpperCase()}</span>
                </div>
                <div class="task-details">
                    <span>📅 ${task.date}</span>
                    <span>⏰ ${task.timeFrom} - ${task.timeTo}</span>
                </div>
                <div class="task-meta">
                    <span>Priority Score: ${task.priority.toFixed(2)}</span>
                </div>
            `;

            todoList.appendChild(li);
        });
    }

    // Initial render
    renderTodoList();
});