import type { Task } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errorData.message || res.statusText, errorData);
  }
  return res.json();
}

export const api = {
  getTasks: async (params: { search?: string; status?: string; priority?: string }, signal?: AbortSignal): Promise<Task[]> => {
    const url = new URL(`${API_URL}/tasks`);
    if (params.search) url.searchParams.append('search', params.search);
    if (params.status) url.searchParams.append('status', params.status);
    if (params.priority) url.searchParams.append('priority', params.priority);

    const res = await fetch(url.toString(), { signal });
    return handleResponse(res);
  },
  
  createTask: async (task: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return handleResponse(res);
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  deleteTask: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(res.status, errorData.message || res.statusText, errorData);
    }
  },
};
