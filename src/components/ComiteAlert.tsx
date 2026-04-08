import { useState, useEffect } from "react";
import { AlertCircle, Calendar, FolderOpen, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { startComiteSession } from "@/utils/comiteSession";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ComiteHistorique {
  id: string;
  date: string;
  entite: string;
  participants: string;
  formData: any;
}

interface ComiteAlertProps {
  onComiteSelected?: () => void;
}

export const ComiteAlert = ({ onComiteSelected }: ComiteAlertProps) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [comites, setComites] = useState<ComiteHistorique[]>([]);
  const [selectedComiteId, setSelectedComiteId] = useState<string>("");

  useEffect(() => {
    // Charger l'historique des comités (partagés entre toutes les agences)
    api.getComites().then(data => setComites(data || [])).catch(() => {});
  }, []);

  const handleOpenExistingComite = async () => {
    if (!selectedComiteId) {
      toast.error("Veuillez sélectionner un comité");
      return;
    }

    const selectedComite = comites.find(c => c.id === selectedComiteId);
    if (!selectedComite) return;

    // Rouvrir le comité sélectionné avec son ID existant
    await startComiteSession(selectedComite.formData, selectedComite.id);
    toast.success(`Comité du ${new Date(selectedComite.date).toLocaleDateString('fr-FR')} réouvert !`, { position: 'top-center' });
    window.dispatchEvent(new Event('comite-session-changed'));
    setShowModal(false);
    
    if (onComiteSelected) {
      onComiteSelected();
    }
  };

  const handleCreateNewComite = () => {
    navigate('/theme/info-comite');
  };

  return (
    <>
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">
          Aucun comité ouvert
        </AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <p className="mb-3">
            Pour créer des actions, votes ou sujets, vous devez sélectionner un comité.
          </p>
          <div className="flex gap-2">
            {comites.length > 0 && (
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setShowModal(true)}
                className="border-amber-600 text-amber-900 hover:bg-amber-100"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Comité existant
              </Button>
            )}
            <Button 
              size="sm"
              onClick={handleCreateNewComite}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau comité
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Modal de sélection de comité */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sélectionner un comité existant</DialogTitle>
            <DialogDescription>
              Choisissez le comité dans lequel vous souhaitez ajouter cette action.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Select value={selectedComiteId} onValueChange={setSelectedComiteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un comité" />
                </SelectTrigger>
                <SelectContent>
                  {comites.map((comite) => (
                    <SelectItem key={comite.id} value={comite.id}>
                      Comité du {new Date(comite.date).toLocaleDateString('fr-FR')} - {comite.entite}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleOpenExistingComite}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                Ouvrir ce comité
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
