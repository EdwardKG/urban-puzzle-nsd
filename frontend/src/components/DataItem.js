import React from 'react';

function DataItem({ data, onDelete }) {
  return (
    <div className="data-item">
      <div>
        <h3>{data.name}</h3>
        <p>Value: {data.value}</p>
        {data.description && <p>{data.description}</p>}
      </div>
      <button 
        className="button" 
        onClick={() => onDelete(data.id)}
        style={{ backgroundColor: '#dc3545' }}
      >
        Delete
      </button>
    </div>
  );
}

export default DataItem;
