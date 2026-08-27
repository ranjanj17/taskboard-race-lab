import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTaskStore } from '../store/taskStore';
import { TaskList } from './TaskList';
import { TaskDetailDrawer } from './TaskDetailDrawer';

export const TaskBoard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchTasks, isLoading, error, conflictTask, setConflictTask } = useTaskStore();
  
  const search = searchParams.get('search') || '';
  const [localSearch, setLocalSearch] = useState(search);
  
  const status = searchParams.get('status') || 'all';
  const priority = searchParams.get('priority') || 'all';
  const selectedTaskId = searchParams.get('taskId');
  const isCreating = searchParams.get('create') === 'true';

  // Sync local search if URL changes externally
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce logic for search
  useEffect(() => {
    // Prevent setting a timeout if the local search is already in sync with the URL
    if (localSearch === search) return;

    const timer = setTimeout(() => {
      setSearchParams((prevParams) => {
        const newParams = new URLSearchParams(prevParams);
        if (localSearch) {
          newParams.set('search', localSearch);
        } else {
          newParams.delete('search');
        }
        return newParams;
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, search, setSearchParams]);

  useEffect(() => {
    fetchTasks({ search, status, priority });
  }, [search, status, priority, fetchTasks]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value && e.target.value !== 'all') {
      newParams.set('status', e.target.value);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value && e.target.value !== 'all') {
      newParams.set('priority', e.target.value);
    } else {
      newParams.delete('priority');
    }
    setSearchParams(newParams);
  };

  const openCreateTask = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('create', 'true');
    setSearchParams(newParams);
  };

  const closeDrawer = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('create');
    newParams.delete('taskId');
    setSearchParams(newParams);
    setConflictTask(null);
  };

  return (
    <div className="taskboard">
      <header className="taskboard-header">
        <h1>Task Board</h1>
        <button onClick={openCreateTask} className="btn-primary">New Task</button>
      </header>

      {conflictTask && (
        <div className="conflict-alert">
          <strong>Conflict Detected:</strong> The task "{conflictTask.title}" was modified by another user.
          <button onClick={() => { setConflictTask(null); fetchTasks({ search, status, priority }); }}>Refresh Latest Data</button>
        </div>
      )}

      <div className="filters">
        <input 
          type="text" 
          placeholder="Search tasks..." 
          value={localSearch} 
          onChange={handleSearchChange}
          className="search-input"
        />
        
        <select value={status} onChange={handleStatusChange} className="filter-select">
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select value={priority} onChange={handlePriorityChange} className="filter-select">
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => fetchTasks({ search, status, priority })}>Retry</button>
        </div>
      )}

      {isLoading && <div className="loading-state">Loading tasks...</div>}

      <TaskList />

      {(selectedTaskId || isCreating) && (
        <TaskDetailDrawer 
          taskId={selectedTaskId} 
          onClose={closeDrawer} 
        />
      )}
    </div>
  );
};
