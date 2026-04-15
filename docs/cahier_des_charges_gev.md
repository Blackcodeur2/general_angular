# Cahier des Charges - Application GEV (Gestion d'Entreprise de Voyage)

## 1. Contexte et Présentation du Projet

### 1.1 Contexte

Dans le cadre de la modernisation de la gestion des agences de voyage de transport interurbain au Cameroun, ce projet vise à remplacer/améliorer les processus manuels ou obsolètes par une solution numérique intégrée (CamerTrip / GEV).

### 1.2 Objectifs

L'objectif est de développer une plateforme web/mobile robuste permettant la gestion complète du cycle de vie d'une réservation de voyage, la gestion des flottes, du personnel, et des paiements digitalisés.

## 2. Définition du Périmètre

Le projet couvre les interfaces pour divers types d'utilisateurs :

- Administrateurs globaux
- Propriétaires d'agences
- Chefs d'agence
- Agents de guichet
- Clients finaux (voyageurs)

## 3. Spécifications Fonctionnelles

### 3.1 Module Utilisateurs et Rôles

- Authentification et gestion des permissions selon les profils.
- Interface d'administration pour la gestion des utilisateurs (pagination côté serveur, filtres par rôle).
- Dashboard avec statistiques pour les propriétaires (CA, nombre de voyages, etc.).

### 3.2 Gestion des Réservations (Agent et Client)

- Sélection des trajets, dates, et choix des sièges (carte interactive).
- Vérification du statut des voyages pour empêcher les réservations sur les trajets terminés.
- Génération de billets PDF (via DomPDF côté backend) et téléchargement.
- Suivi de l'historique des réservations.

### 3.3 Gestion des Agences (Chef d'Agence)

- Gestion du personnel (chauffeurs, agents).
- Gestion des trajets, horaires et affectation des bus/chauffeurs.

### 3.4 Module de Paiement

- Intégration de la passerelle de paiement CamPay (Mobile Money etc.).
- Gestion du statut des paiements en temps réel (Push USSD, Callback).

## 4. Spécifications Techniques

### 4.1 Frontend (Application Web)

- *Framework* : Angular
- *Styling* : CSS/SCSS (Design moderne, responsif, tableaux riches avec badges de statut).
- *State Management / API* : Services Angular, injection de dépendances.

### 4.2 Backend (API)

- *Framework* : Laravel (PHP)
- *Base de données* : MySQL ou PostgreSQL
- API RESTful pour la communication avec le Frontend Angular et l'Application Mobile.

### 4.3 Frontend (Application Mobile Client)

- *Framework* : Flutter (Android)
- *Interaction* : Partage la même base de données via l'API RESTful.
- *Fonctionnalités* : Recherche de trajets, réservation de billets, et consultation de l'historique de voyage par le client final.

## 5. Contraintes et Exigences

- *Sécurité* : Protection des données personnelles (KYC documents), sécurisation des transactions CamPay.
- *Performance* : Les pages de liste doivent utiliser la pagination côté serveur pour des temps de réponse rapides.
- *Ergonomie* : Interface utilisateur "premium", intuitive et responsive (accessible sur tablette/desktop aux guichets).

## 6. Livrables

- Code source Frontend Web Angular et Mobile Flutter (dépôts Git).
- Documentation utilisateur et technique.
- Environnement de test (Staging) pour validation.

## 7. Planning et Étapes (À définir)

- Phase 1 : Cadrage et Maquettes
- Phase 2 : Développement Backend et API
- Phase 3 : Développement Frontend Angular et Application Mobile Flutter
- Phase 4 : Tests et Intégration
- Phase 5 : Déploiement et Formation
