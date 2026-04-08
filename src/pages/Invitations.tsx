import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Sun, Moon, UserPlus, CalendarClock, Search, X, Copy, Send, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import logoFortil from "@/img/cropped-Logo-Picto_Degrade.png";

interface ComiteFutur {
  id: string;
  date: string;
  entite: string;
  participants: string;
  createdAt: string;
  formData: any;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  jobTitle: string | null;
}

const Invitations = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const [comitesFuturs, setComitesFuturs] = useState<ComiteFutur[]>([]);
  const [loadingComites, setLoadingComites] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedComite, setSelectedComite] = useState<ComiteFutur | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [selectedPersons, setSelectedPersons] = useState<Person[]>([]);
  const [emailBody, setEmailBody] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.userRole !== 'ADMIN')) {
      navigate("/dashboard");
      return;
    }
    if (loading) return;
    loadComites();
  }, [navigate, loading, isAuthenticated, user]);

  const loadComites = () => {
    setLoadingComites(true);
    api.getComites().then(comites => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futurs = comites
        .filter((c: any) => {
          const d = new Date(c.date);
          d.setHours(0, 0, 0, 0);
          return d > today;
        })
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setComitesFuturs(futurs);
    }).catch(() => {}).finally(() => setLoadingComites(false));
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const comiteDate = new Date(date);
    comiteDate.setHours(0, 0, 0, 0);
    return Math.ceil((comiteDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const generateEmailTemplate = useCallback((comite: ComiteFutur) => {
    const dateStr = new Date(comite.date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const adminName = user?.fullName || 'L\'administrateur';
    return `Bonjour,

Vous êtes invité(e) à participer au comité local prévu le ${dateStr} pour l'entité ${comite.entite || 'non définie'}.

Merci de confirmer votre présence.

Cordialement,
${adminName}`;
  }, [user]);

  const openInviteDialog = (comite: ComiteFutur) => {
    setSelectedComite(comite);
    setSelectedPersons([]);
    setSearchQuery("");
    setSearchResults([]);
    setEmailBody(generateEmailTemplate(comite));
    setDialogOpen(true);
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await api.getPersons(query);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const togglePerson = (person: Person) => {
    setSelectedPersons(prev => {
      const exists = prev.find(p => p.id === person.id);
      if (exists) return prev.filter(p => p.id !== person.id);
      return [...prev, person];
    });
  };

  const removePerson = (personId: string) => {
    setSelectedPersons(prev => prev.filter(p => p.id !== personId));
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailBody);
      toast.success("Message copié dans le presse-papier");
    } catch {
      toast.error("Impossible de copier le message");
    }
  };

  const handleSendInvitations = () => {
    if (selectedPersons.length === 0) {
      toast.error("Veuillez sélectionner au moins une personne");
      return;
    }
    toast.info("Envoi d'emails non configuré — fonctionnalité à venir", { position: 'top-center' });
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-28">
      <img src={logoFortil} alt="" className="logoBG" />

      <div>
        <header className="gradientBg border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="hover:bg-muted">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Retour
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Invitations aux comités</h1>
                  <p className="text-xs text-muted-foreground">Invitez des participants aux prochains comités</p>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")} className="transition-all duration-200 h-8 w-8 noBG">
                {currentTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {loadingComites ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : comitesFuturs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarClock className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun comité futur planifié</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Créez un comité avec une date future pour pouvoir envoyer des invitations.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {comitesFuturs.map((comite, index) => {
                const daysUntil = getDaysUntil(comite.date);
                const isTomorrow = daysUntil === 1;
                const dateFormatted = new Date(comite.date).toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                });

                return (
                  <Card
                    key={comite.id}
                    className={`transition-all duration-200 hover:shadow-lg animate-fade-in ${
                      isTomorrow ? 'border-orange-500/50' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base capitalize">{dateFormatted}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {comite.entite || 'Entité non définie'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={daysUntil <= 3 ? "destructive" : "secondary"} className="text-xs">
                            {daysUntil === 1 ? "Demain" : `Dans ${daysUntil} jours`}
                          </Badge>
                          <Button size="sm" onClick={() => openInviteDialog(comite)} className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            Inviter
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {comite.participants && (
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Participants :</span> {comite.participants}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Dialog d'invitation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Inviter des participants
            </DialogTitle>
            {selectedComite && (
              <DialogDescription>
                Comité du {new Date(selectedComite.date).toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })} — {selectedComite.entite || 'Entité non définie'}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-5">
            {/* Recherche de personnes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Rechercher des participants</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Résultats de recherche */}
              {searchQuery.length >= 2 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {searching ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">Recherche...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">Aucun résultat</div>
                  ) : (
                    searchResults.map(person => {
                      const isSelected = selectedPersons.some(p => p.id === person.id);
                      return (
                        <label
                          key={person.id}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => togglePerson(person)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{person.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {person.email || 'Pas d\'email'}{person.jobTitle ? ` — ${person.jobTitle}` : ''}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Personnes sélectionnées */}
            {selectedPersons.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Participants sélectionnés ({selectedPersons.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedPersons.map(person => (
                    <Badge key={person.id} variant="secondary" className="gap-1 pr-1">
                      {person.fullName}
                      {person.email && <span className="text-muted-foreground">({person.email})</span>}
                      <button
                        onClick={() => removePerson(person.id)}
                        className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Template d'email */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Message d'invitation</Label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={8}
                className="resize-none text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCopyEmail} className="gap-2">
              <Copy className="w-4 h-4" />
              Copier le message
            </Button>
            <Button onClick={handleSendInvitations} className="gap-2" disabled={selectedPersons.length === 0}>
              <Send className="w-4 h-4" />
              Envoyer les invitations ({selectedPersons.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Invitations;
