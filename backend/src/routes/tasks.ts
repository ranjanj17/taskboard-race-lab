import { Router } from 'express';
import { tasks, Task } from '../data/store';
import { unreliableMiddleware } from '../middleware/unreliable';

export const taskRouter = Router();

taskRouter.use(unreliableMiddleware);

// GET /tasks
taskRouter.get('/', (req, res) => {
  const { search, status, priority } = req.query;
  
  let filteredTasks = [...tasks];
  
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    filteredTasks = filteredTasks.filter(t => t.title.toLowerCase().includes(s));
  }
  
  if (status && typeof status === 'string' && status !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.status === status);
  }
  
  if (priority && typeof priority === 'string' && priority !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.priority === priority);
  }
  
  // Sort by updatedAt descending
  filteredTasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  res.json(filteredTasks);
});

// GET /tasks/:id
taskRouter.get('/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Task not found' });
  }
  res.json(task);
});

// POST /tasks
taskRouter.post('/', (req, res) => {
  const { title, status, priority, assignee } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Title is required' });
  }
  
  const newTask: Task = {
    id: `task-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    title,
    status: status || 'todo',
    priority: priority || 'medium',
    assignee,
    version: 1,
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id
taskRouter.put('/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Task not found' });
  }
  
  const currentTask = tasks[taskIndex]!;
  const { title, status, priority, assignee, version } = req.body;
  
  // Version conflict check
  if (version !== undefined && version !== currentTask.version) {
    return res.status(409).json({
      error: 'TASK_VERSION_CONFLICT',
      message: 'Task was modified by another client',
      task: currentTask
    });
  }
  
  const updatedTask: Task = {
    ...currentTask,
    title: title !== undefined ? title : currentTask.title,
    status: status !== undefined ? status : currentTask.status,
    priority: priority !== undefined ? priority : currentTask.priority,
    assignee: assignee !== undefined ? assignee : currentTask.assignee,
    version: currentTask.version + 1,
    updatedAt: new Date().toISOString()
  };
  
  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

// DELETE /tasks/:id
taskRouter.delete('/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Task not found' });
  }
  
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});
