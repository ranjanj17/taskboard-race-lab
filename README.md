# taskboard-race-lab

A small React + TypeScript task management application built for a take-home assignment, focusing on race conditions, concurrency handling, and error states.

## Setup

1. Install dependencies from the root directory:
   ```bash
   npm run install:all
   ```
   *(This installs packages for both the backend and frontend).*

## Run

To run both the backend and frontend concurrently:
```bash
npm run dev
```

Alternatively, you can run them separately:
- **Run Backend**: `npm run dev:backend`
- **Run Frontend**: `npm run dev:frontend`

## Tests

To run the full test suite (frontend UI/Async tests + backend API tests):
```bash
npm run test
```

## Project Architecture

- **Frontend (`frontend/`)**: Vite, React, TypeScript, and Zustand for state management. Uses `react-router-dom` to maintain URL search parameters (search, status, priority filters). The components are kept simple, using plain CSS for styling without any heavy libraries.
- **Backend (`backend/`)**: Node.js, Express, and TypeScript. Contains an in-memory data store for `Task` entities. Includes a custom middleware to simulate unreliable network conditions.
- **State Management**: `Zustand` is used for managing tasks, loading, error, and conflict states. 
- **Tests (`tests/`)**: Vitest is used across both the frontend and backend. React Testing Library is used for testing React components, and Supertest is used for backend API routes. Tests are located in `backend/tests/` and `frontend/src/store/` & `frontend/src/components/`.

## Unreliable API Mode

The backend utilizes an unreliable middleware (`backend/src/middleware/unreliable.ts`) which is enabled by default.
- Adds random latency between **100ms and 1800ms** to every request.
- Has a **10% chance** of randomly returning an HTTP 500 error on any request.
- *To configure*: You can set the `UNRELIABLE_MODE=false` environment variable when running the backend to disable it.

## Concurrency Strategy

- **Stale Request Protection**: The frontend search requests use an `AbortController` coupled with sequence IDs. If rapid searching occurs (`a` -> `ab` -> `abc`), the previous fetch requests are aborted. If an aborted request manages to complete (or if the abort signal is ignored by a mock API), the sequence ID check prevents the older response from overwriting the newer state.
- **Versioning (409 Conflicts)**: Every task has a `version` field. When updating a task, the frontend sends the current version. The backend compares this. If the server version is newer, it rejects the update with a `409 Conflict`.
- **Optimistic Updates**: Task updates (like changing status) are performed optimistically in the frontend UI (`Zustand` state is updated immediately).
- **Rollback on Failure**: If the optimistic update fails (e.g., due to the random 500 error or a 409 conflict), the UI instantly rolls back to its original state and displays the error/conflict.
- **Duplicate Mutation Handling**: The UI disables form submission buttons while an update or creation is in-flight to prevent duplicate clicking. In a real-world scenario, we'd also implement an idempotency key header for mutations, but UI disablement is the primary layer here.

---

## Assignment Questions

### 1. How do you prevent stale responses from updating the UI?
I use a combination of an `AbortController` and a sequence ID (a simple incrementing counter) within the Zustand store (`fetchTasks`). Before initiating a new fetch, the previous `AbortController` is triggered. Additionally, before updating the state with the fetched data, we verify if the current request's sequence ID matches the latest sequence ID. If it doesn't, the response is discarded.

### 2. How do you detect conflicting task edits?
I implemented Optimistic Concurrency Control using a `version` field on the `Task` model. Whenever a client modifies a task, it sends its known `version` in the payload. The Express backend verifies this version against the current version in memory. If they differ, the backend returns a `409 Conflict` status, and the frontend prompts the user to refresh their state.

### 3. What do you do if a mutation succeeds but the client times out?
If the client times out but the backend mutation succeeds, the client's optimistic update would eventually be rolled back (since the client considers it a failed promise), which causes a temporary UI inconsistency. The next time the user fetches the list or interacts with the item, the true server state would overwrite the local state. In a production system, mutations should use an idempotency key (like a unique Request-ID) so the client can safely retry the exact same mutation without fear of duplicating an action (like a status change or payment).

### 4. Which state belongs in the URL, server cache, and local component state?
- **URL State**: Filtering logic (`search`, `status`, `priority`) and high-level navigation (like which task is open in a detail drawer using `taskId`). This makes the view shareable and survives page reloads.
- **Server Cache (Zustand State)**: The list of `Task` objects, which is a cache of the backend's data. This includes the global loading and error states for fetching.
- **Local Component State**: Ephemeral UI states, like form inputs (title, selected status in the edit form), and the `isSubmitting` flag for a specific button.

### 5. What would fail first if this list had 100,000 tasks?
If the list had 100,000 tasks, the first failure point would be **rendering (DOM overload)** on the frontend. React would freeze attempting to render 100,000 DOM nodes simultaneously. Following closely behind would be the **network payload** (fetching a huge JSON array).
*Improvements:* We would need to implement server-side pagination (or cursor pagination), and frontend virtualization (e.g., `react-window`) to only render visible items.

### 6. What shortcut did you intentionally take?
I used a simple array in memory for the backend instead of a real database (like PostgreSQL or MongoDB) to keep the project strictly within the 3-4 hour scope. I also used predefined string assignments instead of an actual user/auth infrastructure, and used plain CSS instead of setting up a robust design system.
