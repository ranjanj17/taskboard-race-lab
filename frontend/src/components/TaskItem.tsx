import React from 'react';
import type { Task } from '../types';
import { useTaskStore } from '../store/taskStore';

interface TaskItemProps {
  task: Task;
  onClick: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onClick }) => {
  const { updateTask } = useTaskStore();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    updateTask(task.id, { status: e.target.value as Task['status'] }).catch(console.error);
  };

  return (
    <div className="task-item">
      <div className="task-header">
        <h3>{task.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`priority-badge priority-${task.priority}`}>
            {task.priority}
          </span>
          <button 
            className="icon-btn-edit" 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            title="Edit Task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="task-footer">
        <select 
          value={task.status} 
          onChange={handleStatusChange} 
          onClick={e => e.stopPropagation()}
          className="status-select"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {task.assignee && <span className="assignee">👤 {task.assignee}</span>}
      </div>
    </div>
  );
};
