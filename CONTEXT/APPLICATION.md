# Comit-Connect - Contexte et Fonctionnement

## Presentation

**Comit-Connect** est un outil de gestion de comites locaux pour le **Groupe FORTIL**.
Chaque agence FORTIL organise des comites periodiques (mensuels/trimestriels) pour suivre la performance, la gouvernance et l'impact de l'agence.

C'est un **POC** (Proof of Concept) en local.

---

## Stack Technique

### Frontend
- **React 18 + TypeScript** avec **Vite** (port 8080)
- **shadcn/ui** + **Tailwind CSS** pour les composants UI
- **React Router v6** pour le routing
- **Lucide React** pour les icones

### Backend
- **Express.js + TypeScript** (port 3001, dossier `server/`)
- **Prisma ORM** avec **PostgreSQL**
- **express-session** pour l'authentification par session (cookies)
- **tsx** pour le hot-reload en dev

### Communication
- Le frontend proxy les requetes `/api` vers `localhost:3001` via la config Vite
- Toutes les requetes fetch incluent `credentials: 'include'` pour transmettre le cookie de session

---

## Architecture des Fichiers

```
comit-connect/
  src/                          # Frontend React
    App.tsx                     # Routes principales, AuthProvider + ThemeProvider
    main.tsx                    # Point d'entree React
    contexts/
      AuthContext.tsx            # Context d'authentification (session-based)
    components/
      Sidebar.tsx               # Barre laterale de navigation
      Footer.tsx                # Pied de page avec bouton deconnexion
      Breadcrumb.tsx            # Fil d'ariane
      ComiteAlert.tsx           # Alerte si pas de comite actif
      ComiteToast.tsx           # Toast de rappel comite actif
      RichTextEditor.tsx        # Editeur de texte riche (notes)
      theme-provider.tsx        # Gestion dark/light mode
    pages/
      Login.tsx                 # Page de connexion (selection agence)
      Dashboard.tsx             # Tableau de bord principal
      ThemeForm.tsx             # Formulaire de creation/edition de comite (/info-comite)
      ThemeRouter.tsx           # Router pour les sous-themes
      SubThemesList.tsx         # Liste des sous-themes d'un pilier
      SubThemeDetail.tsx        # Detail d'un sous-theme (notes, votes)
      ActionsManager.tsx        # Gestion des actions (/actions)
      AutresSujets.tsx          # Autres sujets hors themes (/autres-sujets)
      HistoriqueComites.tsx     # Comites passes archives (/historique-comites)
      ComitesFuturs.tsx         # Comites futurs planifies (/comites-futurs)
      ExportPDF.tsx             # Export du compte-rendu en PDF
    data/
      themes.ts                 # Definition des 7 piliers thematiques
      agencies.ts               # (ancien) Liste statique d'agences
      persons.ts                # (ancien) Liste statique de personnes
    lib/
      api.ts                    # Client API centralise (fetch avec credentials)
      utils.ts                  # Utilitaires divers
    utils/
      comiteSession.ts          # Gestion de la session comite active
  server/                       # Backend Express
    src/
      index.ts                  # Point d'entree serveur, middleware, session
      routes/
        index.ts                # Montage de toutes les routes /api/*
        authRoutes.ts           # Routes /api/auth (login, logout, me)
        agencyRoutes.ts         # Routes /api/agencies
        comiteRoutes.ts         # Routes /api/comites
        themeRoutes.ts          # Routes /api/themes (notes, votes)
        actionRoutes.ts         # Routes /api/actions
        personRoutes.ts         # Routes /api/persons
        autreSujetRoutes.ts     # Routes /api/autres-sujets
        activiteRoutes.ts       # Routes /api/activites
      controllers/
        authController.ts       # Login/logout/me (session)
        agencyController.ts     # CRUD agences
        comiteController.ts     # CRUD comites
        themeController.ts      # Notes et votes par sous-theme
        actionController.ts     # CRUD actions
        personController.ts     # CRUD personnes
        autreSujetController.ts # CRUD autres sujets
        activiteController.ts   # CRUD activites
      middleware/
        errorHandler.ts         # Gestion globale des erreurs
        authMiddleware.ts       # Middleware requireAuth (optionnel)
      types/
        session.d.ts            # Extension du type SessionData
    prisma/
      schema.prisma             # Schema de la base de donnees
      seed.ts                   # Seed avec 25 agences et 30 personnes
```

---

## Authentification

### Mecanisme
- **Session-based** via `express-session` (cookies httpOnly, 24h)
- Pas de mot de passe : l'utilisateur selectionne une agence dans une liste
- Le serveur cree une session avec `req.session.agencyId`

### Flux
1. L'utilisateur arrive sur `/` (Login)
2. Il selectionne une agence dans la liste
3. `POST /api/auth/login` → le serveur set la session
4. Le frontend redirige vers `/dashboard`
5. `AuthContext` verifie la session au montage via `GET /api/auth/me`
6. La deconnexion via `POST /api/auth/logout` detruit la session

### AuthContext
- `isAuthenticated` : boolean (derive de `!!agency`)
- `agency` : objet Agency ou null
- `loading` : boolean (true pendant la verification initiale)
- `login(agencyId)` : connecte l'agence
- `logout()` : deconnecte

### Guard sur les pages
Chaque page protegee utilise :
```typescript
const { isAuthenticated, loading } = useAuth();
useEffect(() => {
  if (!loading && !isAuthenticated) navigate("/");
}, [loading, isAuthenticated]);
```

---

## Metaphore du Comite = Livre

Un comite est comme un **livre** :
- **Ouvrir un comite** = ouvrir un livre pour ecrire dedans
- **Travailler dans un comite** = ecrire dans les pages du livre (notes, votes, actions, sujets)
- **Fermer un comite** = refermer le livre, il est archive
- **Rouvrir un comite** = rouvrir le livre pour y apporter des modifications

---

## Workflow Complet

### 1. Connexion
- Selection d'une agence sur la page Login
- Redirection vers le Dashboard

### 2. Creation d'un comite
- Aller sur `/info-comite` (ThemeForm)
- Remplir le formulaire :
  - **Entite** : pre-rempli avec l'agence connectee
  - **Date du comite** : date du jour ou future
  - **Participants** : selectionner les participants
  - **Activites** : selectionner les activites de l'agence
- Cliquer sur **"Demarrer le comite"**
- Le comite est cree en BDD avec le statut **OPEN**
- L'ID du comite actif est stocke dans `localStorage` sous `active-comite-id`

### 3. Session de comite active
Une fois le comite ouvert, l'utilisateur peut naviguer entre :

#### Les 7 Piliers Thematiques
Organises en 3 categories :
1. **Performance**
   - Performance Economique
   - Performance Sociale
   - Performance Technique
2. **Gouvernance**
   - Gouvernance
3. **Impact**
   - Impact Environnemental
   - Impact Societal
   - Impact Societaire (note: il semble y avoir overlap, verifier avec l'utilisateur)

Chaque pilier a des **sous-themes** (ex: "Chiffre d'affaires", "Satisfaction client").
Pour chaque sous-theme, on peut :
- Ecrire des **notes** (editeur riche)
- Voter (**Vert** = satisfaisant, **Orange** = a ameliorer, **Rouge** = critique)

#### Actions (/actions)
- Creer, modifier, supprimer des actions
- Chaque action a : titre, description, responsable, deadline, statut, priorite
- Les actions sont liees au comite actif via `comite_id`

#### Autres Sujets (/autres-sujets)
- Sujets hors themes principaux
- Lies au comite actif via `comite_id`

### 4. Fermeture du comite
- Le comite passe en statut **CLOSED**
- Toutes les donnees (notes, votes, actions, sujets) sont conservees en BDD
- Le comite ferme apparait dans :
  - `/historique-comites` si la date est passee
  - `/comites-futurs` si la date est future

### 5. Consultation et reouverture
- Les comites fermes sont consultables dans l'historique
- Un comite peut etre **rouvert** pour y apporter des modifications
- L'export PDF genere un compte-rendu du comite

---

## Modele de Donnees (Prisma)

### Relations principales
```
Agency (1) ←→ (N) Comite
Comite (1) ←→ (N) ThemeNote      (notes par sous-theme)
Comite (1) ←→ (N) ThemeVote      (votes par sous-theme)
Comite (1) ←→ (N) Action         (actions du comite)
Comite (1) ←→ (N) AutreSujet     (autres sujets du comite)
Comite (1) ←→ (N) ComiteActivite (activites du comite)
Comite (N) ←→ (N) Person         (participants, via table de jointure)
```

### Statuts d'un comite
- `OPEN` : comite en cours, editable
- `CLOSED` : comite termine, archive

---

## localStorage Restant (volontaire)

Seuls 2 usages de localStorage subsistent :
1. **`active-comite-id`** : ID du comite actif pour synchronisation rapide entre onglets/pages (dans `comiteSession.ts`)
2. **`comit-connect-theme`** : preference dark/light mode (dans `theme-provider.tsx`)

Toutes les autres donnees passent par l'API backend.

---

## Demarrage du Projet

```bash
# Terminal 1 : Base de donnees (si pas deja lancee)
# Assurer que PostgreSQL tourne localement

# Terminal 2 : Backend
cd server
npm install
npx prisma generate
npx prisma db push
npx prisma db seed   # 25 agences + 30 personnes
npm run dev           # Demarre sur port 3001

# Terminal 3 : Frontend
npm install
npm run dev           # Demarre sur port 8080
```

---

## Points d'Attention pour le Developpement

1. **Toujours inclure `credentials: 'include'`** dans les requetes fetch (deja gere par `src/lib/api.ts`)
2. **Le comite actif** est identifie par `active-comite-id` dans localStorage ET verifie cote serveur
3. **Les donnees appartiennent a un comite** : toute note, vote, action, sujet a un `comite_id` en FK
4. **Le formulaire ThemeForm** sert a la fois a creer et editer un comite
5. **Les pages de sous-themes** sont dynamiques : le contenu depend du pilier et sous-theme selectionne
6. **L'export PDF** compile toutes les donnees d'un comite en un document
