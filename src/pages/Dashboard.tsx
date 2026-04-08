import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Info,
  TrendingUp,
  Users,
  Settings,
  Shield,
  Heart,
  Leaf,
  Star,
  Zap,
  Globe,
  LogOut,
  ArrowRight,
  Building2,
  Sun,
  Moon,
  MessageSquarePlus,
  FileDown,
  Calendar,
  Search,
  X
} from "lucide-react";
import { useThemeData } from "@/contexts/ThemeDataContext";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import logoFortil from "@/img/cropped-Logo-Picto_Degrade.png";
import { getCurrentSession, hasActiveSession, getActiveComiteId } from "@/utils/comiteSession";
import { api } from "@/lib/api";
import { ComiteAlert } from "@/components/ComiteAlert";
import { ComiteToast } from "@/components/ComiteToast";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, any> = {
  info: Info,
  'trending-up': TrendingUp,
  users: Users,
  settings: Settings,
  shield: Shield,
  heart: Heart,
  leaf: Leaf,
  star: Star,
  zap: Zap,
  globe: Globe,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { themes, refetch: refetchThemes } = useThemeData();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, agency: currentAgency, loading, logout } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeComite, setActiveComite] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});
  const [autresSujetsCount, setAutresSujetsCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
      return;
    }
    if (loading) return;

    // Rafraîchir les thèmes (ex: après ajout depuis l'admin)
    refetchThemes();

    // Afficher la modale de bienvenue uniquement si pas déjà affichée dans cette session
    const welcomeShown = sessionStorage.getItem('welcomeModalShown');
    if (!welcomeShown) {
      setShowWelcomeModal(true);
      sessionStorage.setItem('welcomeModalShown', 'true');
    }

    // Charger les informations du comité actif
    getCurrentSession().then(session => {
      if (session) setActiveComite(session.formData);
    });

    // Charger les compteurs d'activité si un comité est actif
    const comiteId = getActiveComiteId();
    if (comiteId) {
      api.getActivityCountsByTheme(comiteId).then(counts => setActivityCounts(counts)).catch(() => {});
      api.getActivities(comiteId).then(activities => {
        const count = activities.filter((a: any) => a.type === 'sujet-created' || a.type === 'sujet-deleted').length;
        setAutresSujetsCount(count);
      }).catch(() => {});
    }

    // Le toast des comités futurs est géré par ComiteToast
  }, [navigate, loading, isAuthenticated]);

  const handleStartNewComite = () => {
    setShowWelcomeModal(false);
    navigate('/theme/info-comite');
  };

  const handleLogout = async () => {
    await logout();
    sessionStorage.removeItem('welcomeModalShown');
    toast.success("Déconnexion réussie", { position: 'top-center' });
    navigate("/");
  };

  const handleThemeClick = (themeId: string) => {
    navigate(`/theme/${themeId}`);
  };

  // Filtrer les thèmes en fonction de la recherche
  const filteredThemes = themes.filter(theme => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    // Rechercher dans le titre et la description du thème
    const matchTheme = theme.title.toLowerCase().includes(query) || 
                       theme.description.toLowerCase().includes(query);
    // Rechercher dans les sous-thèmes
    const matchSubTheme = theme.subThemes.some(subTheme => 
      subTheme.title.toLowerCase().includes(query)
    );
    return matchTheme || matchSubTheme;
  });

  return (
    <div className="min-h-screen dashboard-bg pb-28 colorBG">
      <img src={logoFortil} alt="" className="logoBG" />
      <div>
        <header className="gradientBg border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src={logoFortil} 
              alt="FORTIL Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Comités Locaux
              </h1>
              <div className="flex items-center gap-2">
                {currentAgency && (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium text-foreground">
                      {currentAgency.name}
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">{currentAgency.region}</p>
                  </>
                )}
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
          <div className="flex items-center gap-3">
            {/* Barre de recherche discrète */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un thème..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 h-9 w-[200px] bg-background/50 border-border/50 focus:w-[280px] transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {user?.userRole === 'SUPER_ADMIN' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2 h-8 noBG"
              >
                <Shield className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline text-xs">Admin</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="transition-all duration-200 h-8 w-8"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="mb-4 animate-fade-in text-center">
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Piliers du Comité</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Sélectionnez un thème pour accéder aux sous-thèmes
          </p>
        </div>

        {/* Actions */}
        <div className="mb-3">
          <h3 className="text-base font-semibold mb-2 text-primary text-center">Actions</h3>
          <div className="max-w-3xl mx-auto flex justify-center gap-2">
            {/* Autres sujets à aborder */}
            <button
              className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 hover:border-primary/50 bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => navigate('/autres-sujets')}
            >
              <div className="p-1 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm group-hover:scale-110 transition-transform">
                <MessageSquarePlus className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold group-hover:text-primary transition-colors">Autres sujets</span>
              {hasActiveSession() && autresSujetsCount > 0 && (
                <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 h-4 min-w-[16px] flex items-center justify-center font-bold">
                  {autresSujetsCount}
                </Badge>
              )}
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Historique des comités */}
            <button
              className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 hover:border-primary/50 bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => navigate('/historique-comites')}
            >
              <div className="p-1 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                <Calendar className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold group-hover:text-primary transition-colors">Historique</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Export PDF */}
            <button
              className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 hover:border-primary/50 bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => navigate('/export-pdf')}
            >
              <div className="p-1 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm group-hover:scale-110 transition-transform">
                <FileDown className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold group-hover:text-primary transition-colors">Export PDF</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Séparateur */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          <div className="text-xs text-muted-foreground font-semibold">•</div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        </div>

        {/* Thèmes principaux */}
        <div className={`${hasActiveSession() ? 'p-4 rounded-lg border-2 border-green-500 ring-2 ring-green-500/30 shadow-green-500/20 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 animate-glow' : ''}`}>
          {hasActiveSession() && (
            <div className="mb-3 text-center">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">
                📋 Comité en cours
              </p>
              <p className="text-xs text-muted-foreground">
                Sélectionnez les thèmes abordés pendant ce comité
              </p>
            </div>
          )}
          <h3 className="text-base font-semibold mb-2 text-center">Thèmes principaux</h3>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredThemes.map((theme, index) => {
                const Icon = iconMap[theme.icon] || Info;
                return (
                  <Card
                    key={theme.id}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in overflow-hidden border-border/50 hover:border-primary/50"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleThemeClick(theme.id)}
                  >
                    <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
                    <CardHeader className="p-1.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`p-1 rounded-lg bg-gradient-to-br ${theme.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                          {hasActiveSession() && (() => {
                            const count = activityCounts[theme.id] || 0;
                            return count > 0 ? (
                              <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 h-4 min-w-[16px] flex items-center justify-center font-bold">
                                {count}
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                        <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      <div className="flex items-center gap-1">
                        <CardTitle className="text-xs font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">
                          {theme.title}
                        </CardTitle>
                        {theme.important && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-1.5 pt-0">
                      <p className="text-[10px] text-muted-foreground">
                        {(theme.subThemes || []).length} sous-thèmes
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      </div>

      {/* Modale de bienvenue */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Bienvenue sur Comit-Connect ! 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              {currentAgency && (
                <span className="block mb-4 text-lg font-semibold text-primary">
                  Agence : {currentAgency.name}
                </span>
              )}
              Souhaitez-vous démarrer un nouveau comité ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <Button 
              onClick={handleStartNewComite}
              className="w-full h-16 text-lg bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform duration-200 shadow-lg"
            >
              <Calendar className="w-6 h-6 mr-3" />
              Démarrer un nouveau comité
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowWelcomeModal(false)}
              className="w-full"
            >
              Plus tard, explorer le tableau de bord
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            💡 Vous pouvez toujours démarrer un nouveau comité depuis "Informations comité" dans le menu
          </div>
        </DialogContent>
      </Dialog>

      <ComiteToast />
      <Footer />
    </div>
  );
};

export default Dashboard;
