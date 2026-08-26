import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { tasks, resetStore, seedStore } from '../src/data/store';

describe('Tasks API', () => {
  beforeEach(() => {
    resetStore();
    process.env.UNRELIABLE_MODE = 'false'; // disable for tests
  });

  it('should return 409 Conflict when updating with a stale version', async () => {
    seedStore([
      {
        id: 'task-1',
        title: 'Original Title',
        status: 'todo',
        priority: 'medium',
        version: 5,
        updatedAt: new Date().toISOString()
      }
    ]);

    const res = await request(app)
      .put('/tasks/task-1')
      .send({
        title: 'New Title',
        version: 4 // Stale version
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('TASK_VERSION_CONFLICT');
    expect(res.body.task.version).toBe(5);
  });

  it('should update task and increment version when version matches', async () => {
    seedStore([
      {
        id: 'task-2',
        title: 'Original Title',
        status: 'todo',
        priority: 'medium',
        version: 5,
        updatedAt: new Date().toISOString()
      }
    ]);

    const res = await request(app)
      .put('/tasks/task-2')
      .send({
        title: 'New Title',
        version: 5
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New Title');
    expect(res.body.version).toBe(6);
  });
});
