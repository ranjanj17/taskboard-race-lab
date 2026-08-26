export type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;
  version: number;
  updatedAt: string;
};

export let tasks: Task[] = [
  {
    id: "t1",
    title: "Implement Authentication Flow",
    status: "todo",
    priority: "high",
    assignee: "Alice",
    version: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: "t2",
    title: "Design New Landing Page",
    status: "in_progress",
    priority: "medium",
    assignee: "Bob",
    version: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: "t3",
    title: "Fix Memory Leak in Dashboard",
    status: "done",
    priority: "high",
    assignee: "Charlie",
    version: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: "t4",
    title: "Update API Documentation",
    status: "todo",
    priority: "low",
    version: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: "t5",
    title: "Optimize Database Queries",
    status: "in_progress",
    priority: "medium",
    assignee: "Alice",
    version: 1,
    updatedAt: new Date().toISOString()
  }
];

// Helper to reset store for tests
export const resetStore = () => {
  tasks = [];
};

export const seedStore = (initialTasks: Task[]) => {
  tasks = [...initialTasks];
};
