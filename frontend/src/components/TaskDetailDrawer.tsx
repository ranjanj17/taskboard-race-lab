import React from 'react';
import { useTaskStore } from '../store/taskStore';
import { TaskForm } from './TaskForm';

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ taskId, onClose }) => {
  const { tasks } = useTaskStore();
  const task = taskId ? tasks.find(t => t.id === taskId) : undefined;
  const isCreating = taskId === null;

  if (!isCreating && !task) {
    return (
      <div className="drawer-overlay" onClick={onClose}>
        <div className="drawer" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h2>Task Not Found</h2>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
          <p>The selected task could not be found. It may have been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>{isCreating ? 'Create Task' : 'Edit Task'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        {!isCreating && task && (
          <div className="task-metadata">
            <small>Version: {task.version}</small>
            <br />
            <small>Last Updated: {new Date(task.updatedAt).toLocaleString()}</small>
          </div>
        )}

        <div className="drawer-content">
          <TaskForm 
            task={task} 
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
