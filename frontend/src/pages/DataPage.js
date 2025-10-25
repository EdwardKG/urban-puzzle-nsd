import React, { useState, useEffect } from 'react';
import { dataService } from '../services/api';
import DataItem from '../components/DataItem';
import DataForm from '../components/DataForm';

function DataPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dataService.getAll();
      setData(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const response = await dataService.create({
        ...formData,
        value: parseFloat(formData.value)
      });
      setMessage(response.message);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await dataService.delete(id);
      setMessage(response.message);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="card">
        <h1>Data Management</h1>
        <p>Create, view, and manage your data items</p>
      </div>

      {error && <div className="card error">Error: {error}</div>}
      {message && <div className="card success">{message}</div>}

      <div className="card">
        <h2>Create New Data</h2>
        <DataForm onSubmit={handleCreate} />
      </div>

      <div className="card">
        <h2>Data Items ({data.length})</h2>
        {data.length === 0 ? (
          <p>No data items yet. Create one above!</p>
        ) : (
          <div className="data-list">
            {data.map((item) => (
              <DataItem 
                key={item.id} 
                data={item} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DataPage;
