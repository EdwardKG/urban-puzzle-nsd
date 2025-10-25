import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  return (
    <header>
      <h1>🏙️ Urban Puzzle NSD</h1>
      <nav>
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
        >
          Home
        </Link>
        <Link 
          to="/data" 
          className={location.pathname === '/data' ? 'active' : ''}
        >
          Data Management
        </Link>
        <Link 
          to="/analysis" 
          className={location.pathname === '/analysis' ? 'active' : ''}
        >
          Data Analysis
        </Link>
      </nav>
    </header>
  );
}

export default Header;
