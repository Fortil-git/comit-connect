import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Moon, Save, Download, CalendarIcon, RotateCcw, XCircle } from "lucide-react";
import { useThemeData } from "@/contexts/ThemeDataContext";
import { persons } from "@/data/persons";
import { useTheme } from "@/components/theme-provider";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { startComiteSession, endComiteSession, hasActiveSession, getActiveComiteId, getCurrentSession } from "@/utils/comiteSession";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { api } from "@/lib/api";

const ThemeForm = () => {
  const { themes } = useThemeData();
  const { themeId } = useParams();
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const { isAuthenticated, agency, loading } = useAuth();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [showParticipantsSuggestions, setShowParticipantsSuggestions] = useState(false);
  const [participantsInput, setParticipantsInput] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [openDatePopover, setOpenDatePopover] = useState<string | null>(null);

  const theme = themes.find((t) => t.id === themeId);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
      return;
    }
    if (loading) return;

    // Load saved data from API
    if (themeId) {
      if (themeId === 'info-comite') {
        // Pour info-comite, charger depuis la session active (formData du comité)
        const comiteId = getActiveComiteId();
        if (comiteId) {
          getCurrentSession().then(comite => {
            if (comite?.formData) {
              setFormData(comite.formData);
              if (comite.formData['participants']) {
                const participants = comite.formData['participants'].split('\n').filter((p: string) => p.trim() !== '');
                setSelectedParticipants(participants);
              }
            }
            // Toujours pré-remplir l'entité avec l'agence connectée
            if (agency) {
              setFormData(prev => ({ ...prev, entite: agency.name }));
            }
          }).catch(() => {});
        } else if (agency) {
          setFormData({ entite: agency.name });
        }
      } else {
        // Pour les autres thèmes, charger les notes
        const comiteId = getActiveComiteId();
        api.getNotesByTheme({ themeId, comiteId: comiteId || undefined }).then(data => {
          if (data && Object.keys(data).length > 0) {
            // Extraire le contenu des objets notes
            const extracted: Record<string, any> = {};
            for (const [key, val] of Object.entries(data)) {
              if (val && typeof val === 'object' && 'content' in (val as any)) {
                const content = (val as any).content;
                try { extracted[key] = JSON.parse(content); } catch { extracted[key] = content; }
              } else {
                extracted[key] = val;
              }
            }
            setFormData(extracted);
          }
        }).catch(() => {});
      }
    }
  }, [navigate, themeId, loading, isAuthenticated, agency]);

  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Thème non trouvé</p>
      </div>
    );
  }

  const handleFieldChange = (subThemeId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [subThemeId]: value
    }));
  };

  const handleSave = async () => {
    // Si c'est le formulaire "Informations comité", gérer la création du comité
    if (themeId === 'info-comite') {
      // Vérifier si une session existe déjà
      if (!hasActiveSession()) {
        // Vérifier que tous les champs obligatoires sont remplis
        const champsObligatoires = ['date', 'entite', 'invites', 'participants', 'femmes', 'hommes', 'postes', 'ordre-jour'];
        const champManquants = champsObligatoires.filter(champ => {
          const valeur = formData[champ];
          // Vérifier si le champ est vide, null, undefined, ou un tableau vide
          if (valeur === undefined || valeur === null || valeur === '') return true;
          if (Array.isArray(valeur) && valeur.length === 0) return true;
          if (typeof valeur === 'number' && valeur === 0 && (champ === 'femmes' || champ === 'hommes')) return true;
          return false;
        });

        if (champManquants.length > 0) {
          const nomsChamps: { [key: string]: string } = {
            'date': 'Date du Comité',
            'entite': 'Entité FORTIL',
            'invites': 'Invités d\'une autre agence',
            'participants': 'Noms des participants',
            'femmes': 'Nombre de femmes présentes',
            'hommes': 'Nombre d\'hommes présents',
            'postes': 'Postes représentés',
            'ordre-jour': 'Ordre du jour'
          };

          const listeChamps = champManquants.map(c => `• ${nomsChamps[c]}`).join('\n');

          toast.error(
            `⚠️ Champs obligatoires manquants :\n\n${listeChamps}\n\nVeuillez remplir tous les champs pour créer le comité.`,
            {
              duration: 7000,
              position: 'top-center'
            }
          );
          return;
        }

        // Vérifier qu'il n'y a pas déjà un comité à cette date
        const formDate = formData['date'];
        if (formDate) {
          const existingComites = await api.getComites();
          const dateExists = existingComites.some((comite: any) => {
            const comiteDate = new Date(comite.date).toDateString();
            const newDate = new Date(formDate).toDateString();
            return comiteDate === newDate;
          });

          if (dateExists) {
            toast.error(
              `Un comité existe déjà pour le ${new Date(formDate).toLocaleDateString('fr-FR')}.\n\nUn seul comité par jour est autorisé.`,
              {
                duration: 5000,
                position: 'top-center'
              }
            );
            return;
          }
        }

        // Démarrer une session de comité (le formData est stocké dans le comité)
        await startComiteSession(formData, undefined, agency?.id);

        const dateComite = formData['date'] ? new Date(formData['date']).toLocaleDateString('fr-FR') : 'Non renseignée';
        const entite = formData['entite'] || 'Non renseignée';

        // Déclencher un événement pour mettre à jour le Footer et le header
        window.dispatchEvent(new Event('comite-session-changed'));

        // Rediriger vers le dashboard
        navigate('/dashboard');

        // Vérifier si c'est un comité futur
        const selectedDate = new Date(formData['date']);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        // Afficher le toast après la redirection
        setTimeout(() => {
          if (selectedDate > today) {
            const diffTime = selectedDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            toast.success(
              `📅 Comité futur planifié !\n📆 Date : ${dateComite} (dans ${diffDays} jour${diffDays > 1 ? 's' : ''})\n🏢 Entité : ${entite}\n\n✨ Vous pouvez déjà ajouter des activités à ce comité.`,
              {
                duration: 6000,
                position: 'top-right'
              }
            );
          } else {
            toast.success(
              `✅ Comité ouvert !\n📅 Date : ${dateComite}\n🏢 Entité : ${entite}\n\nToutes les actions seront enregistrées jusqu'à la clôture.`,
              {
                duration: 5000,
                position: 'top-right'
              }
            );
          }
        }, 100);
      } else {
        toast.success("Données sauvegardées !");
      }
    } else {
      // Pour les autres thèmes, sauvegarder les notes individuellement
      if (themeId) {
        const comiteId = getActiveComiteId();
        const savePromises = Object.entries(formData).map(([subThemeId, value]) => {
          const content = typeof value === 'string' ? value : JSON.stringify(value);
          return api.upsertNote({ themeId, subThemeId, content, comiteId }).catch(() => {});
        });
        await Promise.all(savePromises);
      }
      toast.success("Données sauvegardées avec succès !");
    }
  };

  const handleEndSession = () => {
    if (themeId === 'info-comite' && hasActiveSession()) {
      setShowEndSessionDialog(true);
    }
  };

  const confirmEndSession = async () => {
    await endComiteSession();
    setShowEndSessionDialog(false);
    toast.success("Comité terminé et enregistré dans l'historique !", { position: 'top-center' });
    navigate('/historique-comites');
  };

  const handleReset = () => {
    if (window.confirm("Voulez-vous vraiment réinitialiser le formulaire ? Toutes les données non sauvegardées seront perdues.")) {
      setFormData({});
      setSelectedParticipants([]);
      // Ne pas appeler upsertNote pour info-comite (pas de notes, c'est un formulaire de création de comité)
      if (themeId && themeId !== 'info-comite') {
        const comiteId = getActiveComiteId();
        // Réinitialiser chaque note du thème
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
          theme.subThemes.forEach(st => {
            api.upsertNote({ themeId, subThemeId: st.id, content: '', comiteId }).catch(() => {});
          });
        }
      }
      if (themeId === 'info-comite' && agency) {
        setFormData({ entite: agency.name });
      }
      toast.success("Formulaire réinitialisé !");
    }
  };

  const handleExport = () => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    const exportData = {
      theme: theme.title,
      date: new Date().toLocaleDateString('fr-FR'),
      data: theme.subThemes.map(st => ({
        question: st.title,
        response: formData[st.id] || null
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comite-${theme.id}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Export réussi !");
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
                <p className="text-xs text-muted-foreground">{theme.description}</p>
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

      <main className="container mx-auto px-4 py-3 max-w-4xl">
        <Breadcrumb 
          items={[
            { label: theme.title, icon: theme.icon, color: theme.color }
          ]} 
        />
        
        <Card className="animate-fade-in shadow-elevated">
          <CardHeader className="py-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{theme.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                {themeId === 'info-comite' && !hasActiveSession() && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      💡 <strong>Astuce :</strong> Vous pouvez anticiper un comité futur en sélectionnant une date ultérieure à aujourd'hui.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {theme.subThemes.map((subTheme, index) => {
              // Vérifier si c'est le premier champ vide
              const isCurrentField = !formData[subTheme.id] && (index === 0 || theme.subThemes.slice(0, index).every(st => formData[st.id]));
              
              // Masquer "agence-invites" si la réponse à "invites" n'est pas "Oui"
              if (subTheme.id === 'agence-invites' && formData['invites'] !== 'Oui') {
                return null;
              }
              
              return (
              <div key={subTheme.id} className={`space-y-1.5 pb-3 border-b border-border/50 last:border-0 last:pb-0 p-3 rounded-lg border-2 transition-all duration-300 ${
                isCurrentField
                  ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                  : 'border-transparent bg-transparent'
              }`}>
                <Label htmlFor={subTheme.id} className={`text-sm font-medium ${isCurrentField ? 'text-primary font-bold' : ''}`}>
                  {index + 1}. {subTheme.title} {isCurrentField && <span className="text-xs ml-2 animate-pulse">← Complétez ce champ</span>}
                </Label>
                
                {subTheme.type === 'text' && (
                  subTheme.id === 'participants' ? (
                    // Champ spécial avec autocomplétion pour les participants
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowParticipantsSuggestions(!showParticipantsSuggestions)}
                          className="text-xs h-7"
                        >
                          {showParticipantsSuggestions ? 'Masquer' : 'Voir tous les noms'}
                        </Button>
                      </div>
                      
                      {/* Input avec autocomplétion */}
                      <div className="relative">
                        <Input
                          id={subTheme.id}
                          placeholder="Tapez un nom pour rechercher..."
                          value={participantsInput}
                          onChange={(e) => {
                            setParticipantsInput(e.target.value);
                            setShowParticipantsSuggestions(e.target.value.length > 0);
                          }}
                          onFocus={() => participantsInput.length > 0 && setShowParticipantsSuggestions(true)}
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                        
                        {/* Suggestions d'autocomplétion */}
                        {showParticipantsSuggestions && (
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
                                        handleFieldChange(subTheme.id, newParticipants.join('\n'));
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
                                    handleFieldChange(subTheme.id, newParticipants.join('\n'));
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
                    // Champ texte normal pour les autres champs
                    <Textarea
                      id={subTheme.id}
                      placeholder={subTheme.placeholder || "Saisissez votre réponse..."}
                      value={formData[subTheme.id] || ''}
                      onChange={(e) => handleFieldChange(subTheme.id, e.target.value)}
                      className="min-h-[60px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  )
                )}

                {subTheme.type === 'date' && (
                  <Popover open={openDatePopover === subTheme.id} onOpenChange={(open) => setOpenDatePopover(open ? subTheme.id : null)}>
                    <PopoverTrigger asChild>
                      <Button
                        id={subTheme.id}
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal transition-all duration-200",
                          !formData[subTheme.id] && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData[subTheme.id] ? (
                          format(new Date(formData[subTheme.id]), "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionnez une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 shadow-lg" align="start">
                      <Calendar
                        mode="single"
                        selected={formData[subTheme.id] ? new Date(formData[subTheme.id]) : undefined}
                        onSelect={(date) => {
                          handleFieldChange(subTheme.id, date ? format(date, "yyyy-MM-dd") : '');
                          setOpenDatePopover(null); // Fermer le popover après sélection
                        }}
                        initialFocus
                        locale={fr}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                )}

                {subTheme.type === 'counter' && (
                  <div className="flex items-center gap-4">
                    <Select
                      value={formData[subTheme.id]?.toString() || ''}
                      onValueChange={(value) => handleFieldChange(subTheme.id, parseInt(value))}
                    >
                      <SelectTrigger id={subTheme.id} className="w-32">
                        <SelectValue placeholder="0" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: (subTheme.max || 10) + 1 }, (_, i) => i).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData[subTheme.id] >= (subTheme.max || 10) && (
                      <Input
                        type="number"
                        placeholder="Autre nombre"
                        value={formData[subTheme.id] > (subTheme.max || 10) ? formData[subTheme.id] : ''}
                        onChange={(e) => handleFieldChange(subTheme.id, parseInt(e.target.value) || 0)}
                        className="w-32"
                        min={(subTheme.max || 10) + 1}
                      />
                    )}
                  </div>
                )}

                {subTheme.type === 'number' && (
                  <Input
                    id={subTheme.id}
                    type="number"
                    placeholder="0"
                    value={formData[subTheme.id] || ''}
                    onChange={(e) => handleFieldChange(subTheme.id, e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                )}

                {subTheme.type === 'radio' && subTheme.options && (
                  <RadioGroup
                    value={formData[subTheme.id] || ''}
                    onValueChange={(value) => handleFieldChange(subTheme.id, value)}
                    className="flex gap-4"
                  >
                    {subTheme.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${subTheme.id}-${option}`} />
                        <Label
                          htmlFor={`${subTheme.id}-${option}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {subTheme.type === 'select' && subTheme.options && (
                  subTheme.id === 'entite' ? (
                    // Champ "Entité FORTIL" en lecture seule avec le nom de l'agence
                    <Input
                      id={subTheme.id}
                      value={formData[subTheme.id] || ''}
                      readOnly
                      className="bg-muted/50 cursor-not-allowed transition-all duration-200"
                    />
                  ) : (
                    <Select
                      value={formData[subTheme.id] || ''}
                      onValueChange={(value) => handleFieldChange(subTheme.id, value)}
                    >
                      <SelectTrigger id={subTheme.id}>
                        <SelectValue placeholder="Sélectionnez une option" />
                      </SelectTrigger>
                      <SelectContent>
                        {subTheme.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                )}

                {subTheme.type === 'checkbox' && subTheme.options && (
                  <div className="space-y-2">
                    {subTheme.options.map((option) => {
                      const isChecked = Array.isArray(formData[subTheme.id]) 
                        ? formData[subTheme.id].includes(option)
                        : false;
                      
                      return (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${subTheme.id}-${option}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const currentValues = Array.isArray(formData[subTheme.id]) 
                                ? formData[subTheme.id] 
                                : [];
                              
                              if (checked) {
                                handleFieldChange(subTheme.id, [...currentValues, option]);
                              } else {
                                handleFieldChange(
                                  subTheme.id,
                                  currentValues.filter((v: string) => v !== option)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`${subTheme.id}-${option}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {option}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              );
            })}
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-secondary">
                <Save className="w-4 h-4 mr-2" />
                {themeId === 'info-comite' ? 'Démarrer le comité' : 'Sauvegarder le formulaire'}
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Dialog de confirmation */}
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
              <Button onClick={confirmEndSession} className="bg-gradient-to-r from-primary to-secondary">
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      </div>
      <Footer />
    </div>
  );
};

export default ThemeForm;
