import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Calendar, CheckCircle, XCircle as XCircleIcon, Clock, Sun, Moon, Info, TrendingUp, Users, Settings, Shield, Heart, Leaf, Star, Zap, Globe, FileText, Vote, BarChart3 } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useThemeData } from "@/contexts/ThemeDataContext";
import { persons } from "@/data/persons";

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
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { hasActiveSession, addActivityToSession, getCurrentSession } from "@/utils/comiteSession";
import { ComiteAlert } from "@/components/ComiteAlert";
import { ComiteToast } from "@/components/ComiteToast";
import { api } from "@/lib/api";
import { getActiveComiteId } from "@/utils/comiteSession";
import logoFortil from "@/img/cropped-Logo-Picto_Degrade.png";

interface Action {
  id: string;
  themeId: string;
  themeName: string;
  subThemeId?: string;
  subThemeName?: string;
  title: string;
  description: string;
  responsables: string;
  echeance: string;
  statut: 'en-cours' | 'terminee' | 'abandonnee';
  commentaireAbandon?: string;
  createdAt: string;
  comiteId?: string;
}

const ActionsManager = () => {
  const { themes } = useThemeData();
  const { isAuthenticated, loading, agency } = useAuth();
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const [actions, setActions] = useState<Action[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isComiteActive, setIsComiteActive] = useState(hasActiveSession());
  const [activeComite, setActiveComite] = useState<any>(null);

  // Écouter les changements de session
  useEffect(() => {
    const handleSessionChange = async () => {
      setIsComiteActive(hasActiveSession());
      const session = await getCurrentSession();
      setActiveComite(session ? session.formData : null);
    };

    // Charger au démarrage
    handleSessionChange();

    window.addEventListener('comite-session-changed', handleSessionChange);
    return () => {
      window.removeEventListener('comite-session-changed', handleSessionChange);
    };
  }, []);

  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterTheme, setFilterTheme] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'actions' | 'votes'>('all');
  const [filterComite, setFilterComite] = useState<string>('all');
  const [comites, setComites] = useState<any[]>([]);
  const [openEcheancePopover, setOpenEcheancePopover] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [selectedVote, setSelectedVote] = useState<any>(null);
  const [showVoteDetailModal, setShowVoteDetailModal] = useState(false);
  const [votesCount, setVotesCount] = useState(0);
  const [allVotes, setAllVotes] = useState<Array<{
    id: string;
    question: string;
    themeId: string;
    themeName: string;
    subThemeId: string;
    subThemeName: string;
    totalVotes: number;
    createdAt: string;
  }>>([]);

  // Form state
  const [formData, setFormData] = useState({
    themeId: '',
    subThemeId: '',
    title: '',
    description: '',
    responsables: '',
    echeance: '',
    statut: 'en-cours' as Action['statut']
  });
  const [showResponsablesSuggestions, setShowResponsablesSuggestions] = useState(false);
  const [responsablesInput, setResponsablesInput] = useState('');
  const [selectedResponsables, setSelectedResponsables] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
      return;
    }
    if (loading) return;

    // Load actions from API
    api.getActions().then(data => setActions(data || [])).catch(() => {});

    // Load all votes from API
    api.getVotes().then(votesData => {
      const loadedVotes = votesData.map((vote: any) => ({
        id: vote.id,
        question: vote.question,
        themeId: vote.themeId,
        themeName: vote.themeName || '',
        subThemeId: vote.subThemeId,
        subThemeName: vote.subThemeName || '',
        totalVotes: vote.options?.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0) || 0,
        options: vote.options,
        createdAt: vote.createdAt,
      }));
      setAllVotes(loadedVotes);
      setVotesCount(loadedVotes.length);
    }).catch(() => {});

    // Charger la liste des comités pour le filtre (partagés entre toutes les agences)
    api.getComites().then(data => setComites(data || [])).catch(() => {});
  }, [navigate, loading, isAuthenticated, agency]);

  const handleOpenModal = () => {
    if (!isComiteActive) {
      // Ne rien faire ici, l'alerte s'affiche déjà sur la page
      return;
    }
    setShowForm(true);
  };

  const handleCreateAction = async () => {
    if (!formData.themeId || !formData.title || !formData.description || !formData.responsables || !formData.echeance) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const selectedTheme = themes.find(t => t.id === formData.themeId);
    if (!selectedTheme) return;

    const selectedSubTheme = formData.subThemeId
      ? selectedTheme.subThemes.find(st => st.id === formData.subThemeId)
      : undefined;

    const comiteId = getActiveComiteId();

    try {
      const newAction = await api.createAction({
        themeId: formData.themeId,
        themeName: selectedTheme.title,
        subThemeId: formData.subThemeId || undefined,
        subThemeName: selectedSubTheme?.title,
        title: formData.title,
        description: formData.description,
        responsables: formData.responsables,
        echeance: formData.echeance,
        comiteId,
      });

      setActions(prev => [...prev, newAction]);

      // Enregistrer l'activité dans la session du comité
      await addActivityToSession({
        type: 'action-created',
        description: `Action créée : ${newAction.title}`,
        details: {
          actionId: newAction.id,
          themeId: newAction.themeId,
          themeName: newAction.themeName,
          subThemeId: newAction.subThemeId,
          subThemeName: newAction.subThemeName,
          title: newAction.title,
          description: newAction.description,
          responsables: newAction.responsables,
          echeance: newAction.echeance
        }
      });

      // Reset form
      setFormData({
        themeId: '',
        subThemeId: '',
        title: '',
        description: '',
        responsables: '',
        echeance: '',
        statut: 'en-cours'
      });
      setSelectedResponsables([]);
      setResponsablesInput('');
      setShowForm(false);
      toast.success("Action créée avec succès !", { position: 'top-center' });
    } catch {
      toast.error("Erreur lors de la création de l'action");
    }
  };

  const handleDeleteAction = async (id: string) => {
    const actionToDelete = actions.find(a => a.id === id);
    try {
      await api.deleteAction(id);
      setActions(prev => prev.filter(a => a.id !== id));

      // Enregistrer l'activité dans la session du comité
      if (actionToDelete) {
        await addActivityToSession({
          type: 'action-deleted',
          description: `Action supprimée : ${actionToDelete.title}`,
          details: {
            actionId: actionToDelete.id,
            title: actionToDelete.title,
            themeName: actionToDelete.themeName
          }
        });
      }

      toast.success("Action supprimée", { position: 'top-center' });
    } catch {
      toast.error("Erreur lors de la suppression de l'action");
    }
  };

  const handleUpdateStatut = async (id: string, newStatut: Action['statut'], commentaire?: string) => {
    const actionToUpdate = actions.find(a => a.id === id);
    try {
      await api.updateActionStatut(id, { statut: newStatut, commentaireAbandon: commentaire });
      setActions(prev => prev.map(a =>
        a.id === id ? { ...a, statut: newStatut, commentaireAbandon: commentaire } : a
      ));

      // Enregistrer l'activité dans la session du comité
      if (actionToUpdate) {
        await addActivityToSession({
          type: 'action-updated',
          description: `Statut de l'action "${actionToUpdate.title}" mis à jour : ${newStatut}`,
          details: {
            actionId: actionToUpdate.id,
            title: actionToUpdate.title,
            oldStatut: actionToUpdate.statut,
            newStatut: newStatut,
            commentaire: commentaire
          }
        });
      }

      toast.success("Statut mis à jour", { position: 'top-center' });
    } catch {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleAbandonAction = (id: string) => {
    const commentaire = prompt("Pourquoi cette action est-elle abandonnée ?");
    if (commentaire !== null) { // null si l'utilisateur annule
      handleUpdateStatut(id, 'abandonnee', commentaire);
    }
  };

  const filteredActions = actions.filter(action => {
    const matchStatut = filterStatut === 'all' || action.statut === filterStatut;
    const matchTheme = filterTheme === 'all' || action.themeId === filterTheme;
    const matchComite = filterComite === 'all' || action.comiteId === filterComite;
    return matchStatut && matchTheme && matchComite;
  });

  const filteredVotes = allVotes.filter(vote => {
    const matchTheme = filterTheme === 'all' || vote.themeId === filterTheme;
    return matchTheme;
  });

  const getStatutIcon = (statut: Action['statut']) => {
    switch (statut) {
      case 'terminee': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'abandonnee': return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatutLabel = (statut: Action['statut']) => {
    switch (statut) {
      case 'terminee': return 'Terminée';
      case 'abandonnee': return 'Abandonnée';
      default: return 'En cours';
    }
  };

  const getStatutColor = (statut: Action['statut']) => {
    switch (statut) {
      case 'terminee': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'abandonnee': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-28">
            <img src={logoFortil} alt="" className="logoBG" />

      <div>
        <header className="gradientBg border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Retour
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Suivi des actions à mener</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Gestion et suivi des actions du comité</p>
                    {activeComite && (
                      <>
                        <span className="text-sm text-muted-foreground">•</span>
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
                variant="ghost"
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

        <main className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Alerte si aucun comité n'est ouvert */}
          {!isComiteActive && (
            <div className="mb-6 animate-fade-in">
              <ComiteAlert onComiteSelected={() => setShowForm(true)} />
            </div>
          )}

          {/* Header with filters and create button */}
          <div className="space-y-4 mb-6">
            {/* Filtre par comité */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-semibold whitespace-nowrap">Filtrer par comité :</Label>
              <Select value={filterComite} onValueChange={setFilterComite}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Tous les comités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les comités ({actions.length})</SelectItem>
                  {comites.map((comite) => {
                    const count = actions.filter(a => a.comiteId === comite.id).length;
                    const dateComite = new Date(comite.date).toLocaleDateString('fr-FR');
                    return (
                      <SelectItem key={comite.id} value={comite.id}>
                        Comité du {dateComite} - {comite.entite} ({count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par thématique */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-semibold whitespace-nowrap">Filtrer par thématique :</Label>
              <Select value={filterTheme} onValueChange={setFilterTheme}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Toutes les thématiques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les thématiques ({actions.length})</SelectItem>
                  {themes.map((theme) => {
                    const count = actions.filter(a => a.themeId === theme.id).length;
                    return (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.title} ({count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par type (Actions/Votes) */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-semibold whitespace-nowrap">Type :</Label>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  Tout ({actions.length + votesCount})
                </Button>
                <Button
                  variant={filterType === 'actions' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('actions')}
                >
                  Actions ({actions.length})
                </Button>
                <Button
                  variant={filterType === 'votes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('votes')}
                >
                  Votes ({votesCount})
                </Button>
              </div>
            </div>

            {/* Filtres par statut et bouton création */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {filterType !== 'votes' && (
                  <>
                    <Button
                      variant={filterStatut === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatut('all')}
                    >
                      Toutes ({actions.length})
                    </Button>
                <Button
                  variant={filterStatut === 'en-cours' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatut('en-cours')}
                >
                  En cours ({actions.filter(a => a.statut === 'en-cours').length})
                </Button>
                <Button
                  variant={filterStatut === 'terminee' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatut('terminee')}
                >
                  Terminées ({actions.filter(a => a.statut === 'terminee').length})
                </Button>
                <Button
                  variant={filterStatut === 'abandonnee' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatut('abandonnee')}
                >
                  Abandonnées ({actions.filter(a => a.statut === 'abandonnee').length})
                </Button>
                  </>
                )}
              </div>
              <Button 
                onClick={() => setShowForm(!showForm)} 
                disabled={!isComiteActive}
                className="bg-gradient-to-r from-primary to-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isComiteActive ? "Vous devez ouvrir un comité pour créer des actions" : ""}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle action
              </Button>
            </div>
          </div>

          {/* Create form Modal */}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle action</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer une nouvelle action à mener
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Sélection du thème avec cartes */}
                <div className={`space-y-2 p-4 rounded-lg border-2 transition-all duration-300 ${
                  !formData.themeId 
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                    : 'border-border/30 bg-transparent'
                }`}>
                  <Label className={!formData.themeId ? 'text-primary font-bold' : ''}>
                    Thème concerné * {!formData.themeId && <span className="text-xs ml-2 animate-pulse">← Commencez ici</span>}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {themes
                      .filter(theme => theme.id !== 'info-comite' && theme.id !== 'suivi-actions')
                      .map((theme) => {
                        const Icon = iconMap[theme.icon] || Info;
                        const isSelected = formData.themeId === theme.id;
                        return (
                          <Card
                            key={theme.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              isSelected 
                                ? 'border-2 border-primary ring-2 ring-primary/20 shadow-md' 
                                : 'border-border/50 hover:border-primary/50'
                            }`}
                            onClick={() => setFormData({...formData, themeId: theme.id, subThemeId: ''})}
                          >
                            <CardContent className="p-3">
                              <div className="flex flex-col items-center text-center gap-2">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.color} shadow-sm ${isSelected ? 'scale-110' : ''} transition-transform`}>
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                <span className={`text-xs font-medium leading-tight line-clamp-2 ${isSelected ? 'text-primary' : ''}`}>
                                  {theme.title}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>

                {/* Sélection du sous-thème si un thème est sélectionné */}
                {formData.themeId && (() => {
                  const selectedTheme = themes.find(t => t.id === formData.themeId);
                  if (!selectedTheme || selectedTheme.subThemes.length === 0) return null;
                  
                  return (
                    <div className={`space-y-2 p-4 rounded-lg border-2 transition-all duration-300 ${
                      formData.themeId && !formData.subThemeId
                        ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                        : 'border-border/30 bg-transparent'
                    }`}>
                      <Label className={formData.themeId && !formData.subThemeId ? 'text-primary font-bold' : ''}>
                        Sous-thème concerné * {formData.themeId && !formData.subThemeId && <span className="text-xs ml-2 animate-pulse">← Étape suivante</span>}
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedTheme.subThemes.map((subTheme) => {
                          const isSelected = formData.subThemeId === subTheme.id;
                          return (
                            <Card
                              key={subTheme.id}
                              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                isSelected 
                                  ? 'border-2 border-primary ring-2 ring-primary/20 shadow-md' 
                                  : 'border-border/50 hover:border-primary/50'
                              }`}
                              onClick={() => setFormData({...formData, subThemeId: subTheme.id})}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded bg-muted ${isSelected ? 'bg-primary/10' : ''}`}>
                                    <FileText className={`w-3 h-3 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                  </div>
                                  <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                                    {subTheme.title}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div className={`space-y-2 p-4 rounded-lg border-2 transition-all duration-300 ${
                  formData.subThemeId && !formData.title
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                    : 'border-border/30 bg-transparent'
                }`}>
                  <Label htmlFor="title" className={formData.subThemeId && !formData.title ? 'text-primary font-bold' : ''}>
                    Titre de l'action * {formData.subThemeId && !formData.title && <span className="text-xs ml-2 animate-pulse">← Donnez un titre</span>}
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Améliorer la communication interne"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className={`space-y-2 p-4 rounded-lg border-2 transition-all duration-300 ${
                  formData.title && !formData.description
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                    : 'border-border/30 bg-transparent'
                }`}>
                  <Label htmlFor="description" className={formData.title && !formData.description ? 'text-primary font-bold' : ''}>
                    Action à mener * {formData.title && !formData.description && <span className="text-xs ml-2 animate-pulse">← Décrivez l'action</span>}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez l'action en détail..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                  formData.description && (!formData.responsables || !formData.echeance)
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                    : 'border-border/30 bg-transparent'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="responsables">Responsable(s) *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowResponsablesSuggestions(!showResponsablesSuggestions)}
                        className="text-xs h-6"
                      >
                        {showResponsablesSuggestions ? 'Masquer' : 'Voir tous les noms'}
                      </Button>
                    </div>
                    
                    {/* Input avec autocomplétion */}
                    <div className="relative">
                      <Input
                        id="responsables"
                        placeholder="Tapez un nom pour rechercher..."
                        value={responsablesInput}
                        onChange={(e) => {
                          setResponsablesInput(e.target.value);
                          setShowResponsablesSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => responsablesInput.length > 0 && setShowResponsablesSuggestions(true)}
                      />
                      
                      {/* Suggestions d'autocomplétion */}
                      {showResponsablesSuggestions && (
                        <Card className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto shadow-lg">
                          <CardContent className="p-2">
                            {persons
                              .filter(person => 
                                responsablesInput === '' || 
                                person.fullName.toLowerCase().includes(responsablesInput.toLowerCase())
                              )
                              .map(person => (
                                <Button
                                  key={person.id}
                                  variant="ghost"
                                  className="w-full justify-start text-left font-normal h-auto py-2 px-3 hover:bg-primary/10"
                                  onClick={() => {
                                    if (!selectedResponsables.includes(person.fullName)) {
                                      const newResponsables = [...selectedResponsables, person.fullName];
                                      setSelectedResponsables(newResponsables);
                                      setFormData({...formData, responsables: newResponsables.join(', ')});
                                    }
                                    setResponsablesInput('');
                                    setShowResponsablesSuggestions(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-xs">{person.fullName}</span>
                                    {person.role && <span className="text-[10px] text-muted-foreground">{person.role}</span>}
                                  </div>
                                </Button>
                              ))}
                            {persons.filter(person => 
                              responsablesInput === '' || 
                              person.fullName.toLowerCase().includes(responsablesInput.toLowerCase())
                            ).length === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-3">Aucun résultat</p>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    {/* Liste des responsables sélectionnés */}
                    {selectedResponsables.length > 0 && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground">Responsables sélectionnés ({selectedResponsables.length})</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedResponsables.map((responsable, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs"
                            >
                              <span>{responsable}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-3 w-3 p-0 hover:bg-primary/20"
                                onClick={() => {
                                  const newResponsables = selectedResponsables.filter((_, i) => i !== index);
                                  setSelectedResponsables(newResponsables);
                                  setFormData({...formData, responsables: newResponsables.join(', ')});
                                }}
                              >
                                <XCircleIcon className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="echeance">Date d'échéance *</Label>
                    <Popover open={openEcheancePopover} onOpenChange={setOpenEcheancePopover}>
                      <PopoverTrigger asChild>
                        <Button
                          id="echeance"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal transition-all duration-200",
                            !formData.echeance && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.echeance ? (
                            format(new Date(formData.echeance), "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionnez une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 shadow-lg" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={formData.echeance ? new Date(formData.echeance) : undefined}
                          onSelect={(date) => {
                            setFormData({...formData, echeance: date ? format(date, "yyyy-MM-dd") : ''});
                            setOpenEcheancePopover(false); // Fermer le popover après sélection
                          }}
                          initialFocus
                          locale={fr}
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statut">Statut initial</Label>
                  <Select value={formData.statut} onValueChange={(value: Action['statut']) => setFormData({...formData, statut: value})}>
                    <SelectTrigger id="statut">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-cours">En cours</SelectItem>
                      <SelectItem value="terminee">Terminée (réussie)</SelectItem>
                      <SelectItem value="abandonnee">Abandonnée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateAction} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                    Créer l'action
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Votes list */}
          {(filterType === 'all' || filterType === 'votes') && filteredVotes.length > 0 && (
            <div className="mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Vote className="w-5 h-5 text-primary" />
                  Votes et sondages ({filteredVotes.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-1 ml-7">
                  Consultations et décisions collectives du comité
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVotes.map((vote) => (
                  <Card key={vote.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => {
                    setSelectedVote(vote);
                    setShowVoteDetailModal(true);
                  }}>
                    <div className="h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
                    <CardHeader className="p-2.5">
                      <div className="flex items-start justify-between mb-1">
                        <Vote className="w-3.5 h-3.5 text-purple-500" />
                        <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-xs font-bold leading-tight line-clamp-2">
                        {vote.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2.5 pt-0 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                          {vote.themeName}
                        </span>
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded flex items-center gap-1">
                          <FileText className="w-2.5 h-2.5" />
                          {vote.subThemeName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BarChart3 className="w-3 h-3" />
                        <span>{vote.totalVotes} vote{vote.totalVotes > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(vote.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Séparateur entre votes et actions */}
          {(filterType === 'all' && filteredVotes.length > 0 && filteredActions.length > 0) && (
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              <div className="text-xs text-muted-foreground font-semibold">•</div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            </div>
          )}

          {/* Actions list - Petites cartes */}
          {(filterType === 'all' || filterType === 'actions') && filteredActions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Actions à mener ({filteredActions.length})
              </h3>
              <p className="text-xs text-muted-foreground mt-1 ml-7">
                Tâches et engagements pris lors des comités
              </p>
            </div>
          )}
          {(filterType === 'all' || filterType === 'actions') && filteredActions.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {filterStatut === 'all' 
                  ? "Aucune action créée. Cliquez sur 'Nouvelle action' pour commencer."
                  : `Aucune action ${getStatutLabel(filterStatut as Action['statut']).toLowerCase()}.`
                }
              </p>
            </Card>
          )}
          {(filterType === 'all' || filterType === 'actions') && filteredActions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActions.map((action, index) => {
                const actionTheme = themes.find(t => t.id === action.themeId);
                const themeColorClass = actionTheme?.color || 'from-gray-500 to-gray-600';
                
                return (
                  <Card 
                    key={action.id} 
                    className="animate-fade-in hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => setSelectedAction(action)}
                  >
                    {/* Bordure colorée en haut */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${themeColorClass} opacity-40 group-hover:opacity-60 transition-opacity duration-300`} />
                    {/* Fond coloré subtil */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${themeColorClass} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300`} />
                  <CardContent className="p-3 relative z-10">
                    <div className="space-y-3">
                      {/* Header avec badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded">
                            {action.themeName}
                          </span>
                          {action.subThemeName && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded flex items-center gap-1">
                              <FileText className="w-2.5 h-2.5" />
                              {action.subThemeName}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded border flex items-center gap-1 ${getStatutColor(action.statut)}`}>
                            {getStatutIcon(action.statut)}
                            {getStatutLabel(action.statut)}
                          </span>
                        </div>
                      </div>

                      {/* Titre */}
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>

                      {/* Description tronquée */}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {action.description}
                      </p>

                      {/* Footer avec infos */}
                      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(action.echeance).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded">
                          {action.responsables.split(',')[0]}
                          {action.responsables.split(',').length > 1 && ` +${action.responsables.split(',').length - 1}`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}

          {/* Modal de détails */}
          <Dialog open={selectedAction !== null} onOpenChange={(open) => !open && setSelectedAction(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedAction && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                        {selectedAction.themeName}
                      </span>
                      {selectedAction.subThemeName && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {selectedAction.subThemeName}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 ${getStatutColor(selectedAction.statut)}`}>
                        {getStatutIcon(selectedAction.statut)}
                        {getStatutLabel(selectedAction.statut)}
                      </span>
                    </div>
                    <DialogTitle className="text-xl">{selectedAction.title}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="text-sm font-semibold">Action à mener</Label>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{selectedAction.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold">Responsable(s)</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedAction.responsables}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Échéance
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(selectedAction.echeance).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {selectedAction.commentaireAbandon && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <Label className="text-sm font-semibold text-red-600 dark:text-red-400">Raison de l'abandon</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedAction.commentaireAbandon}</p>
                      </div>
                    )}

                    {selectedAction.statut === 'en-cours' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleUpdateStatut(selectedAction.id, 'terminee');
                            setSelectedAction(null);
                          }}
                          className="flex-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marquer comme terminée
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleAbandonAction(selectedAction.id);
                            setSelectedAction(null);
                          }}
                          className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <XCircleIcon className="w-4 h-4 mr-2" />
                          Marquer comme abandonnée
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          handleDeleteAction(selectedAction.id);
                          setSelectedAction(null);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer l'action
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Modal de détails de vote */}
          <Dialog open={showVoteDetailModal} onOpenChange={setShowVoteDetailModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Détails du vote</DialogTitle>
              </DialogHeader>
              {selectedVote && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Thème</Label>
                      <p className="text-sm font-medium">{selectedVote.themeName}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Sous-thème</Label>
                      <p className="text-sm font-medium">{selectedVote.subThemeName}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Question</Label>
                    <p className="text-sm font-medium">{selectedVote.question}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Options et résultats</Label>
                    <div className="space-y-2">
                      {selectedVote.options?.map((option: any, index: number) => {
                        const percentage = selectedVote.totalVotes > 0 
                          ? Math.round((option.votes / selectedVote.totalVotes) * 100) 
                          : 0;
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{option.text}</span>
                              <span className="font-medium">{option.votes} vote{option.votes > 1 ? 's' : ''} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Total des votes</Label>
                    <p className="text-sm font-medium">{selectedVote.totalVotes} vote{selectedVote.totalVotes > 1 ? 's' : ''}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Créé le</Label>
                    <p className="text-sm">{new Date(selectedVote.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedVote.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowVoteDetailModal(false)}
                    >
                      Fermer
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setShowVoteDetailModal(false);
                        navigate(`/theme/${selectedVote.themeId}/subtheme/${selectedVote.subThemeId}`);
                      }}
                    >
                      Voir dans le sous-thème
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
      <ComiteToast />
      <Footer />
    </div>
  );
};

export default ActionsManager;
