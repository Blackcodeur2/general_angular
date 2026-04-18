# Analyse de la Base de Données `transport_net_backend`

> **Contexte** : Système de gestion de transport interurbain — Laravel 12 / MySQL 9.1  
> **Date** : 16 avril 2026  
> **Source** : Export phpMyAdmin — 698 lignes, 12 tables métier

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Points forts du schéma](#2-points-forts-du-schéma)
3. [Problèmes critiques](#3-problèmes-critiques)
4. [Problèmes de conception](#4-problèmes-de-conception)
5. [Recommandations prioritaires](#5-recommandations-prioritaires)
6. [Cartographie des relations](#6-cartographie-des-relations)
7. [Notation globale](#7-notation-globale)

---

## 1. Introduction

Ce rapport présente une analyse approfondie de la base de données `transport_net_backend`, un système de gestion de transport interurbain développé avec le framework Laravel 12 et le serveur de base de données MySQL 9.1. Le schéma SQL a été exporté via phpMyAdmin le 16 avril 2026 et constitue la base de cette évaluation.

L'objectif principal de cet audit est d'identifier les problèmes structurels, les anomalies de conception, les failles de sécurité potentielles et les opportunités d'amélioration qui pourraient compromettre la fiabilité, la performance ou l'évolutivité du système en production. L'analyse couvre les contraintes d'intégrité référentielle, la normalisation du schéma, la cohérence des types énumérés, la gestion des clés étrangères, ainsi que la qualité générale de l'architecture relationnelle.

Le système gère les opérations d'une agence de transport incluant la gestion des agences, des gares, des trajets, des voyages, des réservations, des paiements, des colis, des bus, des chauffeurs et des annonces promotionnelles. L'architecture repose sur 12 tables métier principales, complétées par les tables système de Laravel (migrations, sessions, cache, jobs).

### 1.1 Vue d'ensemble du schéma

| Table | Lignes | Rôle principal |
|-------|--------|----------------|
| `users` | 17 | Utilisateurs (admin, propriétaires, agents, chauffeurs, clients) |
| `agences` | 1 | Entreprises de transport |
| `gares` | 3 | Stations de départ/arrivée |
| `trajets` | 5 | Itinéraires entre gares (prix, distance, type) |
| `buses` | 6 | Véhicules (immatriculation, capacité, modèle) |
| `voyages` | 3 | Départs programmés (bus, chauffeur, date, prix) |
| `reservations` | 12 | Réservations de places |
| `paiements` | 13 | Transactions financières |
| `colis` | 0 | Envois de colis entre gares |
| `annonces` | 0 | Publications des agences (posts, promos) |
| `k_w_c_documents` | 12 | Documents KYC (CNI, selfie) |

---

## 2. Points forts du schéma

### 2.1 Structure relationnelle cohérente

Le modèle relationnel couvre de manière exhaustive le domaine fonctionnel d'un système de transport interurbain. La chaîne relationnelle `users → agences → gares → trajets → voyages → reservations → paiements` est complète et logiquement articulée. Chaque table dispose de son identifiant primaire auto-incrémenté de type `BIGINT UNSIGNED`, ce qui constitue un bon choix pour éviter les problèmes d'overflow sur des tables à forte volumétrie. Les clés étrangères utilisent également le type `BIGINT UNSIGNED`, assurant la cohérence des types entre colonnes source et cible.

### 2.2 Contraintes d'intégrité référentielle

L'ensemble des relations entre tables est protégé par des contraintes `FOREIGN KEY` avec des stratégies de suppression appropriées. Les relations de type `CASCADE` sont utilisées pour les dépendances fortes (par exemple, la suppression d'une agence entraîne celle de ses gares et annonces), tandis que les relations `SET NULL` sont employées pour les dépendances faibles (par exemple, la suppression d'une gare n'élimine pas les bus qui y étaient affectés). Cette différenciation montre une réflexion mûre sur le cycle de vie des données.

### 2.3 Contraintes d'unicité

Les colonnes sensibles sont protégées contre les doublons par des index `UNIQUE` : `email` et `telephone` dans la table `users`, `email` et `telephone` dans `agences`, `immatriculation` dans `buses`, `matricule` dans `users`, `num_reservation` et `num_voyage`, ainsi que la référence de paiement. Cette protection est essentielle pour garantir l'intégrité des données métier et éviter les conflits lors de la création d'enregistrements.

### 2.4 Historique de migrations structuré

Le système dispose de 26 migrations Laravel, échelonnées entre le 19 mars et le 16 avril 2026, organisées en 6 batches successifs. Cette granularité dans le suivi des modifications du schéma est une excellente pratique qui facilite le travail en équipe, le rollback en cas de problème, et l'audit des évolutions structurelles de la base de données au fil du temps.

---

## 3. Problèmes critiques

### 3.1 Double réservation possible sur la même place

> **Sévérité** : 🔴 Critique — Impact direct sur les utilisateurs

Il manque une **contrainte d'unicité composée** `(voyage_id, place)` dans la table `reservations`. Actuellement, rien n'empêche deux réservations pour le **même siège** sur le **même voyage**. Les données d'exemple montrent d'ailleurs ce scénario : les réservations `RES-GCONZPYV` (id=11) et `RES-ACUL3TNK` (id=10) ciblent toutes les deux le voyage 4, place 15, et seule l'une est annulée.

**Correction SQL :**

```sql
-- Vérifier et nettoyer les doublons existants AVANT d'ajouter la contrainte
SELECT voyage_id, place, COUNT(*) as nb
FROM reservations
WHERE statut IN ('validee', 'en attente')
GROUP BY voyage_id, place
HAVING nb > 1;

-- Ajouter la contrainte d'unicité
ALTER TABLE `reservations`
  ADD UNIQUE KEY `reservations_voyage_place_unique` (`voyage_id`, `place`);
```

**Migration Laravel associée :** `2026_04_16_100200_add_unique_reservation_voyage_place.php`

---

### 3.2 Contrainte étrangère dupliquée sur `trajets.arrivee_id`

> **Sévérité** : 🔴 Critique — Risque de comportement imprévu

Deux contraintes `FOREIGN KEY` pointent sur la même colonne :

```sql
-- Contrainte doublon (à supprimer)
ADD CONSTRAINT `trajets_arrive_foreign` FOREIGN KEY (`arrivee_id`) REFERENCES `gares` (`id`) ON DELETE CASCADE;

-- Contrainte correcte (à conserver)
ADD CONSTRAINT `trajets_arrivee_id_foreign` FOREIGN KEY (`arrivee_id`) REFERENCES `gares` (`id`) ON DELETE CASCADE;
```

La première, nommée `trajets_arrive_foreign`, est un doublon de la seconde `trajets_arrivee_id_foreign`. Ce doublon est inutile et peut générer des comportements imprévus lors de la suppression de gares (l'opération `CASCADE` serait déclenchée deux fois). De plus, cela crée une incohérence de nommage avec la colonne `depart_id` qui ne possède qu'une seule contrainte.

**Correction SQL :**

```sql
ALTER TABLE `trajets` DROP FOREIGN KEY `trajets_arrive_foreign`;
```

**Migration Laravel associée :** `2026_04_16_100000_fix_duplicate_fk_trajets.php`

---

### 3.3 Typo dans l'ENUM `users.statut` : `"innactif"` au lieu de `"inactif"`

> **Sévérité** : 🔴 Critique — Bug de filtrage dans le code

L'ENUM de la colonne `statut` contient la valeur `'innactif'` au lieu de `'inactif'` (il manque un "a"). Ce problème affecte directement les requêtes de filtrage dans le code applicatif. Si un développeur écrit une requête avec le terme correct `'inactif'`, elle ne retournera aucun résultat. Inversement, le terme mal orthographié se propage dans l'interface utilisateur.

2 utilisateurs sur 17 sont actuellement concernés par cette valeur incorrecte.

**Correction SQL :**

```sql
-- Étape 1 : Mettre à jour les données existantes
UPDATE `users` SET `statut` = 'inactif' WHERE `statut` = 'innactif';

-- Étape 2 : Corriger l'ENUM
ALTER TABLE `users`
  CHANGE COLUMN `statut` `statut`
  ENUM('approuve', 'rejete', 'actif', 'inactif', 'en attente')
  COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en attente';
```

**Migration Laravel associée :** `2026_04_16_100100_fix_users_statut_typo.php`

---

## 4. Problèmes de conception

### 4.1 Sémantique de `trajets.depart_id` et `trajets.arrivee_id`

> **Sévérité** : 🟡 Moyenne — Impact sur l'évolutivité

Les colonnes `depart_id` et `arrivee_id` de la table `trajets` référencent la table `gares`. Cela signifie qu'un trajet est défini entre **deux gares spécifiques**, alors que logiquement un trajet relie **deux villes**. Si une agence ouvre une nouvelle gare dans une ville déjà desservie, il faudra recréer le trajet avec la nouvelle gare, dupliquant ainsi les données de prix, de distance et de durée.

**Recommandation :** Créer une table `villes` et référencer les villes dans les trajets :

```sql
CREATE TABLE `villes` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nom` VARCHAR(191) NOT NULL,
  `region` VARCHAR(191) DEFAULT NULL
);

-- Ajouter ville_id dans gares
ALTER TABLE `gares` ADD COLUMN `ville_id` BIGINT UNSIGNED AFTER `agence_id`;
ALTER TABLE `gares` ADD FOREIGN KEY (`ville_id`) REFERENCES `villes` (`id`);

-- Modifier trajets pour référencer les villes
ALTER TABLE `trajets` CHANGE `depart_id` `depart_ville_id` BIGINT UNSIGNED NOT NULL;
ALTER TABLE `trajets` CHANGE `arrivee_id` `arrivee_ville_id` BIGINT UNSIGNED NOT NULL;
```

---

### 4.2 Champ `voyages.places_disponibles` redondant et risqué

> **Sévérité** : 🟡 Moyenne — Risque d'incohérence des données

`places_disponibles` est une **valeur dérivée** (capacité du bus − réservations validées). La stocker en dur peut mener à des incohérences si une réservation est annulée ou modifiée sans que `places_disponibles` soit mis à jour simultanément.

**Recommandation :** Calculer dynamiquement via un accessor Eloquent ou une sous-requête :

```sql
SELECT b.nb_places - COUNT(r.id) AS places_disponibles
FROM voyages v
JOIN buses b ON b.id = v.bus_id
LEFT JOIN reservations r ON r.voyage_id = v.id AND r.statut = 'validee'
WHERE v.id = ?
GROUP BY v.id;
```

```php
// Dans le modèle Voyage
public function getPlacesDisponiblesAttribute()
{
    return $this->bus->nb_places
        - $this->reservations()->where('statut', 'validee')->count();
}
```

---

### 4.3 Incohérence de genre dans les ENUM de statut

> **Sévérité** : 🟡 Moyenne — Qualité du code

Les valeurs ENUM utilisent des genres grammaticaux incohérents selon les tables :

| Table | Valeurs ENUM `statut` | Genre |
|-------|-----------------------|-------|
| `agences` | `'approuvee', 'rejetee', 'en attente'` | Féminin |
| `users` | `'approuve', 'rejete', 'actif', 'innactif', 'en attente'` | Masculin |
| `k_w_c_documents` | `'en attente', 'approuve', 'rejete'` | Masculin |
| `reservations` | `'en attente', 'validee', 'annule'` | Mixte |
| `paiements` | `'en attente', 'validee', 'annule'` | Mixte |
| `voyages` | `'en attente', 'en cours', 'annule', 'termine'` | Mixte |

**Recommandation :** Harmoniser vers le masculin par défaut (`'approuve'`, `'rejete'`, `'valide'`, `'annule'`, `'termine'`) ou utiliser des termes neutres (`'approved'`, `'rejected'`, `'cancelled'`).

---

### 4.4 Table `annonces.likes` sans suivi utilisateur

> **Sévérité** : 🟡 Moyenne — Fonctionnalité incomplète

Un simple compteur `likes` ne permet pas de savoir **qui** a aimé. Impossible de gérer un "unlike", de vérifier si un utilisateur a déjà aimé, ou d'empêcher le spam de likes.

**Recommandation :** Créer une table de liaison :

```sql
CREATE TABLE `annonce_likes` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `annonce_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY (`annonce_id`, `user_id`),
  FOREIGN KEY (`annonce_id`) REFERENCES `annonces`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
```

---

### 4.5 Pas de `user_id` dans la table `paiements`

> **Sévérité** : 🟡 Moyenne — Performance des requêtes

Pour retrouver tous les paiements d'un utilisateur, il faut traverser la table `reservations`. Cette jointure supplémentaire complexifie les requêtes, surtout pour les tableaux de bord et rapports financiers.

**Recommandation :** Ajouter `user_id` dans `paiements` :

```sql
ALTER TABLE `paiements` ADD COLUMN `user_id` BIGINT UNSIGNED DEFAULT NULL AFTER `gare_id`;
ALTER TABLE `paiements` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
```

---

### 4.6 Absence de soft deletes

> **Sévérité** : 🟡 Moyenne — Perte de données irréversible

Aucune table métier ne dispose de colonne `deleted_at`. Dans un système de transport, la suppression physique d'un voyage, d'une réservation ou d'un paiement pose des problèmes d'audit et de facturation.

**Recommandation :** Activer les soft deletes de Laravel :

```bash
php artisan make:migration add_soft_deletes_to_voyages --table=voyages
php artisan make:migration add_soft_deletes_to_reservations --table=reservations
php artisan make:migration add_soft_deletes_to_paiements --table=paiements
```

```php
// Dans chaque modèle concerné
use Illuminate\Database\Eloquent\SoftDeletes;

class Voyage extends Model
{
    use SoftDeletes;
}
```

---

### 4.7 Chemins de fichiers Windows en production

> **Sévérité** : 🟡 Moyenne — Compatibilité serveur

Plusieurs enregistrements de `k_w_c_documents` contiennent des chemins Windows :

```
C:\Users\Black_codeur\AppData\Local\Temp\fak4BC2.tmp
C:\Users\Black_codeur\AppData\Local\Temp\fak8400.tmp
C:\Users\Black_codeur\AppData\Local\Temp\fakCE6.tmp
...
```

Ces chemins ne fonctionneront pas sur un serveur Linux en production.

**Recommandation :** Utiliser la facade `Storage` de Laravel pour des chemins portables :

```php
// ❌ À éviter
$path = 'C:\Users\Black_codeur\AppData\Local\Temp\fak4BC2.tmp';

// ✅ Bonne pratique
$path = $request->file('document')->store('kwc/proprietaires');
```

---

### 4.8 Email invalide dans les données

> **Sévérité** : 🟢 Basse — Données de test

L'enregistrement de l'agence (id=1) contient : `agence@generalexpressvoyages` (sans TLD).

**Recommandation :** Ajouter une validation au niveau BDD et du modèle :

```php
// Dans le modèle Agence
protected static function booted()
{
    static::addGlobalScope(fn ($query) => $query->where('email', 'REGEXP', '^[^@]+@[^@]+\\.[^@]+$'));
}
```

---

### 4.9 Absence de table `villes` normalisée

> **Sévérité** : 🟡 Moyenne — Normalisation

Les noms de villes sont stockés en `VARCHAR` dans `gares.ville` et `users.ville`. Cela rend les recherches et jointures complexes et peut entraîner des incohérences orthographiques.

**Recommandation :** Voir la section [4.1](#41-sémantique-de-trajetsdepart_id-et-trajetsarrivee_id) pour le schéma de la table `villes`.

---

## 5. Recommandations prioritaires

| # | Recommandation | Priorité | Difficulté |
|---|---------------|----------|------------|
| 1 | Ajouter contrainte `UNIQUE (voyage_id, place)` sur `reservations` | 🔴 Critique | Faible |
| 2 | Supprimer la FK dupliquée `trajets_arrive_foreign` | 🔴 Critique | Faible |
| 3 | Corriger le typo `"innactif"` → `"inactif"` | 🔴 Critique | Faible |
| 4 | Créer une table `villes` et refactorer `trajets` | 🟡 Haute | Moyenne |
| 5 | Supprimer `places_disponibles` et calculer dynamiquement | 🟡 Haute | Moyenne |
| 6 | Harmoniser les ENUM de statut (genre + orthographe) | 🟡 Moyenne | Moyenne |
| 7 | Ajouter `user_id` dans la table `paiements` | 🟡 Moyenne | Faible |
| 8 | Activer les soft deletes sur les tables métier | 🟡 Moyenne | Faible |
| 9 | Corriger les chemins de fichiers Windows | 🟡 Moyenne | Faible |
| 10 | Ajouter une validation d'email au niveau BDD | 🟢 Basse | Faible |

---

## 6. Cartographie des relations

| Table source | Colonne | Table cible | Colonne cible | `ON DELETE` |
|-------------|---------|-------------|---------------|-------------|
| `agences` | `proprietaire_id` | `users` | `id` | `CASCADE` |
| `gares` | `agence_id` | `agences` | `id` | `CASCADE` |
| `buses` | `gare_id` | `gares` | `id` | `SET NULL` |
| `trajets` | `gare_id` | `gares` | `id` | `SET NULL` |
| `trajets` | `depart_id` | `gares` | `id` | `CASCADE` |
| `trajets` | `arrivee_id` | `gares` | `id` | `CASCADE` |
| `annonces` | `agence_id` | `agences` | `id` | `CASCADE` |
| `voyages` | `gare_id` | `gares` | `id` | `SET NULL` |
| `voyages` | `trajet_id` | `trajets` | `id` | `SET NULL` |
| `voyages` | `bus_id` | `buses` | `id` | `SET NULL` |
| `voyages` | `chauffeur_id` | `users` | `id` | `SET NULL` |
| `reservations` | `user_id` | `users` | `id` | `SET NULL` |
| `reservations` | `gare_id` | `gares` | `id` | `SET NULL` |
| `reservations` | `voyage_id` | `voyages` | `id` | `SET NULL` |
| `paiements` | `gare_id` | `gares` | `id` | `SET NULL` |
| `paiements` | `reservation_id` | `reservations` | `id` | `SET NULL` |
| `colis` | `user_id` | `users` | `id` | `CASCADE` |
| `colis` | `provenance` | `gares` | `id` | `CASCADE` |
| `colis` | `destination` | `gares` | `id` | `CASCADE` |
| `k_w_c_documents` | `user_id` | `users` | `id` | `CASCADE` |
| `users` | `gare_id` | `gares` | `id` | `SET NULL` |

---

## 7. Notation globale

| Critère | Note | Appréciation |
|---------|------|-------------|
| Structure relationnelle | ⭐⭐⭐⭐ | Bonne couverture du domaine fonctionnel avec des relations claires et cohérentes |
| Contraintes d'intégrité | ⭐⭐⭐ | FK bien définies mais contrainte `UNIQUE` manquante sur les réservations |
| Normalisation | ⭐⭐⭐ | Redondance sur `places_disponibles` et absence de table `villes` normalisée |
| Sécurité des données | ⭐⭐⭐ | Pas de soft deletes, chemins de fichiers en dur dans la BDD |
| Évolutivité | ⭐⭐⭐ | Bon potentiel mais bloqué par la sémantique `trajets` ↔ `gares` au lieu de `trajets` ↔ `villes` |

> **En résumé** : Le schéma constitue une base solide. Les 3 problèmes critiques sont rapidement corrigibles avec les migrations fournies. L'application de l'ensemble des recommandations permettrait d'élever la note de **3.2/5** à un niveau estimé de **4.5/5**.
