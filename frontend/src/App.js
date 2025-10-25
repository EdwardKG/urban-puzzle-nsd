import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';


import Home from './pages/Home';
import DataPage from './pages/DataPage';
import AnalysisPage from './pages/AnalysisPage';
import MapPage from './pages/MapPage';
import HeaderWithMap from "./components/HeaderWithMap";

function App() {
    return (
    <Router>
      <div className="App">
        <HeaderWithMap />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
