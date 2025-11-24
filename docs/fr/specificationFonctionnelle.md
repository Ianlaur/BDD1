# Document de Spécification Fonctionnelle
**Projet Loft**  
Version : 1.0  
Date : 19 novembre 2025  
Statut : Actif  
Documents Connexes : [Document d'Exigences Produit (PRD) v1.0](./PRD.md)  
Auteur : Agent de Documentation du Projet

---

## 1. Vue d'Ensemble

### 1.1 Objectif
Cette Spécification Fonctionnelle décrit le comportement de la Plateforme Association Connect d'un point de vue utilisateur et fonctionnel. Elle traduit le [Document d'Exigences Produit (PRD)](./PRD.md) en comportements fonctionnels, interactions utilisateur, règles de validation et critères d'acceptation pour guider l'implémentation et les tests.

### 1.2 Portée
Couvre les aspects fonctionnels incluant :
- Authentification & autorisation utilisateur
- Gestion des profils étudiants et associations
- Découverte d'associations et flux d'adhésion
- Création, gestion et inscription aux événements
- Publication de contenu et fil d'actualité
- Messagerie et notifications
- Fonctions administratives et tableaux de bord

### 1.3 Public
- Ingénieurs Logiciels
- Ingénieurs QA
- Chefs de Produit
- Designers UX/UI
- Parties Prenantes

### 1.4 Contexte Système
Application web construite avec Next.js (le document référence Next.js 15), hébergée sur Vercel, utilisant Neon PostgreSQL. Types d'utilisateurs principaux : Étudiants et Associations ; rôle Admin Système pour la gestion de plateforme.

*Voir [PRD - Stack Technologique](./PRD.md#51-stack-technologique) pour l'architecture technique complète et [PRD - Schéma de Base de Données](./PRD.md#54-schéma-de-base-de-données) pour les modèles de données.*

---

## 2. Acteurs et Rôles

*Ces rôles s'alignent avec les personas utilisateurs définis dans [PRD - Personas Utilisateurs](./PRD.md#2-personas-utilisateurs).*

### 2.1 Définitions des Acteurs

#### 2.1.1 Utilisateur Invité (Non Authentifié)
Capacités :
- Voir page d'accueil, listes publiques d'associations, informations publiques d'événements
- Accéder aux pages d'inscription/connexion

Restrictions :
- Ne peut pas rejoindre d'associations, s'inscrire à des événements, envoyer des messages ou créer du contenu

#### 2.1.2 Étudiant
Capacités :
- Toutes les capacités Invité plus gestion de profil, parcourir associations, demander adhésion, s'inscrire aux événements, messagerie, notifications, voir présence

Restrictions :
- Ne peut pas créer d'associations, approuver demandes d'adhésion, créer événements/publications ou accéder au tableau de bord de gestion d'association

#### 2.1.3 Membre d'Association
Capacités :
- Toutes les capacités Étudiant plus voir listes de membres et contenu spécifique à l'association

Restrictions :
- Ne peut pas approuver/rejeter adhésions, créer/modifier événements/publications ou modifier le profil d'association

#### 2.1.4 Administrateur d'Association
Capacités :
- Gérer profil d'association, approuver/rejeter adhésions, créer/modifier/supprimer événements et publications, retirer membres, voir analyses d'association et paramètres

Restrictions :
- Ne peut pas vérifier sa propre association (requiert Admin Système) ou accéder aux tableaux de bord d'autres associations

#### 2.1.5 Administrateur Système
Capacités :
- Accès système complet : gestion utilisateurs, vérification associations, modération contenu, surveillance système, annonces, paramètres

Restrictions :
- Doit suivre les règlements de confidentialité des données ; actions enregistrées pour audit

### 2.2 Hiérarchie des Rôles
Administrateur Système > Admin Association > Membre Association > Étudiant > Invité

### 2.3 Règles de Transition de Rôles
- Invité → Étudiant : inscription, vérification email, création profil
- Étudiant → Membre Association : demande + approbation admin
- Membre Association → Admin Association : attribution manuelle (futur)
- Tout Rôle → Administrateur Système : attribution manuelle par Admin Système existant

---

## 3. Flux Utilisateurs

### 3.1 Flux d'Authentification

*Ces flux implémentent les exigences de [PRD - Système d'Authentification](./PRD.md#31-système-dauthentification).*

#### 3.1.1 Inscription Utilisateur (Email/Mot de passe)
Champs du formulaire : email, mot de passe (min 8 caractères), confirmer mot de passe, type d'utilisateur (Étudiant/Association), case TOS.  
Validation : format/unicité email, exigences mot de passe, correspondance mots de passe, TOS acceptés.  
Succès : hachage mot de passe bcrypt (rounds de salt ≥ 10), créer User + profil, envoyer email de vérification (futur), créer session JWT, rediriger vers complétion profil.  
Échecs : erreurs de validation en ligne ; limitation de débit pour échecs répétés.

Flux alternatifs : email existe déjà, mot de passe trop faible.

#### 3.1.2 Inscription Utilisateur (Google OAuth)
Flux : consentement Google → vérifier jeton → créer/lier utilisateur → créer session → rediriger.  
Gère nouvel utilisateur, utilisateur existant, annulation et erreurs.

#### 3.1.3 Connexion Utilisateur (Email/Mot de passe)
Champs : email, mot de passe, "Se souvenir de moi".  
Validation : comparaison bcrypt, statut du compte.  
Succès : créer session JWT (7 jours si souvenir, sinon 24 heures), mettre à jour dernière connexion, rediriger vers tableau de bord.  
Échecs : message générique "Email ou mot de passe invalide", enregistrer tentatives échouées, limitation de débit après 5 échecs.

#### 3.1.4 Gestion de Session
- Stocker JWT dans cookie HTTP-only, sécurisé ; SameSite=Lax.
- Valider jeton sur routes protégées ; rafraîchir avant expiration (fenêtre glissante).
- Déconnexion : effacer cookie, invalider jeton côté serveur (futur).

---

### 3.2 Gestion du Profil Étudiant

*Implémente les exigences [PRD - Profils Étudiants](./PRD.md#321-profils-étudiants).*

#### 3.2.1 Création de Profil (Première Fois)
Champs : photo de profil (optionnel), nom d'affichage, bio, spécialisation, année de diplôme, intérêts/tags.  
Validation : nom d'affichage 2–50 caractères, bio ≤ 500 caractères, année de diplôme actuelle..+10 ans, types & tailles d'images.  
Succès : mettre à jour StudentProfile, redimensionner/télécharger image, marquer profil complet, rediriger vers découverte. Option de saut disponible.

#### 3.2.2 Modification de Profil
Formulaire pré-rempli, même validation. Utiliser verrouillage optimiste pour modifications concurrentes. Notifier en cas de succès ou aucun changement.

#### 3.2.3 Visualisation de Profil
- Propre profil : infos complètes, bouton modifier, associations rejointes, historique de présence.
- Autres étudiants : champs publics uniquement selon paramètres de confidentialité, "Envoyer Message" (futur) si permis.

---

### 3.3 Découverte et Adhésion aux Associations

*Implémente les exigences [PRD - Découverte & Recherche d'Associations](./PRD.md#33-découverte--recherche-dassociations) et [PRD - Système de Design](./PRD.md#41-système-de-design).*

#### 3.3.1 Parcourir les Associations
Grille de cartes d'associations (responsive 1–4 colonnes) montrant logo, nom, description (tronquée), catégorie, nombre de membres, bouton rejoindre, badge de vérification. Triées par nombre de membres par défaut ; pagination après 24 éléments ; chargement paresseux des images.

Interactions de carte : échelle et ombre au survol ; clic pour détail ; rejoindre déclenche flux d'adhésion.

#### 3.3.2 Recherche & Filtrage
- Recherche débounced (300ms) à travers nom, description, catégorie ; correspondance partielle insensible à la casse.
- Puces de catégories (multi-sélection logique OU).
- Recherche + filtres combinés utilisent logique ET.
- Message aucun résultat et option effacer filtres.

#### 3.3.3 Vue Détaillée d'Association
Sections : en-tête (logo, nom, badges, bouton rejoindre, liens), à propos, événements (5 à venir), publications récentes (3), membres (avatars échantillon quand membre). États bouton rejoindre : Non Rejoint / En Attente / Rejoint.

#### 3.3.4 Flux d'Adhésion à une Association
- Requiert authentification, pas déjà membre/en attente, et association acceptant membres.
- À la demande : créer Membership(statut=PENDING), notifier admins, mise à jour UI optimiste vers "Demande en Attente".

*Voir aussi [Section 3.6.1 - Approbation d'Adhésion](#361-voir-membres-admin-association) et [PRD - Flux de Demande d'Adhésion](./PRD.md#64-flux-de-demande-dadhésion).*

#### 3.3.5 Approbation d'Adhésion (Côté Association)
Tableau de bord admin liste demandes en attente avec actions approuver/rejeter. Approuver → Membership.ACTIVE, horodatage joinedAt, incrémenter nombre de membres, notifier étudiant. Rejeter → Membership.REJECTED, notifier étudiant ; option d'inclure raison.

Actions groupées planifiées (futur).

---

### 3.4 Gestion des Événements

*Implémente les exigences [PRD - Gestion des Événements](./PRD.md#35-gestion-des-événements). Voir aussi [PRD - Flux de Création d'Événement](./PRD.md#63-flux-de-création-et-participation-aux-événements).*

#### 3.4.1 Création d'Événement (Admin Association)
Champs : titre, description, image, date/heure, lieu/lien virtuel, capacité, date limite d'inscription, nécessite approbation, statut (Brouillon/Publié), visibilité.  
Validation : titre 5–200 caractères, description 20–2000, début ≥ 1 heure dans le futur, capacité 1–10000, contraintes d'image.  
Succès (Publié) : créer Event, télécharger/optimiser image, notifier membres, rediriger vers détail événement.  
Succès (Brouillon) : enregistrer comme brouillon sans notifications.

#### 3.4.2 Modification d'Événement
Formulaire pré-rempli, mêmes validations. Changements significatifs (date/heure/lieu) déclenchent notifications participants ; changements mineurs non.

#### 3.4.3 Inscription à un Événement (Étudiant)
Requiert authentification et événement publié avec inscription ouverte et capacité disponible. À l'inscription → EventRegistration(CONFIRMED), incrémenter compte, notifier association, mise à jour UI. États : CONFIRMED, WAITLIST (futur), CANCELLED, ATTENDED, NO_SHOW.

#### 3.4.4 Annuler Inscription
Modal de confirmation ; à l'annulation → définir statut=CANCELLED, décrémenter compte, rétablir bouton. Autorisé jusqu'à 1 heure avant début événement.

#### 3.4.5 Annulation d'Événement (Admin Association)
Modal de confirmation avec raison optionnelle. À la confirmation → Event.status=CANCELLED, notifier tous participants inscrits, mettre à jour inscriptions vers CANCELLED, afficher badge "ANNULÉ" et raison.

---

### 3.5 Gestion des Publications

*Implémente les exigences [PRD - Fil d'Actualité & Publications](./PRD.md#36-fil-dactualité--publications).*

#### 3.5.1 Créer Publication (Admin Association)
Champs : titre, contenu enrichi, images (max 5), statut (Brouillon/Publié), planification optionnelle.  
Validation : titre 5–200 caractères, contenu 20–5000 caractères, images validées/optimisées.  
Publications publiées notifient membres optionnellement.

Fonctionnalités éditeur enrichi : gras, italique, titres, listes, liens, intégration d'images.

#### 3.5.2 Modifier Publication
Formulaire pré-rempli, même validation. Mettre à jour horodatages ; ne pas renvoyer notifications par défaut.

#### 3.5.3 Supprimer Publication
Modal de confirmation. Préférer suppression douce (statut=DELETED) pour conserver piste d'audit. Fournir option de suppression dure.

#### 3.5.4 Voir Publications (Étudiants)
Profil association montre publications publiées en ordre chronologique inverse, paginées après 10 publications. Cartes de publication montrent titre, extrait (200 caractères), première image, date de publication.

---

### 3.6 Gestion des Adhésions

*Implémente les exigences [PRD - Gestion des Adhésions](./PRD.md#34-gestion-des-adhésions).*

#### 3.6.1 Voir Membres (Admin Association)
Interface à onglets : Membres Actifs, Demandes en Attente, (Inactifs futur). Membres actifs montrent photo profil, nom, spécialisation/année, date d'adhésion, badge rôle, actions. Recherche et filtres supportés.

#### 3.6.2 Retirer Membre
Modal de confirmation avec raison optionnelle. Au retrait → Membership.REMOVED, horodatage leftAt, annuler inscriptions futures aux événements, notifier membre, préserver données historiques. Re-candidature autorisée après 90 jours.

#### 3.6.3 Attribuer Rôles de Membres
Fonctionnalité future : changer rôles (Membre/Modérateur/Admin) avec permissions et notifications correspondantes.

---

### 3.7 Tableau de Bord de Gestion d'Association

*Implémente les exigences [PRD - Tableau de Bord de Gestion d'Association](./PRD.md#39-tableau-de-bord-de-gestion-dassociation) avec spécifications de design de [PRD - Système de Design](./PRD.md#41-système-de-design).*

#### 3.7.1 Vue d'Ensemble du Tableau de Bord
Sections :
1. Cartes de statistiques : membres totaux, demandes en attente, événements totaux, membres actifs (mois)
2. Actions rapides : modifier profil, créer événement/publication, paramètres
3. Demandes de membres en attente (aperçu)
4. Événements récents (aperçu)
5. Publications récentes (aperçu)

Disposition responsive et états de chargement squelette. Mises à jour en temps réel pour demandes en attente et statistiques.

#### 3.7.2 Interactions
Mises à jour en temps réel (WebSocket/polling futur), grille responsive pour breakpoints, mises à jour optimistes pour actions admin.

---

### 3.8 Système de Notifications

*Implémente les exigences [PRD - Notifications](./PRD.md#372-notifications). Voir [PRD - Types de Notifications](./PRD.md#72-types-de-notifications) pour liste complète.*

#### 3.8.1 Types & Déclencheurs
Exemples :
- MEMBERSHIP_REQUEST (vers Admin Association)
- MEMBERSHIP_APPROVED / REJECTED (vers Étudiant)
- EVENT_CREATED / UPDATED / CANCELLED / REMINDER (vers membres/participants)
- POST_CREATED (optionnel)
- NEW_MESSAGE (messagerie directe)
- ASSOCIATION_VERIFIED (vers Admin Association)

Chaque notification contient type, destinataire, contenu, lien d'action, priorité, statut de lecture.

#### 3.8.2 Affichage
Cloche de notification avec badge non lu (plafond "99+") ; menu déroulant montre 10 dernières notifications ; page centre de notifications montre liste complète avec filtres, pagination et actions groupées.

#### 3.8.3 Interactions
Marquage automatique comme lu au clic ; marquage manuel et groupé comme lu ; suppression individuelle avec annulation de 5 secondes ; suppression douce retenue en BD.

---

### 3.9 Messagerie Directe (Futur)
Messagerie un-à-un : composer, livraison en temps réel (WebSocket), fils de messages, indicateurs de frappe, actions de messages (supprimer/signaler/bloquer).

---

### 3.10 Fonctions Admin

*Implémente les exigences [PRD - Tableau de Bord Admin](./PRD.md#38-tableau-de-bord-admin).*

#### 3.10.1 Gestion des Utilisateurs
Liste utilisateurs paginée avec recherche et filtres par rôle/statut. Actions : voir/modifier, suspendre, bannir, supprimer, réinitialiser mot de passe, vérification email manuelle. Suspensions requièrent raison/durée.

#### 3.10.2 Vérification d'Association
Flux de travail admin pour examiner et vérifier associations ; définit flag vérifié et notifie association. Rejet avec feedback possible.

#### 3.10.3 Modération de Contenu
Flux de révision de contenu signalé : approuver/retirer contenu, avertir/bannir utilisateurs. Révision proactive pour nouvelles associations et contenu à fort engagement (futur).

---

## 4. Exigences Fonctionnelles Détaillées

FRs clés résumées :

- FR-AUTH-001..004 : Inscription, connexion, gestion de session, RBAC. Stocker JWTs dans cookies sécurisés ; appliquer vérifications de rôles et retourner 403 sur actions non autorisées.
- FR-PROFILE-001..003 : Création de profils étudiant et association, validation, paramètres de confidentialité.
- FR-DISCOVERY-001..003 : Navigation, recherche, filtrage d'associations avec considérations de performance (chargement paresseux, mise en cache).
- FR-MEMBER-001..004 : Flux de rejoindre, approuver/rejeter, retirer, quitter avec transitions d'état d'adhésion.
- FR-EVENT-001..005 : Flux de créer, modifier, annuler, inscrire, annuler inscription et validations.
- FR-POST-001..004 : Flux de créer, modifier, supprimer, voir publications avec règles de texte enrichi et images.
- FR-NOTIF-001..004 : Création de notifications, affichage, sémantiques de marquer comme lu, supprimer.
- FR-DASH-001 : Fonctionnalité et réactivité du tableau de bord d'association.
- FR-ADMIN-001..002 : Fonctions de gestion utilisateurs et vérification admin.

(Se référer aux sections précédentes pour validation détaillée au niveau des champs et comportements.)

---

## 5. Validation et Gestion des Erreurs

*Ces règles de validation appliquent les exigences de sécurité de [PRD - Exigences de Sécurité](./PRD.md#53-exigences-de-sécurité).*

### 5.1 Règles de Validation des Entrées
- Email : format RFC 5322, max 254 caractères, minuscules, unique.
- Mot de passe : 8–128 caractères (règles de complexité futures).
- Nom d'Affichage : 2–50 caractères, alphanumérique + espaces.
- Nom d'Association : 5–100 caractères, unique.
- Longueurs de descriptions : associations 50–1000, publications 20–5000.
- Dates : début au moins 1 heure dans le futur ; fin après début.
- Images : JPEG/PNG/WebP ; profil ≤ 5MB, événement ≤ 10MB ; dimensions min pour profil 100×100, événement 400×300.

### 5.2 Modèles de Gestion des Erreurs
- Côté client : valider au blur & soumission, messages en ligne.
- Côté serveur : toujours valider, retourner JSON avec détails ; 400 pour erreurs de validation.
- Erreurs de base de données : capturer violations de contraintes d'unicité et retourner messages conviviaux.
- Erreurs d'authentification : messages génériques ; limitation de débit.
- Erreurs inattendues : HTTP 500 avec message UI générique ; enregistrer détails.

### 5.3 Messages d'Erreur
Principes de design : conviviaux, actionnables, cohérents. Exemples :
- Succès : "Profil mis à jour avec succès", "Événement créé et publié"
- Validation : "Email requis", "Le mot de passe doit contenir au moins 8 caractères"
- Business : "Vous êtes déjà membre de cette association", "La capacité de l'événement a été atteinte"
- Permission : "Vous n'avez pas la permission d'effectuer cette action"
- Système : "Une erreur s'est produite. Veuillez réessayer"

---

## 6. Critères d'Acceptation (Points Saillants Sélectionnés)

### 6.1 Authentification & Autorisation
- Inscription (email/Google) crée comptes et sessions correctement.
- Connexion redirige vers tableaux de bord appropriés ; "Se souvenir de moi" définit durée de session.
- 5 tentatives de connexion échouées déclenchent verrouillage temporaire/limitation de débit.

### 6.2 Gestion de Profil
- Profils étudiant/association doivent répondre aux champs requis et validations.
- Téléchargements de photos de profil validés, redimensionnés et stockés.

### 6.3 Découverte & Adhésion
- Associations navigables en grille ; recherche débounced et insensible à la casse ; filtres fonctionnent avec logique correcte.
- Demandes d'adhésion créent adhésions PENDING et notifient admins ; approbations changent statut vers ACTIVE et notifient étudiants.

### 6.4 Gestion des Événements
- Flux de créer/modifier/annuler/inscrire appliquent validations et notifient utilisateurs appropriés.
- Inscription respecte capacité et dates limites ; annulations gérées selon règles.

### 6.5 Gestion des Publications
- Comportements de créer/publier/brouillon comme spécifié ; images optimisées et limitées à 5 par publication.

### 6.6 Notifications & Tableau de Bord
- Notifications sont créées, affichées et gérables (marquer/lire/supprimer) selon spec.
- Tableau de bord association affiche statistiques requises et éléments récents avec dispositions responsives.

### 6.7 Fonctions Admin
- Admins peuvent gérer utilisateurs et vérifier associations ; actions enregistrées pour audit.

(Voir sections AC détaillées pour critères testables complets.)

---

## 7. Hypothèses, Dépendances & Contraintes

*Voir [PRD - Stack Technologique](./PRD.md#51-stack-technologique) et [PRD - Exigences Techniques](./PRD.md#5-exigences-techniques) pour contexte technique complet.*

### 7.1 Hypothèses
- Utilisateurs principaux sont étudiants universitaires ; navigateurs modernes ; utilisation mobile significative.
- Hébergement : Vercel ; BD : Neon PostgreSQL.
- Disponibilité OAuth (Google).

### 7.2 Dépendances
- Externes : Vercel, Neon, Google OAuth.
- Internes : schéma Prisma, authentification, gestion de session, profils complets pour certaines fonctionnalités.

### 7.3 Contraintes
- Objectifs de performance : <2s chargement page sur 3G, API <200ms. *Voir [PRD - Exigences de Performance](./PRD.md#52-exigences-de-performance).*
- Support navigateurs : navigateurs modernes uniquement.
- Scalabilité : cible 10k+ utilisateurs simultanés. *Voir [PRD - Exigences de Scalabilité](./PRD.md#55-exigences-de-scalabilité).*
- Règlementaire : considérations RGPD, FERPA.
- Accessibilité : objectif WCAG 2.1 AA. *Voir [PRD - Principes d'Expérience Utilisateur](./PRD.md#42-principes-dexpérience-utilisateur).*

Références technologiques dans le document : Next.js 15.x, React 19, TypeScript 5.x, Prisma 6.x, TailwindCSS 4.x, Node.js 18+.

---

## 8. Améliorations Futures (Feuille de Route)

*S'aligne avec les phases de [PRD - Stratégie de Lancement](./PRD.md#8-stratégie-de-lancement).*

### Phase 2 (2–3 mois)
- Messagerie directe (temps réel), notifications email/push, calendrier événements, recherche améliorée.
*Voir [PRD - Phase 2](./PRD.md#82-phase-2--fonctionnalités-améliorées).*

### Phase 3 (4–6 mois)
- Recommandations IA, tableau de bord analyses, billetterie événements payants, apps PWA/natives.
*Voir [PRD - Phase 3](./PRD.md#83-phase-3--croissance--optimisation).*

### Phase 4 (6–12 mois)
- Support multi-universitaire, flux de travail admin avancés, API publique, fonctionnalités entreprise.
*Voir [PRD - Phase 4](./PRD.md#84-phase-4--fonctionnalités-entreprise) et [PRD - Considérations Futures](./PRD.md#11-considérations-futures).*

---

## 9. Glossaire

### A
- **Critères d'Acceptation (AC)** : Conditions testables qui doivent être remplies pour l'achèvement d'une fonctionnalité [Voir : [Section 6](#6-critères-dacceptation-points-saillants-sélectionnés)]
- **Acteur** : Utilisateur ou entité système qui interagit avec la plateforme [Voir : [Section 2.1](#21-définitions-des-acteurs)]
- **API (Interface de Programmation d'Application)** : Interface programmatique pour interactions système
- **Route API** : Point de terminaison côté serveur Next.js (ex: `/api/auth/register`)
- **Association** : Organisation étudiante, club ou groupe sur la plateforme [Voir : [PRD §1.2](./PRD.md#12-énoncé-du-problème)]
- **Admin d'Association** : Rôle utilisateur avec permissions de gestion complètes pour une association [Voir : [Section 2.1.4](#214-administrateur-dassociation)]
- **Membre d'Association** : Rôle utilisateur avec accès limité spécifique à l'association [Voir : [Section 2.1.3](#213-membre-dassociation)]
- **Profil d'Association** : Informations publiques et paramètres de l'organisation [Voir : [PRD §3.2.2](./PRD.md#322-profils-dassociations)]
- **Piste d'Audit** : Journal des actions utilisateurs pour conformité et sécurité
- **Authentification** : Processus de vérification de l'identité utilisateur [Voir : [Section 3.1](#31-flux-dauthentification)]
- **Autorisation** : Processus d'octroi de permissions basées sur les rôles [Voir : [PRD §3.1](./PRD.md#31-système-dauthentification)]

### B
- **Badge** : Indicateur visuel (vérification, rôle, statut)
- **bcrypt** : Algorithme de hachage cryptographique de mot de passe (rounds de salt ≥10) [Voir : [Section 3.1.1](#311-inscription-utilisateur-emailmot-de-passe)]
- **Actions Groupées** : Opérations sur plusieurs éléments (marquer lu, approuver membres)
- **Logique Business** : Règles régissant comportement système et flux de travail

### C
- **Capacité** : Nombre maximum de participants autorisés pour un événement [Voir : [Section 3.4.1](#341-création-dévénement-admin-association)]
- **CSRF (Falsification de Requête Intersite)** : Attaque empêchée par jetons Next.js
- **CRUD** : Opérations Créer, Lire, Mettre à jour, Supprimer

### D
- **Tableau de Bord** : Interface de gestion centralisée [Voir : [Section 3.7](#37-tableau-de-bord-de-gestion-dassociation), [PRD §3.9](./PRD.md#39-tableau-de-bord-de-gestion-dassociation)]
- **Mode Sombre** : Schéma de couleurs pour faible luminosité [Voir : [PRD §4.3](./PRD.md#43-mode-sombre)]
- **Schéma de Base de Données** : Structure de données et relations [Voir : [PRD §5.4](./PRD.md#54-schéma-de-base-de-données)]
- **Debounce** : Technique de délai pour entrée de recherche (300ms) [Voir : [Section 3.3.2](#332-recherche--filtrage)]
- **Messagerie Directe** : Fonctionnalité de communication un-à-un (futur) [Voir : [Section 3.9](#39-messagerie-directe-futur)]
- **Brouillon** : Statut non publié pour événements/publications [Voir : [Section 3.4.1](#341-création-dévénement-admin-association)]

### E
- **Edge Network** : CDN global de Vercel pour livraison de contenu
- **Gestion des Erreurs** : Réponse système aux erreurs de validation et système [Voir : [Section 5.2](#52-modèles-de-gestion-des-erreurs)]
- **Événement** : Activité planifiée organisée par une association [Voir : [Section 3.4](#34-gestion-des-événements), [PRD §3.5](./PRD.md#35-gestion-des-événements)]
- **Inscription à un Événement** : Engagement d'un étudiant à assister à un événement [Voir : [Section 3.4.3](#343-inscription-à-un-événement-étudiant)]
- **Statut EventRegistration** : CONFIRMED, WAITLIST, CANCELLED, ATTENDED, NO_SHOW [Voir : [Section 3.4.3](#343-inscription-à-un-événement-étudiant)]

### F
- **FERPA** : Règlement de confidentialité de l'éducation américain [Voir : [Section 7.3](#73-contraintes)]
- **Filtre** : Méthode pour affiner résultats par critères [Voir : [Section 3.3.2](#332-recherche--filtrage)]
- **Exigence Fonctionnelle (FR)** : Spécification de comportement système spécifique [Voir : [Section 4](#4-exigences-fonctionnelles-détaillées)]

### G
- **RGPD** : Règlement de protection des données UE [Voir : [Section 7.3](#73-contraintes)]
- **Google OAuth** : Authentification tierce via Google [Voir : [Section 3.1.2](#312-inscription-utilisateur-google-oauth)]
- **Dégradé** : Transition multi-couleurs dans design UI [Voir : [PRD §4.1](./PRD.md#41-système-de-design)]
- **Utilisateur Invité** : Visiteur non authentifié avec accès limité [Voir : [Section 2.1.1](#211-utilisateur-invité-non-authentifié)]

### H
- **Suppression Dure** : Retrait permanent de la base de données
- **Cookie HTTP-only** : Cookie sécurisé inaccessible au JavaScript client [Voir : [Section 3.1.4](#314-gestion-de-session)]
- **HTTPS** : Protocole HTTP chiffré (appliqué) [Voir : [PRD §5.3](./PRD.md#53-exigences-de-sécurité)]

### I
- **Idempotent** : Opération produisant même résultat quand répétée
- **Optimisation d'Image** : Compression/redimensionnement automatiques par Next.js
- **Validation En Ligne** : Vérification d'erreurs au niveau des champs en temps réel [Voir : [Section 5.1](#51-règles-de-validation-des-entrées)]

### J
- **Demande d'Adhésion** : Demande d'un étudiant pour adhésion à une association [Voir : [Section 3.3.4](#334-flux-dadhésion-à-une-association)]
- **JWT (Jeton Web JSON)** : Authentification de session basée sur jetons [Voir : [Section 3.1.4](#314-gestion-de-session)]

### L
- **Chargement Paresseux** : Différer chargement de ressource jusqu'au besoin [Voir : [Section 3.3.1](#331-parcourir-les-associations)]
- **Lighthouse** : Outil de performance web de Google (cible >90)
- **Style LinkedIn** : Modèle de disposition visuelle basée sur cartes [Voir : [PRD §3.3](./PRD.md#33-découverte--recherche-dassociations)]

### M
- **Membre** : Utilisateur avec adhésion d'association active
- **Adhésion** : Relation utilisateur-association [Voir : [Section 3.3](#33-découverte-et-adhésion-aux-associations), [PRD §3.4](./PRD.md#34-gestion-des-adhésions)]
- **Statut d'Adhésion** : PENDING, ACTIVE, REMOVED, REJECTED, INACTIVE [Voir : [Section 3.3.4](#334-flux-dadhésion-à-une-association)]
- **Middleware** : Intercepteur de requête Next.js (ex: vérification d'authentification)
- **Migration** : Changement de version de schéma de base de données (Prisma)
- **MVP (Produit Minimum Viable)** : Ensemble de fonctionnalités initial [Voir : [PRD §8.1](./PRD.md#81-phase-1--mvp-actuel)]

### N
- **Neon** : Fournisseur de base de données PostgreSQL serverless [Voir : [PRD §5.1](./PRD.md#51-stack-technologique)]
- **Next.js** : Framework React (v15.x) [Voir : [Section 1.4](#14-contexte-système)]
- **NextAuth.js** : Bibliothèque d'authentification (v5) [Voir : [PRD §5.1](./PRD.md#51-stack-technologique)]
- **Notification** : Message système sur activité de plateforme [Voir : [Section 3.8](#38-système-de-notifications), [PRD §3.7.2](./PRD.md#372-notifications)]
- **Type de Notification** : MEMBERSHIP_REQUEST, EVENT_CREATED, etc. [Voir : [Section 3.8.1](#381-types--déclencheurs)]

### O
- **OAuth** : Standard ouvert pour autorisation (Google, Microsoft)
- **Verrouillage Optimiste** : Contrôle de concurrence utilisant vérifications de version [Voir : [Section 3.2.2](#322-modification-de-profil)]
- **Mise à Jour Optimiste** : Mise à jour UI avant confirmation serveur [Voir : [Section 3.3.4](#334-flux-dadhésion-à-une-association)]
- **ORM (Mapping Objet-Relationnel)** : Abstraction de base de données (Prisma)

### P
- **Pagination** : Division du contenu en pages [Voir : [Section 3.3.1](#331-parcourir-les-associations)]
- **En Attente** : Statut adhésion/inscription en attente d'approbation [Voir : [Section 3.3.4](#334-flux-dadhésion-à-une-association)]
- **Persona** : Utilisateur représentatif fictif [Voir : [PRD §2](./PRD.md#2-personas-utilisateurs)]
- **Publication** : Annonce ou mise à jour d'association [Voir : [Section 3.5](#35-gestion-des-publications), [PRD §3.6](./PRD.md#36-fil-dactualité--publications)]
- **PRD (Document d'Exigences Produit)** : Spécification produit de haut niveau [Voir : [Documents Connexes](./PRD.md)]
- **Prisma** : ORM TypeScript (v6.x) [Voir : [PRD §5.1](./PRD.md#51-stack-technologique)]
- **Profil** : Informations utilisateur ou association [Voir : [Section 3.2](#32-gestion-du-profil-étudiant)]
- **PWA (Application Web Progressive)** : App web avec fonctionnalités natives (futur)

### R
- **Limitation de Débit** : Limitation de requêtes pour empêcher abus [Voir : [Section 3.1.3](#313-connexion-utilisateur-emailmot-de-passe)]
- **RBAC (Contrôle d'Accès Basé sur Rôles)** : Modèle de permissions par rôle utilisateur [Voir : [Section 2](#2-acteurs-et-rôles)]
- **React** : Bibliothèque UI (v19) [Voir : [PRD §5.1](./PRD.md#51-stack-technologique)]
- **Mise à Jour Temps Réel** : Rafraîchissement immédiat de données (WebSocket/polling) [Voir : [Section 3.7.2](#372-interactions)]
- **Date Limite d'Inscription** : Dernière date pour inscription événement [Voir : [Section 3.4.1](#341-création-dévénement-admin-association)]
- **Design Responsive** : UI adaptative pour différentes tailles d'écran [Voir : [PRD §4.2](./PRD.md#42-principes-dexpérience-utilisateur)]
- **RFC 5322** : Spécification de format d'adresse email [Voir : [Section 5.1](#51-règles-de-validation-des-entrées)]
- **Éditeur de Texte Enrichi** : Interface de saisie de texte formaté [Voir : [Section 3.5.1](#351-créer-publication-admin-association)]
- **Rôle** : Niveau de permission (Étudiant, Admin Association, Admin Système) [Voir : [Section 2](#2-acteurs-et-rôles), [PRD §7.3](./PRD.md#73-rôles-utilisateurs--permissions)]
- **Hiérarchie des Rôles** : Niveaux de permissions ordonnés [Voir : [Section 2.2](#22-hiérarchie-des-rôles)]

### S
- **Rounds de Salt** : Itérations de hachage bcrypt (≥10) [Voir : [Section 3.1.1](#311-inscription-utilisateur-emailmot-de-passe)]
- **SameSite** : Attribut de cookie pour protection CSRF (Lax) [Voir : [Section 3.1.4](#314-gestion-de-session)]
- **Recherche** : Trouver contenu par mots-clés [Voir : [Section 3.3.2](#332-recherche--filtrage)]
- **Session** : Période active d'utilisateur authentifié [Voir : [Section 3.1.4](#314-gestion-de-session)]
- **Durée de Session** : 24 heures par défaut, 7 jours avec "Se souvenir de moi" [Voir : [Section 3.1.3](#313-connexion-utilisateur-emailmot-de-passe)]
- **Chargement Squelette** : UI de remplacement pendant récupération de données [Voir : [Section 3.7.1](#371-vue-densemble-du-tableau-de-bord)]
- **Fenêtre Glissante** : Mécanisme de rafraîchissement de session [Voir : [Section 3.1.4](#314-gestion-de-session)]
- **Suppression Douce** : Marquer comme supprimé sans retirer de la BD [Voir : [Section 3.5.3](#353-supprimer-publication)]
- **SSO (Authentification Unique)** : Système d'authentification unifié (futur)
- **Étudiant** : Type d'utilisateur principal rejoignant associations [Voir : [Section 2.1.2](#212-étudiant)]
- **Profil Étudiant** : Informations étendues étudiant [Voir : [Section 3.2.1](#321-création-de-profil-première-fois)]
- **Administrateur Système** : Rôle de gestion à l'échelle de la plateforme [Voir : [Section 2.1.5](#215-administrateur-système), [PRD §3.8](./PRD.md#38-tableau-de-bord-admin)]

### T
- **TailwindCSS** : Framework CSS utilitaire (v4.x) [Voir : [PRD §5.1](./PRD.md#51-stack-technologique)]
- **Jeton** : Chaîne cryptographique pour authentification (JWT)
- **TOS (Conditions d'Utilisation)** : Accord d'utilisation de la plateforme
- **TypeScript** : JavaScript fortement typé (v5.x) [Voir : [PRD §5.1](./PRD.md#51-stack-technologique)]

### U
- **UI/UX** : Design d'Interface Utilisateur et Expérience Utilisateur
- **Annulation** : Rétablir action (ex: suppression notification 5 secondes) [Voir : [Section 3.8.3](#383-interactions)]
- **Flux Utilisateur** : Parcours utilisateur étape par étape [Voir : [Section 3](#3-flux-utilisateurs), [PRD §6](./PRD.md#6-flux-utilisateurs)]

### V
- **Validation** : Vérification de données d'entrée [Voir : [Section 5.1](#51-règles-de-validation-des-entrées)]
- **Vercel** : Plateforme d'hébergement et déploiement [Voir : [Section 1.4](#14-contexte-système)]
- **Vérification** : Approbation d'association par Admin Système [Voir : [Section 3.10.2](#3102-vérification-dassociation), [PRD §3.2.2](./PRD.md#322-profils-dassociations)]
- **Badge de Vérification** : Indicateur visuel de statut vérifié [Voir : [Section 3.3.1](#331-parcourir-les-associations)]
- **Événement Virtuel** : Événement en ligne avec lien de réunion [Voir : [Section 3.4.1](#341-création-dévénement-admin-association)]

### W
- **WCAG** : Directives d'accessibilité web (cible 2.1 AA) [Voir : [Section 7.3](#73-contraintes)]
- **WebSocket** : Protocole de communication bidirectionnelle temps réel [Voir : [Section 3.7.2](#372-interactions)]
- **Flux de Travail** : Processus multi-étapes (ex: flux d'approbation) [Voir : [PRD §3.4](./PRD.md#34-gestion-des-adhésions)]

### X
- **XSS (Cross-Site Scripting)** : Vulnérabilité empêchée par échappement React [Voir : [PRD §5.3](./PRD.md#53-exigences-de-sécurité)]

---

## 10. Historique du Document

| Version | Date | Auteur | Changements |
|---:|---|---|---|
| 1.0 | 19 nov 2025 | Agent de Documentation du Projet | Spécification fonctionnelle complète initiale basée sur PRD v1.0 |

---

Connexes : Document d'Exigences Produit (PRD) v1.0, Spécification Technique (En Attente), Plan de Test (En Attente)
