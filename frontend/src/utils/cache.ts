/**
 * Système de cache simple pour optimiser les requêtes fréquentes
 * Utilise localStorage pour la persistance et un cache en mémoire pour la vitesse
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes par défaut
  private readonly MAX_MEMORY_SIZE = 100; // Maximum 100 entrées en mémoire

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    // Vérifier le cache mémoire d'abord
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && Date.now() < memoryEntry.expiresAt) {
      return memoryEntry.data as T;
    }

    // Vérifier le localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (Date.now() < entry.expiresAt) {
          // Remettre en cache mémoire
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Expiré, supprimer
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (e) {
      console.warn('Erreur lors de la lecture du cache:', e);
    }

    return null;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const expiresAt = Date.now() + ttl;
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), expiresAt };

    // Stocker en mémoire
    if (this.memoryCache.size >= this.MAX_MEMORY_SIZE) {
      // Supprimer l'entrée la plus ancienne
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, entry);

    // Stocker dans localStorage (avec gestion d'erreur pour quota)
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (e) {
      // Quota dépassé, nettoyer les anciennes entrées
      this.cleanExpired();
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (e2) {
        console.warn('Impossible de stocker dans le cache localStorage:', e2);
      }
    }
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (e) {
      console.warn('Erreur lors de la suppression du cache:', e);
    }
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanExpired(): void {
    const now = Date.now();

    // Nettoyer le cache mémoire
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now >= entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }

    // Nettoyer le localStorage
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('cache_')) {
          try {
            const entry: CacheEntry<any> = JSON.parse(localStorage.getItem(key) || '{}');
            if (now >= entry.expiresAt) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Entrée corrompue, supprimer
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      console.warn('Erreur lors du nettoyage du cache:', e);
    }
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Erreur lors du vidage du cache:', e);
    }
  }

  /**
   * Récupère ou exécute une fonction avec cache
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

// Instance singleton
export const cache = new CacheService();

// Nettoyer le cache au démarrage
if (typeof window !== 'undefined') {
  cache.cleanExpired();
  // Nettoyer périodiquement (toutes les 10 minutes)
  setInterval(() => cache.cleanExpired(), 10 * 60 * 1000);
}


