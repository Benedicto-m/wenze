/**
 * Hook pour optimiser les requêtes Supabase avec cache
 */

import { useState, useEffect, useCallback } from 'react';
import { cache } from '../utils/cache';

interface UseOptimizedQueryOptions {
  cacheKey: string;
  ttl?: number; // Time to live en millisecondes
  enabled?: boolean; // Si false, ne pas exécuter la requête
}

export function useOptimizedQuery<T>(
  queryFn: () => Promise<T>,
  options: UseOptimizedQueryOptions
) {
  const { cacheKey, ttl = 5 * 60 * 1000, enabled = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Essayer de récupérer depuis le cache
      const cached = cache.get<T>(cacheKey);
      if (cached !== null) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Exécuter la requête
      const result = await queryFn();
      
      // Mettre en cache et mettre à jour l'état
      cache.set(cacheKey, result, ttl);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      console.error('Erreur dans useOptimizedQuery:', error);
    } finally {
      setLoading(false);
    }
  }, [queryFn, cacheKey, ttl, enabled]);

  const refetch = useCallback(() => {
    cache.delete(cacheKey);
    fetchData();
  }, [cacheKey, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}


