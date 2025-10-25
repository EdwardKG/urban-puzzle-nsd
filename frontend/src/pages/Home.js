import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <div className="card">
        <h1>Welcome to Urban Puzzle NSD</h1>
        <p>
          A full-stack web application built with Node.js, React, and Python for data science and analysis.
        </p>
      </div>

      <div className="card">
        <h2>Features</h2>
        <ul>
          <li>✅ Node.js Express backend with MVC architecture</li>
          <li>✅ RESTful API with Swagger documentation</li>
          <li>✅ React frontend with modern hooks</li>
          <li>✅ Python data science service integration</li>
          <li>✅ Real-time data analysis and processing</li>
        </ul>
      </div>

      <div className="card">
        <h2>Quick Start</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Link to="/data">
            <button className="button">Manage Data</button>
          </Link>
          <Link to="/analysis">
            <button className="button">Analyze Data</button>
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>API Documentation</h2>
        <p>
          View the complete API documentation at:{' '}
          <a 
            href="http://localhost:5000/api-docs" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#007bff' }}
          >
            http://localhost:5000/api-docs
          </a>
        </p>
      </div>
    </div>
  );
}

export default Home;
