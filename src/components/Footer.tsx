import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Info, 
  TrendingUp, 
  Users, 
  Settings, 
  Shield, 
  Heart, 
  Leaf,
  Home,
  ListChecks,
  MessageSquarePlus,
  FileDown,
  LogOut,
  Save,
  CheckCircle,
  Calendar,
  CalendarClock,
  Star,
  Zap,
  Globe,
  Layers,
  NotebookPen,
  UserPlus
} from "lucide-react";
import { useThemeData } from "@/contexts/ThemeDataContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { hasActiveSession, endComiteSession, getCurrentSession } from "@/utils/comiteSession";
import { getActiveComiteId } from "@/utils/comiteSession";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, any> = {
  info: Info,
  'trending-up': TrendingUp,
  users: Users,
  settings: Settings,
  shield: Shield,
  heart: Heart,
  leaf: Leaf,
  'list-checks': ListChecks,
  star: Star,
  zap: Zap,
  globe: Globe,
};

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { themes } = useThemeData();
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(hasActiveSession());
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});
  const [autresSujetsCount, setAutresSujetsCount] = useState(0);
  const [futureComitesCount, setFutureComitesCount] = useState(0);
  const [activeComiteData, setActiveComiteData] = useState<any>(null);

  // Écouter les changements de session
  useEffect(() => {
    const loadCounts = async () => {
      const comiteId = getActiveComiteId();
      if (comiteId) {
        api.getActivityCountsByTheme(comiteId).then(counts => setActivityCounts(counts)).catch(() => {});
        api.getActivities(comiteId).then(activities => {
          const count = activities.filter((a: any) => a.type === 'sujet-created' || a.type === 'sujet-deleted').length;
          setAutresSujetsCount(count);
        }).catch(() => {});
        // Charger les données du comité actif
        const session = await getCurrentSession();
        setActiveComiteData(session || null);
      } else {
        setActivityCounts({});
        setAutresSujetsCount(0);
        setActiveComiteData(null);
      }
      // Future comites count
      api.getComites().then(comites => {
        const today = new Date(); today.setHours(0,0,0,0);
        const count = comites.filter((c: any) => { const d = new Date(c.date); d.setHours(0,0,0,0); return d > today; }).length;
        setFutureComitesCount(count);
      }).catch(() => {});
    };
    loadCounts();

    const handleSessionChange = () => {
      setIsSessionActive(hasActiveSession());
      loadCounts();
    };

    window.addEventListener('comite-session-changed', handleSessionChange);
    return () => {
      window.removeEventListener('comite-session-changed', handleSessionChange);
    };
  }, []);

  const getActiveTheme = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'theme' && pathParts[2]) {
      return pathParts[2];
    }
    return null;
  };

  const activeThemeId = getActiveTheme();
  const isDashboard = location.pathname === '/dashboard';

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    sessionStorage.removeItem('welcomeModalShown');
    toast.success("Déconnexion réussie", { position: 'top-center' });
    navigate("/");
  };

  const handleEndSession = () => {
    setShowEndSessionDialog(true);
  };

  const confirmEndSession = async () => {
    await endComiteSession();
    setShowEndSessionDialog(false);
    setIsSessionActive(false);
    toast.success("Comité terminé et enregistré dans l'historique !", { position: 'top-center' });
    // Déclencher un événement pour mettre à jour les autres composants
    window.dispatchEvent(new Event('comite-session-changed'));
    navigate('/historique-comites');
  };

  // Séparer les thèmes en deux groupes
  const infoComiteTheme = themes.find(t => t.id === 'info-comite');
  const suiviActionsTheme = themes.find(t => t.id === 'suivi-actions');
  const otherThemes = themes.filter(t => t.id !== 'info-comite' && t.id !== 'suivi-actions');

  const isPreparation = (() => {
    if (!activeComiteData?.date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const comiteDate = new Date(activeComiteData.date);
    comiteDate.setHours(0, 0, 0, 0);
    return comiteDate > today;
  })();

  return (
    <>
      {/* Indicateur de comité actif - fixé en haut */}
      {isSessionActive && activeComiteData && (
        <div className={`fixed top-0 right-0 w-1/2 z-50 border-b px-6 py-1.5 backdrop-blur-sm rounded-bl-lg ${
          isPreparation
            ? "bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-500/20"
            : "bg-gradient-to-r from-emerald-500/15 to-green-500/10 border-green-500/20"
        }`}>
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPreparation ? "bg-amber-400" : "bg-green-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPreparation ? "bg-amber-500" : "bg-green-500"}`}></span>
            </span>
            <span className={`font-semibold ${isPreparation ? "text-amber-700 dark:text-amber-300" : "text-green-700 dark:text-green-300"}`}>
              {isPreparation ? "Comité en préparation" : "Comité en cours"}
            </span>
            <span className={isPreparation ? "text-amber-600/60 dark:text-amber-400/60" : "text-green-600/60 dark:text-green-400/60"}>|</span>
            <span className={isPreparation ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}>
              {activeComiteData.date
                ? new Date(activeComiteData.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Date non définie'}
            </span>
            <span className={isPreparation ? "text-amber-600/60 dark:text-amber-400/60" : "text-green-600/60 dark:text-green-400/60"}>|</span>
            <span className={isPreparation ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}>
              {activeComiteData.entite || activeComiteData.entity || 'Entité non définie'}
            </span>
          </div>
        </div>
      )}
    <footer className="colorBG fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t-2 border-border/50 z-30 shadow-2xl">
      <div className="w-full px-6 py-6 colorBG">
        <div className="flex items-center justify-between gap-4">
          {/* Groupe gauche: Accueil + Info Comité + Suivi Actions */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Navigation</span>
            <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('/dashboard')}
              className={cn(
                "flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 min-w-[70px]",
                isDashboard
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-semibold">Accueil</span>
            </button>

            {/* Info Comité */}
            {infoComiteTheme && (() => {
              const Icon = NotebookPen;
              const isActive = activeThemeId === infoComiteTheme.id;
              return (
                <div key={infoComiteTheme.id} className="relative">
                  {isDashboard && !isSessionActive && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/3 z-50 whitespace-nowrap animate-bounce">
                      <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                        Cliquez ici pour démarrer un comité
                      </div>
                      <div className="absolute left-5 -bottom-1.5 w-3 h-3 bg-primary rotate-45 rounded-sm" />
                    </div>
                  )}
                  <button
                    onClick={() => handleNavigate(`/theme/${infoComiteTheme.id}`)}
                    className={cn(
                      "flex flex-col items-center gap-2 px-3 py-3 rounded-xl transition-all duration-300 min-w-[70px] group",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : !isSessionActive
                          ? "text-primary bg-primary/5 ring-2 ring-primary/30 hover:bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="relative">
                      <div className={cn(
                        "p-2 rounded-xl transition-all duration-300 shadow-md",
                        `bg-gradient-to-br ${infoComiteTheme.color}`,
                        isActive
                          ? "scale-125 shadow-lg"
                          : !isSessionActive
                            ? "scale-110 shadow-lg ring-2 ring-white/30 opacity-100"
                            : "opacity-80 group-hover:opacity-100 group-hover:scale-110"
                      )}>
                        <Icon className={cn("text-white transition-all duration-300", isActive || !isSessionActive ? "w-6 h-6" : "w-5 h-5")} />
                      </div>
                      {isSessionActive ? (() => {
                        const count = activityCounts[infoComiteTheme.id] || 0;
                        return count > 0 ? (
                          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 py-0 h-4 min-w-[16px] flex items-center justify-center font-bold border-2 border-background">
                            {count}
                          </Badge>
                        ) : null;
                      })() : (
                        <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] px-1.5 py-0 h-4 flex items-center justify-center font-bold border-2 border-background animate-pulse">
                          !
                        </Badge>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold text-center leading-tight line-clamp-2",
                      !isSessionActive && !isActive && "text-primary font-bold"
                    )}>
                      {infoComiteTheme.title.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </button>
                </div>
              );
            })()}

            {/* Suivi Actions */}
            {suiviActionsTheme && (() => {
              const Icon = iconMap[suiviActionsTheme.icon] || Info;
              const isActive = activeThemeId === suiviActionsTheme.id;
              return (
                <button
                  key={suiviActionsTheme.id}
                  onClick={() => handleNavigate(`/theme/${suiviActionsTheme.id}`)}
                  className={cn(
                    "flex flex-col items-center gap-2 px-3 py-3 rounded-xl transition-all duration-300 min-w-[70px] group",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      "p-2 rounded-xl transition-all duration-300 shadow-md",
                      `bg-gradient-to-br ${suiviActionsTheme.color}`,
                      isActive ? "scale-125 shadow-lg" : "opacity-80 group-hover:opacity-100 group-hover:scale-110"
                    )}>
                      <Icon className={cn("text-white transition-all duration-300", isActive ? "w-6 h-6" : "w-5 h-5")} />
                    </div>
                    {isSessionActive && (() => {
                      const count = activityCounts[suiviActionsTheme.id] || 0;
                      return count > 0 ? (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 py-0 h-4 min-w-[16px] flex items-center justify-center font-bold border-2 border-background">
                          {count}
                        </Badge>
                      ) : null;
                    })()}
                  </div>
                  <span className="text-[10px] font-semibold text-center leading-tight line-clamp-2">
                    {suiviActionsTheme.title.split(' ').slice(0, 2).join(' ')}
                  </span>
                </button>
              );
            })()}

            {/* Historique */}
            <button
              onClick={() => handleNavigate('/historique-comites')}
              className={cn(
                "flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 min-w-[70px]",
                location.pathname === '/historique-comites'
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-xs font-semibold">Historique</span>
            </button>

            {/* Comités Futurs */}
            <button
              onClick={() => handleNavigate('/comites-futurs')}
              className={cn(
                "flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 min-w-[70px]",
                location.pathname === '/comites-futurs'
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <div className="relative">
                <CalendarClock className="w-6 h-6" />
                {(() => {
                  const count = futureComitesCount;
                  return count > 0 ? (
                    <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] px-1 py-0 h-4 min-w-[16px] flex items-center justify-center font-bold border-2 border-background">
                      {count}
                    </Badge>
                  ) : null;
                })()}
              </div>
              <span className="text-xs font-semibold">Futurs</span>
            </button>
            </div>
          </div>

          {/* Séparateur */}
          <div className="h-16 w-px bg-border/50"></div>

          {/* Groupe centre: autres thèmes */}
          <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Thématiques</span>
            <div className="flex items-center gap-2 overflow-x-auto max-w-full scrollbar-hide">
            {otherThemes.map((theme) => {
              const Icon = iconMap[theme.icon] || Info;
              const isActive = activeThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleNavigate(`/theme/${theme.id}`)}
                  className={cn(
                    "flex flex-col items-center gap-2 px-3 py-3 rounded-xl transition-all duration-300 min-w-[70px] group",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      "p-2 rounded-xl transition-all duration-300 shadow-md",
                      `bg-gradient-to-br ${theme.color}`,
                      isActive ? "scale-125 shadow-lg" : "opacity-80 group-hover:opacity-100 group-hover:scale-110"
                    )}>
                      <Icon className={cn("text-white transition-all duration-300", isActive ? "w-6 h-6" : "w-5 h-5")} />
                    </div>
                    {isSessionActive && (() => {
                      const count = activityCounts[theme.id] || 0;
                      return count > 0 ? (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 py-0 h-4 min-w-[16px] flex items-center justify-center font-bold border-2 border-background">
                          {count}
                        </Badge>
                      ) : null;
                    })()}
                  </div>
                  <span className="text-[10px] font-semibold text-center leading-tight line-clamp-2">
                    {theme.title.split(' ').slice(0, 2).join(' ')}
                  </span>
                </button>
              );
            })}
            </div>
          </div>

          {/* Séparateur */}
          <div className="h-8 w-px bg-border/50"></div>

          {/* Groupe droite: Autres sujets + Export PDF + Déconnexion */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</span>
            <div className="flex items-center gap-2 borderActions">
            <button
              onClick={() => handleNavigate('/autres-sujets')}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-[55px]",
                location.pathname === '/autres-sujets'
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <div className="relative">
                <MessageSquarePlus className="w-4 h-4" />
                {isSessionActive && (() => {
                  const count = autresSujetsCount;
                  return count > 0 ? (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 py-0 h-4 min-w-[16px] flex items-center justify-center font-bold border-2 border-background">
                      {count}
                    </Badge>
                  ) : null;
                })()}
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight">Autres sujets</span>
            </button>

            <button
              onClick={() => handleNavigate('/export-pdf')}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-[55px]",
                location.pathname === '/export-pdf'
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <FileDown className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Export PDF</span>
            </button>

            {/* Bouton Terminer le comité (visible uniquement si session active) */}
            {isSessionActive && (
              <button
                onClick={handleEndSession}
                className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-[55px] bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/30 animate-pulse"
              >
                <div className="relative">
                  <Save className="w-4 h-4" />
                  <CheckCircle className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-green-500" />
                </div>
                <span className="text-[10px] font-bold">Terminer</span>
              </button>
            )}

            {user?.userRole === 'ADMIN' && (
              <button
                onClick={() => handleNavigate('/invitations')}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-[55px]",
                  location.pathname === '/invitations'
                    ? "bg-blue-500/10 text-blue-500"
                    : "text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                )}
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Invitations</span>
              </button>
            )}

            {user?.userRole === 'SUPER_ADMIN' && (
              <button
                onClick={() => handleNavigate('/admin')}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-[55px]",
                  location.pathname === '/admin'
                    ? "bg-red-500/10 text-red-500"
                    : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                )}
              >
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Admin</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-[55px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Déconnexion</span>
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmation pour terminer le comité */}
      <Dialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminer le comité</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir terminer ce comité ? Toutes les activités seront enregistrées dans l'historique.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndSessionDialog(false)}>
              Annuler
            </Button>
            <Button onClick={confirmEndSession} className="bg-gradient-to-r from-green-500 to-emerald-500">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </footer>
    </>
  );
};
