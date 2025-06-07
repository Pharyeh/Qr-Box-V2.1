const API_BASE = import.meta.env.MODE === 'development'
  ? ''
  : 'http://localhost:5001';

export default API_BASE; 