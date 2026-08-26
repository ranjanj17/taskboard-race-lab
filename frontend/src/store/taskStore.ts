import { create } from 'zustand';
import type { Task } from '../types';
import { api, ApiError } from '../api';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  conflictTask: Task | null; // For 409 resolution
  
  // State mutations
  setConflictTask: (task: Task | null) => void;
  
  // Async actions
  fetchTasks: (params: { search?: string; status?: string; priority?: string }) => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
}

let fetchController: AbortController | null = null;
let fetchSequence = 0;

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  conflictTask: null,
  
  setConflictTask: (task) => set({ conflictTask: task }),
  
  fetchTasks: async (params) => {
    // Increment sequence ID to track latest request
    const currentSeq = ++fetchSequence;
    
    // Abort previous in-flight request
    if (fetchController) {
      fetchController.abort();
    }
    
    fetchController = new AbortController();
    
    set({ isLoading: true, error: null });
    
    try {
      const data = await api.getTasks(params, fetchController.signal);
      
      // Prevent stale response from overwriting newer request
      if (currentSeq !== fetchSequence) {
        return; 
      }
      
      set({ tasks: data, isLoading: false });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Ignored, as it was intentionally aborted
        return;
      }
      if (currentSeq !== fetchSequence) {
        return;
      }
      set({ error: err.message || 'Failed to fetch tasks', isLoading: false });
    }
  },
  
  createTask: async (task) => {
    const newTask = await api.createTask(task);
    set((state) => ({
      tasks: [newTask, ...state.tasks]
    }));
  },
  
  updateTask: async (id, updates) => {
    const { tasks } = get();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    
    const originalTask = tasks[taskIndex];
    
    // Optimistic Update
    const optimisticTask = { ...originalTask, ...updates };
    set({
      tasks: tasks.map(t => t.id === id ? optimisticTask : t)
    });
    
    try {
      // Must send current version from original task
      const updatedTask = await api.updateTask(id, { ...updates, version: originalTask.version });
      
      // Reconcile with server response (which has new version and updatedAt)
      set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t)
      }));
    } catch (err: any) {
      // Rollback on failure
      set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? originalTask : t)
      }));
      
      if (err instanceof ApiError && err.status === 409) {
        // Handle conflict
        set({ conflictTask: err.data.task });
      }
      throw err;
    }
  }
}));
