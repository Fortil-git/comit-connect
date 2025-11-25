import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { themes } from "@/data/themes";

const SubThemesList = () => {
  const { themeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const theme = themes.find((t) => t.id === themeId);

  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Thème non trouvé</p>
      </div>
    );
  }

  const handleSubThemeClick = (subThemeId: string) => {
    navigate(`/theme/${themeId}/subtheme/${subThemeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-muted mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{theme.title}</h1>
            <p className="text-sm text-muted-foreground">{theme.description}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Sous-thèmes disponibles</h2>
          <p className="text-muted-foreground">
            Sélectionnez un sous-thème pour commencer la prise de notes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {theme.subThemes.map((subTheme, index) => (
            <Card
              key={subTheme.id}
              className="group hover:shadow-elevated transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/50 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleSubThemeClick(subTheme.id)}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors flex-1">
                    {subTheme.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium">
                    {subTheme.type === 'text' && 'Texte libre'}
                    {subTheme.type === 'checkbox' && 'Cases à cocher'}
                    {subTheme.type === 'select' && 'Menu déroulant'}
                    {subTheme.type === 'number' && 'Numérique'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SubThemesList;
