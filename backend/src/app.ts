import express from 'express';
import cors from 'cors';
import { taskRouter } from './routes/tasks';

export const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/tasks', taskRouter);
