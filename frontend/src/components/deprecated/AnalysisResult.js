import React from 'react';

function AnalysisResult({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="analysis-result">
      <h3>Analysis Results</h3>
      
      <div className="stat-grid">
        <div className="stat-item">
          <label>Count</label>
          <value>{analysis.count}</value>
        </div>
        
        <div className="stat-item">
          <label>Mean</label>
          <value>{analysis.mean?.toFixed(2)}</value>
        </div>
        
        <div className="stat-item">
          <label>Median</label>
          <value>{analysis.median?.toFixed(2)}</value>
        </div>
        
        <div className="stat-item">
          <label>Std Dev</label>
          <value>{analysis.std?.toFixed(2)}</value>
        </div>
        
        <div className="stat-item">
          <label>Min</label>
          <value>{analysis.min?.toFixed(2)}</value>
        </div>
        
        <div className="stat-item">
          <label>Max</label>
          <value>{analysis.max?.toFixed(2)}</value>
        </div>
        
        <div className="stat-item">
          <label>Sum</label>
          <value>{analysis.sum?.toFixed(2)}</value>
        </div>
        
        <div className="stat-item">
          <label>Variance</label>
          <value>{analysis.variance?.toFixed(2)}</value>
        </div>
      </div>

      {analysis.quartiles && (
        <div style={{ marginTop: '20px' }}>
          <h4>Quartiles</h4>
          <div className="stat-grid">
            <div className="stat-item">
              <label>Q1 (25%)</label>
              <value>{analysis.quartiles.q1?.toFixed(2)}</value>
            </div>
            <div className="stat-item">
              <label>Q2 (50%)</label>
              <value>{analysis.quartiles.q2?.toFixed(2)}</value>
            </div>
            <div className="stat-item">
              <label>Q3 (75%)</label>
              <value>{analysis.quartiles.q3?.toFixed(2)}</value>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisResult;
