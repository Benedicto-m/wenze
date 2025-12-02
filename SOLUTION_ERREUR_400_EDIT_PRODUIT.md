# 🔧 Solution - Erreur 400 lors de la modification d'un produit

## ❌ Problème

Vous rencontrez une erreur 400 lors de la modification d'un produit avec le message :
```
Erreur: Impossible de modifier le produit.
Failed to load resource: the server responded with a status of 400
```

---

## 🔍 Causes possibles

### 1. **Colonne `price_fc` manquante** (le plus probable)
La colonne `price_fc` n'existe pas encore dans votre base de données. Le code essaie de mettre à jour cette colonne, mais elle n'existe pas.

### 2. **Format de données invalide**
Certaines valeurs ne respectent pas les contraintes de la base de données.

### 3. **Contrainte de validation**
Une contrainte de validation dans Supabase rejette les données.

---

## ✅ Solution

### **Étape 1 : Exécuter la migration SQL**

La colonne `price_fc` doit être ajoutée à votre table `products`. Suivez ces étapes :

1. **Ouvrez votre projet Supabase**
   - Allez sur [https://supabase.com](https://supabase.com)
   - Connectez-vous et sélectionnez votre projet

2. **Accédez à l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur **"SQL Editor"**
   - Cliquez sur **"New query"**

3. **Exécutez la migration (IMPORTANT : une instruction à la fois)**

   **ÉTAPE 1 : Ajouter la colonne**
   - Copiez et collez cette instruction :
   ```sql
   ALTER TABLE products ADD COLUMN IF NOT EXISTS price_fc NUMERIC;
   ```
   - Cliquez sur **"Run"** ou appuyez sur `Ctrl + Enter`
   - ✅ Attendez que cette instruction soit terminée

   **ÉTAPE 2 : Mettre à jour les produits existants**
   - Après l'étape 1, copiez et collez cette instruction :
   ```sql
   UPDATE products SET price_fc = price_ada * 2400 WHERE price_fc IS NULL;
   ```
   - Cliquez sur **"Run"**
   - ✅ C'est terminé !

   ⚠️ **IMPORTANT** : Exécutez chaque instruction **séparément**. Ne copiez pas toutes les instructions en même temps.

---

### **Étape 2 : Vérifier que la colonne existe**

Pour vérifier que la colonne a été ajoutée, exécutez cette requête :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name = 'price_fc';
```

Vous devriez voir :
```
column_name | data_type | is_nullable
price_fc    | numeric   | YES
```

---

### **Étape 3 : Recharger l'application**

1. Rechargez votre application dans le navigateur (`F5` ou `Ctrl + R`)
2. Essayez de modifier un produit à nouveau

---

## 🔧 Améliorations apportées

Le code a été amélioré pour :

1. ✅ **Gestion d'erreurs améliorée**
   - Affiche maintenant un message d'erreur détaillé
   - Indique si c'est un problème de colonne manquante

2. ✅ **Gestion de `price_fc` optionnelle**
   - Le code vérifie si `price_fc` existe avant de l'inclure dans la mise à jour
   - Si la colonne n'existe pas, elle est simplement ignorée

3. ✅ **Nettoyage des valeurs null**
   - Les champs non utilisés sont explicitement mis à `null`
   - Évite les conflits avec les contraintes de base de données

---

## 📝 Messages d'erreur améliorés

Maintenant, si une erreur survient, vous verrez un message plus précis :

### Si la colonne `price_fc` manque :
```
Erreur: La colonne price_fc n'existe pas encore. 
Veuillez exécuter la migration SQL: supabase/migrations/add_price_fc_column.sql
```

### Si c'est une autre erreur :
```
Erreur: [détails de l'erreur spécifique]
```

---

## 🔍 Vérification supplémentaire

Si le problème persiste après avoir exécuté la migration :

### 1. Vérifier les contraintes de la table

```sql
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'products';
```

### 2. Vérifier les logs Supabase

1. Allez dans **"Logs"** dans le menu Supabase
2. Filtrez par **"Postgres Logs"**
3. Cherchez les erreurs récentes liées à la table `products`

### 3. Vérifier les RLS Policies

Assurez-vous que vous avez les permissions pour mettre à jour vos propres produits :

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'products' 
AND policyname LIKE '%update%';
```

---

## 🚨 Si le problème persiste

1. **Vérifiez la console du navigateur**
   - Ouvrez les outils de développement (`F12`)
   - Allez dans l'onglet **"Console"**
   - Cherchez les erreurs détaillées

2. **Vérifiez les données envoyées**
   - Dans l'onglet **"Network"** des outils de développement
   - Cherchez la requête vers `/rest/v1/products`
   - Vérifiez les données envoyées dans le payload

3. **Contactez le support**
   - Si aucune solution ne fonctionne, vérifiez les logs Supabase
   - Prenez note du message d'erreur exact

---

## ✅ Vérification finale

Après avoir exécuté la migration, vous devriez pouvoir :

1. ✅ Modifier un produit sans erreur
2. ✅ Changer le prix en FC
3. ✅ Voir le prix en ADA mis à jour en temps réel
4. ✅ Sauvegarder les modifications

---

**Après avoir exécuté la migration SQL, le problème devrait être résolu ! 🎉**

