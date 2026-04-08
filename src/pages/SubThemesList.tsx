import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Sun, Moon } from "lucide-react";
import { useThemeData } from "@/contexts/ThemeDataContext";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { hasActiveSession, getCurrentSession } from "@/utils/comiteSession";
import { getActiveComiteId } from "@/utils/comiteSession";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const SubThemesList = () => {
  const { themes } = useThemeData();
  const { isAuthenticated, loading } = useAuth();
  const { themeId } = useParams();
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const [activeComite, setActiveComite] = useState<any>(null);
  const [subThemeCounts, setSubThemeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
      return;
    }
    if (loading) return;

    // Charger le comité actif
    const handleSessionChange = async () => {
      const session = await getCurrentSession();
      setActiveComite(session ? session.formData : null);
      // Load subtheme activity counts
      const comiteId = getActiveComiteId();
      if (comiteId && themeId) {
        api.getActivityCountsBySubTheme(comiteId, themeId).then(counts => setSubThemeCounts(counts)).catch(() => {});
      } else {
        setSubThemeCounts({});
      }
    };

    handleSessionChange();

    window.addEventListener('comite-session-changed', handleSessionChange);
    return () => {
      window.removeEventListener('comite-session-changed', handleSessionChange);
    };
  }, [navigate, loading, isAuthenticated]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-28">
      <div>
        <header className="gradientBg border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-bold">{theme.title}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                  {activeComite && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-md flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-green-600">Comité en cours</span>
                      </div>
                      {activeComite['date'] && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(activeComite['date']).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
              className="transition-all duration-200 h-8 w-8 noBG"
            >
              {currentTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Breadcrumb 
          items={[
            { label: theme.title, icon: theme.icon, color: theme.color }
          ]} 
        />
        
        <div className="mb-6 animate-fade-in">
          <h2 className="text-xl font-bold mb-1">Sous-thèmes disponibles</h2>
          <p className="text-sm text-muted-foreground">
            Sélectionnez un sous-thème pour commencer la prise de notes
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {theme.subThemes.map((subTheme, index) => (
            <Card
              key={subTheme.id}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/50 animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => handleSubThemeClick(subTheme.id)}
            >
              <CardHeader className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1.5 rounded-md bg-gradient-to-br ${theme.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <FileText className="w-3.5 h-3.5 text-white" />
                    </div>
                    {hasActiveSession() && (() => {
                      const count = subThemeCounts[subTheme.id] || 0;
                      return count > 0 ? (
                        <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 h-4 min-w-[16px] flex items-center justify-center font-bold">
                          {count}
                        </Badge>
                      ) : null;
                    })()}
                  </div>
                </div>
                <CardTitle className="text-xs leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {subTheme.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium inline-block">
                  {subTheme.type === 'text' && 'Texte'}
                  {subTheme.type === 'checkbox' && 'Choix'}
                  {subTheme.type === 'select' && 'Menu'}
                  {subTheme.type === 'number' && 'Nombre'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      </div>
      <Footer />
    </div>
  );
};

export default SubThemesList;
