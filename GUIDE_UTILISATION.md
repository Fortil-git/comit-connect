# Guide d'utilisation - Comit-Connect

## 📋 Table des matières

1. [Présentation de l'application](#présentation-de-lapplication)
2. [Connexion](#connexion)
3. [Démarrer un nouveau comité](#démarrer-un-nouveau-comité)
4. [Gérer les thèmes du comité](#gérer-les-thèmes-du-comité)
5. [Créer des actions à mener](#créer-des-actions-à-mener)
6. [Créer des votes et sondages](#créer-des-votes-et-sondages)
7. [Ajouter d'autres sujets](#ajouter-dautres-sujets)
8. [Terminer un comité](#terminer-un-comité)
9. [Consulter l'historique](#consulter-lhistorique)
10. [Rouvrir un comité existant](#rouvrir-un-comité-existant)

---

## 🎯 Présentation de l'application

**Comit-Connect** est une application web de gestion et de suivi des comités locaux FORTIL. Elle permet de :

- ✅ Organiser et structurer les réunions de comité
- 📝 Prendre des notes sur différentes thématiques
- 🎯 Créer et suivre des actions à mener
- 🗳️ Organiser des votes et sondages
- 📊 Consulter l'historique des comités passés
- 📄 Exporter les données en PDF

### Utilité principale

L'application centralise toutes les informations relatives aux comités locaux :
- **Informations du comité** : date, entité, participants
- **7 thématiques principales** : Performance économique, sociale, technique, gouvernance, impact sociétal et environnemental
- **Suivi des actions** : création, suivi et clôture des actions décidées en comité
- **Historique complet** : toutes les activités sont enregistrées et consultables

---

## 🔐 Connexion

### Première connexion

1. **Accédez à l'application** via votre navigateur
2. **Sélectionnez votre agence** dans la liste déroulante :
   - Paris
   - Lyon
   - Toulouse
   - Nantes
   - Bordeaux
   - Lille
   - Strasbourg
   - Marseille
   - Rennes
   - Grenoble

3. **Cliquez sur "Se connecter"**

> 💡 **Note** : L'agence sélectionnée sera affichée dans le header de toutes les pages.

### Modal de bienvenue

Après la connexion, une modal de bienvenue s'affiche vous proposant de :
- **Démarrer un nouveau comité** : Lance directement le formulaire d'informations
- **Explorer le tableau de bord** : Accède au dashboard sans créer de comité

> 💡 **Astuce** : Cette modal s'affiche à chaque nouvelle connexion.

---

## 🚀 Démarrer un nouveau comité

### Depuis le Dashboard

Deux façons de démarrer un comité :

#### Option 1 : Via la modal de bienvenue
- Cliquez sur **"Démarrer un nouveau comité"**
- Vous êtes redirigé vers le formulaire "Informations comité"

#### Option 2 : Via la carte "Information comité"
- Sur le dashboard, la carte **"Information comité"** clignote en vert
- Elle affiche : **"✨ Démarrer un nouveau comité"**
- Cliquez sur cette carte

### Remplir le formulaire "Informations comité"

Le formulaire contient plusieurs champs :

1. **Date du Comité** : Sélectionnez la date de la réunion (calendrier qui se ferme automatiquement)
2. **Entité FORTIL** : Pré-rempli automatiquement avec le nom de votre agence (lecture seule)
3. **Invités** : Y a-t-il des invités ? (Oui/Non)
4. **Agence des invités** : Si invités = Oui (optionnel)
5. **Participants** : Sélection multiple avec suggestions
6. **Nombre de participants** : Compteur automatique
7. **Ordre du jour** : Points à aborder
8. **Décisions prises** : Résumé des décisions
9. **Points d'attention** : Éléments importants
10. **Prochaines étapes** : Actions futures
11. **Commentaires** : Remarques libres

> 💡 **Nouveau** : Le champ "Entité FORTIL" est automatiquement rempli avec le nom de votre agence connectée et ne peut pas être modifié.
> 💡 **Nouveau** : Les calendriers se ferment automatiquement après sélection d'une date.

### Démarrer le comité

1. **Remplissez tous les champs**
2. **Cliquez sur "Démarrer le comité"** (en bas du formulaire)
3. **Vous êtes redirigé vers le dashboard**
4. **Un toast de confirmation s'affiche** en haut de la page pendant 5 secondes :
   ```
   ✅ Comité ouvert !
   📅 Date : 27 novembre 2025
   🏢 Entité : FORTIL SUD EST
   
   Toutes les actions seront enregistrées jusqu'à la clôture.
   ```

### Indicateurs de comité actif

Une fois le comité démarré, plusieurs indicateurs apparaissent :

#### 1. Toast permanent (en bas à droite)
```
┌─────────────────┐
│ [OUVERT]        │
│ 📅 27 nov 2025 │
│ 🏢 FORTIL SUD  │
│    EST      [X]│
└─────────────────┘
```

#### 2. Badge dans le header (toutes les pages)
```
[🟢 Comité en cours] 27/11/2025
```

#### 3. Section "Thèmes principaux" mise en lumière
- Bordure bleue
- Fond bleu clair
- Message : "📋 Comité en cours - Sélectionnez les thèmes abordés pendant ce comité"

#### 4. Bouton "Terminer le comité" dans le footer
- Visible uniquement quand un comité est actif

---

## 📚 Gérer les thèmes du comité

### Les 7 thématiques principales

1. **Performance Économique** 🔵
   - Évolution du BP
   - Intercontrats
   - FAE (Frais d'Approche et d'Étude)
   - Taux de marge
   - Nouveaux clients
   - Chiffre d'affaires
   - Rentabilité
   - Objectifs financiers

2. **Performance Sociale** 💜
   - Effectifs RH
   - Recrutement
   - Turnover
   - Absentéisme
   - Formation
   - Satisfaction collaborateurs
   - Événements internes

3. **Performance Technique** 🟠
   - Satisfaction technique
   - Veille technologique
   - Innovation
   - Compétences techniques
   - Projets techniques

4. **Performance Gouvernance** 🌸
   - Diversité et inclusion
   - Vivre-ensemble
   - Éthique et conformité
   - Communication interne
   - Processus décisionnels

5. **Impact Sociétal** 💙
   - Mécénat et partenariats
   - Ancrage territorial
   - Partenariats locaux
   - Engagement sociétal

6. **Impact Environnemental** 🟢
   - Empreinte carbone
   - Consommation d'énergie
   - Gestion des déchets
   - Mobilité durable
   - Achats responsables

### Accéder à un thème

1. **Depuis le dashboard**, cliquez sur la carte du thème souhaité
2. **Liste des sous-thèmes** s'affiche
3. **Cliquez sur un sous-thème** pour accéder à la prise de notes

### Prendre des notes

> ⚠️ **Important** : Un comité doit être ouvert pour prendre des notes.

#### Si aucun comité n'est ouvert :
- Une alerte s'affiche en haut de la page
- Tous les champs de saisie sont grisés et désactivés
- Le bouton "Sauvegarder la note" est désactivé
- Message : "⚠️ Aucun comité ouvert - La prise de notes est désactivée. Ouvrez un comité pour commencer à prendre des notes."

#### Si un comité est ouvert :

1. **Sélectionnez un sous-thème**
2. **Saisissez vos notes** dans le champ prévu (Textarea, Input, Select ou Checkbox selon le type)
3. **Cliquez sur "Sauvegarder la note"**
4. **Confirmation** : Toast "Note sauvegardée avec succès !" en haut de la page

> 💡 **Astuce** : Les notes sont automatiquement enregistrées dans la session du comité actif.

### Organisation de la page sous-thème

La page est organisée en 3 sections :

#### 1. Prise de notes (en haut, pleine largeur)
- Champ de saisie adapté au type (Textarea, Input, Select, Checkbox)
- Bouton "Sauvegarder la note"
- Hauteur compacte (120px pour le textarea)

#### 2. Actions à mener (en bas à gauche)
- Liste des actions liées à ce sous-thème
- Affichage en grille (2 colonnes sur desktop)
- Hauteur max : 500px avec scroll si nécessaire
- Bouton "Nouvelle action" en bas de la carte
- **Clic sur une action** : Ouvre une modale avec tous les détails

#### 3. Votes et sondages (en bas à droite)
- Liste des votes créés pour ce sous-thème
- Hauteur max : 500px avec scroll si nécessaire
- Bouton "Créer un vote" en bas de la carte

> 💡 **Astuce** : Le contenu tient sans scroll sur un écran standard.

### Exporter les notes

- **Bouton "Exporter"** disponible sur chaque sous-thème
- Format : JSON
- Contient : thème, sous-thème, date, note

---

## 🎯 Créer des actions à mener

### Accès au suivi des actions

Deux façons d'accéder :

1. **Via le footer** : Cliquez sur "Suivi actions"
2. **Via le dashboard** : Carte "Suivi des actions à mener"

### Créer une nouvelle action

> ⚠️ **Important** : Un comité doit être ouvert pour créer des actions.

#### Si aucun comité n'est ouvert :
- Une alerte s'affiche en haut de la page
- Le bouton "Nouvelle action" est grisé et désactivé
- Deux options :
  - **Comité existant** : Rouvrir un comité passé
  - **Nouveau comité** : Créer un nouveau comité

#### Si un comité est ouvert :

1. **Cliquez sur "Nouvelle action"**
2. **Remplissez le formulaire** :
   - **Thématique** : Sélectionnez le thème concerné
   - **Sous-thème** : Sélectionnez le sous-thème (optionnel)
   - **Titre** : Nom de l'action
   - **Description** : Détails de l'action
   - **Responsables** : Personnes en charge
   - **Échéance** : Date limite (calendrier interactif avec format français)

3. **Cliquez sur "Créer l'action"**
4. **Confirmation** : Toast "Action créée avec succès !" en haut de la page

> 💡 **Nouveau** : Le champ échéance utilise un calendrier interactif (comme dans le formulaire d'informations du comité) avec affichage en français (ex: "27 novembre 2025").

### Suivre les actions

#### Filtres disponibles :
- **Par comité** : Filtrer les actions par comité spécifique (affiche la date et l'entité)
- **Par thématique** : Toutes, Performance Économique, Performance Sociale, etc.
- **Par type** : Toutes, Actions uniquement, Votes uniquement
- **Par statut** : Toutes, En cours, Terminées, Abandonnées

> 💡 **Nouveau** : Filtrage par comité pour voir uniquement les actions d'un comité spécifique.

#### Statuts des actions :
- 🔵 **En cours** : Action en cours de réalisation
- 🟢 **Terminée** : Action complétée
- 🔴 **Abandonnée** : Action annulée (avec commentaire obligatoire)

#### Consulter une action :
1. **Cliquez sur une action** (depuis le suivi ou depuis un sous-thème)
2. **Une modale s'ouvre** avec tous les détails :
   - Thème et sous-thème
   - Titre et description
   - Responsables et échéance
   - Statut avec badge coloré
   - Commentaire d'abandon (si applicable)
   - Date de création
3. **Boutons disponibles** :
   - "Fermer" : Ferme la modale
   - "Voir dans Suivi actions" : Redirige vers la page de suivi (depuis un sous-thème)

> 💡 **Nouveau** : Plus besoin de quitter la page pour consulter les détails d'une action.

#### Modifier le statut :
1. **Depuis le suivi des actions**, cliquez sur une action
2. **Sélectionnez le nouveau statut**
3. **Ajoutez un commentaire** si abandon
4. **Confirmation** : Toast "Statut mis à jour" en haut de la page

### Supprimer une action

1. **Ouvrez les détails de l'action**
2. **Cliquez sur "Supprimer l'action"**
3. **Confirmation** : Toast "Action supprimée" en haut de la page

---

## 🗳️ Créer des votes et sondages

### Accès aux votes

Les votes sont créés depuis les pages de sous-thèmes.

### Créer un vote

> ⚠️ **Important** : Un comité doit être ouvert pour créer des votes.

1. **Accédez à un sous-thème**
2. **Scrollez jusqu'à la section "Votes et sondages"**
3. **Cliquez sur "Créer un vote"**
4. **Remplissez le formulaire** :
   - **Question** : La question du vote
   - **Options** : Minimum 2 options (ajoutez-en avec le bouton "+")

5. **Cliquez sur "Créer le vote"**
6. **Confirmation** : Toast "Vote créé avec succès !" en haut de la page

### Voter

1. **Sélectionnez une option** (bouton radio)
2. **Cliquez sur "Voter"**
3. **Confirmation** : Toast "Vote enregistré !" en haut de la page

### Consulter un vote

#### Depuis un sous-thème :
1. **Cliquez sur "Voir les résultats"**
2. **Modal s'ouvre** avec :
   - Graphique en barres
   - Nombre de votes par option
   - Pourcentages

#### Depuis le suivi des actions :
1. **Cliquez sur une carte de vote**
2. **Une modale s'ouvre** avec tous les détails :
   - Thème et sous-thème
   - Question du vote
   - Options avec résultats (votes et pourcentages)
   - Barres de progression visuelles
   - Total des votes
   - Date de création
3. **Boutons disponibles** :
   - "Fermer" : Ferme la modale
   - "Voir dans le sous-thème" : Redirige vers le sous-thème

> 💡 **Nouveau** : Consultez les votes depuis le suivi des actions sans changer de page.

### Supprimer un vote

1. **Cliquez sur l'icône poubelle** 🗑️
2. **Confirmation** : Toast "Vote supprimé !" en haut de la page

---

## 💬 Ajouter d'autres sujets

### Accès

- **Via le footer** : Cliquez sur "Autres sujets"
- **Via le dashboard** : Carte "Autres sujets à aborder"

### Créer un sujet

> ⚠️ **Important** : Un comité doit être ouvert pour ajouter des sujets.

1. **Cliquez sur "Ajouter un sujet"**
2. **Remplissez le formulaire** :
   - **Titre** : Nom du sujet
   - **Description** : Détails du sujet

3. **Cliquez sur "Créer le sujet"**
4. **Confirmation** : Toast de confirmation en haut de la page

### Consulter un sujet

- **Cliquez sur une carte** pour voir les détails complets
- Modal s'ouvre avec titre et description

### Supprimer un sujet

1. **Cliquez sur l'icône poubelle** 🗑️ sur la carte
2. **Confirmation** : Le sujet est supprimé

---

## ✅ Terminer un comité

### Depuis le footer

1. **Cliquez sur "Terminer le comité"** (bouton visible uniquement si comité actif)
2. **Modal de confirmation** s'affiche :
   ```
   Êtes-vous sûr de vouloir terminer ce comité ?
   Toutes les activités seront enregistrées dans l'historique.
   ```

3. **Cliquez sur "Terminer le comité"**
4. **Redirection** vers la page "Historique des comités"
5. **Confirmation** : Toast "Comité terminé et enregistré dans l'historique"

### Que se passe-t-il ?

- ✅ Toutes les activités sont enregistrées (actions, votes, notes, sujets)
- ✅ Le comité est ajouté à l'historique
- ✅ Les indicateurs de comité actif disparaissent
- ✅ Le bouton "Terminer le comité" disparaît du footer
- ✅ La carte "Information comité" redevient verte et clignote

---

## 📜 Consulter l'historique

### Accès

- **Via le footer** : Cliquez sur "Historique"
- **Via le dashboard** : Carte "Historique des comités"

### Export PDF des comités

Depuis l'historique, vous pouvez exporter un comité en PDF professionnel :

1. **Accédez à "Export PDF"** via le footer ou le dashboard
2. **Sélectionnez un comité** dans la liste déroulante
3. **Cliquez sur "Générer le PDF"**
4. **Le PDF est téléchargé** automatiquement

#### Contenu du PDF :
- **En-tête** : Logo FORTIL et titre professionnel
- **Informations du comité** : Date, entité, participants, invités, etc.
- **Résumé des activités** : Statistiques (notes, actions, votes, autres sujets)
- **Actions détaillées** : Titre, description, responsables, échéance, statut, date de création
- **Votes détaillés** : Question, options, résultats avec pourcentages
- **Notes sauvegardées** : Thèmes et sous-thèmes
- **Autres sujets** : Titres et descriptions
- **Pied de page** : Pagination et date de génération

> 💡 **Nouveau** : Le PDF est optimisé pour l'intégration dans PowerBI avec une structure tabulaire claire.
> 💡 **Historique des exports** : Tous les exports sont enregistrés avec possibilité de ré-exporter.

### Vue d'ensemble

L'historique affiche tous les comités passés avec :

#### Liste des comités (à gauche)
- **Date du comité** : Format "27 novembre 2025"
- **Badge "Dernier comité"** : Sur le comité le plus récent
- **Nombre d'activités** : Badge avec le total
- **Entité** : Nom de l'entité
- **Participants** : Liste des participants
- **Activités détaillées** : Cliquez sur la flèche pour déplier

#### Calendrier (à droite)
- **Mois en cours** : Avec navigation ◀ ▶
- **Jours avec comités** : Cercle vert
- **Aujourd'hui** : Cercle bleu
- **Navigation** : Changez de mois avec les flèches

### Détails d'un comité

Cliquez sur un comité pour déplier les détails :

#### Types d'activités :
- 📝 **Note sauvegardée** : Notes prises sur un sous-thème
- ✅ **Action créée** : Nouvelle action à mener
- 🗳️ **Vote créé** : Nouveau vote ou sondage
- 💬 **Sujet créé** : Autre sujet abordé
- 🗑️ **Suppression** : Actions, votes ou sujets supprimés

#### Informations affichées :
- **Type d'activité** : Icône + description
- **Horodatage** : Date et heure
- **Détails** : Informations spécifiques (titre, question, etc.)
- **Lien** : Accès direct au thème/sous-thème concerné

### Supprimer un comité

1. **Cliquez sur l'icône poubelle** 🗑️ à droite du comité
2. **Confirmation** : "Êtes-vous sûr de vouloir supprimer le comité du 27 novembre 2025 ? Cette action est irréversible."
3. **Cliquez sur "OK"**
4. **Confirmation** : Toast "Comité supprimé avec succès"

---

## 🔄 Rouvrir un comité existant

### Pourquoi rouvrir un comité ?

- Ajouter des actions oubliées
- Créer de nouveaux votes
- Compléter des notes
- Ajouter d'autres sujets

### Comment rouvrir un comité ?

#### Méthode 1 : Via l'alerte (si aucun comité ouvert)

1. **Tentez de créer une action/vote/sujet**
2. **Alerte s'affiche** : "Aucun comité ouvert"
3. **Cliquez sur "Comité existant"**
4. **Sélectionnez le comité** dans la liste déroulante
5. **Cliquez sur "Ouvrir ce comité"**
6. **Confirmation** : Toast "Comité du 27 novembre 2025 réouvert !"

#### Méthode 2 : Via l'historique

1. **Accédez à l'historique**
2. **Consultez les comités passés**
3. **Utilisez l'alerte pour rouvrir** (même processus que méthode 1)

### Que se passe-t-il ?

- ✅ Le comité est réouvert avec son ID original
- ✅ Les activités existantes sont conservées
- ✅ Les nouvelles activités s'ajoutent aux anciennes
- ✅ Pas de doublon dans l'historique
- ✅ Les indicateurs de comité actif réapparaissent

### Terminer à nouveau

- **Cliquez sur "Terminer le comité"** dans le footer
- Le comité est **mis à jour** dans l'historique (pas de nouveau comité créé)
- Toutes les activités (anciennes + nouvelles) sont enregistrées

---

## 🎨 Interface et navigation

### Header

Présent sur toutes les pages :
- **Logo FORTIL** : Retour au dashboard
- **Nom de l'agence** : Agence sélectionnée à la connexion
- **Barre de recherche** : Recherche rapide de thèmes et sous-thèmes (discrète, s'agrandit au focus)
- **Badge comité actif** : Si un comité est ouvert
- **Bouton thème** : Basculer entre mode clair/sombre

> 💡 **Nouveau** : Barre de recherche pour filtrer rapidement les thèmes et sous-thèmes dans le dashboard.

### Footer

Navigation principale avec 3 groupes :

#### Navigation (gauche)
- **Accueil** : Retour au dashboard
- **Info Comité** : Formulaire d'informations (badge vert "!" si aucun comité ouvert)
- **Suivi Actions** : Gestion des actions

#### Thématiques (centre)
- 6 thèmes principaux
- Icônes colorées
- Accès rapide

#### Actions (droite)
- **Autres sujets** : Sujets divers
- **Historique** : Comités passés
- **Export PDF** : Export des données
- **Déconnexion** : Se déconnecter
- **Terminer le comité** : Si comité actif (bouton rouge)

### Fil d'Ariane (Breadcrumb)

Sur les pages de thèmes et sous-thèmes :
- **Thème** > **Sous-thème**
- Cliquable pour remonter

---

## 💡 Bonnes pratiques

### Avant le comité

1. ✅ Préparez l'ordre du jour
2. ✅ Listez les participants
3. ✅ Identifiez les thèmes à aborder

### Pendant le comité

1. ✅ Démarrez le comité dès le début de la réunion
2. ✅ Prenez des notes en temps réel sur chaque thème
3. ✅ Créez les actions à mener au fur et à mesure
4. ✅ Organisez les votes si nécessaire
5. ✅ Notez les autres sujets abordés

### Après le comité

1. ✅ Relisez et complétez les notes
2. ✅ Vérifiez que toutes les actions sont créées
3. ✅ Terminez le comité
4. ✅ Exportez les données si besoin
5. ✅ Suivez les actions dans "Suivi actions"

### Suivi régulier

1. ✅ Consultez régulièrement le suivi des actions
2. ✅ Mettez à jour les statuts des actions
3. ✅ Consultez l'historique pour comparer les comités
4. ✅ Préparez le prochain comité en vous basant sur l'historique

---

## 🔧 Fonctionnalités avancées

### Filtrage dans le suivi des actions

#### Filtres disponibles :
- **Par type** : Toutes, Actions uniquement, Votes uniquement
- **Par thématique** : Voir uniquement les actions/votes d'un thème
- **Par statut** : En cours, Terminées, Abandonnées (pour les actions)
- **Compteurs** : Nombre d'actions et de votes par filtre

#### Consultation rapide :
- **Clic sur une action** : Ouvre une modale avec les détails complets
- **Clic sur un vote** : Ouvre une modale avec les résultats et statistiques
- **Pas de redirection** : Restez sur la page de suivi pour une navigation fluide

### Statistiques des votes

- **Graphique en barres** : Visualisation des résultats
- **Pourcentages** : Calcul automatique
- **Total de votes** : Nombre de participants

### Calendrier de l'historique

- **Navigation mensuelle** : Parcourez les mois
- **Jours avec comités** : Repérage visuel
- **Aujourd'hui** : Marqueur spécial

### Recherche dans l'historique

- **Tri par date** : Du plus récent au plus ancien
- **Mise en avant** : Dernier comité en évidence
- **Détails dépliables** : Cliquez pour voir les activités

---

## ❓ FAQ - Questions fréquentes

### Puis-je créer des actions/votes/notes sans comité ouvert ?

Non, un comité doit être actif pour :
- Prendre des notes dans les sous-thèmes
- Créer des actions à mener
- Créer des votes et sondages
- Ajouter d'autres sujets

Vous pouvez soit :
- Créer un nouveau comité
- Rouvrir un comité existant

Les champs et boutons sont automatiquement désactivés (grisés) quand aucun comité n'est ouvert.

### Que se passe-t-il si je ferme le navigateur pendant un comité ?

Le comité reste actif. Les données sont sauvegardées dans le navigateur (localStorage). Vous pouvez continuer où vous vous êtes arrêté.

### Puis-je modifier un comité terminé ?

Oui, rouvrez-le depuis l'alerte ou l'historique, ajoutez vos modifications, puis terminez-le à nouveau.

### Les données sont-elles sauvegardées ?

Oui, toutes les données sont sauvegardées localement dans votre navigateur (localStorage). Elles persistent même après fermeture du navigateur.

### Puis-je exporter les données ?

Oui, plusieurs options :
- Export JSON par sous-thème
- Export PDF global (via le bouton dans le footer)

### Combien de comités puis-je créer ?

Illimité. Tous les comités sont conservés dans l'historique.

### Puis-je créer plusieurs comités le même jour ?

Non, **un seul comité par jour est autorisé**. Si vous tentez de créer un comité à une date où un comité existe déjà, un message d'erreur s'affiche :

```
❌ Un comité existe déjà pour le 27/11/2025.
Un seul comité par jour est autorisé.
```

Vous pouvez cependant rouvrir le comité existant pour le compléter.

### Puis-je supprimer un comité ?

Oui, depuis l'historique, cliquez sur l'icône poubelle. ⚠️ Action irréversible.

### La modal de bienvenue s'affiche-t-elle toujours ?

Elle s'affiche à chaque nouvelle connexion (après déconnexion).

---

## 🎯 Raccourcis clavier

Aucun raccourci clavier n'est actuellement implémenté. Navigation uniquement à la souris/tactile.

---

## 📱 Compatibilité

### Navigateurs supportés
- ✅ Chrome (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Appareils
- ✅ Desktop (optimisé)
- ✅ Tablette (responsive)
- ✅ Mobile (adapté)

---

## 🆘 Support

Pour toute question ou problème :
- Consultez ce guide d'utilisation
- Vérifiez la FAQ ci-dessus
- Contactez l'administrateur système

---

## 📝 Notes de version

**Version actuelle** : 1.1.0

### Fonctionnalités principales
- ✅ Gestion complète des comités
- ✅ 7 thématiques avec sous-thèmes
- ✅ Suivi des actions à mener
- ✅ Votes et sondages
- ✅ Historique complet
- ✅ Export des données
- ✅ Interface responsive
- ✅ Mode clair/sombre

### Nouveautés v1.2.0 (16 décembre 2025)
- ✨ **Champ Entité auto-rempli** : Le champ "Entité FORTIL" est automatiquement rempli avec l'agence connectée
- ✨ **Fermeture auto des calendriers** : Les calendriers se ferment automatiquement après sélection
- ✨ **Filtrage par comité** : Filtrez les actions par comité spécifique dans "Suivi actions"
- ✨ **Badge notification** : Badge vert "!" sur "Info Comité" quand aucun comité n'est ouvert
- ✨ **Barre de recherche** : Recherche rapide de thèmes et sous-thèmes dans le dashboard
- ✨ **Export PDF professionnel** : PDF détaillé avec logo FORTIL, optimisé pour PowerBI
- ✨ **Historique des exports** : Tous les exports PDF sont enregistrés et ré-exportables
- ✨ **Gestion des comités** : Réinitialisation automatique des données lors de l'ouverture d'un nouveau comité
- ✨ **Filtrage amélioré** : Filtres multiples (comité, thème, type, statut) dans le suivi des actions

### Nouveautés v1.1.0 (27 novembre 2025)
- ✨ **Désactivation automatique** : Prise de notes, actions et votes désactivés sans comité actif
- ✨ **Layout optimisé** : Sous-thèmes réorganisés (notes en haut, actions/votes côte à côte)
- ✨ **Calendrier interactif** : Sélection de date d'échéance avec calendrier français
- ✨ **Modales de détails** : Consultation rapide des actions et votes sans redirection
- ✨ **Contrainte journalière** : Un seul comité par jour autorisé
- ✨ **Hauteur optimisée** : Contenu des sous-thèmes visible sans scroll
- ✨ **Boutons repositionnés** : Boutons d'action en bas des cartes pour meilleure UX

---

**Dernière mise à jour** : 16 décembre 2025
**Auteur** : FERRES Enzo
**Application** : Comit-Connect v1.2.0
