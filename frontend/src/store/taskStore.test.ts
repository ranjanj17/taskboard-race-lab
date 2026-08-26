import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaskStore } from './taskStore';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    data?: any;
    constructor(status: number, message: string, data?: any) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }
}));

describe('taskStore - Race conditions and Optimistic Updates', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [], isLoading: false, error: null, conflictTask: null });
    vi.clearAllMocks();
  });

  it('Async/Race-related test: prevents older request from overwriting newer request', async () => {
    const { fetchTasks } = useTaskStore.getState();

    let resolveReq1: any;
    let resolveReq2: any;
    
    // req1 takes longer to resolve
    vi.mocked(api.getTasks).mockImplementationOnce(() => new Promise(resolve => { resolveReq1 = resolve; }));
    // req2 resolves quickly
    vi.mocked(api.getTasks).mockImplementationOnce(() => new Promise(resolve => { resolveReq2 = resolve; }));

    // Start req1
    const p1 = fetchTasks({ search: 'a' });
    // Start req2
    const p2 = fetchTasks({ search: 'ab' });

    // Resolve req2 first
    resolveReq2([{ id: '2', title: 'ab task', status: 'todo', priority: 'low', version: 1 }]);
    await p2;

    expect(useTaskStore.getState().tasks[0].title).toBe('ab task');

    // Resolve req1 later
    resolveReq1([{ id: '1', title: 'a task', status: 'todo', priority: 'low', version: 1 }]);
    await p1;

    // The state should still contain req2's data, req1's data should be ignored due to sequence tracking
    expect(useTaskStore.getState().tasks[0].title).toBe('ab task');
  });

  it('Failure/edge case test: optimistic rollback on 500 error', async () => {
    // Setup initial state
    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Task', status: 'todo', priority: 'medium', version: 1, updatedAt: '' }]
    });

    const { updateTask } = useTaskStore.getState();

    // Mock API to throw 500
    vi.mocked(api.updateTask).mockRejectedValueOnce(new Error('Simulated 500 error'));

    // Trigger update
    const updatePromise = updateTask('1', { status: 'done' });

    // Synchronously, the state should be optimistically updated
    expect(useTaskStore.getState().tasks[0].status).toBe('done');

    // Wait for failure
    await expect(updatePromise).rejects.toThrow('Simulated 500 error');

    // State should be rolled back to original
    expect(useTaskStore.getState().tasks[0].status).toBe('todo');
  });
});
