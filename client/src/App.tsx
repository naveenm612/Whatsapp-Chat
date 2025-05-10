import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatbot from './components/Chats/chats';
import LoginForm from './components/Loginform/loginform';
import SignUpForm from './components/Signup/signup';

const App: React.FC = () => {
  return (
    <Router>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/chats" element={<Chatbot />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;