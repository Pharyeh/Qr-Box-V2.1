import { useEffect } from 'react';

export default function useAutoRefresh(callback, delay = 5000) {
  useEffect(() => {
    callback(); // run once on mount
    const interval = setInterval(callback, delay);
    return () => clearInterval(interval); // cleanup
  }, [callback, delay]);
}
