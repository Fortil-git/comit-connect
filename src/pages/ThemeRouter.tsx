import { useParams } from "react-router-dom";
import ThemeForm from "./ThemeForm";
import ActionsManager from "./ActionsManager";
import SubThemesList from "./SubThemesList";

const ThemeRouter = () => {
  const { themeId } = useParams();

  // Si c'est "info-comite", afficher le formulaire unique
  if (themeId === 'info-comite') {
    return <ThemeForm />;
  }

  // Si c'est "suivi-actions", afficher le gestionnaire d'actions
  if (themeId === 'suivi-actions') {
    return <ActionsManager />;
  }

  // Sinon, afficher la liste de cartes
  return <SubThemesList />;
};

export default ThemeRouter;
