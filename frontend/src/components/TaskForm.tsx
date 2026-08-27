import React, { useState } from 'react';
import type { Task } from '../types';
import { useTaskStore } from '../store/taskStore';

interface TaskFormProps {
  task?: Task;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSuccess, onCancel }) => {
  const { createTask, updateTask } = useTaskStore();
  const [title, setTitle] = useState(task?.title || '');
  const [status, setStatus] = useState<Task['status']>(task?.status || 'todo');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [assignee, setAssignee] = useState(task?.assignee || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (task) {
        await updateTask(task.id, { title, status, priority, assignee: assignee || undefined });
      } else {
        await createTask({ title, status, priority, assignee: assignee || undefined });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value as Task['status'])} disabled={isSubmitting}>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="form-group">
        <label>Priority</label>
        <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} disabled={isSubmitting}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="form-group">
        <label>Assignee</label>
        <input 
          list="assignee-list" 
          value={assignee} 
          onChange={e => setAssignee(e.target.value)} 
          disabled={isSubmitting}
          placeholder="Select or type a name..."
        />
        <datalist id="assignee-list">
          <option value="Alice" />
          <option value="Bob" />
          <option value="Charlie" />
          <option value="David" />
        </datalist>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting || !title.trim()} className="btn-primary">
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};
