import React, { useState } from 'react';
import { pythonService } from '../services/api';
import AnalysisResult from '../components/AnalysisResult';

function AnalysisPage() {
  const [input, setInput] = useState('1, 2, 3, 4, 5, 6, 7, 8, 9, 10');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Parse input string to array of numbers
      const dataArray = input
        .split(',')
        .map(item => parseFloat(item.trim()))
        .filter(num => !isNaN(num));
      
      if (dataArray.length === 0) {
        setError('Please enter valid numbers separated by commas');
        return;
      }

      const response = await pythonService.analyze(dataArray);
      setAnalysis(response.analysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h1>Data Analysis</h1>
        <p>Analyze numerical data using Python data science service</p>
      </div>

      {error && <div className="card error">Error: {error}</div>}

      <div className="card">
        <h2>Input Data</h2>
        <form onSubmit={handleAnalyze}>
          <label htmlFor="data-input">
            Enter numbers separated by commas:
          </label>
          <textarea
            id="data-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="1, 2, 3, 4, 5"
            rows="4"
            disabled={loading}
          />
          
          <button 
            type="submit" 
            className="button" 
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze Data'}
          </button>
        </form>
      </div>

      {analysis && (
        <div className="card">
          <AnalysisResult analysis={analysis} />
        </div>
      )}

      <div className="card">
        <h3>About This Analysis</h3>
        <p>
          This analysis is performed by a Python Flask service that uses NumPy and Pandas 
          for statistical computations. The service calculates various statistical measures 
          including mean, median, standard deviation, variance, quartiles, and more.
        </p>
      </div>
    </div>
  );
}

export default AnalysisPage;
