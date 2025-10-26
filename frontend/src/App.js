import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';

import MapPage from './pages/MapPage';
import AtlasHeader from './components/AtlasHeader';

function App() {
    return (
    <Router>
      <div className="App">
        <AtlasHeader />
        <MapPage />
      </div>
    </Router>
  );
}

export default App;
