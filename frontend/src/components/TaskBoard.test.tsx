import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskBoard } from './TaskBoard';
import { BrowserRouter } from 'react-router-dom';
import { useTaskStore } from '../store/taskStore';

// Mock the store so we don't hit real APIs in the UI tests
vi.mock('../store/taskStore', () => ({
  useTaskStore: vi.fn()
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('TaskBoard UI', () => {
  beforeEach(() => {
    vi.mocked(useTaskStore).mockReturnValue({
      tasks: [
        { id: '1', title: 'Test Task 1', status: 'todo', priority: 'high', version: 1, updatedAt: '' },
        { id: '2', title: 'Test Task 2', status: 'done', priority: 'low', version: 1, updatedAt: '' }
      ],
      isLoading: false,
      error: null,
      fetchTasks: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      conflictTask: null,
      setConflictTask: vi.fn()
    });
  });

  it('renders the task list correctly', () => {
    renderWithRouter(<TaskBoard />);
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  it('calls fetchTasks when search input changes', () => {
    const fetchTasksMock = vi.fn();
    vi.mocked(useTaskStore).mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
      fetchTasks: fetchTasksMock,
      createTask: vi.fn(),
      updateTask: vi.fn(),
      conflictTask: null,
      setConflictTask: vi.fn()
    });

    renderWithRouter(<TaskBoard />);
    
    // Initial fetch from useEffect
    expect(fetchTasksMock).toHaveBeenCalledTimes(1);

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'abc' } });

    // The component updates search params, which triggers useEffect again
    expect(fetchTasksMock).toHaveBeenCalledTimes(2);
  });
});
