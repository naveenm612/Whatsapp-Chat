import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatbot from './components/chats';

const App: React.FC = () => {
  return (
    <Router>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Chatbot />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;