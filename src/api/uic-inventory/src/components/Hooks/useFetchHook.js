import ky from 'ky';
import { useCallback, useEffect, useState } from 'react';

export function useFetch(url, options, ready = true) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const stringOptions = JSON.stringify(options);

  const fetchAsync = useCallback(async () => {
    setStatus('loading');
    try {
      const json = await ky(url, JSON.parse(stringOptions)).json();
      console.info(json);

      setData(json);
      setStatus('success');
    } catch (error) {
      console.error('useFetch', error);

      setError(error);
      setStatus('error');
    }
  }, [url, stringOptions]);

  useEffect(() => {
    if (ready) {
      fetchAsync();
    }
  }, [url, stringOptions, ready, fetchAsync]);

  return { status, data, error, refetch: fetchAsync };
}

export function useManualFetch() {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchAsync = async (url, options) => {
    setStatus('loading');
    try {
      const json = await ky(url, options).json();

      setData(json);
      console.info(json);
      setStatus('success');
    } catch (error) {
      console.error('useManualFetch', error);
      setError(error);
      setStatus('error');
    }
  };

  return [fetchAsync, { status, data, error }];
}
