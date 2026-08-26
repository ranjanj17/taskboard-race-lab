import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskBoard } from './components/TaskBoard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TaskBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
