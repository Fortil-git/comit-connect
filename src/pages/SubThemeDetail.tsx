import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Download, Sun, Moon, Vote, Plus, Trash2, BarChart3, CheckCircle, XCircle, Clock, Calendar, FileText } from "lucide-react";
import { useThemeData } from "@/contexts/ThemeDataContext";
import { persons } from "@/data/persons";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import { hasActiveSession, addActivityToSession, getCurrentSession, getActiveComiteId } from "@/utils/comiteSession";
import { api } from "@/lib/api";
import { ComiteAlert } from "@/components/ComiteAlert";
import { ComiteToast } from "@/components/ComiteToast";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import logoFortil from "@/img/cropped-Logo-Picto_Degrade.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

interface VoteQuestion {
  id: string;
  question: string;
  options: VoteOption[];
  createdAt: string;
  isActive: boolean;
  totalParticipants?: number;
}

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

const SubThemeDetail = () => {
  const { themes } = useThemeData();
  const { isAuthenticated, loading, agency } = useAuth();
  const { themeId, subThemeId } = useParams();
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const [noteValue, setNoteValue] = useState<any>(null);
  const [noteAttachments, setNoteAttachments] = useState<any[]>([]);
  const [votes, setVotes] = useState<VoteQuestion[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showActionDetailModal, setShowActionDetailModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
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
  const [selectedVote, setSelectedVote] = useState<VoteQuestion | null>(null);
  const [newVote, setNewVote] = useState({
    question: '',
    options: [{text: '', votes: 0}, {text: '', votes: 0}],
    totalParticipants: 0
  });
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    responsables: '',
    echeance: '',
    statut: 'en-cours' as Action['statut']
  });
  const [userVote, setUserVote] = useState<string>('');
  const [showParticipantsSuggestions, setShowParticipantsSuggestions] = useState(false);
  const [participantsInput, setParticipantsInput] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showActionResponsablesSuggestions, setShowActionResponsablesSuggestions] = useState(false);
  const [actionResponsablesInput, setActionResponsablesInput] = useState('');
  const [selectedActionResponsables, setSelectedActionResponsables] = useState<string[]>([]);
  const [openActionDatePopover, setOpenActionDatePopover] = useState(false);

  const theme = themes.find((t) => t.id === themeId);
  const subTheme = theme?.subThemes.find((st) => st.id === subThemeId);

  // Handler mémorisé pour éviter les re-renders de l'éditeur
  const handleNoteChange = useCallback((content: string, attachments: any[]) => {
    setNoteValue(content);
    setNoteAttachments(attachments);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
      return;
    }
    if (loading) return;

    const comiteId = getActiveComiteId();

    // Load saved note
    if (themeId && subThemeId) {
      api.getNote({ themeId, subThemeId, ...(comiteId ? { comiteId } : {}) }).then(noteData => {
        if (noteData) {
          if (typeof noteData === 'object' && noteData.content !== undefined) {
            setNoteValue(noteData.content || '');
            setNoteAttachments(noteData.attachments || []);
          } else {
            setNoteValue(noteData);
            setNoteAttachments([]);
          }
        } else {
          setNoteValue(subTheme?.type === 'checkbox' ? [] : '');
        }
      }).catch(() => {
        setNoteValue(subTheme?.type === 'checkbox' ? [] : '');
      });
    }

    // Load votes - uniquement si un comité est actif
    if (comiteId) {
      api.getVotes({ themeId: themeId!, subThemeId: subThemeId! }).then(data => {
        setVotes(data || []);
      }).catch(() => setVotes([]));
    } else {
      setVotes([]);
    }

    // Load actions for this subtheme - uniquement si un comité est actif
    if (comiteId) {
      api.getActions({ themeId: themeId!, subThemeId: subThemeId!, comiteId }).then(data => {
        setActions(data || []);
      }).catch(() => setActions([]));
    } else {
      setActions([]);
    }
  }, [navigate, themeId, subThemeId, subTheme, loading, isAuthenticated]);

  if (!theme || !subTheme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Sous-thème non trouvé</p>
      </div>
    );
  }

  const handleSave = async () => {
    const comiteId = getActiveComiteId();
    try {
      await api.upsertNote({
        themeId,
        subThemeId,
        comiteId,
        content: noteValue,
        attachments: noteAttachments,
      });
      await addActivityToSession({
        type: 'note-saved',
        description: `Note sauvegardée pour "${subTheme!.title}" dans ${theme!.title}`,
        details: {
          themeId,
          subThemeId,
          themeName: theme!.title,
          subThemeName: subTheme!.title,
          note: noteValue
        }
      });
      toast.success("Note sauvegardée avec succès !", { position: 'top-center' });
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleExport = () => {
    const data = {
      theme: theme.title,
      subTheme: subTheme.title,
      date: new Date().toLocaleDateString('fr-FR'),
      note: noteValue,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comite-${theme.id}-${subTheme.id}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Export réussi !", { position: 'top-center' });
  };

  const handleCreateVote = async () => {
    if (!isComiteActive) {
      toast.error("Vous devez ouvrir un comité pour créer des votes");
      return;
    }

    if (!newVote.question.trim() || newVote.options.some(opt => !opt.text.trim())) {
      toast.error("Veuillez remplir la question et toutes les options");
      return;
    }

    if (newVote.totalParticipants <= 0) {
      toast.error("Le nombre de participants doit être supérieur à 0");
      return;
    }

    const totalVotes = newVote.options.reduce((sum, opt) => sum + opt.votes, 0);
    if (totalVotes > newVote.totalParticipants) {
      toast.error(`Le total des votes (${totalVotes}) ne peut pas dépasser le nombre de participants (${newVote.totalParticipants})`);
      return;
    }

    try {
      const created = await api.createVote({
        question: newVote.question,
        options: newVote.options.map(opt => ({ text: opt.text, votes: opt.votes })),
        totalParticipants: newVote.totalParticipants,
        themeId,
        subThemeId,
        comiteId: getActiveComiteId(),
      });
      setVotes([...votes, created]);
      await addActivityToSession({
        type: 'vote-created',
        description: `Vote créé : "${newVote.question}" dans ${subTheme!.title}`,
        details: {
          question: newVote.question,
          options: created.options,
          totalParticipants: newVote.totalParticipants,
          themeId,
          subThemeId,
          themeName: theme!.title,
          subThemeName: subTheme!.title
        }
      });
      setNewVote({ question: '', options: [{text: '', votes: 0}, {text: '', votes: 0}], totalParticipants: 0 });
      setShowVoteModal(false);
      toast.success("Vote créé avec succès !", { position: 'top-center' });
    } catch {
      toast.error("Erreur lors de la création du vote");
    }
  };

  const handleAddOption = () => {
    setNewVote({...newVote, options: [...newVote.options, {text: '', votes: 0}]});
  };

  const handleRemoveOption = (index: number) => {
    if (newVote.options.length > 2) {
      const newOptions = newVote.options.filter((_, i) => i !== index);
      setNewVote({...newVote, options: newOptions});
    }
  };

  const handleUpdateOptionText = (index: number, value: string) => {
    const newOptions = [...newVote.options];
    newOptions[index] = {...newOptions[index], text: value};
    setNewVote({...newVote, options: newOptions});
  };

  const handleUpdateOptionVotes = (index: number, value: number) => {
    const newOptions = [...newVote.options];
    newOptions[index] = {...newOptions[index], votes: value};
    setNewVote({...newVote, options: newOptions});
  };

  const handleSubmitVote = async () => {
    if (!userVote || !selectedVote) return;
    try {
      await api.castVote(selectedVote.id, userVote);
      // Reload votes
      const updated = await api.getVotes({ themeId: themeId!, subThemeId: subThemeId! });
      setVotes(updated);
      setUserVote('');
      setSelectedVote(null);
      toast.success("Vote enregistré !", { position: 'top-center' });
    } catch {
      toast.error("Erreur lors de l'enregistrement du vote");
    }
  };

  const handleDeleteVote = async (voteId: string) => {
    const vote = votes.find(v => v.id === voteId);
    try {
      await api.deleteVote(voteId);
      setVotes(votes.filter(v => v.id !== voteId));
      if (vote) {
        await addActivityToSession({
          type: 'vote-deleted',
          description: `Vote supprimé : "${vote.question}" dans ${subTheme!.title}`,
          details: {
            question: vote.question,
            themeId,
            subThemeId,
            themeName: theme!.title,
            subThemeName: subTheme!.title
          }
        });
      }
      toast.success("Vote supprimé !", { position: 'top-center' });
    } catch {
      toast.error("Erreur lors de la suppression du vote");
    }
  };

  const getStatutColor = (statut: Action['statut']) => {
    switch (statut) {
      case 'en-cours': return 'border-blue-300 bg-blue-50 text-blue-700';
      case 'terminee': return 'border-green-300 bg-green-50 text-green-700';
      case 'abandonnee': return 'border-red-300 bg-red-50 text-red-700';
    }
  };

  const getStatutIcon = (statut: Action['statut']) => {
    switch (statut) {
      case 'en-cours': return <Clock className="w-2.5 h-2.5" />;
      case 'terminee': return <CheckCircle className="w-2.5 h-2.5" />;
      case 'abandonnee': return <XCircle className="w-2.5 h-2.5" />;
    }
  };

  const getStatutLabel = (statut: Action['statut']) => {
    switch (statut) {
      case 'en-cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'abandonnee': return 'Abandonnée';
    }
  };

  const handleCreateAction = async () => {
    if (!isComiteActive) {
      toast.error("Vous devez ouvrir un comité pour créer des actions");
      return;
    }

    if (!newAction.title.trim() || !newAction.description.trim() || !newAction.responsables.trim() || !newAction.echeance) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const comiteId = getActiveComiteId();
    try {
      const action = await api.createAction({
        themeId: themeId!,
        themeName: theme!.title,
        subThemeId: subThemeId,
        subThemeName: subTheme!.title,
        title: newAction.title,
        description: newAction.description,
        responsables: newAction.responsables,
        echeance: newAction.echeance,
        comiteId,
      });
      setActions([...actions, action]);
      await addActivityToSession({
        type: 'action-created',
        description: `Action créée : "${action.title}" pour ${subTheme!.title}`,
        details: {
          title: action.title,
          description: action.description,
          echeance: action.echeance,
          responsables: action.responsables,
          themeName: theme!.title,
          subThemeName: subTheme!.title,
          themeId,
          subThemeId
        }
      });
      setNewAction({
        title: '',
        description: '',
        responsables: '',
        echeance: '',
        statut: 'en-cours'
      });
      setSelectedActionResponsables([]);
      setActionResponsablesInput('');
      setShowActionModal(false);
      toast.success("Action créée avec succès !", { position: 'top-center' });
    } catch {
      toast.error("Erreur lors de la création de l'action");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-28">
      <div>
              <img src={logoFortil} alt="" className="logoBG" />

        <header className="gradientBg border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/theme/${themeId}`)}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-bold">{subTheme.title}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{theme.title}</p>
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

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumb 
          items={[
            { label: theme.title, href: `/theme/${themeId}`, icon: theme.icon, color: theme.color },
            { label: subTheme.title }
          ]} 
        />

        {/* Alerte si aucun comité n'est ouvert */}
        {!isComiteActive && (
          <div className="mb-6 animate-fade-in">
            <ComiteAlert />
          </div>
        )}
        
        {/* Prise de notes - Pleine largeur en haut */}
        <Card className="animate-fade-in shadow-elevated mb-6">
          <CardHeader>
            <CardTitle className="text-base">Prise de notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isComiteActive && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ <strong>Aucun comité ouvert</strong> - La prise de notes est désactivée. Ouvrez un comité pour commencer à prendre des notes.
                </p>
              </div>
            )}
            {subTheme.type === 'text' && (
              <div className="space-y-2">
                {subTheme.id === 'participants' ? (
                  // Champ spécial avec autocomplétion pour les participants
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="participants">Participants au comité</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowParticipantsSuggestions(!showParticipantsSuggestions)}
                        disabled={!isComiteActive}
                        className="text-xs h-7"
                      >
                        {showParticipantsSuggestions ? 'Masquer' : 'Voir tous les noms'}
                      </Button>
                    </div>
                    
                    {/* Input avec autocomplétion */}
                    <div className="relative">
                      <Input
                        id="participants"
                        placeholder={isComiteActive ? "Tapez un nom pour rechercher..." : "Ouvrez un comité pour ajouter des participants"}
                        value={participantsInput}
                        onChange={(e) => {
                          setParticipantsInput(e.target.value);
                          setShowParticipantsSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => participantsInput.length > 0 && setShowParticipantsSuggestions(true)}
                        disabled={!isComiteActive}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      
                      {/* Suggestions d'autocomplétion */}
                      {showParticipantsSuggestions && isComiteActive && (
                        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                          <CardContent className="p-2">
                            {persons
                              .filter(person => 
                                participantsInput === '' || 
                                person.fullName.toLowerCase().includes(participantsInput.toLowerCase())
                              )
                              .map(person => (
                                <Button
                                  key={person.id}
                                  variant="ghost"
                                  className="w-full justify-start text-left font-normal h-auto py-2 px-3 hover:bg-primary/10"
                                  onClick={() => {
                                    if (!selectedParticipants.includes(person.fullName)) {
                                      const newParticipants = [...selectedParticipants, person.fullName];
                                      setSelectedParticipants(newParticipants);
                                      setNoteValue(newParticipants.join('\n'));
                                    }
                                    setParticipantsInput('');
                                    setShowParticipantsSuggestions(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-semibold">{person.fullName}</span>
                                    {person.role && <span className="text-xs text-muted-foreground">{person.role}</span>}
                                  </div>
                                </Button>
                              ))}
                            {persons.filter(person => 
                              participantsInput === '' || 
                              person.fullName.toLowerCase().includes(participantsInput.toLowerCase())
                            ).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">Aucun résultat</p>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    {/* Liste des participants sélectionnés */}
                    {selectedParticipants.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Participants sélectionnés ({selectedParticipants.length})</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedParticipants.map((participant, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                            >
                              <span>{participant}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-primary/20"
                                onClick={() => {
                                  const newParticipants = selectedParticipants.filter((_, i) => i !== index);
                                  setSelectedParticipants(newParticipants);
                                  setNoteValue(newParticipants.join('\n'));
                                }}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Éditeur WYSIWYG pour les autres sous-thèmes
                  <div>
                    <Label htmlFor="note">Vos notes</Label>
                    <RichTextEditor
                      value={noteValue || ''}
                      onChange={handleNoteChange}
                      placeholder={isComiteActive ? "Saisissez vos notes ici..." : "Ouvrez un comité pour prendre des notes"}
                      disabled={!isComiteActive}
                      attachments={noteAttachments}
                    />
                  </div>
                )}
              </div>
            )}

            {subTheme.type === 'number' && (
              <div className="space-y-2">
                <Label htmlFor="note">Valeur</Label>
                <Input
                  id="note"
                  type="number"
                  placeholder={isComiteActive ? "0" : "Ouvrez un comité pour saisir une valeur"}
                  value={noteValue || ''}
                  onChange={(e) => setNoteValue(e.target.value)}
                  disabled={!isComiteActive}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            {subTheme.type === 'select' && subTheme.options && (
              <div className="space-y-2">
                <Label>Sélection</Label>
                <Select
                  value={noteValue || ''}
                  onValueChange={(value) => setNoteValue(value)}
                  disabled={!isComiteActive}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder={isComiteActive ? "Sélectionnez une option" : "Ouvrez un comité pour sélectionner"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subTheme.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {subTheme.type === 'checkbox' && subTheme.options && (
              <div className="space-y-3">
                <Label>Options</Label>
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  {subTheme.options.map((option) => (
                    <div key={option} className="flex items-center space-x-3">
                      <Checkbox
                        id={`${subTheme.id}-${option}`}
                        checked={(noteValue || []).includes(option)}
                        disabled={!isComiteActive}
                        onCheckedChange={(checked) => {
                          const currentValues = noteValue || [];
                          const newValues = checked
                            ? [...currentValues, option]
                            : currentValues.filter((v: string) => v !== option);
                          setNoteValue(newValues);
                        }}
                        className="transition-all duration-200"
                      />
                      <Label
                        htmlFor={`${subTheme.id}-${option}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={!isComiteActive}
                className="bg-gradient-to-r from-primary to-secondary h-8 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Sauvegarder la note
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Layout 2 colonnes - Actions et Votes côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne 1: Actions à mener */}
          <Card className="animate-fade-in shadow-elevated flex flex-col max-h-[500px]">
            <CardHeader className="flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Actions à mener ({actions.length})</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tâches liées à ce sous-thème
                </p>
              </div>
            </CardHeader>
          <CardContent className="overflow-y-auto flex-1">
            {actions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                Aucune action liée à ce sous-thème. Créez-en une depuis "Suivi actions".
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {actions.map((action) => {
                  const actionTheme = themes.find(t => t.id === action.themeId);
                  const themeColorClass = actionTheme?.color || 'from-gray-500 to-gray-600';
                  
                  return (
                    <Card 
                      key={action.id} 
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
                      onClick={() => {
                        setSelectedAction(action);
                        setShowActionDetailModal(true);
                      }}
                    >
                      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${themeColorClass} opacity-40 group-hover:opacity-60 transition-opacity duration-300`} />
                      <div className={`absolute inset-0 bg-gradient-to-br ${themeColorClass} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300`} />
                      <CardContent className="p-3 relative z-10">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded border flex items-center gap-1 ${getStatutColor(action.statut)}`}>
                              {getStatutIcon(action.statut)}
                              {getStatutLabel(action.statut)}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {action.title}
                          </h4>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {action.description}
                          </p>
                          
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
                            <div className="text-[10px] font-medium truncate max-w-[120px]">
                              {action.responsables}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            <div className="pt-4 border-t mt-4 flex-shrink-0">
              <Button 
                onClick={() => setShowActionModal(true)} 
                size="sm" 
                disabled={!isComiteActive}
                className="bg-gradient-to-r from-primary to-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isComiteActive ? "Vous devez ouvrir un comité pour créer des actions" : ""}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle action
              </Button>
            </div>
          </CardContent>
          </Card>

          {/* Colonne 2: Votes et sondages */}
          <Card className="animate-fade-in shadow-elevated flex flex-col max-h-[500px]">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Votes et sondages</CardTitle>
              </div>
            </CardHeader>
          <CardContent className="overflow-y-auto flex-1">
            {votes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun vote créé. Cliquez sur "Créer un vote" pour commencer.
              </p>
            ) : (
              <div className="space-y-4">
                {votes.map((vote) => {
                  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
                  return (
                    <Card key={vote.id} className="border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base">{vote.question}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {totalVotes} vote{totalVotes > 1 ? 's' : ''} • Créé le {new Date(vote.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedVote(vote);
                                setShowResultsModal(true);
                              }}
                            >
                              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                              Résultats
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteVote(vote.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <RadioGroup value={userVote} onValueChange={setUserVote}>
                          <div className="space-y-2">
                            {vote.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value={option.id} id={`${vote.id}-${option.id}`} />
                                <Label htmlFor={`${vote.id}-${option.id}`} className="flex-1 cursor-pointer">
                                  {option.text}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                        <Button 
                          onClick={() => {
                            setSelectedVote(vote);
                            handleSubmitVote();
                          }}
                          disabled={!userVote}
                          className="w-full mt-4"
                          size="sm"
                        >
                          Voter
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            <div className="pt-4 border-t mt-4 flex-shrink-0">
              <Button 
                onClick={() => setShowVoteModal(true)} 
                size="sm" 
                disabled={!isComiteActive}
                className="bg-gradient-to-r from-primary to-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isComiteActive ? "Vous devez ouvrir un comité pour créer des votes" : ""}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un vote
              </Button>
            </div>
          </CardContent>
          </Card>
        </div>
        {/* Fin du layout 2 colonnes */}

        {/* Modal création de vote */}
        <Dialog open={showVoteModal} onOpenChange={setShowVoteModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau vote</DialogTitle>
              <DialogDescription>
                Posez une question et ajoutez les options de réponse
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  placeholder="Ex: Quelle est votre priorité pour le prochain trimestre ?"
                  value={newVote.question}
                  onChange={(e) => setNewVote({...newVote, question: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalParticipants">Nombre de participants au vote *</Label>
                <Input
                  id="totalParticipants"
                  type="number"
                  min="1"
                  placeholder="Ex: 10"
                  value={newVote.totalParticipants || ''}
                  onChange={(e) => setNewVote({...newVote, totalParticipants: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="space-y-2">
                <Label>Options de réponse et résultats *</Label>
                <div className="space-y-3">
                  {newVote.options.map((option, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option.text}
                          onChange={(e) => handleUpdateOptionText(index, e.target.value)}
                          className="flex-1"
                        />
                        {newVote.options.length > 2 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveOption(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`votes-${index}`} className="text-sm text-muted-foreground min-w-[120px]">Nombre de votes :</Label>
                        <Input
                          id={`votes-${index}`}
                          type="number"
                          min="0"
                          placeholder="0"
                          value={option.votes || ''}
                          onChange={(e) => handleUpdateOptionVotes(index, parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        {newVote.totalParticipants > 0 && (
                          <span className="text-sm text-muted-foreground">
                            ({Math.round((option.votes / newVote.totalParticipants) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une option
                </Button>
                {newVote.totalParticipants > 0 && (
                  <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                    Total des votes : {newVote.options.reduce((sum, opt) => sum + opt.votes, 0)} / {newVote.totalParticipants}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateVote} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  Créer le vote
                </Button>
                <Button variant="outline" onClick={() => setShowVoteModal(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal résultats */}
        <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Résultats du vote</DialogTitle>
              <DialogDescription>
                {selectedVote?.question}
              </DialogDescription>
            </DialogHeader>
            {selectedVote && (
              <div className="space-y-4 mt-4">
                {selectedVote.options.map((option) => {
                  const totalVotes = selectedVote.options.reduce((sum, opt) => sum + opt.votes, 0);
                  const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : 0;
                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{option.text}</span>
                        <span className="text-muted-foreground">{option.votes} vote{option.votes > 1 ? 's' : ''} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    Total: {selectedVote.options.reduce((sum, opt) => sum + opt.votes, 0)} vote{selectedVote.options.reduce((sum, opt) => sum + opt.votes, 0) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal détails d'action */}
        <Dialog open={showActionDetailModal} onOpenChange={setShowActionDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de l'action</DialogTitle>
            </DialogHeader>
            {selectedAction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Thème</Label>
                    <p className="text-sm font-medium">{selectedAction.themeName}</p>
                  </div>
                  {selectedAction.subThemeName && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Sous-thème</Label>
                      <p className="text-sm font-medium">{selectedAction.subThemeName}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Titre</Label>
                  <p className="text-sm font-medium">{selectedAction.title}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedAction.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Responsables</Label>
                    <p className="text-sm">{selectedAction.responsables}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Échéance</Label>
                    <p className="text-sm">{new Date(selectedAction.echeance).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className={`inline-flex px-3 py-1 text-sm font-medium rounded border ${getStatutColor(selectedAction.statut)}`}>
                    {getStatutIcon(selectedAction.statut)}
                    <span className="ml-2">{getStatutLabel(selectedAction.statut)}</span>
                  </div>
                </div>

                {selectedAction.commentaireAbandon && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Commentaire d'abandon</Label>
                    <p className="text-sm text-red-600 dark:text-red-400">{selectedAction.commentaireAbandon}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Créée le</Label>
                  <p className="text-sm">{new Date(selectedAction.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedAction.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowActionDetailModal(false)}
                  >
                    Fermer
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowActionDetailModal(false);
                      navigate('/theme/suivi-actions');
                    }}
                  >
                    Voir dans Suivi actions
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal création d'action */}
        <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle action à mener</DialogTitle>
              <DialogDescription>
                Créer une action liée à "{subTheme.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Thème</Label>
                <Input value={theme.title} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>Sous-thème</Label>
                <Input value={subTheme.title} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action-title">Titre de l'action *</Label>
                <Input
                  id="action-title"
                  placeholder="Ex: Analyser les écarts du BP"
                  value={newAction.title}
                  onChange={(e) => setNewAction({...newAction, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action-description">Description</Label>
                <Textarea
                  id="action-description"
                  placeholder="Détails de l'action..."
                  value={newAction.description}
                  onChange={(e) => setNewAction({...newAction, description: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="action-responsables">Responsable(s)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowActionResponsablesSuggestions(!showActionResponsablesSuggestions)}
                      className="text-xs h-6"
                    >
                      {showActionResponsablesSuggestions ? 'Masquer' : 'Voir tous'}
                    </Button>
                  </div>
                  
                  {/* Input avec autocomplétion */}
                  <div className="relative">
                    <Input
                      id="action-responsables"
                      placeholder="Tapez un nom..."
                      value={actionResponsablesInput}
                      onChange={(e) => {
                        setActionResponsablesInput(e.target.value);
                        setShowActionResponsablesSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => actionResponsablesInput.length > 0 && setShowActionResponsablesSuggestions(true)}
                    />
                    
                    {/* Suggestions */}
                    {showActionResponsablesSuggestions && (
                      <Card className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto shadow-lg">
                        <CardContent className="p-2">
                          {persons
                            .filter(person => 
                              actionResponsablesInput === '' || 
                              person.fullName.toLowerCase().includes(actionResponsablesInput.toLowerCase())
                            )
                            .map(person => (
                              <Button
                                key={person.id}
                                variant="ghost"
                                className="w-full justify-start text-left font-normal h-auto py-1.5 px-2 hover:bg-primary/10"
                                onClick={() => {
                                  if (!selectedActionResponsables.includes(person.fullName)) {
                                    const newResponsables = [...selectedActionResponsables, person.fullName];
                                    setSelectedActionResponsables(newResponsables);
                                    setNewAction({...newAction, responsables: newResponsables.join(', ')});
                                  }
                                  setActionResponsablesInput('');
                                  setShowActionResponsablesSuggestions(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-semibold text-xs">{person.fullName}</span>
                                  {person.role && <span className="text-[10px] text-muted-foreground">{person.role}</span>}
                                </div>
                              </Button>
                            ))}
                          {persons.filter(person => 
                            actionResponsablesInput === '' || 
                            person.fullName.toLowerCase().includes(actionResponsablesInput.toLowerCase())
                          ).length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">Aucun résultat</p>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Badges des responsables */}
                  {selectedActionResponsables.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Sélectionnés ({selectedActionResponsables.length})</Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedActionResponsables.map((responsable, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs"
                          >
                            <span>{responsable}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0 hover:bg-primary/20"
                              onClick={() => {
                                const newResponsables = selectedActionResponsables.filter((_, i) => i !== index);
                                setSelectedActionResponsables(newResponsables);
                                setNewAction({...newAction, responsables: newResponsables.join(', ')});
                              }}
                            >
                              <XCircle className="h-2 w-2" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action-echeance">Date d'échéance *</Label>
                  <Popover open={openActionDatePopover} onOpenChange={setOpenActionDatePopover}>
                    <PopoverTrigger asChild>
                      <Button
                        id="action-echeance"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newAction.echeance && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {newAction.echeance ? (
                          format(new Date(newAction.echeance), "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionnez une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 shadow-lg" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={newAction.echeance ? new Date(newAction.echeance) : undefined}
                        onSelect={(date) => {
                          setNewAction({...newAction, echeance: date ? format(date, 'yyyy-MM-dd') : ''});
                          setOpenActionDatePopover(false); // Fermer le popover après sélection
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
                <Label htmlFor="action-statut">Statut initial</Label>
                <Select value={newAction.statut} onValueChange={(value: Action['statut']) => setNewAction({...newAction, statut: value})}>
                  <SelectTrigger id="action-statut">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-cours">En cours</SelectItem>
                    <SelectItem value="terminee">Terminée</SelectItem>
                    <SelectItem value="abandonnee">Abandonnée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateAction} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer l'action
                </Button>
                <Button variant="outline" onClick={() => setShowActionModal(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      </div>
      <ComiteToast />
      <Footer />
    </div>
  );
};

export default SubThemeDetail;
