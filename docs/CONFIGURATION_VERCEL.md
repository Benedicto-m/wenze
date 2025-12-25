# Configuration des Variables d'Environnement sur Vercel

Ce document explique comment configurer les variables d'environnement nécessaires pour déployer l'application WENZE sur Vercel.

## Variables d'Environnement Requises

### Frontend (Variables VITE_*)

Les variables préfixées par `VITE_` sont exposées côté client et sont nécessaires pour le fonctionnement de l'application.

#### 1. Blockfrost API Key (Testnet)

**Variable:** `VITE_BLOCKFROST_PROJECT_ID`

**Description:** Clé API Blockfrost pour le réseau testnet Cardano (Preprod). Cette clé est nécessaire pour que Lucid puisse interagir avec la blockchain Cardano.

**Comment l'obtenir:**
1. Créez un compte sur [Blockfrost.io](https://blockfrost.io/)
2. Allez dans votre dashboard
3. Créez un nouveau projet pour le réseau **Preprod Testnet**
4. Copiez le **Project ID** (commence par `preprod...` ou `testnet...`)

**Exemple:** `preprod1234567890abcdefghijklmnopqrstuvwxyz`

#### 2. Blockfrost API Key (Mainnet) - Optionnel

**Variable:** `VITE_BLOCKFROST_MAINNET_PROJECT_ID`

**Description:** Clé API Blockfrost pour le réseau mainnet Cardano. Nécessaire uniquement si vous utilisez le mainnet.

**Comment l'obtenir:**
1. Dans votre dashboard Blockfrost
2. Créez un nouveau projet pour le réseau **Mainnet**
3. Copiez le **Project ID** (commence par `mainnet...`)

### Backend (Variables sans préfixe VITE_)

Ces variables sont utilisées côté serveur et ne sont pas exposées au client.

#### 1. Supabase URL

**Variable:** `SUPABASE_URL`

**Description:** URL de votre projet Supabase.

**Exemple:** `https://xxxxxxxxxxxxx.supabase.co`

#### 2. Supabase Key

**Variable:** `SUPABASE_KEY`

**Description:** Clé API Supabase (anon key ou service role key selon vos besoins).

## Configuration sur Vercel

### Méthode 1: Via l'Interface Web Vercel

1. **Accédez à votre projet sur Vercel**
   - Connectez-vous à [vercel.com](https://vercel.com)
   - Sélectionnez votre projet WENZE

2. **Ouvrez les paramètres**
   - Cliquez sur **Settings** dans le menu du projet
   - Allez dans **Environment Variables**

3. **Ajoutez les variables**
   - Cliquez sur **Add New**
   - Entrez le nom de la variable (ex: `VITE_BLOCKFROST_PROJECT_ID`)
   - Entrez la valeur de la variable
   - **IMPORTANT:** Sélectionnez les environnements où la variable doit être disponible:
     - ✅ **Production** (pour le déploiement en production)
     - ✅ **Preview** (pour les preview deployments)
     - ✅ **Development** (pour les déploiements de développement)
   - Cliquez sur **Save**

4. **Répétez pour toutes les variables nécessaires**

5. **Redéployez l'application**
   - Les variables d'environnement sont injectées au moment du build
   - Vous devez redéployer pour que les nouvelles variables soient prises en compte
   - Allez dans **Deployments** et cliquez sur **Redeploy** sur le dernier déploiement

### Méthode 2: Via Vercel CLI

```bash
# Installer Vercel CLI si ce n'est pas déjà fait
npm i -g vercel

# Se connecter à Vercel
vercel login

# Ajouter une variable d'environnement
vercel env add VITE_BLOCKFROST_PROJECT_ID

# Sélectionner les environnements (Production, Preview, Development)
# Entrer la valeur quand demandé

# Répéter pour toutes les variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
# etc.

# Redéployer
vercel --prod
```

## Vérification

Après avoir configuré les variables et redéployé:

1. **Vérifiez les logs de build**
   - Allez dans **Deployments** > Sélectionnez le dernier déploiement > **Build Logs**
   - Vérifiez qu'il n'y a pas d'erreurs liées aux variables manquantes

2. **Testez l'application**
   - Ouvrez l'application déployée
   - Connectez un wallet Cardano
   - Essayez d'effectuer une transaction
   - Si vous voyez encore l'erreur "Blockfrost n'est pas configuré", vérifiez:
     - Que les variables sont bien définies pour **Production**
     - Que vous avez bien redéployé après avoir ajouté les variables
     - Que les noms des variables sont exactement corrects (sensible à la casse)

## Dépannage

### Erreur: "Blockfrost n'est pas configuré"

**Causes possibles:**
- La variable `VITE_BLOCKFROST_PROJECT_ID` n'est pas définie sur Vercel
- La variable n'est pas définie pour l'environnement Production
- L'application n'a pas été redéployée après l'ajout de la variable
- Le nom de la variable est incorrect (vérifiez la casse)

**Solution:**
1. Vérifiez que la variable existe dans Vercel > Settings > Environment Variables
2. Assurez-vous qu'elle est activée pour **Production**
3. Redéployez l'application

### Erreur: "Cannot convert undefined to a BigInt" ou Erreur 403

**Causes possibles:**
- La clé API Blockfrost est invalide ou expirée
- La clé API n'a pas les bonnes permissions
- La clé API est pour le mauvais réseau (testnet vs mainnet)

**Solution:**
1. Vérifiez que votre clé API Blockfrost est valide dans le dashboard Blockfrost
2. Vérifiez que vous utilisez la bonne clé pour le bon réseau:
   - `VITE_BLOCKFROST_PROJECT_ID` pour testnet (Preprod)
   - `VITE_BLOCKFROST_MAINNET_PROJECT_ID` pour mainnet
3. Créez une nouvelle clé API si nécessaire

### Les variables fonctionnent en local mais pas sur Vercel

**Causes possibles:**
- Les variables sont dans un fichier `.env.local` qui n'est pas déployé (normal)
- Les variables ne sont pas définies sur Vercel
- Les variables ne sont pas définies pour l'environnement Production

**Solution:**
- Les fichiers `.env` locaux ne sont jamais déployés sur Vercel (c'est une bonne pratique de sécurité)
- Vous devez configurer les variables directement sur Vercel comme expliqué ci-dessus

## Sécurité

⚠️ **Important:**
- Les variables préfixées par `VITE_` sont **exposées côté client** et visibles dans le code JavaScript compilé
- Ne mettez **jamais** de secrets sensibles dans les variables `VITE_*`
- Les clés API Blockfrost sont conçues pour être utilisées côté client, mais limitez leurs permissions dans Blockfrost
- Pour les secrets sensibles (comme les clés Supabase service role), utilisez des variables sans préfixe `VITE_` et accédez-y uniquement côté serveur

## Ressources

- [Documentation Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Blockfrost Documentation](https://docs.blockfrost.io/)
- [Supabase Documentation](https://supabase.com/docs)


