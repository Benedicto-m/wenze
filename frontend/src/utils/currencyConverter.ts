// Taux de change FC vers ADA
// Taux de fallback si l'API n'est pas disponible
const FC_TO_ADA_RATE_FALLBACK = 2400; // 1 ADA = 2400 FC (fallback)

// Taux USD vers FC (Francs Congolais) - Fallback
const USD_TO_FC_RATE_FALLBACK = 2800; // 1 USD ≈ 2800 FC (approximatif, à ajuster)

/**
 * Récupère le taux USD vers FC depuis une API de taux de change
 */
async function fetchUSDToFCRate(): Promise<number> {
  try {
    // Utiliser exchangerate-api.com (gratuit, pas de clé API nécessaire pour usage basique)
    // Alternative: utiliser une autre API de taux de change
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error('Failed to fetch USD rate');
    }

    const data = await response.json();
    // Récupérer le taux USD vers CDF (Franc Congolais)
    const usdToCdfRate = data.rates?.CDF;
    
    if (usdToCdfRate && usdToCdfRate > 0) {
      return usdToCdfRate;
    }
    
    // Si pas de CDF, utiliser le fallback
    return USD_TO_FC_RATE_FALLBACK;
  } catch (error) {
    console.warn('Erreur lors de la récupération du taux USD/FC:', error);
    return USD_TO_FC_RATE_FALLBACK;
  }
}

export interface CurrencyConverter {
  fcToAda: (amountFC: number) => number;
  adaToFc: (amountADA: number) => number;
  getRate: () => number;
  setRate: (rate: number) => void;
  fetchRealTimeRate: () => Promise<void>;
  refreshRate: () => Promise<void>;
}

class CurrencyConverterService implements CurrencyConverter {
  private rate: number = FC_TO_ADA_RATE_FALLBACK;
  private lastFetchTime: number = 0;
  private fetching: boolean = false;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Essayer de charger le taux depuis localStorage
    const savedRate = localStorage.getItem('fc_to_ada_rate');
    const savedTime = localStorage.getItem('fc_to_ada_rate_time');
    
    if (savedRate) {
      const parsedRate = parseFloat(savedRate);
      const savedTimestamp = savedTime ? parseInt(savedTime) : 0;
      const now = Date.now();
      
      // Utiliser le taux sauvegardé s'il a moins de 5 minutes
      if (!isNaN(parsedRate) && parsedRate > 0 && (now - savedTimestamp) < this.CACHE_DURATION) {
        this.rate = parsedRate;
        this.lastFetchTime = savedTimestamp;
      }
    }
    
    // Récupérer le taux réel au démarrage
    this.fetchRealTimeRate();
  }

  /**
   * Récupère le taux de change réel depuis l'API
   */
  async fetchRealTimeRate(): Promise<void> {
    // Éviter les requêtes multiples simultanées
    if (this.fetching) return;
    
    // Vérifier si on a un taux récent en cache
    const now = Date.now();
    if (now - this.lastFetchTime < this.CACHE_DURATION) {
      return;
    }

    this.fetching = true;

    try {
      // 1. Récupérer le prix ADA en USD depuis CoinGecko
      const adaResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd',
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!adaResponse.ok) {
        throw new Error('Failed to fetch ADA price');
      }

      const adaData = await adaResponse.json();
      const adaPriceUSD = adaData.cardano?.usd;

      if (!adaPriceUSD || adaPriceUSD <= 0) {
        throw new Error('Invalid ADA price');
      }

      // 2. Récupérer le taux USD vers FC depuis l'API
      const usdToFcRate = await fetchUSDToFCRate();

      // 3. Calculer le taux ADA vers FC
      // Si 1 ADA = X USD et 1 USD = Y FC, alors 1 ADA = X * Y FC
      // Donc 1 FC = 1 / (X * Y) ADA
      // Pour avoir FC/ADA : X * Y
      const newRate = adaPriceUSD * usdToFcRate;

      if (newRate > 0) {
        this.rate = newRate;
        this.lastFetchTime = now;
        
        // Sauvegarder dans localStorage
        localStorage.setItem('fc_to_ada_rate', newRate.toString());
        localStorage.setItem('fc_to_ada_rate_time', now.toString());
        
        console.log('Taux de change mis à jour:', {
          adaPriceUSD,
          usdToFcRate,
          fcToAdaRate: newRate,
        });
      }
    } catch (error: any) {
      console.warn('Erreur lors de la récupération du taux de change:', error);
      // Utiliser le taux de fallback ou celui en cache
      if (this.rate === FC_TO_ADA_RATE_FALLBACK) {
        const savedRate = localStorage.getItem('fc_to_ada_rate');
        if (savedRate) {
          const parsedRate = parseFloat(savedRate);
          if (!isNaN(parsedRate) && parsedRate > 0) {
            this.rate = parsedRate;
          }
        }
      }
    } finally {
      this.fetching = false;
    }
  }

  /**
   * Force la mise à jour du taux de change
   */
  async refreshRate(): Promise<void> {
    this.lastFetchTime = 0; // Forcer le rafraîchissement
    await this.fetchRealTimeRate();
  }

  /**
   * Convertit FC en ADA
   */
  fcToAda(amountFC: number): number {
    if (isNaN(amountFC) || amountFC <= 0) return 0;
    const ada = amountFC / this.rate;
    // Arrondir à 2 décimales pour ADA
    return Math.round(ada * 100) / 100;
  }

  /**
   * Convertit ADA en FC
   */
  adaToFc(amountADA: number): number {
    if (isNaN(amountADA) || amountADA <= 0) return 0;
    const fc = amountADA * this.rate;
    // Arrondir à l'entier pour FC
    return Math.round(fc);
  }

  /**
   * Récupère le taux de change actuel
   */
  getRate(): number {
    return this.rate;
  }

  /**
   * Définit un nouveau taux de change
   */
  setRate(newRate: number): void {
    if (newRate > 0) {
      this.rate = newRate;
      localStorage.setItem('fc_to_ada_rate', newRate.toString());
    }
  }

  /**
   * Formate le prix en FC pour l'affichage
   */
  formatFC(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Formate le prix en ADA pour l'affichage
   */
  formatADA(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  }
}

// Instance singleton
export const currencyConverter = new CurrencyConverterService();

// Export des fonctions utilitaires
export const convertFCToADA = (fc: number) => currencyConverter.fcToAda(fc);
export const convertADAToFC = (ada: number) => currencyConverter.adaToFc(ada);
export const formatFC = (amount: number) => currencyConverter.formatFC(amount);
export const formatADA = (amount: number) => currencyConverter.formatADA(amount);
export const getExchangeRate = () => currencyConverter.getRate();
export const setExchangeRate = (rate: number) => currencyConverter.setRate(rate);
export const refreshExchangeRate = () => currencyConverter.refreshRate();

