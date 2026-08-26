import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTaskStore } from '../store/taskStore';
import { TaskItem } from './TaskItem';

export const TaskList: React.FC = () => {
  const { tasks, isLoading, error } = useTaskStore();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!isLoading && !error && tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found.</p>
      </div>
    );
  }

  const handleTaskClick = (taskId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('taskId', taskId);
    setSearchParams(newParams);
  };

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onClick={() => handleTaskClick(task.id)}
        />
      ))}
    </div>
  );
};
