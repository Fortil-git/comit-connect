import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Sun, Moon, MessageSquarePlus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { addActivityToSession, hasActiveSession } from "@/utils/comiteSession";
import { getActiveComiteId } from "@/utils/comiteSession";
import { ComiteAlert } from "@/components/ComiteAlert";
import { ComiteToast } from "@/components/ComiteToast";
import logoFortil from "@/img/cropped-Logo-Picto_Degrade.png";

interface AutreSujet {
  id: string;
  titre: string;
  description: string;
  createdAt: string;
}

const AutresSujets = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const [sujets, setSujets] = useState<AutreSujet[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isComiteActive, setIsComiteActive] = useState(hasActiveSession());

  // Écouter les changements de session et recharger les sujets
  useEffect(() => {
    const handleSessionChange = () => {
      const active = hasActiveSession();
      setIsComiteActive(active);
      // Recharger les sujets du nouveau comité actif (ou vider si aucun)
      const comiteId = getActiveComiteId();
      if (comiteId) {
        api.getAutresSujets(comiteId).then(data => setSujets(data || [])).catch(() => {});
      } else {
        setSujets([]);
      }
    };

    window.addEventListener('comite-session-changed', handleSessionChange);
    return () => {
      window.removeEventListener('comite-session-changed', handleSessionChange);
    };
  }, []);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSujet, setSelectedSujet] = useState<AutreSujet | null>(null);
  const [hasOtherSubject, setHasOtherSubject] = useState<boolean | null>(null);
  const [newSujet, setNewSujet] = useState({
    titre: '',
    description: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
      return;
    }
    if (loading) return;

    // Ne charger que les sujets du comité actif (les sujets appartiennent à leur comité)
    const comiteId = getActiveComiteId();
    if (comiteId) {
      api.getAutresSujets(comiteId).then(data => setSujets(data || [])).catch(() => {});
    } else {
      setSujets([]);
    }
  }, [navigate, loading, isAuthenticated]);

  const handleCreateSujet = async () => {
    if (!newSujet.titre.trim()) {
      toast.error("Veuillez renseigner le titre du sujet");
      return;
    }

    try {
      const comiteId = getActiveComiteId();
      const sujet = await api.createAutreSujet({
        titre: newSujet.titre,
        description: newSujet.description,
        comiteId,
      });
      setSujets(prev => [...prev, sujet]);
      await addActivityToSession({
        type: 'sujet-created',
        description: `Autre sujet ajouté : "${sujet.titre}"`,
        details: { titre: sujet.titre, description: sujet.description }
      });
      setNewSujet({ titre: '', description: '' });
      setShowModal(false);
      setHasOtherSubject(null);
      toast.success("Sujet ajouté avec succès !");
    } catch {
      toast.error("Erreur lors de l'ajout du sujet");
    }
  };

  const handleDeleteSujet = async (id: string) => {
    const sujet = sujets.find(s => s.id === id);
    try {
      await api.deleteAutreSujet(id);
      setSujets(prev => prev.filter(s => s.id !== id));
      if (sujet) {
        await addActivityToSession({
          type: 'sujet-deleted',
          description: `Autre sujet supprimé : "${sujet.titre}"`
        });
      }
      toast.success("Sujet supprimé !");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleOpenModal = () => {
    if (!isComiteActive) {
      toast.error("Vous devez ouvrir un comité pour ajouter des sujets");
      return;
    }
    setHasOtherSubject(null);
    setShowModal(true);
  };

  const handleYesResponse = () => {
    setHasOtherSubject(true);
  };

  const handleNoResponse = () => {
    setHasOtherSubject(false);
    setShowModal(false);
    toast.info("Aucun autre sujet à ajouter");
  };

  const handleOpenDetail = (sujet: AutreSujet) => {
    setSelectedSujet(sujet);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedSujet(null);
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
                  onClick={() => navigate('/dashboard')}
                  className="hover:bg-muted"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Retour
                </Button>
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquarePlus className="w-5 h-5 text-primary" />
                    Autres sujets à aborder
                  </h1>
                  <p className="text-xs text-muted-foreground">Sujets divers abordés lors du comité</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenModal}
                  disabled={!isComiteActive}
                  className="bg-gradient-to-r from-primary to-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!isComiteActive ? "Vous devez ouvrir un comité pour ajouter des sujets" : ""}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un sujet
                </Button>
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
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-6xl">
          {sujets.length === 0 ? (
            <Card className="p-12 text-center animate-fade-in">
              <MessageSquarePlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Aucun autre sujet</h3>
              <p className="text-muted-foreground mb-6">
                Cliquez sur "Ajouter un sujet" pour enregistrer un sujet abordé lors du comité
              </p>
              <Button onClick={handleOpenModal} className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un sujet
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sujets.map((sujet, index) => (
                <Card 
                  key={sujet.id} 
                  className="hover:shadow-lg transition-all duration-300 group animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleOpenDetail(sujet)}
                >
                  <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-bold leading-tight line-clamp-2 flex-1">
                        {sujet.titre}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSujet(sujet.id);
                        }}
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {sujet.description && (
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                        {sujet.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(sujet.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Modal pour ajouter un sujet */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Autre sujet à aborder</DialogTitle>
              <DialogDescription>
                Un autre sujet a-t-il été abordé lors du comité ?
              </DialogDescription>
            </DialogHeader>

            {hasOtherSubject === null ? (
              <div className="flex gap-4 justify-center py-6">
                <Button 
                  onClick={handleYesResponse}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary h-12 text-base"
                >
                  Oui
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleNoResponse}
                  className="flex-1 h-12 text-base"
                >
                  Non
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sujet-titre">Titre du sujet *</Label>
                  <Input
                    id="sujet-titre"
                    placeholder="Ex: Discussion sur les nouveaux locaux"
                    value={newSujet.titre}
                    onChange={(e) => setNewSujet({...newSujet, titre: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sujet-description">Description</Label>
                  <Textarea
                    id="sujet-description"
                    placeholder="Détails du sujet abordé..."
                    value={newSujet.description}
                    onChange={(e) => setNewSujet({...newSujet, description: e.target.value})}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateSujet} 
                    className="flex-1 bg-gradient-to-r from-primary to-secondary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter le sujet
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowModal(false);
                      setHasOtherSubject(null);
                      setNewSujet({ titre: '', description: '' });
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de détail d'un sujet */}
        <Dialog open={showDetailModal} onOpenChange={handleCloseDetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-primary" />
                {selectedSujet?.titre}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-xs">
                <Calendar className="w-3 h-3" />
                Ajouté le {selectedSujet && new Date(selectedSujet.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSujet && (
              <div className="space-y-4">
                {selectedSujet.description ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Description</Label>
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {selectedSujet.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-center">
                    <p className="text-sm text-muted-foreground italic">
                      Aucune description fournie
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={handleCloseDetail}
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeleteSujet(selectedSujet.id);
                      handleCloseDetail();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <ComiteToast />
      <Footer />
    </div>
  );
};

export default AutresSujets;
