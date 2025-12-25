import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface KnowledgeEntry {
  keywords: string[];
  content: string;
  category: string;
}

// Base de connaissances Cardano étendue avec sujets complexes
const cardanoKnowledgeBase: Record<string, KnowledgeEntry[]> = {
  fr: [
    {
      keywords: ['cardano', 'blockchain', 'troisième génération', '3ème génération'],
      category: 'général',
      content: 'Cardano est une blockchain de troisième génération fondée par Charles Hoskinson, co-fondateur d\'Ethereum. Elle utilise la preuve d\'enjeu (Proof of Stake) via Ouroboros pour une consommation d\'énergie réduite (~0.001% d\'Ethereum), une meilleure scalabilité et une sécurité mathématiquement prouvée. Cardano se distingue par son approche scientifique rigoureuse, avec peer-review de toutes ses recherches.'
    },
    {
      keywords: ['ada', 'cryptomonnaie', 'monnaie', 'lovelace'],
      category: 'ada',
      content: 'ADA est la cryptomonnaie native de Cardano, nommée d\'après Ada Lovelace, considérée comme la première programmeuse informatique. 1 ADA = 1,000,000 Lovelaces (unité la plus petite). ADA sert à : payer les frais de transaction, participer au staking pour sécuriser le réseau, voter dans le système de gouvernance (CIP), et est utilisée comme garantie dans les smart contracts. L\'approvisionnement maximum est de 45 milliards d\'ADA.'
    },
    {
      keywords: ['wallet', 'portefeuille', 'nami', 'eternl', 'lace', 'yoroi', 'flint', 'vespr'],
      category: 'wallets',
      content: 'Un wallet Cardano stocke vos clés privées et permet d\'envoyer/recevoir des ADA, gérer les NFTs, déléguer au staking, et interagir avec les DApps. Principaux wallets : Nami (extension navigateur), Eternl (multi-fonctions avancé), Lace (officiel IOG, léger), Yoroi (officiel Emurgo, simple), Flint (Chrome extension), Vespr (mobile). WENZE supporte tous ces wallets via CIP-30. Les wallets utilisent des clés privées que vous devez garder en sécurité - si vous les perdez, vos fonds sont perdus à jamais.'
    },
    {
      keywords: ['créer wallet', 'créer un wallet', 'installer wallet', 'comment créer', 'comment installer', 'nouveau wallet', 'débutant wallet', 'première fois wallet', 'setup wallet', 'configurer wallet'],
      category: 'wallet-creation',
      content: `CRÉER UN WALLET CARDANO - GUIDE COMPLET :

ÉTAPE 1 : Choisir un wallet
• Nami : Recommandé pour débutants, simple et sûr (extension Chrome/Brave)
• Eternl : Plus avancé, nombreuses fonctionnalités
• Lace : Wallet officiel IOG, design moderne
• Yoroi : Simple, bon pour mobile (Emurgo)

ÉTAPE 2 : Installation
• Aller sur le site officiel du wallet (namiwallet.io, eternl.io, lace.io, yoroi-wallet.com)
• Installer l'extension navigateur (Chrome/Brave/Firefox) ou l'app mobile
• Vérifier que vous êtes sur le site officiel (vérifier l'URL, éviter les copies)

ÉTAPE 3 : Création du wallet
1. Cliquer sur "Créer un nouveau wallet" ou "Create wallet"
2. Choisir un nom pour votre wallet (ex: "Mon wallet principal")
3. Créer un mot de passe fort (minimum 8 caractères, lettres + chiffres)
4. IMPORTANT : Noter la phrase de récupération (seed phrase) de 12, 15 ou 24 mots
5. Confirmer la phrase en la réécrivant dans l'ordre

ÉTAPE 4 : Sauvegarde sécurisée (CRITIQUE)
• Écrire la phrase de récupération sur papier (NE JAMAIS la sauvegarder en ligne)
• Stocker le papier dans un endroit sûr (coffre-fort, boîte de sécurité)
• Ne jamais partager cette phrase avec qui que ce soit
• Sans cette phrase, impossible de récupérer votre wallet si vous perdez l'accès

ÉTAPE 5 : Réception d'ADA
• Votre wallet génère automatiquement une adresse de réception (commence par addr1...)
• Vous pouvez recevoir des ADA en partageant cette adresse
• Vérifier toujours l'adresse avant d'envoyer de grosses sommes

ÉTAPE 6 : Première connexion sur WENZE
1. Aller sur WENZE et cliquer sur "Connecter un wallet"
2. Choisir votre wallet installé (Nami, Eternl, etc.)
3. Autoriser la connexion dans la fenêtre popup du wallet
4. Approuver la connexion - votre adresse s'affichera sur WENZE

SÉCURITÉ IMPORTANTE :
• Ne jamais donner votre phrase de récupération à personne
• Méfiez-vous des sites de phishing (vérifier l'URL)
• Toujours vérifier les adresses avant d'envoyer des fonds
• Activer l'authentification à deux facteurs si disponible`
    },
    {
      keywords: ['phrase de récupération', 'seed phrase', 'phrase secrète', 'mots de récupération', '12 mots', '24 mots', 'backup wallet', 'sauvegarder wallet'],
      category: 'wallet-security',
      content: `PHRASE DE RÉCUPÉRATION - GUIDE COMPLET :

QU'EST-CE QUE C'EST ?
La phrase de récupération (seed phrase/recovery phrase) est une série de 12, 15 ou 24 mots en anglais qui donne accès à votre wallet. Elle est générée lors de la création du wallet.

POURQUOI C'EST CRITIQUE ?
• C'est la SEULE façon de récupérer votre wallet si vous perdez l'accès
• Sans elle, vos fonds sont PERDUS À JAMAIS si vous perdez votre appareil ou oubliez le mot de passe
• Elle contrôle TOUS vos fonds - quiconque la possède contrôle votre wallet

COMMENT LA PROTÉGER :
1. ÉCRIRE SUR PAPIER (jamais sur ordinateur/téléphone)
2. Stocker dans un endroit sûr (coffre-fort, boîte de sécurité)
3. Faire plusieurs copies dans des endroits différents
4. NE JAMAIS la photographier ou la sauvegarder en ligne
5. NE JAMAIS la partager avec qui que ce soit
6. Ne pas la stocker dans des notes cryptées en ligne

QUE FAIRE SI JE L'AI PERDUE ?
• Si vous avez encore accès au wallet : créer un nouveau wallet et transférer vos fonds
• Si vous n'avez plus accès : malheureusement, vos fonds sont perdus à jamais
• C'est pourquoi la sauvegarde est si importante !

VÉRIFICATION DE LA PHRASE :
• Lors de la création, le wallet vous demande de la confirmer
• Assurez-vous de bien noter les mots dans l'ordre exact
• Vérifiez l'orthographe de chaque mot
• Testez la récupération sur un autre appareil si possible (wallet vide)`
    },
    {
      keywords: ['transaction', 'frais', 'fees', 'envoyer', 'recevoir', 'transfert'],
      category: 'transactions',
      content: 'Les transactions sur Cardano sont rapides (environ 20 secondes pour confirmation) et peu coûteuses (environ 0.17 ADA, soit ~$0.10). Chaque transaction nécessite des frais minimaux calculés par : base_fee (0.155381 ADA) + (taille_transaction × 0.000043946 ADA/byte). Cardano supporte les transactions multi-assets (native tokens), les smart contracts, les metadata, et les références d\'inputs (CIP-31) pour réduire les coûts.'
    },
    {
      keywords: ['staking', 'délégation', 'stake pool', 'pool', 'récompenses', 'delegation'],
      category: 'staking',
      content: 'Le staking (délégation) permet de gagner des récompenses ADA (~4-5% APY) en déléguant vos ADA à un stake pool sans perdre le contrôle de vos fonds. Vous pouvez unstake à tout moment (pas de période de verrouillage). Les récompenses sont distribuées toutes les 5 jours (epoch). Choisissez un pool avec : bon pledge (engagement opérateur), saturation <100%, fees raisonnables (0-5%), et performance >95%. Vous gardez toujours le contrôle de vos ADA - la délégation n\'est pas un transfert.'
    },
    {
      keywords: ['smart contract', 'plutus', 'aiken', 'dapp', 'décentralisé', 'contrat intelligent'],
      category: 'smart-contracts',
      content: 'Les smart contracts sur Cardano sont écrits en Plutus (basé sur Haskell, sécurité fonctionnelle) ou Aiken (syntaxe moderne, plus simple). Ils permettent d\'automatiser des transactions selon des conditions définies. L\'EVM (Extended UTXO Model) de Cardano permet d\'exécuter des smart contracts directement dans les UTXOs, offrant meilleure prévisibilité des coûts et sécurité. Sur WENZE, notre système d\'escrow utilise des smart contracts Plutus pour sécuriser les transactions entre acheteurs et vendeurs, verrouillant les fonds jusqu\'à confirmation de livraison.'
    },
    {
      keywords: ['escrow', 'séquestre', 'wenze', 'sécurisé', 'transaction sécurisée'],
      category: 'escrow',
      content: 'L\'escrow (séquestre) est un smart contract qui verrouille les fonds jusqu\'à ce que certaines conditions soient remplies. Sur WENZE, l\'escrow protège les acheteurs et vendeurs : les fonds ADA sont verrouillés dans un contrat Plutus jusqu\'à ce que l\'acheteur confirme la réception du produit. Si un problème survient, un mécanisme de timeout permet le remboursement. Le contrat est immutable et vérifiable sur la blockchain, garantissant transparence et sécurité totale.'
    },
    {
      keywords: ['wenze', 'comment fonctionne wenze', 'wenze comment ça marche', 'marketplace wenze', 'goma', 'rdc'],
      category: 'wenze-general',
      content: `WENZE - MARKETPLACE SÉCURISÉE SUR CARDANO

QU'EST-CE QUE WENZE ?
WENZE est une marketplace moderne et sécurisée construite spécialement pour Goma, en République Démocratique du Congo. Elle utilise la blockchain Cardano pour garantir la sécurité totale des transactions via un système d'escrow décentralisé.

FONCTIONNEMENT GÉNÉRAL :
WENZE permet aux utilisateurs d'acheter et vendre des produits/services en toute sécurité. Les transactions sont protégées par des smart contracts Plutus qui verrouillent les fonds jusqu'à confirmation de réception.

CARACTÉRISTIQUES PRINCIPALES :
• Transactions sécurisées avec escrow blockchain Cardano
• Paiements en ADA (cryptomonnaie native de Cardano)
• Système de points WZP pour récompenser les utilisateurs actifs
• Négociation de prix intégrée avec chat en temps réel
• Support multi-langue (Français et Swahili)
• Interface moderne et intuitive, optimisée mobile
• Disponibilité des services avec statut en ligne/offline
• Types de prix : fixe ou négociable (avec plage min-max)

COMMENT COMMENCER :
1. Créer un compte (email/password ou Google)
2. Connecter un wallet Cardano (Nami, Eternl, Lace, etc.)
3. Commencer à acheter ou vendre !

WENZE réinvente l'échange à Goma avec une garantie de sécurité totale grâce à la technologie blockchain.`
    },
    {
      keywords: ['acheter', 'comment acheter', 'processus achat', 'acheter produit', 'commander', 'achat wenze'],
      category: 'wenze-achat',
      content: `COMMENT ACHETER SUR WENZE - GUIDE COMPLET

ÉTAPE 1 : Créer un compte et se connecter
• Créer un compte avec email/password ou Google OAuth
• Compléter votre profil (nom, photo, etc.)

ÉTAPE 2 : Connecter un wallet Cardano
• Installer un wallet compatible (Nami, Eternl, Lace, etc.)
• Connecter votre wallet sur WENZE via le bouton "Connecter un wallet"
• S'assurer d'avoir suffisamment d'ADA pour la transaction

ÉTAPE 3 : Parcourir les produits
• Explorer la marketplace par catégorie
• Utiliser la recherche pour trouver des produits spécifiques
• Consulter les détails du produit (prix, description, vendeur)

ÉTAPE 4 : Choisir le type d'achat
• PRIX FIXE : Le prix est déjà déterminé, vous pouvez acheter directement
• PRIX NÉGOCIABLE : Le prix est dans une plage (min-max), vous pouvez négocier via le chat

ÉTAPE 5 : Passer la commande
• Cliquer sur "Acheter" ou "Négocier"
• Pour prix fixe : La commande est créée immédiatement
• Pour négociation : Proposer un prix dans le chat avec le vendeur

ÉTAPE 6 : Paiement sécurisé
• Votre wallet s'ouvre automatiquement
• Les fonds ADA sont verrouillés dans un smart contract escrow
• La transaction est enregistrée sur la blockchain Cardano (Preprod Testnet)
• Vous recevez un hash de transaction pour suivre sur Cardano Explorer

ÉTAPE 7 : Attendre la livraison
• Le statut passe à "Fonds bloqués" (escrow_web2)
• Le vendeur confirme l'expédition → statut "Confirmée" (shipped)
• Vous communiquez via le chat intégré si nécessaire

ÉTAPE 8 : Confirmer la réception
• Une fois le produit reçu, confirmer la réception
• Les fonds sont libérés automatiquement au vendeur via le smart contract
• Statut final : "Terminé" (completed)

ÉTAPE 9 : Gagner des points WZP
• Après chaque transaction complétée, vous recevez 50% des points WZP
• Les points sont visibles dans votre profil
• Plus vous êtes actif, plus vous gagnez de points !

SÉCURITÉ :
• Vos fonds sont protégés par l'escrow jusqu'à confirmation
• Impossible pour le vendeur de récupérer les fonds sans votre confirmation
• Toutes les transactions sont vérifiables sur la blockchain`
    },
    {
      keywords: ['vendre', 'comment vendre', 'publier produit', 'créer produit', 'mettre en vente', 'vendre wenze'],
      category: 'wenze-vente',
      content: `COMMENT VENDRE SUR WENZE - GUIDE COMPLET

ÉTAPE 1 : Créer un compte vendeur
• S'inscrire sur WENZE avec email/password ou Google
• Compléter votre profil avec vos informations

ÉTAPE 2 : Se connecter au wallet (optionnel mais recommandé)
• Connecter un wallet Cardano pour recevoir les paiements
• Sans wallet, vous pouvez quand même vendre (les fonds seront stockés)

ÉTAPE 3 : Publier un produit
• Cliquer sur "Vendre un produit" dans la navigation
• Remplir le formulaire de publication :

  INFORMATIONS GÉNÉRALES :
  • Catégorie (Électronique, Mode, Aliments, Beauté, Bricolage, Services, Immobilier, Auto, Autres)
  • Titre du produit (exemple selon catégorie)
  • Description détaillée (placeholders adaptés selon catégorie)
  
  PRIX :
  • Type de prix : FIXE ou NÉGOCIABLE
  • Prix fixe : Entrer le montant en Francs Congolais (FC)
  • Prix négociable : Entrer prix minimum et maximum en FC
  
  SPÉCIAL - SERVICES :
  • Statut de disponibilité : Disponible ou Indisponible
  • Contact WhatsApp (optionnel)
  • Contact Email (optionnel)
  
  SPÉCIAL - MODE :
  • Type : Habit ou Soulier
  • Taille (pour habits) ou Numéro (pour souliers)
  
  IMAGES :
  • Télécharger une ou plusieurs photos du produit
  • Les images sont stockées sur Supabase Storage

ÉTAPE 4 : Publier
• Vérifier toutes les informations
• Cliquer sur "Publier le produit"
• Votre produit apparaît immédiatement sur la marketplace

ÉTAPE 5 : Gérer les commandes
• Recevoir des notifications de nouvelles commandes
• Consulter vos commandes dans le tableau de bord
• Pour chaque commande :
  - Voir les détails (acheteur, produit, prix)
  - Communiquer via le chat intégré
  - Négocier si prix négociable
  - Confirmer l'expédition une fois envoyé

ÉTAPE 6 : Confirmation d'expédition
• Une fois le produit envoyé, cliquer sur "Confirmer l'expédition"
• Le statut passe à "Confirmée" (shipped)
• Attendre la confirmation de réception de l'acheteur

ÉTAPE 7 : Réception des fonds
• Quand l'acheteur confirme la réception
• Les fonds ADA sont libérés automatiquement vers votre wallet
• Transaction visible sur Cardano Explorer

ÉTAPE 8 : Gagner des points WZP
• Après chaque transaction complétée, vous recevez 50% des points WZP
• Les points s'accumulent dans votre profil
• Améliorez votre réputation en vendant régulièrement

CONSEILS POUR BIEN VENDRE :
• Photos de qualité : Plusieurs angles, bonne luminosité
• Description détaillée : État, spécifications, origine
• Prix compétitif : Comparer avec le marché
• Disponibilité : Mettre à jour si indisponible (services)
• Communication : Répondre rapidement aux messages`
    },
    {
      keywords: ['wzp', 'points', 'points wzp', 'récompenses', 'système points', 'gagner points'],
      category: 'wenze-wzp',
      content: `SYSTÈME DE POINTS WZP - COMMENT ÇA MARCHE

QU'EST-CE QUE WZP ?
WZP (Wenze Points) est le système de récompenses de WENZE qui récompense les utilisateurs actifs sur la plateforme.

COMMENT GAGNER DES POINTS WZP ?
• Transaction d'achat complétée : Vous recevez 50% des points
• Transaction de vente complétée : Vous recevez 50% des points
• Plus vous êtes actif, plus vous gagnez de points !

RÉPARTITION DES POINTS :
Lorsqu'une transaction est complétée (statut "Terminé") :
• 50% des points → Acheteur
• 50% des points → Vendeur
• Les points sont distribués automatiquement, aucun action requise

OÙ VOIR MES POINTS ?
• Dans votre profil utilisateur
• Dans le tableau de bord
• Le solde WZP est affiché en temps réel

HISTORIQUE :
• Toutes les transactions WZP sont enregistrées
• Vous pouvez voir quand et comment vous avez gagné des points
• Chaque transaction affiche le montant et la raison

AVANTAGES :
• Fidélité : Plus vous utilisez WENZE, plus vous gagnez
• Engagement : Encourage les transactions réussies
• Communauté : Récompense les utilisateurs actifs

NOTE : Les points WZP sont actuellement un système de réputation et de gamification. Les usages futurs des points seront communiqués.`
    },
    {
      keywords: ['négociation', 'négocier prix', 'proposer prix', 'prix négociable', 'comment négocier'],
      category: 'wenze-negociation',
      content: `NÉGOCIATION DE PRIX SUR WENZE - GUIDE COMPLET

QUAND PEUT-ON NÉGOCIER ?
• Seulement pour les produits avec PRIX NÉGOCIABLE
• Le vendeur définit une plage de prix (minimum - maximum)
• Vous pouvez proposer un prix dans cette plage

COMMENT NÉGOCIER :

POUR L'ACHETEUR :
1. Trouver un produit avec prix négociable (badge "Prix négociable" visible)
2. Cliquer sur "Négocier" au lieu de "Acheter"
3. Une commande en mode négociation est créée
4. Le chat s'ouvre automatiquement avec le vendeur
5. Proposer un prix dans la plage min-max via le chat
6. Le vendeur peut accepter ou refuser votre proposition
7. Si accepté, les fonds sont verrouillés dans l'escrow au prix négocié

POUR LE VENDEUR :
1. Lors de la publication, choisir "Prix négociable"
2. Définir le prix minimum et maximum acceptables
3. Recevoir des propositions de prix des acheteurs
4. Discuter via le chat intégré
5. Accepter ou refuser les propositions
6. Si accepté, l'acheteur verrouille les fonds au prix convenu

PROCESSUS DE NÉGOCIATION :
• Mode : La commande est en mode "negotiation" (pas "direct")
• Proposition : L'acheteur propose un prix via le chat
• Discussion : Échange libre entre acheteur et vendeur
• Acceptation : Si les deux parties sont d'accord
• Verrouillage : Les fonds sont bloqués dans l'escrow au prix final
• Suivi : Le reste du processus est identique (expédition, confirmation, libération)

AVANTAGES :
• Flexibilité : Permet d'ajuster le prix selon la situation
• Communication : Chat intégré pour discuter
• Transparence : Toutes les propositions sont visibles
• Sécurité : Même protection escrow que les prix fixes`
    },
    {
      keywords: ['catégories', 'catégorie produit', 'types produits', 'quelles catégories'],
      category: 'wenze-categories',
      content: `CATÉGORIES DE PRODUITS SUR WENZE

WENZE supporte 9 catégories principales :

1. ÉLECTRONIQUE
• Téléphones, ordinateurs, accessoires tech
• Exemples : iPhone, Samsung, MacBook, écouteurs

2. MODE
• Habits et souliers avec tailles/numéros spécifiques
• Types : Habit (tailles XS à XXL) ou Soulier (numéros)

3. ALIMENTS
• Produits alimentaires, boissons
• Exemples : Riz, huile, fruits, produits locaux

4. BEAUTÉ & HYGIÈNE
• Produits cosmétiques, soins personnels
• Exemples : Crèmes, parfums, kits maquillage

5. BRICOLAGE & MATÉRIAUX
• Matériaux de construction, outils
• Exemples : Ciment, tôle, peinture, quincaillerie

6. SERVICES ⭐
• Services divers avec disponibilité
• Statut : Disponible ou Indisponible (visible pour acheteurs)
• Contact direct : WhatsApp et/ou Email requis
• Exemples : Réparation, cours, plomberie, services professionnels

7. IMMOBILIER
• Biens immobiliers (pas d'escrow, contact direct)
• Contact : WhatsApp et/ou Email

8. AUTO & MOTO
• Véhicules et pièces détachées (pas d'escrow, contact direct)
• Contact : WhatsApp et/ou Email

9. AUTRES
• Catégorie personnalisable pour produits ne rentrant dans aucune catégorie
• Permet de définir votre propre catégorie

NOTE IMPORTANTE :
• Services, Immobilier et Auto utilisent un système de contact direct (pas d'escrow)
• Pour ces catégories, la transaction se fait directement entre acheteur et vendeur
• Les autres catégories utilisent l'escrow blockchain pour la sécurité`
    },
    {
      keywords: ['chat', 'messagerie', 'message', 'communiquer', 'discuter', 'contacter vendeur'],
      category: 'wenze-chat',
      content: `SYSTÈME DE CHAT WENZE - GUIDE COMPLET

COMMENT FONCTIONNE LE CHAT ?
Le chat est intégré dans chaque commande, permettant la communication directe entre acheteur et vendeur.

ACCÈS AU CHAT :
• Le chat s'ouvre automatiquement lors de la création d'une commande
• Accessible depuis la page "Détail de la commande"
• Disponible pour toutes les commandes (achat ou vente)

FONCTIONNALITÉS :
• Messages en temps réel : Mise à jour toutes les 5 secondes
• Statut de lecture : 
  - ✓ (simple) = Message envoyé
  - ✓✓ (double) = Message lu par le destinataire
• Présence en ligne : Indicateur vert si l'autre personne est en ligne
• Historique : Tous les messages sont sauvegardés

UTILISATIONS :
1. NÉGOCIATION : Discuter du prix pour produits négociables
2. COORDINATION : Organiser la livraison/remise
3. QUESTIONS : Poser des questions sur le produit
4. SUIVI : Communiquer pendant le processus de transaction

BONNES PRATIQUES :
• Répondre rapidement pour une meilleure expérience
• Être respectueux et professionnel
• Utiliser le chat pour clarifier les détails avant l'achat
• Communiquer clairement sur la livraison`
    },
    {
      keywords: ['profil', 'réputation', 'score réputation', 'vérifié', 'boutique', 'statistiques'],
      category: 'wenze-profil',
      content: `PROFIL ET RÉPUTATION SUR WENZE

VOTRE PROFIL :
• Nom complet, username, email
• Photo de profil (avatar)
• Adresse wallet Cardano (si connecté)
• Score de réputation
• Badge "Vérifié" (si applicable)
• Solde WZP (points accumulés)

SCORE DE RÉPUTATION :
• Basé sur vos transactions réussies
• Plus vous avez de transactions complétées, plus votre score augmente
• Visible sur votre profil et votre boutique publique

BOUTIQUE PUBLIQUE :
• Tous les utilisateurs ont une boutique publique accessible
• Affiche tous vos produits en vente
• Statistiques : Nombre de produits, score de réputation
• Visite : Les autres peuvent voir votre boutique via votre profil

MODIFIER VOTRE PROFIL :
1. Aller dans "Profil" dans le menu
2. Cliquer sur "Modifier le profil"
3. Modifier les informations souhaitées
4. Cliquer sur "Enregistrer"

STATISTIQUES :
• Nombre de produits vendus
• Nombre de commandes
• Points WZP accumulés
• Score de réputation`
    },
    {
      keywords: ['acheter ada', 'vendre ada', 'acheter des ada', 'vendre des ada', 'obtenir ada', 'comment obtenir ada', 'comment acheter ada', 'comment vendre ada', 'échanger ada', 'convertir ada', 'ada fc', 'ada ↔ fc', 'échanger ada fc', 'convertir ada fc', 'buy ada', 'sell ada', 'get ada', 'partenaire exchange', 'ada exchange', 'yann exchange', 'jules exchange'],
      category: 'wenze-ada',
      content: `COMMENT OBTENIR ET ÉCHANGER DES ADA SUR WENZE

IMPORTANT : CLARIFICATION
WENZE est une MARKETPLACE pour acheter/vendre des PRODUITS et SERVICES. WENZE utilise ADA comme moyen de PAIEMENT pour les transactions sur la marketplace. Pour échanger ADA ↔ FC (Francs Congolais), WENZE propose des partenaires d'échange intégrés.

ÉCHANGER ADA ↔ FC SUR WENZE (PARTENAIRES INTÉGRÉS) :

WENZE a intégré des partenaires externes pour faciliter l'échange entre ADA et FC :

1. ADA EXCHANGE
• Plateforme en ligne pour échanger ADA ↔ FC via Mobile Money
• Accessible directement depuis WENZE
• Contact via WhatsApp (depuis WENZE)

2. YANN EXCHANGE
• Partenaire d'échange ADA ↔ FC
• Accessible depuis WENZE
• Contact via WhatsApp avec message pré-rempli : "Bonjour, je souhaite échanger des ADA contre des FC via WENZE."

3. JULES EXCHANGE
• Partenaire d'échange ADA ↔ FC
• Accessible depuis WENZE
• Contact via WhatsApp avec message pré-rempli : "Bonjour, je souhaite échanger des ADA contre des FC via WENZE."

COMMENT ACCÉDER AUX PARTENAIRES D'ÉCHANGE :
1. Sur la barre de navigation de WENZE, cliquer sur "Échanger ADA ↔ FC"
2. Une modal s'ouvre avec les opérateurs disponibles (ADA Exchange, Yann Exchange, Jules Exchange)
3. Choisir l'opérateur souhaité
4. Cliquer sur "Contacter via WhatsApp"
5. Un message pré-rempli s'ouvre dans WhatsApp pour faciliter la communication
6. Finaliser l'échange directement avec le partenaire

AUTRES MÉTHODES POUR OBTENIR DES ADA :

MÉTHODE 1 : Acheter sur un échange de cryptomonnaies
• Échanges populaires : Binance, Coinbase, Kraken, KuCoin
• Processus :
  1. Créer un compte sur l'échange
  2. Vérifier votre identité (KYC)
  3. Ajouter des fonds (carte bancaire, virement, etc.)
  4. Acheter des ADA avec vos fonds
  5. Retirer les ADA vers votre wallet Cardano

MÉTHODE 2 : Échanger d'autres cryptomonnaies
• Sur des échanges décentralisés (DEX) Cardano
• Exemples : Minswap, SundaeSwap, WingRiders
• Connecter votre wallet Cardano
• Échanger vos tokens contre ADA

MÉTHODE 3 : Recevoir des ADA
• Recevoir des ADA de quelqu'un d'autre
• Partager votre adresse wallet (commence par addr1...)
• L'autre personne vous envoie des ADA

COMMENT UTILISER DES ADA SUR WENZE :

POUR ACHETER DES PRODUITS :
1. Avoir des ADA dans votre wallet Cardano (obtenus via les partenaires WENZE ou autres méthodes)
2. Se connecter à WENZE
3. Connecter votre wallet (Nami, Eternl, Lace, etc.)
4. Parcourir les produits et choisir un produit
5. Lors de l'achat, votre wallet s'ouvre automatiquement
6. Les ADA sont verrouillés dans un smart contract escrow
7. Après confirmation de réception, les ADA sont libérés au vendeur

POUR VENDRE ET RECEVOIR DES ADA :
1. Publier un produit sur WENZE
2. Un acheteur commande votre produit
3. L'acheteur verrouille les ADA dans l'escrow
4. Vous expédiez le produit
5. L'acheteur confirme la réception
6. Les ADA sont libérés automatiquement vers votre wallet
7. Vous pouvez ensuite échanger vos ADA contre FC via les partenaires WENZE

COMMENT CONNECTER VOTRE WALLET SUR WENZE :
1. Installer un wallet Cardano (Nami, Eternl, Lace, etc.)
2. Créer ou importer un wallet
3. Avoir des ADA dans ce wallet (via partenaires WENZE ou autres méthodes)
4. Sur WENZE, cliquer sur "Connecter un wallet"
5. Autoriser la connexion dans la popup du wallet
6. Votre adresse s'affiche sur WENZE

RÉSEAU UTILISÉ :
• WENZE utilise actuellement le Preprod Testnet de Cardano
• Vous avez besoin d'ADA de testnet (pas de l'ADA mainnet)
• Pour obtenir de l'ADA de testnet : Cardano Faucet (testnet)

RÉSUMÉ :
• WENZE = Marketplace pour produits/services avec partenaires d'échange intégrés
• Pour échanger ADA ↔ FC : utiliser les partenaires WENZE (ADA Exchange, Yann Exchange, Jules Exchange)
• Accès : Cliquer sur "Échanger ADA ↔ FC" dans la navigation
• Pour utiliser des ADA : les dépenser sur WENZE pour acheter des produits
• Pour recevoir des ADA : vendre des produits sur WENZE, puis échanger via les partenaires si besoin`
    },
    {
      keywords: ['ouroboros', 'consensus', 'proof of stake', 'preuve d\'enjeu', 'pos'],
      category: 'consensus',
      content: 'Ouroboros est le protocole de consensus de Cardano utilisant la Preuve d\'Enjeu (PoS). C\'est le premier PoS prouvé mathématiquement sécurisé. Ouroboros garantit : sécurité équivalente à Bitcoin avec consommation énergétique minime, décentralisation (pas de pools dominants), et scalabilité (millions de transactions par seconde potentiel). Le réseau est divisé en epochs (5 jours) et slots (1 seconde), avec des validateurs (stake pools) élus de manière aléatoire mais pondérée par leur stake.'
    },
    {
      keywords: ['plutus', 'haskell', 'programmation', 'langage', 'code'],
      category: 'plutus',
      content: 'Plutus est le langage de programmation fonctionnel pour écrire des smart contracts sur Cardano. Basé sur Haskell, il offre une sécurité mathématique élevée grâce au système de types fort. Plutus Core compile vers une machine virtuelle (Plutus VM) qui exécute sur la blockchain. Les contrats Plutus sont vérifiables formellement, réduisant les bugs critiques. Aiken est une alternative moderne avec une syntaxe plus simple mais compile aussi vers Plutus Core pour compatibilité.'
    },
    {
      keywords: ['utxo', 'output', 'input', 'modèle', 'eutxo'],
      category: 'utxo',
      content: 'Cardano utilise le modèle UTXO (Unspent Transaction Output) étendu (EUTXO). Chaque transaction consomme des UTXOs (inputs) et crée de nouveaux UTXOs (outputs). Ce modèle offre : meilleure parallélisation (plusieurs transactions simultanées), prévisibilité des coûts, et sécurité (pas de reentrancy comme dans l\'account model). Les smart contracts dans EUTXO s\'exécutent avant la validation, garantissant que seules les transactions valides sont incluses dans la blockchain.'
    },
    {
      keywords: ['gouvernance', 'vote', 'cip', 'catalyst', 'voltaire'],
      category: 'governance',
      content: 'Cardano utilise un système de gouvernance décentralisée appelé Voltaire. Les détenteurs d\'ADA peuvent voter sur les CIPs (Cardano Improvement Proposals) et recevoir des récompenses pour leur participation. Project Catalyst distribue des fonds du trésor Cardano (funding) à des projets communautaires votés démocratiquement. Le système permet une évolution décentralisée de la blockchain sans dépendre d\'une autorité centrale.'
    },
    {
      keywords: ['nft', 'token', 'native token', 'token natif', 'fungible'],
      category: 'tokens',
      content: 'Cardano supporte les native tokens (tokens natifs) sans smart contracts. Cela signifie que les tokens et NFTs sont de première classe sur la blockchain, avec les mêmes garanties de sécurité qu\'ADA. Les frais pour transférer des tokens natifs sont identiques aux frais ADA (très économiques). Cardano supporte aussi les NFTs avec metadata standardisés (CIP-25), permettant de créer des collections complètes directement sur-chain.'
    },
    {
      keywords: ['hydra', 'scalabilité', 'layer 2', 'solution échelle'],
      category: 'scalability',
      content: 'Hydra est une solution de scaling Layer 2 pour Cardano permettant d\'atteindre des millions de transactions par seconde. Hydra crée des "têtes" (heads) - des canaux de paiement off-chain entre participants. Les transactions dans une tête sont instantanées et gratuites, seuls les ouvertures/fermetures nécessitent une transaction on-chain. Chaque tête peut traiter 1000 TPS, et le réseau peut supporter des milliers de têtes simultanément.'
    },
    {
      keywords: ['charles hoskinson', 'iohk', 'iog', 'fondateur', 'créateur'],
      category: 'history',
      content: 'Cardano a été fondée par Charles Hoskinson, co-fondateur d\'Ethereum. Le projet est développé par IOG (Input Output Global, anciennement IOHK) en collaboration avec la Cardano Foundation et Emurgo. Cardano se distingue par son approche peer-reviewed, avec toutes les recherches publiées et vérifiées par la communauté scientifique avant implémentation. Le projet est open-source et décentralisé.'
    },
    {
      keywords: ['sécurité', 'sécurisé', 'sûr', 'protection', 'risque'],
      category: 'security',
      content: 'Cardano priorise la sécurité via : preuves mathématiques formelles pour Ouroboros, système de types fort en Plutus (prévention d\'erreurs), modèle EUTXO (pas de reentrancy), audit de code régulier, et approche peer-reviewed pour toutes les innovations. Le réseau n\'a jamais subi de hack majeur depuis son lancement en 2017. Les wallets utilisent des standards de sécurité stricts (CIP-30) pour interactions avec DApps.'
    },
    {
      keywords: ['epoch', 'slot', 'temps', 'bloc', 'block'],
      category: 'epochs',
      content: 'Cardano divise le temps en epochs (5 jours) et slots (1 seconde). Chaque epoch contient ~432,000 slots. Un slot leader (stake pool) est élu pour chaque slot pour créer un bloc. Si un slot leader ne produit pas de bloc, le slot reste vide (pas de pénalité). Les récompenses de staking sont calculées par epoch et distribuées 2 epochs plus tard. Les paramètres réseau peuvent être ajustés entre epochs via gouvernance.'
    }
  ],
  sw: [
    {
      keywords: ['cardano', 'blockchain', 'kizazi cha tatu', '3'],
      category: 'général',
      content: 'Cardano ni blockchain ya kizazi cha tatu iliyoanzishwa na Charles Hoskinson, mwanzilishi wa Ethereum. Inatumia uthibitisho wa steki (Proof of Stake) kupitia Ouroboros kwa matumizi ya chini ya nishati (~0.001% ya Ethereum), uwezo bora, na usalama uliothibitishwa kihisabati. Cardano inajulikana kwa mbinu yake ya kisayansi, na utafiti wote unakaguliwa na wataalamu kabla ya kutekelezwa.'
    },
    {
      keywords: ['ada', 'fedha', 'lovelace'],
      category: 'ada',
      content: 'ADA ni fedha za kidijitali za asili za Cardano, zilizopewa jina la Ada Lovelace, mwanaprogramu wa kwanza. 1 ADA = 1,000,000 Lovelaces (kipimo kidogo zaidi). ADA hutumika kwa: kulipa ada za biashara, kushiriki katika staking kuhakikisha mtandao, kupiga kura katika mfumo wa utawala (CIP), na kutumika kama dhamana katika mikataba mahiri. Jumla ya juu ni ADA bilioni 45.'
    },
    {
      keywords: ['wallet', 'mkoba', 'nami', 'eternl', 'lace', 'yoroi', 'flint'],
      category: 'wallets',
      content: 'Mkoba wa Cardano huhifadhi funguo zako za siri na kuruhusu kutuma/kupokea ADA, kusimamia NFTs, kugawa kwa staking, na kuingiliana na DApps. Mifuko kuu: Nami (extension ya kivinjari), Eternl (mipango mbalimbali), Lace (rasmi IOG, nyepesi), Yoroi (rasmi Emurgo, rahisi), Flint (Chrome extension), Vespr (simu). WENZE inasaidia mifuko hii yote kupitia CIP-30. Funguo za siri lazima zihifadhiwe salama - ukiwa poteza, fedha zako zitaenda milele.'
    },
    {
      keywords: ['kutengeneza mfuko', 'kutengeneza mkoba', 'kuweka mfuko', 'jinsi ya kutengeneza', 'jinsi ya kuweka', 'mfuko mpya', 'kuanzia mfuko', 'kwanza mfuko', 'setup mfuko', 'kuwezesha mfuko'],
      category: 'wallet-creation',
      content: `KUTENGENEZA MfUKO WA CARDANO - MWONGOZO KAMILI:

HATUA YA 1: Kuchagua mfuko
• Nami: Inapendekezwa kwa wanaoanza, rahisi na salama (extension ya Chrome/Brave)
• Eternl: Ya hali ya juu zaidi, vipengele vingi
• Lace: Mfuko rasmi wa IOG, muundo wa kisasa
• Yoroi: Rahisi, bora kwa simu (Emurgo)

HATUA YA 2: Uwekaji
• Nenda kwenye tovuti rasmi ya mfuko (namiwallet.io, eternl.io, lace.io, yoroi-wallet.com)
• Weka extension ya kivinjari (Chrome/Brave/Firefox) au programu ya simu
• Hakikisha uko kwenye tovuti rasmi (angalia URL, epuka nakala)

HATUA YA 3: Kutengeneza mfuko
1. Bofya "Tengeneza mfuko mpya" au "Create wallet"
2. Chagua jina la mfuko wako (mfano: "Mfuko wangu kuu")
3. Tengeneza nenosiri thabiti (angalau herufi 8, herufi + nambari)
4. MUHIMU: Andika maneno ya kurejesha (seed phrase) ya maneno 12, 15 au 24
5. Thibitisha maneno kwa kuyaandika tena kwa mpangilio

HATUA YA 4: Hifadhi salama (MUHIMU)
• Andika maneno ya kurejesha kwenye karatasi (KAMWE usiyhifadhi mtandaoni)
• Weka karatasi mahali salama (sanduku la hazina, sanduku la usalama)
• Kamwe usishiriki maneno haya na mtu yeyote
• Bila maneno haya, haiwezekani kurejesha mfuko wako ikiwa utapoteza ufikiaji

HATUA YA 5: Kupokea ADA
• Mfuko wako hutengeneza anwani ya kupokea otomatiki (yanza na addr1...)
• Unaweza kupokea ADA kwa kushiriki anwani hii
• Daima angalia anwani kabla ya kutuma kiasi kikubwa

HATUA YA 6: Muunganisho wa kwanza kwenye WENZE
1. Nenda kwenye WENZE na ubofye "Unganisha mfuko"
2. Chagua mfuko uliowekwa (Nami, Eternl, nk)
3. Ruhusu muunganisho kwenye dirisha la popup la mfuko
4. Idhinisha muunganisho - anwani yako itaonekana kwenye WENZE

USALAMA MUHIMU:
• Kamwe usipe maneno ya kurejesha kwa mtu yeyote
• Jihadharini na tovuti za ulaghai (angalia URL)
• Daima angalia anwani kabla ya kutuma fedha
• Wezesha uthibitishaji wa hatua mbili ikiwa inapatikana`
    },
    {
      keywords: ['maneno ya kurejesha', 'seed phrase', 'maneno ya siri', 'maneno ya backup', 'maneno 12', 'maneno 24', 'backup mfuko', 'hifadhi mfuko'],
      category: 'wallet-security',
      content: `MANENO YA KUREJESHA - MWONGOZO KAMILI:

NI NINI?
Maneno ya kurejesha (seed phrase/recovery phrase) ni mfululizo wa maneno 12, 15 au 24 katika Kiingereza ambayo inatoa ufikiaji kwa mfuko wako. Hutengenezwa wakati wa kutengeneza mfuko.

KWA NINI NI MUHIMU?
• Ni NJIA PEKEE ya kurejesha mfuko wako ikiwa utapoteza ufikiaji
• Bila haya, fedha zako zitaenda MILELE ikiwa utapoteza kifaa chako au utasahau nenosiri
• Yanadhibiti FEDHA ZOTE zako - yeyote akiyamiliki anadhibiti mfuko wako

JINSI YA KUWALINDA:
1. ANDIKA KWA KARATASI (kamwe kwa kompyuta/simu)
2. Weka mahali salama (sanduku la hazina, sanduku la usalama)
3. Fanya nakala nyingi mahali tofauti
4. KAMWE usiypige picha au kuyhifadhi mtandaoni
5. KAMWE usiyashiriki na mtu yeyote
6. Usiyweke kwenye maelezo yaliyofichwa mtandaoni

NINI KIFANYEKIWE NIKIYAPOTEA?
• Ikiwa bado una ufikiaji kwa mfuko: tengeneza mfuko mpya na uhamishe fedha zako
• Ikiwa huna ufikiaji tena: kwa bahati mbaya, fedha zako zimepotea milele
• Ndiyo maana hifadhi ni muhimu sana!

UTHIBITISHO WA MANENO:
• Wakati wa kutengeneza, mfuko unaomba kuyathibitisha
• Hakikisha umeandika maneno kwa mpangilio halisi
• Angalia uandishi wa kila neno
• Jaribu kurejesha kwenye kifaa kingine ikiwezekana (mfuko tupu)`
    },
    {
      keywords: ['transaction', 'biashara', 'ada za', 'fees', 'kutuma', 'kupokea'],
      category: 'transactions',
      content: 'Biashara kwenye Cardano ni za haraka (sekunde 20 kwa uthibitisho) na za gharama ndogo (takriban 0.17 ADA, ~$0.10). Kila biashara inahitaji ada za chini zilizohesabiwa kwa: base_fee (0.155381 ADA) + (ukubwa_biashara × 0.000043946 ADA/byte). Cardano inasaidia biashara za multi-assets (tokens asili), mikataba mahiri, metadata, na marejeo ya inputs (CIP-31) kupunguza gharama.'
    },
    {
      keywords: ['staking', 'kugawa', 'stake pool', 'pool', 'zawadi', 'delegation'],
      category: 'staking',
      content: 'Kuweka steki (kugawa) kuruhusu kupata zawadi za ADA (~4-5% APY) kwa kugawa ADA zako kwenye bahari ya steki bila kupoteza udhibiti wa fedha zako. Unaweza kujiondoa wakati wowote (hakuna kufungwa). Zawadi husambazwa kila siku 5 (epoch). Chagua bahari na: pledge nzuri, saturation <100%, ada za kawaida (0-5%), na utendaji >95%. Daima una udhibiti wa ADA zako - kugawa si kuhamisha.'
    },
    {
      keywords: ['smart contract', 'mkataba mahiri', 'plutus', 'aiken', 'dapp'],
      category: 'smart-contracts',
      content: 'Mikataba mahiri kwenye Cardano imeandikwa kwa Plutus (msingi wa Haskell, usalama wa kazi) au Aiken (syntax ya kisasa, rahisi zaidi). Inaruhusu kufanya biashara kiotomatiki kulingana na masharti yaliyoainishwa. EVM ya Cardano inaruhusu kutekeleza mikataba mahiri moja kwa moja katika UTXOs, ikitoa utabiri bora wa gharama na usalama. Kwenye WENZE, mfumo wetu wa escrow hutumia mikataba mahiri ya Plutus kuhakikisha biashara kati ya wanunuzi na wauzaji, kufunga fedha hadi uthibitisho wa uwasilishaji.'
    },
    {
      keywords: ['escrow', 'kuhifadhi', 'wenze', 'salama'],
      category: 'escrow',
      content: 'Escrow (kuhifadhi) ni mkataba mahiri ambao hufunga fedha hadi masharti fulani yatimizwe. Kwenye WENZE, escrow hulinda wanunuzi na wauzaji: fedha za ADA zinafungwa katika mkataba wa Plutus hadi mkununuzi athibitishe kupokea bidhaa. Ikiwa shida itatokea, mfumo wa timeout huruhusu malipo ya kurudi. Mkataba hauwezi kubadilishwa na unaweza kuangaliwa kwenye blockchain, kuhakikisha uwazi na usalama kamili.'
    },
    {
      keywords: ['ouroboros', 'makubaliano', 'proof of stake', 'pos', 'uthibitisho'],
      category: 'consensus',
      content: 'Ouroboros ni itifaki ya makubaliano ya Cardano inayotumia Uthibitisho wa Steki (PoS). Ni PoS ya kwanza iliyothibitishwa kihisabati kwa usalama. Ouroboros inahakikisha: usalama sawa na Bitcoin kwa matumizi ya chini ya nishati, utawala usio na katikati (hakuna bahari kuu), na uwezo (mamilioni ya biashara kwa sekunde inawezekana). Mtandao umegawanywa katika epochs (siku 5) na slots (sekunde 1), na wathibitishaji (stake pools) huchaguliwa kwa nasibu lakini kwa uzito wa steki yao.'
    }
  ]
};

// Réponses génériques
const defaultResponses: Record<string, Record<string, string>> = {
  fr: {
    greeting: 'Bonjour ! Je suis votre assistant Cardano sur WENZE. Je peux répondre à vos questions complexes sur la blockchain Cardano, les wallets, les transactions, les smart contracts, le staking, la gouvernance, et bien plus encore. Posez-moi n\'importe quelle question !',
    unknown: 'Je comprends votre question sur Cardano. Voici quelques informations générales : Cardano est une blockchain de troisième génération qui utilise la preuve d\'enjeu (Ouroboros) pour une sécurité maximale et une consommation énergétique minimale. Les transactions sont rapides (~20s) et peu coûteuses (~0.17 ADA). Sur WENZE, nous utilisons des smart contracts Plutus pour sécuriser vos transactions via notre système d\'escrow. Souhaitez-vous en savoir plus sur un sujet spécifique ?',
    help: 'Je peux vous aider avec :\n• Informations détaillées sur Cardano et ADA\n• Wallets et sécurité\n• Smart contracts (Plutus, Aiken) et DApps\n• Staking et récompenses\n• Transactions et frais\n• Gouvernance et CIPs\n• NFTs et tokens natifs\n• Scalabilité (Hydra)\n• Architecture technique (EUTXO, Ouroboros)\n\nPosez-moi n\'importe quelle question, même complexe !',
  },
  sw: {
    greeting: 'Hujambo! Mimi ni msaidizi wako wa Cardano kwenye WENZE. Ninaweza kujibu maswali yako magumu kuhusu blockchain ya Cardano, mifuko, biashara, mikataba mahiri, staking, utawala, na mengine mengi. Niulize swali lolote!',
    unknown: 'Naelewa swali lako kuhusu Cardano. Hapa kuna taarifa za jumla: Cardano ni blockchain ya kizazi cha tatu inayotumia uthibitisho wa steki (Ouroboros) kwa usalama wa juu na matumizi ya chini ya nishati. Biashara ni za haraka (~20s) na za gharama ndogo (~0.17 ADA). Kwenye WENZE, tunatumia mikataba mahiri ya Plutus kuhakikisha biashara zako kupitia mfumo wetu wa escrow. Je, ungependa kujua zaidi kuhusu mada maalum?',
    help: 'Ninaweza kukusaidia na:\n• Taarifa za kina kuhusu Cardano na ADA\n• Mifuko na usalama\n• Mikataba mahiri (Plutus, Aiken) na DApps\n• Staking na zawadi\n• Biashara na ada\n• Utawala na CIPs\n• NFTs na tokens asili\n• Uwezo (Hydra)\n• Muundo wa kiufundi (EUTXO, Ouroboros)\n\nNiulize swali lolote, hata la ugumu!',
  }
};

const CardanoChatBot: React.FC = () => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialiser avec un message de bienvenue
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: defaultResponses[language].greeting,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, language]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input quand le chat s'ouvre et auto-resize
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Auto-resize textarea quand le contenu change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 128) + 'px'; // Max 128px (32px * 4 lignes)
    }
  }, [inputValue]);

  // Extraction de l'intention et des concepts clés d'une question
  const extractIntent = (question: string): { intent: string; concepts: string[]; questionWords: string[] } => {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Mots de question courants (pour identifier les questions)
    const questionWords = ['quoi', 'qu\'est', 'comment', 'pourquoi', 'quand', 'où', 'qui', 'quel', 'quelle', 'combien', 'peux', 'peut', 'comment faire', 'explique', 'expliquer', 'définir', 'définition', 'nani', 'vipi', 'kwa nini', 'lini', 'wapi', 'nani', 'ngapi'];
    const foundQuestionWords = questionWords.filter(qw => lowerQuestion.includes(qw));
    
    // Concepts Cardano clés avec leurs synonymes
      const conceptMap: Record<string, string[]> = {
      'wallet': ['wallet', 'portefeuille', 'mkoba', 'nami', 'eternl', 'lace', 'yoroi', 'flint', 'vespr', 'créer wallet', 'installer wallet', 'nouveau wallet', 'tengeneza mfuko', 'kuweka mfuko'],
      'wallet-creation': ['créer', 'créer un', 'installer', 'nouveau', 'première fois', 'débutant', 'setup', 'configurer', 'comment créer', 'comment installer', 'tengeneza', 'kuweka', 'kuanzia', 'jinsi ya'],
      'ada': ['ada', 'lovelace', 'cryptomonnaie', 'monnaie', 'fedha'],
      'transaction': ['transaction', 'envoyer', 'recevoir', 'transfert', 'biashara', 'kutuma', 'kupokea', 'frais', 'fees', 'ada za'],
      'staking': ['staking', 'délégation', 'stake pool', 'pool', 'récompenses', 'zawadi', 'delegation', 'kugawa'],
      'smart contract': ['smart contract', 'contrat intelligent', 'plutus', 'aiken', 'mkataba mahiri', 'dapp'],
      'escrow': ['escrow', 'séquestre', 'sécurisé', 'kuhifadhi', 'salama'],
      'cardano': ['cardano', 'blockchain', 'blockchain', 'troisième génération', '3ème génération', 'kizazi cha tatu'],
      'ouroboros': ['ouroboros', 'consensus', 'proof of stake', 'pos', 'preuve d\'enjeu', 'uthibitisho'],
      'nft': ['nft', 'token', 'native token', 'token natif'],
      'governance': ['gouvernance', 'vote', 'cip', 'catalyst', 'voltaire', 'utawala'],
      'wallet-security': ['phrase', 'seed', 'récupération', 'backup', 'sauvegarder', 'maneno ya kurejesha', 'maneno ya siri'],
      'wenze': ['wenze', 'marketplace wenze', 'comment fonctionne wenze', 'wenze comment ça marche', 'goma', 'rdc'],
      'wenze-achat': ['acheter', 'comment acheter', 'processus achat', 'acheter produit', 'commander', 'achat wenze'],
      'wenze-vente': ['vendre', 'comment vendre', 'publier produit', 'créer produit', 'mettre en vente', 'vendre wenze'],
      'wenze-wzp': ['wzp', 'points', 'points wzp', 'récompenses', 'système points', 'gagner points'],
      'wenze-negociation': ['négociation', 'négocier prix', 'proposer prix', 'prix négociable', 'comment négocier'],
      'wenze-categories': ['catégories', 'catégorie produit', 'types produits', 'quelles catégories'],
      'wenze-chat': ['chat', 'messagerie', 'message', 'communiquer', 'discuter', 'contacter vendeur'],
      'wenze-profil': ['profil', 'réputation', 'score réputation', 'vérifié', 'boutique', 'statistiques'],
      'wenze-ada': ['acheter ada', 'vendre ada', 'acheter des ada', 'vendre des ada', 'obtenir ada', 'comment obtenir ada', 'comment acheter ada', 'comment vendre ada', 'échanger ada', 'convertir ada', 'ada fc', 'ada ↔ fc', 'échanger ada fc', 'convertir ada fc', 'partenaire exchange', 'ada exchange', 'yann exchange', 'jules exchange'],
    };
    
    // Identifier les concepts mentionnés
    const concepts: string[] = [];
    for (const [concept, synonyms] of Object.entries(conceptMap)) {
      if (synonyms.some(synonym => lowerQuestion.includes(synonym))) {
        concepts.push(concept);
      }
    }
    
    // Déterminer l'intention
    let intent = 'general';
    if (lowerQuestion.includes('comment') || lowerQuestion.includes('vipi') || lowerQuestion.includes('faire') || lowerQuestion.includes('how')) {
      intent = 'how-to';
    } else if (lowerQuestion.includes('quoi') || lowerQuestion.includes('qu\'est') || lowerQuestion.includes('nani') || lowerQuestion.includes('what')) {
      intent = 'what-is';
    } else if (lowerQuestion.includes('pourquoi') || lowerQuestion.includes('kwa nini') || lowerQuestion.includes('why')) {
      intent = 'why';
    } else if (lowerQuestion.includes('combien') || lowerQuestion.includes('ngapi') || lowerQuestion.includes('how much')) {
      intent = 'how-much';
    }
    
    return { intent, concepts, questionWords: foundQuestionWords };
  };

  // Fonction améliorée pour rechercher dans la base de connaissances avec analyse sémantique
  const searchKnowledgeBase = (question: string): string | null => {
    const kb = cardanoKnowledgeBase[language] || [];
    const { intent, concepts } = extractIntent(question);
    
    // Normaliser la question
    const normalizedQuestion = question.toLowerCase()
      .replace(/[.,!?;:()\[\]{}'"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const questionWords = normalizedQuestion.split(/\s+/).filter(w => w.length > 2);
    
    // Scoring intelligent avec pondération
    const matches: Array<{ entry: KnowledgeEntry; score: number; matchedConcepts: string[] }> = [];
    
    for (const entry of kb) {
      let score = 0;
      const matchedConcepts: string[] = [];
      
      // 1. Correspondance des mots-clés avec pondération élevée
      for (const keyword of entry.keywords) {
        const keywordLower = keyword.toLowerCase();
        const keywordWords = keywordLower.split(/\s+/);
        
        // Correspondance exacte du mot-clé complet (score très élevé)
        if (normalizedQuestion.includes(keywordLower)) {
          score += 20;
          matchedConcepts.push(keyword);
        } else {
          // Correspondance de tous les mots du mot-clé (score élevé)
          const allWordsMatch = keywordWords.every(kw => 
            questionWords.some(qw => qw.includes(kw) || kw.includes(qw))
          );
          if (allWordsMatch) {
            score += 15;
            matchedConcepts.push(keyword);
          } else {
            // Correspondance partielle (score moyen)
            const partialMatches = keywordWords.filter(kw => 
              questionWords.some(qw => qw.includes(kw) || kw.includes(qw))
            );
            if (partialMatches.length > 0) {
              score += 5 * partialMatches.length;
            }
          }
        }
      }
      
      // 2. Correspondance du contenu avec le contexte de la question (recherche sémantique basique)
      const entryContentLower = entry.content.toLowerCase();
      const relevantWords = questionWords.filter(qw => 
        entryContentLower.includes(qw) && qw.length > 3
      );
      score += relevantWords.length * 2; // Bonus pour mots pertinents dans le contenu
      
      // 3. Bonus pour catégorie correspondant aux concepts identifiés
      if (concepts.length > 0) {
        const categoryMatch = concepts.some(concept => {
          const categoryMap: Record<string, string[]> = {
            'wallet': ['wallets', 'wallet-creation', 'wallet-security'],
            'wallet-creation': ['wallet-creation', 'wallets'],
            'wallet-security': ['wallet-security', 'wallets'],
            'ada': ['ada'],
            'transaction': ['transactions'],
            'staking': ['staking'],
            'smart contract': ['smart-contracts'],
            'escrow': ['escrow'],
            'cardano': ['général'],
            'ouroboros': ['consensus'],
            'nft': ['tokens'],
            'governance': ['governance'],
            'wenze': ['wenze-general', 'wenze-achat', 'wenze-vente', 'wenze-wzp', 'wenze-negociation', 'wenze-categories', 'wenze-chat', 'wenze-profil', 'wenze-ada'],
            'wenze-achat': ['wenze-achat', 'wenze-general'],
            'wenze-vente': ['wenze-vente', 'wenze-general'],
            'wenze-wzp': ['wenze-wzp', 'wenze-general'],
            'wenze-negociation': ['wenze-negociation', 'wenze-general'],
            'wenze-categories': ['wenze-categories', 'wenze-general'],
            'wenze-chat': ['wenze-chat', 'wenze-general'],
            'wenze-profil': ['wenze-profil', 'wenze-general'],
            'wenze-ada': ['wenze-ada', 'wenze-general'],
          };
          return categoryMap[concept]?.includes(entry.category);
        });
        if (categoryMatch) score += 10;
      }
      
      // 4. Bonus spécial pour questions sur création de wallet (priorité haute)
      const walletCreationKeywords = ['créer', 'installer', 'nouveau', 'première fois', 'débutant', 'setup', 'tengeneza', 'kuweka', 'kuanzia'];
      const hasWalletCreationIntent = walletCreationKeywords.some(keyword => normalizedQuestion.includes(keyword)) && 
                                      (normalizedQuestion.includes('wallet') || normalizedQuestion.includes('portefeuille') || normalizedQuestion.includes('mfuko'));
      if (hasWalletCreationIntent && entry.category === 'wallet-creation') {
        score += 30; // Bonus très élevé pour questions sur création
      }
      
      // 5. Bonus pour longueur du contenu (contenus détaillés préférés)
      if (score > 0) {
        score += Math.min(entry.content.length / 200, 5); // Bonus limité
      }
      
      if (score > 0) {
        matches.push({ entry, score, matchedConcepts });
      }
    }
    
    // Trier par score décroissant
    matches.sort((a, b) => b.score - a.score);
    
    if (matches.length === 0) return null;
    
    // Si on a une excellente correspondance (score > 15), la retourner seule
    const bestMatch = matches[0];
    if (bestMatch.score >= 15) {
      // Enrichir la réponse avec le contexte de la question si c'est une question "comment"
      if (intent === 'how-to' && bestMatch.entry.content) {
        return bestMatch.entry.content;
      }
      return bestMatch.entry.content;
    }
    
    // Si plusieurs bonnes correspondances (score > 5), les combiner intelligemment
    const goodMatches = matches.filter(m => m.score >= 5);
    if (goodMatches.length > 1) {
      // Prendre les 2 meilleures et les combiner
      const combined = goodMatches.slice(0, 2)
        .map(m => m.entry.content)
        .join('\n\n---\n\n');
      return combined;
    }
    
    // Sinon, retourner la meilleure correspondance même si score faible
    return bestMatch.entry.content;
  };

  // Fonction améliorée pour appeler l'API OpenAI avec historique de conversation
  const callOpenAI = async (question: string, conversationHistory: ChatMessage[]): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      return ''; // Pas d'API key, utiliser la base de connaissances
    }

    try {
      // Construire l'historique de conversation pour le contexte
      const historyMessages = conversationHistory.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const systemPrompt = language === 'fr' 
        ? `Tu es un expert IA en blockchain Cardano travaillant pour WENZE, une marketplace sécurisée sur Cardano. 

MISSION : Comprendre et répondre intelligemment à TOUTES les questions sur Cardano, avec un raisonnement approfondi comme ChatGPT.

MÉTHODE DE RÉFLEXION (comme ChatGPT) :
1. ANALYSE d'abord la question pour comprendre l'intention réelle
2. RÉFLÉCHIS aux concepts connexes et au contexte
3. STRUCTURE ta réponse de manière logique et progressive
4. ANTICIPE les questions de suivi potentielles
5. ADAPTE le niveau de détail selon le type de question

CONTEXTE WENZE :
- Marketplace utilisant des smart contracts Plutus (escrow) pour sécuriser les transactions
- Plateforme pour acheteurs et vendeurs à Goma, RDC
- Système de points WZP intégré
- Support multi-wallets (Nami, Eternl, Lace, Yoroi, Flint, Vespr)

CONNAISSANCES CARDANO ESSENTIELLES :
- Blockchain de 3ème génération avec Ouroboros (PoS prouvé mathématiquement)
- Transactions rapides (~20s) et peu coûteuses (~0.17 ADA de base)
- Smart contracts en Plutus (Haskell) ou Aiken
- Staking avec ~4-5% APY annuel, pas de verrouillage des fonds
- Modèle EUTXO (Extended UTXO) pour sécurité renforcée
- Native tokens et NFTs de première classe (sans smart contracts)
- Gouvernance décentralisée (Voltaire, Catalyst, CIPs)
- Scalabilité avec Hydra (Layer 2 solution)

SPÉCIALITÉ CRÉATION DE WALLETS :
Tu maîtrises parfaitement le processus de création de wallets Cardano :
- Étapes détaillées pour chaque wallet (Nami, Eternl, Lace, Yoroi)
- Importance critique de la phrase de récupération
- Sécurité et meilleures pratiques
- Intégration avec WENZE après création

SPÉCIALITÉ WENZE - FONCTIONNEMENT COMPLET :
Tu connais PARFAITEMENT comment fonctionne WENZE :
- Processus d'achat complet (de la recherche à la réception)
- Processus de vente complet (publication à réception des fonds)
- Système d'escrow blockchain Cardano (sécurité des transactions)
- Système de points WZP (répartition 50/50, distribution automatique)
- Négociation de prix (mode négociation, propositions, acceptation)
- Catégories de produits (9 catégories, spécificités de chaque)
- Types de prix (fixe vs négociable avec plage min-max)
- Disponibilité des services (statut disponible/indisponible)
- Chat intégré (statut de lecture, présence en ligne, temps réel)
- Profil et réputation (score, boutique publique, statistiques)
- États de commande (pending → escrow_web2 → shipped → completed)

LORSQUE QUELQU'UN DEMANDE SUR WENZE :
- Explique le fonctionnement COMPLET de manière structurée
- Donne des EXEMPLES CONCRETS de chaque étape
- Mentionne les spécificités (escrow, WZP, négociation, services)
- Guide l'utilisateur étape par étape selon sa question

DIRECTIVES DE RÉPONSE (Style ChatGPT) :
1. RAISONNE avant de répondre : analyse la question sous plusieurs angles
2. STRUCTURE ta réponse : introduction → détails → exemples → conclusion
3. SOIS EXHAUSTIF : donne toutes les informations pertinentes, pas juste une réponse courte
4. ANTICIPE les besoins : si quelqu'un demande comment créer un wallet, explique TOUT le processus étape par étape
5. SOIS PRÉCIS : donne des détails concrets, chiffres, étapes numérotées
6. RESTE CONVERSATIONNEL : parle comme un expert amical qui veut vraiment aider
7. ADAPTE le niveau : plus de détails pour les questions complexes, plus simple pour les débutants
8. MENTIONNE WENZE quand pertinent : connecte toujours avec le contexte WENZE si c'est utile

EXEMPLES DE RAISONNEMENT APPROFONDI :

Question : "Comment créer un wallet ?"
Réflexion : L'utilisateur veut probablement un guide complet. Je dois :
- Expliquer les options de wallets disponibles
- Décrire chaque étape en détail (choix, installation, création, sauvegarde, sécurité)
- Mentionner l'intégration avec WENZE
- Mettre l'accent sur la sécurité (phrase de récupération)
- Donner des conseils pratiques

Question : "C'est quoi Cardano ?"
Réflexion : Question générale mais importante. Je dois :
- Donner une définition claire
- Expliquer ce qui la différencie (PoS, sécurité, approche scientifique)
- Mentionner les avantages pratiques
- Relier au contexte WENZE si pertinent

Question : "Je comprends rien au staking"
Réflexion : L'utilisateur est débutant. Je dois :
- Expliquer de manière très simple avec analogies
- Donner les avantages concrets (rendements)
- Rassurer sur la simplicité
- Donner les étapes pour commencer
- Répondre aux préoccupations courantes (sécurité, verrouillage)`
        : `Wewe ni mtaalamu wa AI wa blockchain ya Cardano unayefanya kazi kwa WENZE, soko la mtandaoni lenye usalama kwenye Cardano.

MISHENI: Elewa na ujibu kwa akili MASWALI YOTE kuhusu Cardano, kwa kufikiria kwa kina kama ChatGPT.

NJIA YA KUFIKIRIA (kama ChatGPT):
1. CHAMBUA swali kwanza ili kuelewa lengo halisi
2. FIKIRIA dhana zinazohusiana na muktadha
3. UNDA jibu lako kwa mantiki na hatua kwa hatua
4. TAZAMIA maswali ya ziada yanayoweza kuja
5. BADILISHA kina kulingana na aina ya swali

MUKTADHA WA WENZE:
- Soko linalotumia mikataba mahiri ya Plutus (escrow) kuhakikisha biashara
- Jukwaa kwa wanunuzi na wauzaji Goma, RDC
- Mfumo wa pointi WZP uliojumuishwa
- Msaada wa mifuko mbalimbali (Nami, Eternl, Lace, Yoroi, Flint, Vespr)

UJUZI MUHIMU WA CARDANO:
- Blockchain ya kizazi cha 3 na Ouroboros (PoS iliyothibitishwa kihisabati)
- Biashara za haraka (~20s) na za gharama ndogo (~0.17 ADA ya msingi)
- Mikataba mahiri kwa Plutus (Haskell) au Aiken
- Staking na ~4-5% APY ya kila mwaka, hakuna kufungwa kwa fedha
- Mfano wa EUTXO kwa usalama ulioimarishwa
- Tokens asili na NFTs za daraja la kwanza (bila mikataba mahiri)
- Utawala usio na katikati (Voltaire, Catalyst, CIPs)
- Uwezo na Hydra (Suluhisho la Layer 2)

UJUAJUZI WA KUTENGENEZA MIFUKO:
Unajua kikamilifu mchakato wa kutengeneza mifuko ya Cardano:
- Hatua za kina kwa kila mfuko (Nami, Eternl, Lace, Yoroi)
- Umuhimu mkuu wa maneno ya kurejesha
- Usalama na mazoea bora
- Muunganisho na WENZE baada ya kutengeneza

MAELEKEZO YA UJIBU (Mtindo wa ChatGPT):
1. FIKIRIA kabla ya kujibu: chambua swali kutoka pembe nyingi
2. UNDA jibu lako: utangulizi → maelezo → mifano → hitimisho
3. WA KAMILIFU: toa taarifa zote zinazofaa, sio jibu fupi tu
4. TAZAMIA mahitaji: ikiwa mtu anauliza jinsi ya kutengeneza mfuko, eleza mchakato WOTE hatua kwa hatua
5. WA HALISI: toa maelezo halisi, nambari, hatua zilizohesabiwa
6. BAKI MZUNGUMZIAJI: ongea kama mtaalamu rafiki anayetaka kusaidia kweli
7. BADILISHA kiwango: maelezo zaidi kwa maswali magumu, rahisi zaidi kwa wanaoanza
8. TAJA WENZE inapofaa: unganisha daima na muktadha wa WENZE ikiwa ni muhimu`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Utiliser gpt-4o-mini pour meilleures réponses à coût réduit
          messages: [
            { role: 'system', content: systemPrompt },
            ...historyMessages,
            { role: 'user', content: question },
          ],
          max_tokens: 1500, // Plus de tokens pour réponses approfondies et détaillées
          temperature: 0.7, // Équilibré entre créativité et précision pour raisonnement approfondi
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API Error:', errorData);
        throw new Error('API Error');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Erreur OpenAI:', error);
      return '';
    }
  };

  // Générer une réponse intelligente qui comprend le contexte
  const generateResponse = async (question: string): Promise<string> => {
    // 1. PRIORITÉ: Essayer OpenAI d'abord (si disponible) - meilleure compréhension des questions
    try {
      const aiResponse = await callOpenAI(question, messages);
      if (aiResponse && aiResponse.trim().length > 30) {
        return aiResponse.trim();
      }
    } catch (error) {
      console.log('OpenAI non disponible, utilisation de la base de connaissances');
    }

    // 2. Recherche intelligente dans la base de connaissances avec analyse sémantique
    const kbAnswer = searchKnowledgeBase(question);
    if (kbAnswer && kbAnswer.trim().length > 20) {
      // Enrichir la réponse KB avec un contexte si c'est une vraie question
      const { intent, concepts } = extractIntent(question);
      
      // Si la réponse concerne la création de wallet, elle est déjà complète
      if (kbAnswer.includes('CRÉER UN WALLET') || kbAnswer.includes('KUTENGENEZA MfUKO')) {
        return kbAnswer; // La réponse KB est déjà exhaustive
      }
      
      if (intent !== 'general' && concepts.length > 0) {
        // La réponse de la KB est pertinente
        return kbAnswer;
      } else if (kbAnswer) {
        // Réponse de fallback mais toujours utile
        return kbAnswer;
      }
    }

    // 3. Si on a identifié des concepts mais pas de réponse, donner une réponse contextuelle
    const { concepts } = extractIntent(question);
    if (concepts.length > 0) {
      const conceptResponses: Record<string, Record<string, string>> = {
        fr: {
          'wallet': 'Je peux vous aider avec les wallets Cardano ! Les principaux wallets sont Nami, Eternl, Lace, Yoroi, Flint et Vespr. Tous sont supportés sur WENZE. Voulez-vous savoir comment configurer un wallet ou comment l\'utiliser pour les transactions sur notre plateforme ?',
          'ada': 'ADA est la cryptomonnaie native de Cardano, nommée d\'après Ada Lovelace. Elle sert à payer les transactions, faire du staking pour gagner des récompenses, et est utilisée sur WENZE pour sécuriser vos achats via notre système d\'escrow. 1 ADA = 1,000,000 Lovelaces. Que souhaitez-vous savoir précisément sur ADA ?',
          'transaction': 'Les transactions Cardano sont rapides (~20 secondes) et peu coûteuses (~0.17 ADA). Sur WENZE, vos transactions sont sécurisées par des smart contracts escrow qui verrouillent les fonds jusqu\'à confirmation de réception. Avez-vous une question spécifique sur comment faire une transaction ?',
          'staking': 'Le staking Cardano vous permet de gagner ~4-5% APY en déléguant vos ADA à un stake pool, sans jamais perdre le contrôle de vos fonds. Vous pouvez unstake à tout moment. Les récompenses arrivent toutes les 5 jours. Voulez-vous savoir comment commencer le staking ?',
          'wenze': 'WENZE est une marketplace sécurisée sur Cardano pour Goma, RDC. Elle permet d\'acheter et vendre des produits/services avec protection escrow blockchain. Fonctionnalités : escrow sécurisé, points WZP, négociation de prix, chat intégré, 9 catégories de produits. Voulez-vous savoir comment acheter, vendre, ou utiliser une fonctionnalité spécifique ?',
          'wenze-achat': 'Pour acheter sur WENZE : 1) Créer un compte, 2) Connecter un wallet Cardano, 3) Parcourir les produits, 4) Choisir prix fixe ou négociable, 5) Passer commande, 6) Les fonds sont verrouillés dans l\'escrow, 7) Confirmer la réception pour libérer les fonds. Vous gagnez aussi des points WZP ! Quelle étape vous intéresse ?',
          'wenze-vente': 'Pour vendre sur WENZE : 1) Créer un compte, 2) Publier un produit (choisir catégorie, titre, description, images, type de prix), 3) Gérer les commandes reçues, 4) Confirmer l\'expédition, 5) Recevoir les fonds automatiquement après confirmation acheteur. Vous gagnez 50% des points WZP par transaction ! Besoin d\'aide pour une étape spécifique ?',
          'wenze-wzp': 'Les points WZP récompensent votre activité sur WENZE. À chaque transaction complétée, 50% des points vont à l\'acheteur et 50% au vendeur. Les points sont distribués automatiquement et visibles dans votre profil. Plus vous êtes actif, plus vous accumulez de points !',
          'wenze-negociation': 'La négociation est disponible pour les produits avec prix négociable. Le vendeur définit une plage (min-max). L\'acheteur peut proposer un prix dans cette plage via le chat. Si accepté, les fonds sont verrouillés dans l\'escrow au prix convenu. Tout se fait via le chat intégré !',
          'wenze-categories': 'WENZE a 9 catégories : Électronique, Mode (habits/souliers), Aliments, Beauté, Bricolage, Services (avec disponibilité), Immobilier, Auto, Autres. Chaque catégorie a des champs spécifiques. Services/Immobilier/Auto utilisent contact direct (pas d\'escrow).',
          'wenze-chat': 'Le chat WENZE est intégré dans chaque commande. Il permet de négocier, coordonner la livraison, poser des questions. Fonctionnalités : statut de lecture (✓ simple, ✓✓ lu), présence en ligne, messages temps réel (mise à jour 5 secondes).',
          'wenze-profil': 'Votre profil WENZE affiche : nom, username, email, avatar, score de réputation, points WZP, adresse wallet. Vous avez aussi une boutique publique visible par tous avec vos produits. Le score augmente avec les transactions réussies.',
          'wenze-ada': 'IMPORTANT : WENZE est une MARKETPLACE pour produits/services avec partenaires d\'échange intégrés. Pour échanger ADA ↔ FC : utiliser les partenaires WENZE (ADA Exchange, Yann Exchange, Jules Exchange) via "Échanger ADA ↔ FC" dans la navigation. Pour utiliser des ADA : les dépenser sur WENZE pour acheter des produits. Pour recevoir des ADA : vendre des produits sur WENZE, puis échanger via les partenaires si besoin.',
        },
        sw: {
          'wallet': 'Ninaweza kukusaidia na mifuko ya Cardano! Mifuko kuu ni Nami, Eternl, Lace, Yoroi, Flint na Vespr. Yote yanasaidia kwenye WENZE. Je, ungependa kujua jinsi ya kuweka mfuko au jinsi ya kuitumia kwa biashara kwenye jukwaa letu?',
          'ada': 'ADA ni fedha za kidijitali za asili za Cardano, zilizopewa jina la Ada Lovelace. Hutumika kwa kulipa biashara, kufanya staking kupata zawadi, na hutumika kwenye WENZE kuhakikisha ununuzi wako kupitia mfumo wetu wa escrow. Je, ungependa kujua nini hasa kuhusu ADA?',
          'transaction': 'Biashara za Cardano ni za haraka (~sekunde 20) na za gharama ndogo (~0.17 ADA). Kwenye WENZE, biashara zako zinalindwa na mikataba mahiri ya escrow inayofunga fedha hadi uthibitisho wa upokeaji. Je, una swali maalum kuhusu jinsi ya kufanya biashara?',
          'staking': 'Kuweka steki kwenye Cardano kuruhusu kupata ~4-5% APY kwa kugawa ADA zako kwenye bahari ya steki, bila kupoteza udhibiti wa fedha zako. Unaweza kujiondoa wakati wowote. Zawadi huja kila siku 5. Je, ungependa kujua jinsi ya kuanza kuweka steki?',
          'wenze': 'WENZE ni soko la mtandaoni lenye usalama kwenye Cardano kwa Goma, RDC. Inaruhusu kununua na kuuza bidhaa/huduma kwa ulinzi wa escrow blockchain. Vipengele: escrow salama, pointi WZP, mazungumzo ya bei, mazungumzo yaliyojumuishwa, aina 9 za bidhaa. Je, ungependa kujua jinsi ya kununua, kuuza, au kutumia kipengele maalum?',
          'wenze-achat': 'Kununua kwenye WENZE: 1) Tengeneza akaunti, 2) Unganisha mfuko wa Cardano, 3) Chunguza bidhaa, 4) Chagua bei isiyobadilika au inayoweza kuzungumzwa, 5) Fanya agizo, 6) Fedha zinafungwa kwenye escrow, 7) Thibitisha upokeaji ili kutoa fedha. Pia unapata pointi WZP! Ni hatua gani inakuvutia?',
          'wenze-vente': 'Kuuza kwenye WENZE: 1) Tengeneza akaunti, 2) Chapisha bidhaa (chagua aina, kichwa, maelezo, picha, aina ya bei), 3) Simamia maagizo yaliyopokelewa, 4) Thibitisha uwasilishaji, 5) Poka fedha kiotomatiki baada ya uthibitisho wa mnunuzi. Unapata 50% ya pointi WZP kwa kila biashara! Je, unahitaji msaada kwa hatua maalum?',
          'wenze-wzp': 'Pointi za WZP zinawafahamu watumiaji hai kwenye WENZE. Kwa kila biashara iliyokamilika, 50% ya pointi huenda kwa mnunuzi na 50% kwa muuzaji. Pointi husambazwa kiotomatiki na zinaonekana kwenye wasifu wako. Kadri unavyokuwa hai, ndivyo unavyokusanya pointi!',
          'wenze-negociation': 'Mazungumzo yanapatikana kwa bidhaa zenye bei inayoweza kuzungumzwa. Muuzaji huamua safu (kiwango cha chini-kiwango cha juu). Mnunuzi anaweza kupendekeza bei kwenye safu hii kupitia mazungumzo. Ikiwa inakubaliwa, fedha zinafungwa kwenye escrow kwa bei iliyokubaliwa. Yote hufanywa kupitia mazungumzo yaliyojumuishwa!',
          'wenze-categories': 'WENZE ina aina 9: Elektroniki, Mvuto (nguo/viatu), Vyakula, Urembo, Ujenzi, Huduma (na uwepo), Mali isiyohamika, Magari, Zingine. Kila aina ina sehemu maalum. Huduma/Mali isiyohamika/Magari hutumia mawasiliano ya moja kwa moja (hakuna escrow).',
          'wenze-chat': 'Mazungumzo ya WENZE yamejumuishwa kwenye kila agizo. Yanaruhusu kuzungumza, kuratibu uwasilishaji, kuuliza maswali. Vipengele: hali ya kusoma (✓ rahisi, ✓✓ kusomwa), uwepo mtandaoni, ujumbe wa wakati halisi (sasisho sekunde 5).',
          'wenze-profil': 'Wasifu wako wa WENZE unaonyesha: jina, jina la mtumiaji, barua pepe, picha, alama ya sifa, pointi WZP, anwani ya mfuko. Pia una duka la umma linaloonekana na kila mtu na bidhaa zako. Alama huongezeka kwa biashara zilizofanikiwa.',
          'wenze-ada': 'MUHIMU: WENZE ni SOKO la bidhaa/huduma na washirika wa kubadilisha waliyojumuishwa. Kubadilisha ADA ↔ FC: tumia washirika wa WENZE (ADA Exchange, Yann Exchange, Jules Exchange) kupitia "Badilisha ADA ↔ FC" kwenye urambazaji. Kutumia ADA: zitumie kwenye WENZE kununua bidhaa. Kupokea ADA: uuze bidhaa kwenye WENZE, kisha ubadilishe kupitia washirika ikiwa inahitajika.',
        }
      };
      
      const matchedConcept = concepts[0];
      if (conceptResponses[language]?.[matchedConcept]) {
        return conceptResponses[language][matchedConcept];
      }
    }

    // 4. Réponse par défaut améliorée avec suggestions
    return defaultResponses[language].unknown + (language === 'fr' 
      ? '\n\n💡 Essayez de reformuler votre question ou posez-moi quelque chose comme :\n• "Comment fonctionne Cardano ?"\n• "C\'est quoi le staking ?"\n• "Comment utiliser un wallet ?"\n• "Comment faire une transaction sur WENZE ?"'
      : '\n\n💡 Jaribu kuunda swali au niulize kitu kama:\n• "Cardano inafanyaje kazi?"\n• "Staking ni nini?"\n• "Jinsi ya kutumia mfuko?"\n• "Jinsi ya kufanya biashara kwenye WENZE?"');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Générer la réponse avec contexte complet
    const response = await generateResponse(userMessage.content);
    
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleHelp = () => {
    const helpMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: defaultResponses[language].help,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, helpMessage]);
  };

  return (
    <>
      {/* Bouton flottant amélioré */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-2xl shadow-2xl hover:shadow-violet-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group overflow-hidden"
          aria-label={language === 'fr' ? 'Ouvrir le chat Cardano' : 'Fungua mazungumzo ya Cardano'}
        >
          {/* Effet de brillance animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Badge notification avec animation */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}
          
          {/* Icône */}
          {isOpen ? (
            <X className="w-7 h-7 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <div className="relative z-10">
              <Bot className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
        </button>
        
        {/* Texte "Demander à l'IA" */}
        {!isOpen && (
          <div className="flex flex-col items-center gap-1.5" style={{ animation: 'fadeIn 0.3s ease-in' }}>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 bg-gradient-to-r from-white to-violet-50 dark:from-gray-800 dark:to-violet-950/30 px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-violet-200/50 dark:border-violet-700/50">
              {language === 'fr' ? 'Demander à l\'IA' : 'Uliza AI'}
            </span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Fenêtre de chat - Style ChatGPT */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[520px] h-[750px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-fade-in">
          {/* En-tête - Style ChatGPT */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                    {language === 'fr' ? 'Assistant Cardano' : 'Msaidizi wa Cardano'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'fr' ? 'En ligne' : 'Hai mtandaoni'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleHelp}
                  className="text-xs px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  {language === 'fr' ? 'Aide' : 'Msaada'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages - Style ChatGPT */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 scroll-smooth">
            <div className="max-w-4xl mx-auto px-5 py-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' 
                      ? 'bg-violet-600' 
                      : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block max-w-[90%] rounded-2xl px-5 py-4 ${
                        msg.role === 'user'
                          ? 'bg-violet-600 text-white rounded-tr-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="text-[15px] leading-[1.75] whitespace-pre-wrap break-words font-normal">
                          {msg.content.split('\n').map((line, i) => (
                            <p key={i} className={i > 0 ? 'mt-3' : ''}>{line || '\u00A0'}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-200 dark:border-gray-700">
                      <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input - Style ChatGPT */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <form onSubmit={handleSend} className="relative">
              <div className="relative flex items-end gap-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 focus-within:border-violet-500 dark:focus-within:border-violet-500 transition-colors shadow-sm">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={language === 'fr' ? 'Message Cardano...' : 'Ujumbe wa Cardano...'}
                  className="flex-1 resize-none border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-[15px] leading-relaxed max-h-32 overflow-y-auto py-1"
                  rows={1}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as any);
                    }
                  }}
                  style={{ minHeight: '24px' }}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-lg flex items-center justify-center hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-violet-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1 text-center">
                {language === 'fr' ? 'Appuyez sur Entrée pour envoyer, Maj+Entrée pour nouvelle ligne' : 'Bofya Enter kutuma, Shift+Enter kwa mstari mpya'}
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CardanoChatBot;
