# 🔧 Solution - Erreur de syntaxe SQL

## ❌ Problème

Vous rencontrez cette erreur lors de l'exécution de la migration :
```
ERROR: 42601: syntax error at end of input LINE 0: ^
```

---

## ✅ Solution

L'erreur survient parce que **Supabase SQL Editor nécessite d'exécuter les instructions une par une**, pas toutes en même temps.

---

## 📝 Instructions étape par étape

### **Option 1 : Script simplifié (RECOMMANDÉ)**

Exécutez ces **2 instructions séparément** :

#### **Étape 1 : Ajouter la colonne**

Copiez et collez cette instruction dans Supabase SQL Editor, puis cliquez sur **"Run"** :

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_fc NUMERIC;
```

✅ Attendez que cette instruction soit terminée avant de continuer.

#### **Étape 2 : Mettre à jour les produits existants**

Après l'étape 1, copiez et collez cette instruction, puis cliquez sur **"Run"** :

```sql
UPDATE products SET price_fc = price_ada * 2400 WHERE price_fc IS NULL;
```

✅ C'est tout ! La migration est terminée.

---

### **Option 2 : Instruction unique**

Si vous préférez, exécutez d'abord juste l'ajout de colonne :

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_fc NUMERIC;
```

La mise à jour des produits existants peut attendre - elle se fera automatiquement quand vous modifierez un produit.

---

## 🔍 Vérification

Pour vérifier que la colonne a été ajoutée, exécutez cette requête :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'price_fc';
```

Vous devriez voir :
```
column_name | data_type
price_fc    | numeric
```

---

## 💡 Pourquoi cette erreur ?

Supabase SQL Editor traite chaque requête individuellement. Quand vous avez plusieurs instructions SQL séparées par des points-virgules ou des lignes vides, il peut ne pas les interpréter correctement si vous les exécutez toutes en une fois.

**Solution** : Exécutez une instruction à la fois.

---

## ✅ Après la migration

1. Rechargez votre application (`F5`)
2. Essayez de modifier un produit
3. Le prix en FC devrait maintenant être sauvegardé correctement

---

**Exécutez les instructions une par une et le problème sera résolu ! 🚀**

