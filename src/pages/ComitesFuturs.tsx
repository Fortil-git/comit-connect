import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sun, Moon, Calendar, Clock, FileText, Trash2, CalendarClock, RotateCcw, Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { startComiteSession, hasActiveSession } from "@/utils/comiteSession";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import logoFortil from "@/img/cropped-Logo-Picto_Degrade.png";

interface ComiteHistorique {
  id: string;
  date: string;
  entite: string;
  participants: string;
  createdAt: string;
  formData: any;
  activites: any[];
}

const ComitesFuturs = () => {
  const { isAuthenticated, loading, agency } = useAuth();
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const [comitesFuturs, setComitesFuturs] = useState<ComiteHistorique[]>([]);
  const [editingComite, setEditingComite] = useState<ComiteHistorique | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
      return;
    }
    if (loading) return;

    loadComitesFuturs();
  }, [navigate, loading, isAuthenticated]);

  const loadComitesFuturs = () => {
    // Charger depuis l'API (partagés entre toutes les agences)
    api.getComites().then(comites => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filtrer pour ne garder que les comités dont la date est dans le futur
      const futurs = comites.filter((c: any) => {
        const comiteDate = new Date(c.date);
        comiteDate.setHours(0, 0, 0, 0);
        return comiteDate > today;
      }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setComitesFuturs(futurs);
    }).catch(() => {});
  };

  const handleReopenComite = async (comite: ComiteHistorique) => {
    if (hasActiveSession()) {
      toast.error('Un comité est déjà ouvert. Veuillez le terminer avant d\'en ouvrir un autre.');
      return;
    }

    const dateComite = new Date(comite.date).toLocaleDateString('fr-FR');
    if (window.confirm(`Voulez-vous réouvrir le comité du ${dateComite} ?\n\nVous pourrez continuer à ajouter des activités à ce comité.`)) {
      // Réouvrir le comité avec son ID existant
      await startComiteSession(comite.formData, comite.id);

      // Déclencher un événement pour mettre à jour l'interface
      window.dispatchEvent(new Event('comite-session-changed'));

      toast.success(`Comité du ${dateComite} réouvert avec succès !`, { position: 'top-center' });
      navigate('/dashboard');
    }
  };

  const handleDeleteComite = async (comiteId: string) => {
    const comite = comitesFuturs.find(c => c.id === comiteId);
    if (!comite) return;

    const dateComite = new Date(comite.date).toLocaleDateString('fr-FR');
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le comité futur du ${dateComite} ?\n\nToutes les activités associées seront également supprimées.\n\nCette action est irréversible.`)) {
      // Supprimer le comité via API (cascade delete handled by backend)
      await api.deleteComite(comiteId);

      // Recharger la liste depuis l'API
      loadComitesFuturs();
      toast.success("Comité futur supprimé avec succès", { position: 'top-center' });
    }
  };

  const handleEditDate = (comite: ComiteHistorique) => {
    setEditingComite(comite);
    setNewDate(new Date(comite.date));
  };

  const confirmEditDate = async () => {
    if (!editingComite || !newDate) return;

    await api.updateComite(editingComite.id, {
      date: newDate.toISOString(),
      formData: { ...editingComite.formData, date: newDate.toISOString() },
    });

    toast.success(
      `Date modifiée au ${newDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      { position: 'top-center' }
    );
    setEditingComite(null);
    loadComitesFuturs();
    window.dispatchEvent(new Event('comite-session-changed'));
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const comiteDate = new Date(date);
    comiteDate.setHours(0, 0, 0, 0);
    const diffTime = comiteDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-28">
      <img src={logoFortil} alt="" className="logoBG" />

      <div>
        <header className="gradientBg border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="gap-2 hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Comités Futurs
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
              >
                {currentTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Consultez et gérez vos comités planifiés pour les dates à venir.
            </p>
          </div>

          {comitesFuturs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarClock className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun comité futur planifié</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Créez un comité avec une date future pour le voir apparaître ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {comitesFuturs.map((comite, index) => {
                const daysUntil = getDaysUntil(comite.date);
                const isToday = daysUntil === 0;
                const isTomorrow = daysUntil === 1;
                
                return (
                  <Card 
                    key={comite.id}
                    className={`transition-all duration-200 hover:shadow-lg ${
                      isToday ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950' : 
                      isTomorrow ? 'border-2 border-orange-500 bg-orange-50 dark:bg-orange-950' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            <CardTitle className="text-xl">
                              {format(new Date(comite.date), "EEEE d MMMM yyyy", { locale: fr })}
                            </CardTitle>
                            {isToday && (
                              <Badge className="bg-green-600 text-white">Aujourd'hui</Badge>
                            )}
                            {isTomorrow && (
                              <Badge className="bg-orange-600 text-white">Demain</Badge>
                            )}
                            {!isToday && !isTomorrow && (
                              <Badge variant="outline">
                                Dans {daysUntil} jour{daysUntil > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDate(comite)}
                            className="gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Modifier la date
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleReopenComite(comite)}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2 shadow-md"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reprendre
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComite(comite.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-muted-foreground">Entité :</span>
                        <span>{comite.entite}</span>
                      </div>

                      {comite.participants && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-muted-foreground">Participants :</span>
                          <span className="text-xs">{comite.participants}</span>
                        </div>
                      )}

                      {comite.activites && comite.activites.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="font-semibold">
                            {comite.activites.length} activité{comite.activites.length > 1 ? 's' : ''} planifiée{comite.activites.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <Clock className="w-3 h-3" />
                        Créé le {format(new Date(comite.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Dialog de modification de date */}
      <Dialog open={!!editingComite} onOpenChange={(open) => { if (!open) setEditingComite(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la date du comité</DialogTitle>
            <DialogDescription>
              Sélectionnez une nouvelle date pour ce comité.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <CalendarPicker
              mode="single"
              selected={newDate}
              onSelect={setNewDate}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              locale={fr}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingComite(null)}>
              Annuler
            </Button>
            <Button
              onClick={confirmEditDate}
              disabled={!newDate}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ComitesFuturs;
