# Instructions pour mettre à jour Aiken

## Problème actuel

- **Version installée** : `aiken v1.0.29-alpha+16fb02e` (version alpha)
- **Problème** : Incompatible avec les stdlibs récentes (v2.0.0, v3.0.0, main)
- **Erreur** : Parser errors dans la stdlib lors de la compilation

## Solution : Mettre à jour Aiken

### Option 1 : Mise à jour via Cargo (Recommandé)

Si Rust/Cargo est installé :

```bash
# Mettre à jour Aiken vers la dernière version stable
cargo install --force aiken

# Vérifier la version installée
aiken --version
```

**Versions stables recommandées** :
- `v1.1.x` ou `v1.2.x` (versions stables récentes)
- Éviter les versions `alpha` ou `beta`

### Option 2 : Installation depuis les releases GitHub

1. Aller sur https://github.com/aiken-lang/aiken/releases
2. Télécharger la dernière version stable (pas alpha/beta)
3. Extraire et ajouter au PATH

### Option 3 : Utiliser Aiken via Nix (si disponible)

```bash
nix-env -iA aiken
```

## Après la mise à jour

1. Mettre à jour `aiken.toml` :
```toml
compiler = "v1.1.21"  # ou la version installée
```

2. Mettre à jour la stdlib dans `aiken.toml` :
```toml
[[dependencies]]
name = "aiken-lang/stdlib"
version = "v3.0.0"  # Compatible avec Aiken v1.1.x+
source = "github"
```

3. Nettoyer et recompiler :
```bash
cd frontend/contracts/escrow
rm -rf build  # ou Remove-Item -Recurse -Force build sur Windows
aiken build
```

## Vérification

Après la mise à jour, le contrat devrait compiler sans erreurs de parser.

## Note

Si Rust/Cargo n'est pas installé, vous pouvez :
1. Installer Rust depuis https://rustup.rs/
2. Puis installer Aiken avec `cargo install aiken`

