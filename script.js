document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const taskInput = document.getElementById('new-task');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const totalTasksSpan = document.getElementById('total-tasks');
    
    // Variáveis
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Inicializar aplicação
    function init() {
        renderTasks();
        updateTaskStats();
        
        // Event Listeners
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
    }
    
    // Adicionar nova tarefa
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        updateTaskStats();
        
        taskInput.value = '';
        taskInput.focus();
    }
    
    // Renderizar tarefas
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = currentFilter === 'all' 
                ? 'Nenhuma tarefa adicionada ainda.' 
                : currentFilter === 'pending' 
                    ? 'Nenhuma tarefa pendente.' 
                    : 'Nenhuma tarefa concluída.';
            emptyMessage.classList.add('empty-message');
            taskList.appendChild(emptyMessage);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn" title="Editar tarefa"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="Excluir tarefa"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
            
            // Adicionar event listeners para os elementos recém-criados
            const checkbox = taskItem.querySelector('.task-checkbox');
            const editBtn = taskItem.querySelector('.edit-btn');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            const taskText = taskItem.querySelector('.task-text');
            
            checkbox.addEventListener('change', function() {
                toggleTaskCompletion(task.id, this.checked);
            });
            
            editBtn.addEventListener('click', function() {
                editTask(task.id, taskText);
            });
            
            deleteBtn.addEventListener('click', function() {
                deleteTask(task.id);
            });
        });
    }
    
    // Alternar estado de conclusão da tarefa
    function toggleTaskCompletion(id, completed) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed } : task
        );
        saveTasks();
        updateTaskStats();
    }
    
    // Editar tarefa
    function editTask(id, taskTextElement) {
        const currentText = taskTextElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input');
        
        taskTextElement.replaceWith(input);
        input.focus();
        
        function saveEdit() {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                tasks = tasks.map(task => 
                    task.id === id ? { ...task, text: newText } : task
                );
                saveTasks();
            }
            
            // Restaurar o texto (editado ou não)
            taskTextElement.textContent = newText || currentText;
            input.replaceWith(taskTextElement);
            
            // Remover event listeners
            input.removeEventListener('blur', saveEdit);
            input.removeEventListener('keypress', handleKeyPress);
        }
        
        function handleKeyPress(e) {
            if (e.key === 'Enter') {
                saveEdit();
            }
        }
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', handleKeyPress);
    }
    
    // Excluir tarefa
    function deleteTask(id) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateTaskStats();
        }
    }
    
    // Limpar tarefas concluídas
    function clearCompletedTasks() {
        if (confirm('Tem certeza que deseja limpar todas as tarefas concluídas?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
            updateTaskStats();
        }
    }
    
    // Atualizar estatísticas
    function updateTaskStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        
        totalTasksSpan.textContent = `${totalTasks} ${totalTasks === 1 ? 'tarefa' : 'tarefas'} (${completedTasks} concluída${completedTasks !== 1 ? 's' : ''})`;
    }
    
    // Salvar tarefas no localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Inicializar
    init();
});