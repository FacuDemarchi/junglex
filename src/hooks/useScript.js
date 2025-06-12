import { useState, useEffect } from 'react';

export const useScript = (src) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    const handleLoad = () => setStatus('ready');
    const handleError = () => setStatus('error');

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      document.body.removeChild(script);
    };
  }, [src]);

  return status;
}; 