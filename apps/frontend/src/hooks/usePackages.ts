import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Package {
  id: string;
  total_price: number;
  currency: string;
  created_at: string;
  items_count: number;
}

interface UsePackagesReturn {
  packages: Package[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const usePackages = (): UsePackagesReturn => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ai/packages`);
      setPackages(response.data.packages || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch packages'));
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return { 
    packages, 
    loading, 
    error, 
    refetch: fetchPackages
  };
};