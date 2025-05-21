import React, { JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Loginform/loginform';
import SignUpForm from './components/Signup/signup';
import Chats from './components/Chats/chats';


// Protected Route component to check if user is logged in
const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const userInfo = localStorage.getItem('user');
  return userInfo ? element : <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route 
            path="/chats" 
            element={<ProtectedRoute element={<Chats />} />} 
          />
          {/* Redirect any unknown paths to login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;