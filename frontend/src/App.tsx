import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import { DiagnoseProvider } from './context/DiagnoseContext';

function App() {
  return (
    <DiagnoseProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/result/:module" element={<ResultPage />} />
          {/* 默认跳转到basic模块 */}
          <Route path="/result" element={<Navigate to="/result/basic" replace />} />
        </Routes>
      </Router>
    </DiagnoseProvider>
  );
}
export default App;
