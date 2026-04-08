# Instructions pour afficher l'éditeur WYSIWYG

## Problème constaté
L'éditeur React Quill ne s'affiche pas correctement dans la page des sous-thèmes. Seul le label "Vos notes" et les boutons sont visibles.

## Modifications effectuées

### 1. Installation de React Quill
```bash
npm install react-quill quill
```

### 2. Fichiers modifiés

#### `src/main.tsx`
Ajout de l'import CSS global de React Quill :
```typescript
import "react-quill/dist/quill.snow.css";
```

#### `src/index.css`
Ajout des styles pour forcer l'affichage :
```css
.rich-text-editor {
  display: block !important;
  width: 100%;
}

.rich-text-editor .ql-container {
  min-height: 200px;
  font-size: 14px;
  display: block !important;
}

.rich-text-editor .ql-editor {
  min-height: 200px;
  display: block !important;
}
```

#### `src/components/RichTextEditor.tsx`
Composant créé avec état de montage pour éviter les erreurs SSR.

#### `src/pages/SubThemeDetail.tsx`
Intégration de l'éditeur à la place du Textarea.

## ⚠️ ACTION REQUISE

**Pour que l'éditeur s'affiche correctement, vous DEVEZ redémarrer le serveur de développement :**

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis relancer :
npm run dev
```

## Vérification

Après le redémarrage, vous devriez voir :
1. Une barre d'outils de formatage (gras, italique, couleurs, etc.)
2. Une zone d'édition de texte enrichi
3. Les boutons "Ajouter une image" et "Joindre un fichier"
4. La liste des fichiers joints (si présents)

## En cas de problème persistant

Si l'éditeur ne s'affiche toujours pas après le redémarrage :

1. Vérifier la console du navigateur pour les erreurs
2. Vérifier que `react-quill` est bien installé :
   ```bash
   npm list react-quill
   ```
3. Nettoyer le cache et rebuilder :
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

## Fonctionnalités de l'éditeur

Une fois affiché, l'éditeur permet :
- ✅ Formatage de texte (gras, italique, souligné, barré)
- ✅ Titres (H1, H2, H3)
- ✅ Couleurs de texte et de fond
- ✅ Listes ordonnées et non ordonnées
- ✅ Alignement du texte
- ✅ Citations et blocs de code
- ✅ Liens hypertexte
- ✅ **Images** (insertion directe dans le texte)
- ✅ **Fichiers joints** (PDF, DOC, XLS, etc.)

## Export PDF

Les notes enrichies sont exportées dans le PDF avec :
- Le contenu texte (HTML converti)
- Les images intégrées (affichées dans le PDF)
- La liste des fichiers joints avec leur taille
