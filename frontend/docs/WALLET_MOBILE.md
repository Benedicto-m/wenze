# Guide de Connexion Wallet Mobile - Cardano

## Vue d'ensemble

Ce document explique comment fonctionne la connexion wallet Cardano sur mobile Android et les limitations actuelles.

## Architecture

L'application utilise un **Wallet Connector** unifié qui s'adapte automatiquement selon l'appareil :

- **Desktop** : Connexion via **CIP-30** (extensions navigateur)
- **Mobile** : Connexion via **WalletConnect v2** ou **CIP-45** (deeplink + QR code)

## Fonctionnement

### Détection automatique

Le système détecte automatiquement :
- Le type d'appareil (mobile/desktop)
- Les wallets disponibles (injectés sur desktop)
- La méthode de connexion recommandée

### Desktop (CIP-30)

1. Détection des extensions wallet installées (`window.cardano.*`)
2. Liste des wallets disponibles (Nami, Eternl, Lace, etc.)
3. Connexion directe via l'API CIP-30
4. Pas de QR code nécessaire

### Mobile (WalletConnect v2 / CIP-45)

1. Génération d'une URI WalletConnect pour pairing
2. Tentative d'ouverture du wallet via deeplink (`eternl://wc?uri=...`)
3. Si le deeplink échoue, affichage d'un QR code
4. L'utilisateur scanne le QR code avec son wallet mobile
5. Le wallet s'ouvre et demande l'approbation
6. Retour automatique à l'application après approbation

## Wallets supportés

### Desktop
- Nami
- Eternl
- Lace
- Flint
- Vespr
- Yoroi

### Mobile
- **Eternl** (recommandé)
- Nami (si support WalletConnect)

## Limitations actuelles

### WalletConnect v2

⚠️ **L'implémentation WalletConnect v2 est partielle** pour les raisons suivantes :

1. **SDK WalletConnect** : Le SDK officiel WalletConnect pour Cardano n'est pas encore complètement mature
2. **Bridge WalletConnect** : Nécessite un serveur bridge pour la communication P2P
3. **Session management** : La gestion des sessions nécessite une infrastructure supplémentaire

### Solution actuelle

Pour le moment, le système :
- ✅ Génère une URI WalletConnect
- ✅ Tente d'ouvrir le wallet via deeplink
- ✅ Affiche un QR code en fallback
- ⚠️ **Mais ne gère pas encore la session complète**

### CIP-45 / CardanoConnect

CIP-45 est une alternative proposée pour Cardano, mais :
- Pas de bibliothèque officielle stable disponible
- Nécessite une implémentation custom
- Moins de support de la part des wallets

## Comment tester avec Eternl Mobile

### Prérequis

1. Installer **Eternl** sur votre appareil Android
2. Créer ou importer un wallet dans Eternl
3. S'assurer que le wallet est déverrouillé

### Étapes de test

1. **Ouvrir l'application** sur Android Chrome
2. **Cliquer sur "Connecter Wallet"**
3. **Sélectionner "Eternl"** dans la liste
4. **Deux scénarios possibles** :
   - **Scénario A (deeplink réussi)** :
     - Eternl s'ouvre automatiquement
     - Approuver la connexion
     - Retour automatique à l'application
   - **Scénario B (deeplink échoué)** :
     - Un QR code s'affiche
     - Ouvrir Eternl manuellement
     - Scanner le QR code depuis Eternl
     - Approuver la connexion

### Dépannage

**Le deeplink ne fonctionne pas ?**
- Vérifier que Eternl est installé
- Essayer de scanner le QR code manuellement
- Vérifier les permissions du navigateur

**Le QR code ne s'affiche pas ?**
- Vérifier la console pour les erreurs
- Activer le mode debug : `VITE_DEBUG_WALLET=true`

**La connexion échoue ?**
- Vérifier que le wallet est déverrouillé
- Vérifier la connexion internet
- Vérifier les logs en mode debug

## Mode Debug

Pour activer les logs détaillés :

```bash
# Dans .env ou .env.local
VITE_DEBUG_WALLET=true
```

Les logs apparaîtront dans la console du navigateur avec le préfixe `[Wallet Connector]`.

## Améliorations futures

1. **Intégration complète WalletConnect v2**
   - Utiliser `@walletconnect/core` officiel
   - Implémenter le bridge WalletConnect
   - Gérer les sessions persistantes

2. **Support CIP-45**
   - Implémenter le protocole P2P
   - Créer une bibliothèque légère si nécessaire

3. **Support iOS**
   - Adapter les deeplinks pour iOS
   - Gérer les restrictions iOS

4. **Reconnexion automatique**
   - Persister les sessions WalletConnect
   - Reconnecter automatiquement au chargement

## Structure du code

```
frontend/src/wallet/connector/
├── types.ts          # Types et interfaces
├── detect.ts         # Détection device et wallets
├── cip30.ts          # Implémentation CIP-30 (desktop)
├── mobile.ts         # Implémentation mobile (WalletConnect/CIP-45)
└── index.ts          # API publique unifiée
```

## Références

- [CIP-30 Specification](https://cips.cardano.org/cips/cip30/)
- [WalletConnect v2 Docs](https://docs.walletconnect.com/)
- [CIP-45 Proposal](https://github.com/cardano-foundation/CIPs/pull/XXX) (en cours)

## Support

Pour toute question ou problème :
1. Vérifier les logs en mode debug
2. Consulter la documentation des wallets
3. Vérifier les issues GitHub du projet

