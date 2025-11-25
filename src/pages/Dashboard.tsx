import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Info, 
  TrendingUp, 
  Users, 
  Settings, 
  Shield, 
  Heart, 
  Leaf,
  LogOut,
  ArrowRight
} from "lucide-react";
import { themes } from "@/data/themes";
import { toast } from "sonner";

const iconMap = {
  info: Info,
  'trending-up': TrendingUp,
  users: Users,
  settings: Settings,
  shield: Shield,
  heart: Heart,
  leaf: Leaf,
};

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  const handleThemeClick = (themeId: string) => {
    navigate(`/theme/${themeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Comités Locaux
            </h1>
            <p className="text-sm text-muted-foreground">Gestion et suivi des comités</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Piliers du Comité</h2>
          <p className="text-muted-foreground">
            Sélectionnez un thème pour accéder aux sous-thèmes et commencer la prise de notes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme, index) => {
            const Icon = iconMap[theme.icon as keyof typeof iconMap];
            return (
              <Card
                key={theme.id}
                className="group hover:shadow-elevated transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/50 animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleThemeClick(theme.id)}
              >
                <div className={`h-2 bg-gradient-to-r ${theme.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {theme.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {theme.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {theme.subThemes.length} sous-thèmes disponibles
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
