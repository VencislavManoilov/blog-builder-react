import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './components/Admin/AdminPanel';
import Showfile from './components/Showfile';

const isAuthenticated = () => {
  return true;
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Showfile />} />
        
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App;