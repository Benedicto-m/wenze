# 💱 Guide - Conversion FC/ADA en Temps Réel

## ✅ Système de conversion en temps réel implémenté

Le système récupère maintenant les **vrais taux de change** depuis les marchés financiers en temps réel, au lieu d'utiliser un taux fixe simulé.

---

## 🔄 Fonctionnement

### 1. **Récupération du taux ADA/USD**
- ✅ API utilisée : **CoinGecko** (gratuite, fiable)
- ✅ Récupère le prix actuel de Cardano (ADA) en USD
- ✅ Mise à jour automatique toutes les 5 minutes

### 2. **Récupération du taux USD/FC**
- ✅ API utilisée : **ExchangeRate-API** (gratuite)
- ✅ Récupère le taux USD vers CDF (Franc Congolais)
- ✅ Mise à jour automatique avec le taux ADA

### 3. **Calcul du taux ADA/FC**
```
Taux ADA/FC = (Prix ADA en USD) × (Taux USD vers FC)

Exemple:
- Si 1 ADA = 0.50 USD
- Et 1 USD = 2 800 FC
- Alors 1 ADA = 0.50 × 2 800 = 1 400 FC
```

---

## 📡 APIs utilisées

### CoinGecko (Crypto)
- **URL**: `https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd`
- **Gratuite**: Oui (sans clé API pour usage basique)
- **Limite**: ~50 requêtes/minute (largement suffisant)
- **Données**: Prix Cardano (ADA) en temps réel

### ExchangeRate-API (Fiat)
- **URL**: `https://api.exchangerate-api.com/v4/latest/USD`
- **Gratuite**: Oui (sans clé API)
- **Limite**: Pas de limite stricte pour usage basique
- **Données**: Taux de change USD vers toutes les devises (y compris CDF)

---

## 🎯 Avantages

1. ✅ **Taux réels** : Basé sur les marchés financiers actuels
2. ✅ **Mise à jour automatique** : Toutes les 5 minutes
3. ✅ **Cache intelligent** : Évite les requêtes inutiles
4. ✅ **Fallback** : Utilise un taux sauvegardé si l'API est indisponible
5. ✅ **Transparent** : Les utilisateurs voient le taux réel utilisé

---

## 🔧 Fonctionnement technique

### Cache et performance

- **Durée du cache** : 5 minutes
- **Stockage** : localStorage du navigateur
- **Rafraîchissement** : Automatique toutes les 5 minutes
- **Gestion d'erreurs** : Utilise le dernier taux connu si l'API échoue

### Processus de récupération

1. **Au démarrage** : Récupère le taux depuis les APIs
2. **En cache** : Utilise le taux sauvegardé s'il a moins de 5 minutes
3. **Rafraîchissement** : Met à jour automatiquement toutes les 5 minutes
4. **En cas d'erreur** : Utilise le dernier taux connu ou le taux de fallback

---

## 📊 Exemple de calcul

### Scénario réel :

1. **CoinGecko retourne** : 1 ADA = 0.485 USD
2. **ExchangeRate-API retourne** : 1 USD = 2 750 FC
3. **Calcul** : 1 ADA = 0.485 × 2 750 = **1 333.75 FC**

Donc, pour convertir :
- 12 000 FC → 12 000 / 1 333.75 = **9.00 ADA**
- 9.00 ADA → 9.00 × 1 333.75 = **12 000 FC**

---

## 🔍 Vérification du taux

### Dans la console du navigateur :

```javascript
// Vérifier le taux actuel
localStorage.getItem('fc_to_ada_rate')
// Exemple: "1333.75"

// Vérifier la dernière mise à jour
new Date(parseInt(localStorage.getItem('fc_to_ada_rate_time')))
// Exemple: Date de la dernière récupération
```

### Dans l'interface :

Le taux est affiché dans le formulaire de publication :
- Sous le champ de prix en FC
- Format : "Taux: 1 ADA = 1 333.75 FC"
- Badge : "Temps réel" (en vert, avec indicateur animé)

---

## ⚙️ Configuration

### Taux de fallback

Si les APIs sont indisponibles, le système utilise :
- **ADA/FC Fallback** : 2 400 FC (défini dans `currencyConverter.ts`)
- **USD/FC Fallback** : 2 800 FC (défini dans `currencyConverter.ts`)

### Modifier les taux de fallback

Dans `frontend/src/utils/currencyConverter.ts` :

```typescript
const FC_TO_ADA_RATE_FALLBACK = 2400; // Modifier ici
const USD_TO_FC_RATE_FALLBACK = 2800; // Modifier ici
```

---

## 🚨 Gestion des erreurs

### Si l'API CoinGecko échoue :
- ✅ Utilise le dernier taux ADA/USD connu
- ✅ Sinon, utilise le taux de fallback

### Si l'API ExchangeRate échoue :
- ✅ Utilise le dernier taux USD/FC connu
- ✅ Sinon, utilise le taux de fallback (2 800 FC)

### Si les deux APIs échouent :
- ✅ Utilise le dernier taux complet sauvegardé
- ✅ Sinon, utilise le taux de fallback complet

---

## 📝 Fichiers créés/modifiés

### ✅ Créés :
1. `frontend/src/utils/currencyConverter.ts` - Service de conversion avec API
2. `frontend/src/context/ExchangeRateContext.tsx` - Contexte React pour le taux
3. `GUIDE_CONVERSION_TEMPS_REEL.md` - Ce guide

### ✅ Modifiés :
1. `frontend/src/App.tsx` - Ajout du ExchangeRateProvider
2. `frontend/src/pages/CreateProduct.tsx` - Badge "Temps réel"
3. `frontend/src/pages/EditProduct.tsx` - Badge "Temps réel"

---

## 🔄 Cycle de vie du taux

```
Démarrage de l'app
    ↓
Vérifier localStorage (taux récent ?)
    ↓ OUI (moins de 5 min)
    Utiliser le taux en cache
    ↓
    Continuer...

    ↓ NON
    Récupérer depuis les APIs
    ↓
    CoinGecko (ADA/USD)
    ExchangeRate-API (USD/FC)
    ↓
    Calculer: ADA/FC = (ADA/USD) × (USD/FC)
    ↓
    Sauvegarder dans localStorage
    ↓
    Utiliser le nouveau taux
```

**Toutes les 5 minutes** :
- Rafraîchir automatiquement le taux
- Mettre à jour localStorage
- Mettre à jour l'affichage

---

## 🎨 Interface utilisateur

### Badge "Temps réel"

Un petit badge vert apparaît à côté du taux :
- **Indicateur animé** (point vert clignotant)
- **Texte** : "Temps réel"
- **Couleur** : Vert (indique que c'est à jour)

### Exemple d'affichage :

```
Prix (Francs Congolais)
[12 000] FC

📈 Équivalent en ADA: 9.00 ADA
Taux: 1 ADA = 1 333.75 FC  🟢 Temps réel
```

---

## ⚠️ Notes importantes

1. ✅ Les taux sont **mis à jour automatiquement** toutes les 5 minutes
2. ✅ Le taux est **mise en cache** pour éviter trop de requêtes
3. ✅ En cas d'erreur API, le système utilise un **taux de fallback**
4. ⚠️ Le taux USD/FC peut varier selon les sources (ExchangeRate-API vs marché local)
5. 💡 Pour plus de précision, vous pouvez intégrer une API locale de taux de change

---

## 🚀 Améliorations futures possibles

- [ ] Page d'administration pour configurer le taux USD/FC manuellement
- [ ] Intégration avec une API locale (ex: Banque Centrale du Congo)
- [ ] Historique des taux de change
- [ ] Notification quand le taux change significativement
- [ ] Graphique de l'évolution du taux

---

**Le système est maintenant connecté aux vraies données du marché ! 🎉**

