import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function HeaderWithMap() {
  const location = useLocation();
  return (
    <header>
      <h1>🏙️ Urban Puzzle NSD</h1>
      <nav>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        <Link to="/data" className={location.pathname === '/data' ? 'active' : ''}>Data Management</Link>
        <Link to="/analysis" className={location.pathname === '/analysis' ? 'active' : ''}>Data Analysis</Link>
        <Link to="/map" className={location.pathname === '/map' ? 'active' : ''}>Map</Link>
      </nav>
    </header>
  );
}

export default HeaderWithMap;

