// src/hooks/useML.js
import { useState, useEffect } from 'react';

const API_BASE = 'https://case-api-icfc.onrender.com';

export const useMLAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/ml/analyze`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  return { data, loading, error };
};

export const useMLPredict = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = async (tipo, localDoCaso) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/ml/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipo, localDoCaso })
      });
      
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { predict, loading, error };
};