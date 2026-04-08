import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentSession, hasActiveSession, startComiteSession } from "@/utils/comiteSession";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sun, Moon, Calendar, FileText, CheckCircle, Vote, MessageSquarePlus, Clock, ChevronDown, ChevronUp, ExternalLink, Trash2, Download, X, User, CalendarClock, RotateCcw, Paperclip } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoFortil from "@/img/cropped-Logo-Picto_Degrade.png";

interface ComiteHistorique {
  id: string;
  date: string;
  entite: string;
  participants: string;
  createdAt: string;
  formData: any;
  activites: {
    type: 'action-created' | 'action-updated' | 'action-deleted' | 'vote-created' | 'vote-deleted' | 'sujet-created' | 'sujet-deleted' | 'note-saved';
    timestamp: string;
    description: string;
    details?: any;
  }[];
}

const HistoriqueComites = () => {
  const { isAuthenticated, loading, agency } = useAuth();
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const [comites, setComites] = useState<ComiteHistorique[]>([]);
  const [expandedComites, setExpandedComites] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedComiteId, setSelectedComiteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<any>(null);
  const [voteResults, setVoteResults] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
      return;
    }
    if (loading) return;

    // Load comites history from API (partagés entre toutes les agences)
    api.getComites().then(comitesData => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filtrer pour ne garder que les comités dont la date est <= aujourd'hui
      const comitesPasses = comitesData.filter((c: any) => {
        const comiteDate = new Date(c.date);
        comiteDate.setHours(0, 0, 0, 0);
        return comiteDate <= today;
      });

      // Trier par date décroissante (le plus récent en premier)
      const sortedComites = comitesPasses.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setComites(sortedComites);
    }).catch(() => {});
  }, [navigate, loading, isAuthenticated]);

  const toggleComite = (comiteId: string) => {
    const newExpanded = new Set(expandedComites);
    if (newExpanded.has(comiteId)) {
      newExpanded.delete(comiteId);
    } else {
      newExpanded.add(comiteId);
    }
    setExpandedComites(newExpanded);
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
    const comite = comites.find(c => c.id === comiteId);
    if (!comite) return;

    const dateComite = new Date(comite.date).toLocaleDateString('fr-FR');
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le comité du ${dateComite} ?\n\nToutes les activités associées (actions, votes, notes, sujets) seront également supprimées.\n\nCette action est irréversible.`)) {
      // Supprimer le comité via API (cascade delete handled by backend)
      await api.deleteComite(comiteId);
      setComites(prev => prev.filter(c => c.id !== comiteId));

      toast.success('Comité et toutes ses activités supprimés avec succès', { position: 'top-center' });
    }
  };

  const generatePDF = (comite: ComiteHistorique) => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // En-tête avec logo FORTIL
      doc.setFillColor(0, 123, 255);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FORTIL', 15, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Compte Rendu de Comité Local', pageWidth - 15, 20, { align: 'right' });

      yPos = 45;

      // Informations du comité
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Informations du Comité', 15, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const comiteDate = new Date(comite.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const infoData = [
        ['Date', comiteDate],
        ['Entité', comite.entite || 'Non renseigné'],
        ['Participants', comite.participants || 'Non renseigné'],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: infoData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 50 },
          1: { cellWidth: 'auto' }
        },
        margin: { left: 15, right: 15 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Statistiques
      const actions = comite.activites?.filter((a: any) => a.type === 'action-created') || [];
      const votes = comite.activites?.filter((a: any) => a.type === 'vote-created') || [];
      const notes = comite.activites?.filter((a: any) => a.type === 'note-saved') || [];
      const sujets = comite.activites?.filter((a: any) => a.type === 'sujet-created') || [];

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Résumé des Activités', 15, yPos);
      yPos += 10;

      const statsData = [
        ['📝 Notes sauvegardées', notes.length.toString()],
        ['✅ Actions créées', actions.length.toString()],
        ['🗳️ Votes organisés', votes.length.toString()],
        ['💬 Autres sujets', sujets.length.toString()],
        ['📊 Total activités', comite.activites?.length.toString() || '0']
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: statsData,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { halign: 'center', cellWidth: 40, fontStyle: 'bold', textColor: [0, 123, 255] }
        },
        margin: { left: 15, right: 15 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Actions créées
      if (actions.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Actions à Mener', 15, yPos);
        yPos += 10;

        const actionsData = actions.map((action: any) => [
          action.details?.title || 'Sans titre',
          action.details?.themeName || '',
          action.details?.responsables || '',
          action.details?.echeance ? new Date(action.details.echeance).toLocaleDateString('fr-FR') : '',
          new Date(action.timestamp).toLocaleDateString('fr-FR')
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Titre', 'Thème', 'Responsables', 'Échéance', 'Créée le']],
          body: actionsData,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 2 },
          headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 35 },
            2: { cellWidth: 35 },
            3: { cellWidth: 30 },
            4: { cellWidth: 30 }
          },
          margin: { left: 15, right: 15 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Votes et sondages
      if (votes.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Votes et Sondages', 15, yPos);
        yPos += 10;

        const votesData = votes.map((vote: any) => [
          vote.details?.question || 'Sans question',
          vote.details?.themeName || '',
          vote.details?.subThemeName || '',
          new Date(vote.timestamp).toLocaleDateString('fr-FR')
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Question', 'Thème', 'Sous-thème', 'Créé le']],
          body: votesData,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 2 },
          headStyles: { fillColor: [138, 43, 226], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 40 },
            2: { cellWidth: 40 },
            3: { cellWidth: 30 }
          },
          margin: { left: 15, right: 15 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Notes sauvegardées
      if (notes.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes Sauvegardées', 15, yPos);
        yPos += 10;

        const notesData = notes.map((note: any) => [
          note.details?.themeName || '',
          note.details?.subThemeName || '',
          new Date(note.timestamp).toLocaleDateString('fr-FR')
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Thème', 'Sous-thème', 'Date']],
          body: notesData,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 2 },
          headStyles: { fillColor: [52, 168, 83], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 90 },
            2: { cellWidth: 30 }
          },
          margin: { left: 15, right: 15 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Pied de page sur toutes les pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} sur ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
          pageWidth - 15,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      // Sauvegarder le PDF
      const fileName = `Comite_${comite.entite.replace(/\s+/g, '_')}_${new Date(comite.date).toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

      toast.success("PDF généré avec succès !", { position: 'top-center' });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error("Erreur lors de la génération du PDF", { position: 'top-center' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Obtenir les dates des comités
  const comiteDates = comites.map(c => new Date(c.date).toDateString());

  // Générer le calendrier du mois
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Jours vides avant le début du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const hasComiteOnDate = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return comiteDates.includes(date.toDateString());
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'action-created':
      case 'action-updated':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'action-deleted':
        return <CheckCircle className="w-4 h-4 text-red-500" />;
      case 'vote-created':
        return <Vote className="w-4 h-4 text-purple-500" />;
      case 'vote-deleted':
        return <Vote className="w-4 h-4 text-red-500" />;
      case 'sujet-created':
        return <MessageSquarePlus className="w-4 h-4 text-green-500" />;
      case 'sujet-deleted':
        return <MessageSquarePlus className="w-4 h-4 text-red-500" />;
      case 'note-saved':
        return <FileText className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'action-created': return 'Action créée';
      case 'action-updated': return 'Action mise à jour';
      case 'action-deleted': return 'Action supprimée';
      case 'vote-created': return 'Vote créé';
      case 'vote-deleted': return 'Vote supprimé';
      case 'sujet-created': return 'Sujet ajouté';
      case 'sujet-deleted': return 'Sujet supprimé';
      case 'note-saved': return 'Note sauvegardée';
      default: return 'Activité';
    }
  };

  const handleActivityClick = async (activite: any) => {
    setSelectedActivity(activite);
    setShowActivityModal(true);
    setNoteContent(null);
    setVoteResults(activite.details?.options || []);

    // If it's a note, fetch the full content from API
    if (activite.type === 'note-saved' && activite.details?.themeId && activite.details?.subThemeId) {
      try {
        const note = await api.getNote({ themeId: activite.details.themeId, subThemeId: activite.details.subThemeId });
        setNoteContent(note);
      } catch { setNoteContent(null); }
    }

    // If it's a vote, fetch results from API
    if (activite.type.includes('vote') && activite.details?.themeId && activite.details?.subThemeId) {
      try {
        const votes = await api.getVotes({ themeId: activite.details.themeId, subThemeId: activite.details.subThemeId });
        const matchingVote = votes.find((v: any) => v.question === activite.details.question);
        setVoteResults(matchingVote?.options || activite.details.options || []);
      } catch { setVoteResults(activite.details?.options || []); }
    }
  };

  const renderActivityModal = () => {
    if (!selectedActivity) return null;

    const isAction = selectedActivity.type.includes('action');
    const isVote = selectedActivity.type.includes('vote');
    const isNote = selectedActivity.type === 'note-saved';
    const isSujet = selectedActivity.type.includes('sujet');

    // Vote results are loaded via API in handleActivityClick and stored in voteResults state
    const voteOptionsWithResults = voteResults;

    return (
      <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {getActivityIcon(selectedActivity.type)}
              <DialogTitle className="text-xl">
                {getActivityLabel(selectedActivity.type)}
              </DialogTitle>
            </div>
            <DialogDescription>
              {new Date(selectedActivity.timestamp).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-4">
            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Description</h4>
              <p className="text-sm">{selectedActivity.description}</p>
            </div>

            {/* Détails spécifiques aux actions */}
            {isAction && selectedActivity.details && (
              <>
                {selectedActivity.details.title && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Titre de l'action</h4>
                    <p className="text-sm font-medium">{selectedActivity.details.title}</p>
                  </div>
                )}

                {selectedActivity.details.description && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Description détaillée</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedActivity.details.description}</p>
                  </div>
                )}

                {/* Thème et sous-thème mis en évidence */}
                {(selectedActivity.details.themeName || selectedActivity.details.subThemeName) && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/30">
                    <h4 className="text-sm font-semibold mb-3 text-primary">📍 Contexte</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivity.details.themeName && (
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm px-3 py-1">
                          {selectedActivity.details.themeName}
                        </Badge>
                      )}
                      {selectedActivity.details.subThemeName && (
                        <Badge variant="outline" className="border-primary text-primary font-semibold text-sm px-3 py-1">
                          {selectedActivity.details.subThemeName}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {selectedActivity.details.responsables && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Responsables
                    </h4>
                    <p className="text-sm">{selectedActivity.details.responsables}</p>
                  </div>
                )}

                {selectedActivity.details.echeance && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
                      <CalendarClock className="w-4 h-4" />
                      Échéance
                    </h4>
                    <p className="text-sm font-medium">
                      {new Date(selectedActivity.details.echeance).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {selectedActivity.details.statut && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Statut</h4>
                    <Badge 
                      variant={selectedActivity.details.statut === 'en-cours' ? 'default' : 'secondary'}
                      className={selectedActivity.details.statut === 'terminee' ? 'bg-green-500' : selectedActivity.details.statut === 'abandonnee' ? 'bg-red-500' : ''}
                    >
                      {selectedActivity.details.statut === 'en-cours' ? 'En cours' : selectedActivity.details.statut === 'terminee' ? 'Terminée' : 'Abandonnée'}
                    </Badge>
                  </div>
                )}
              </>
            )}

            {/* Détails spécifiques aux votes */}
            {isVote && selectedActivity.details && (
              <>
                {selectedActivity.details.question && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Question du vote</h4>
                    <p className="text-sm font-medium">{selectedActivity.details.question}</p>
                  </div>
                )}

                {/* Thème et sous-thème mis en évidence */}
                {(selectedActivity.details.themeName || selectedActivity.details.subThemeName) && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/30">
                    <h4 className="text-sm font-semibold mb-3 text-primary">📍 Contexte</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivity.details.themeName && (
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm px-3 py-1">
                          {selectedActivity.details.themeName}
                        </Badge>
                      )}
                      {selectedActivity.details.subThemeName && (
                        <Badge variant="outline" className="border-primary text-primary font-semibold text-sm px-3 py-1">
                          {selectedActivity.details.subThemeName}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {voteOptionsWithResults && voteOptionsWithResults.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">📊 Options et résultats du vote</h4>
                    <div className="space-y-3">
                      {voteOptionsWithResults.map((option: any, idx: number) => {
                        const totalVotes = voteOptionsWithResults.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0);
                        const percentage = totalVotes > 0 ? Math.round((option.votes || 0) / totalVotes * 100) : 0;
                        // Gérer différents formats d'options
                        const optionText = typeof option === 'string' 
                          ? option 
                          : (option.option || option.text || option.label || `Option ${idx + 1}`);
                        const voteCount = typeof option === 'string' ? 0 : (option.votes || 0);
                        
                        return (
                          <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border">
                            <div className="mb-3">
                              <p className="text-lg font-bold text-foreground">{optionText}</p>
                            </div>
                            
                            {totalVotes > 0 ? (
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-muted-foreground">Résultat</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-primary">{percentage}%</span>
                                    <Badge variant="secondary" className="font-semibold">
                                      {voteCount} vote{voteCount > 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div 
                                    className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-300 shadow-sm"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-muted-foreground italic">
                                Aucun vote enregistré
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">Total des votes</span>
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-white font-bold">
                          {voteOptionsWithResults.reduce((sum: number, opt: any) => {
                            const votes = typeof opt === 'string' ? 0 : (opt.votes || 0);
                            return sum + votes;
                          }, 0)} vote{voteOptionsWithResults.reduce((sum: number, opt: any) => {
                            const votes = typeof opt === 'string' ? 0 : (opt.votes || 0);
                            return sum + votes;
                          }, 0) > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Détails spécifiques aux notes */}
            {isNote && selectedActivity.details && (
              <>
                {/* Thème et sous-thème mis en évidence */}
                {(selectedActivity.details.themeName || selectedActivity.details.subThemeName) && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/30">
                    <h4 className="text-sm font-semibold mb-3 text-primary">📍 Contexte</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivity.details.themeName && (
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm px-3 py-1">
                          {selectedActivity.details.themeName}
                        </Badge>
                      )}
                      {selectedActivity.details.subThemeName && (
                        <Badge variant="outline" className="border-primary text-primary font-semibold text-sm px-3 py-1">
                          {selectedActivity.details.subThemeName}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {(selectedActivity.details.note || noteContent) && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">📝 Contenu de la note</h4>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      {(() => {
                        // Use noteContent fetched from API
                        const noteData = noteContent;

                        // Si la note est au nouveau format (avec content et attachments)
                        if (noteData && typeof noteData === 'object' && noteData.content) {
                          return (
                            <div className="space-y-4">
                              {/* Contenu HTML de la note */}
                              <div
                                className="prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: noteData.content }}
                              />

                              {/* Pièces jointes */}
                              {noteData.attachments && noteData.attachments.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <Paperclip className="w-4 h-4" />
                                    Fichiers joints ({noteData.attachments.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {noteData.attachments.map((attachment: any) => (
                                      <div
                                        key={attachment.id}
                                        className="flex items-center justify-between p-3 bg-background rounded-md border border-border hover:bg-muted/50 transition-colors"
                                      >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          <Paperclip className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {attachment.size < 1024
                                                ? `${attachment.size} B`
                                                : attachment.size < 1024 * 1024
                                                  ? `${(attachment.size / 1024).toFixed(1)} KB`
                                                  : `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`}
                                            </p>
                                          </div>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            // Télécharger le fichier
                                            const link = document.createElement('a');
                                            link.href = attachment.data;
                                            link.download = attachment.name;
                                            link.click();
                                          }}
                                          className="flex-shrink-0"
                                        >
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Fallback : afficher la note en texte brut (ancien format)
                        return (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {selectedActivity.details.note}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Détails spécifiques aux sujets */}
            {isSujet && selectedActivity.details && (
              <>
                {selectedActivity.details.titre && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Titre du sujet</h4>
                    <p className="text-sm font-medium">{selectedActivity.details.titre}</p>
                  </div>
                )}

                {selectedActivity.details.description && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Description</h4>
                    <div className="p-3 bg-muted/30 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{selectedActivity.details.description}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowActivityModal(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
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
                    <Calendar className="w-5 h-5 text-primary" />
                    Historique des comités
                  </h1>
                  <p className="text-xs text-muted-foreground">Consultez l'historique de tous les comités passés</p>
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

        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {comites.length === 0 ? (
            <Card className="p-12 text-center animate-fade-in">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Aucun comité enregistré</h3>
              <p className="text-muted-foreground mb-6">
                L'historique des comités apparaîtra ici après la sauvegarde du formulaire "Informations comité"
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Liste des comités - 2/3 de la largeur */}
              <div className="lg:col-span-2 space-y-4">
              {comites.map((comite, index) => {
                const isLatest = index === 0; // Le premier comité est le plus récent
                return (
                <Card 
                  key={comite.id}
                  id={`comite-${comite.id}`}
                  className={`animate-fade-in transition-all duration-300 ${isLatest || selectedComiteId === comite.id ? 'border-2 border-primary shadow-xl bg-gradient-to-br from-primary/5 to-secondary/5' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {(isLatest || selectedComiteId === comite.id) && (
                    <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
                  )}
                  <Collapsible open={expandedComites.has(comite.id)} onOpenChange={() => toggleComite(comite.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className={`text-lg ${isLatest ? 'text-primary' : ''}`}>
                              Comité du {new Date(comite.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </CardTitle>
                            {isLatest && (
                              <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
                                Dernier comité
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {comite.activites.length} activité{comite.activites.length > 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><span className="font-medium">Entité :</span> {comite.entite}</p>
                            <p><span className="font-medium">Participants :</span> {comite.participants}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReopenComite(comite);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2 shadow-md"
                            title="Reprendre ce comité pour ajouter des activités"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reprendre
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              generatePDF(comite);
                            }}
                            disabled={isGenerating}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            title="Exporter en PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteComite(comite.id);
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Supprimer ce comité"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {expandedComites.has(comite.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Activités du comité
                          </h4>
                          <div className="space-y-2">
                            {comite.activites.length === 0 ? (
                              <p className="text-sm text-muted-foreground italic">Aucune activité enregistrée</p>
                            ) : (
                              comite.activites.map((activite, idx) => {
                                const getNavigationLink = () => {
                                  if (activite.type === 'action-created' || activite.type === 'action-updated' || activite.type === 'action-deleted') {
                                    return '/theme/suivi-actions';
                                  }
                                  if (activite.type === 'vote-created' || activite.type === 'vote-deleted') {
                                    return activite.details?.themeId && activite.details?.subThemeId 
                                      ? `/theme/${activite.details.themeId}/subtheme/${activite.details.subThemeId}`
                                      : null;
                                  }
                                  if (activite.type === 'sujet-created' || activite.type === 'sujet-deleted') {
                                    return '/autres-sujets';
                                  }
                                  if (activite.type === 'note-saved') {
                                    return activite.details?.themeId && activite.details?.subThemeId
                                      ? `/theme/${activite.details.themeId}/subtheme/${activite.details.subThemeId}`
                                      : null;
                                  }
                                  return null;
                                };

                                const navigationLink = getNavigationLink();

                                return (
                                  <div 
                                    key={idx} 
                                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors group cursor-pointer"
                                    onClick={() => handleActivityClick(activite)}
                                  >
                                    <div className="mt-0.5">
                                      {getActivityIcon(activite.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium">
                                          {getActivityLabel(activite.type)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(activite.timestamp).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {activite.description}
                                      </p>
                                      {activite.details && (
                                        <div className="mt-2 space-y-2">
                                          {/* Thème et sous-thème mis en évidence */}
                                          {(activite.details.themeName || activite.details.subThemeName) && (
                                            <div className="flex flex-wrap gap-2">
                                              {activite.details.themeName && (
                                                <Badge className="bg-gradient-to-r from-primary to-secondary text-white font-semibold">
                                                  {activite.details.themeName}
                                                </Badge>
                                              )}
                                              {activite.details.subThemeName && (
                                                <Badge variant="outline" className="border-primary text-primary font-semibold">
                                                  {activite.details.subThemeName}
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                          
                                          {/* Autres détails */}
                                          <div className="text-xs text-muted-foreground space-y-1">
                                            {activite.details.title && (
                                              <p><span className="font-medium">Titre :</span> {activite.details.title}</p>
                                            )}
                                            {activite.details.echeance && (
                                              <p><span className="font-medium">Échéance :</span> {new Date(activite.details.echeance).toLocaleDateString('fr-FR')}</p>
                                            )}
                                            {activite.details.responsables && (
                                              <p><span className="font-medium">Responsable :</span> {activite.details.responsables}</p>
                                            )}
                                            {activite.details.question && (
                                              <p><span className="font-medium">Question :</span> {activite.details.question}</p>
                                            )}
                                            {activite.details.titre && (
                                              <p><span className="font-medium">Sujet :</span> {activite.details.titre}</p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {navigationLink && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(navigationLink);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
                );
              })}
              </div>

              {/* Calendrier - 1/3 de la largeur */}
              <div className="lg:col-span-1">
                <Card className="sticky top-20 animate-fade-in">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={previousMonth}>
                        <ChevronDown className="w-4 h-4 rotate-90" />
                      </Button>
                      <span>
                        {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </span>
                      <Button variant="ghost" size="sm" onClick={nextMonth}>
                        <ChevronUp className="w-4 h-4 rotate-90" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Jours de la semaine */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs font-semibold text-muted-foreground p-1">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Jours du mois */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendar().map((day, index) => {
                        const hasComite = hasComiteOnDate(day);
                        const comiteOnDay = day ? comites.find(c => {
                          const comiteDate = new Date(c.date);
                          return comiteDate.getDate() === day &&
                                 comiteDate.getMonth() === currentMonth.getMonth() &&
                                 comiteDate.getFullYear() === currentMonth.getFullYear();
                        }) : null;
                        
                        return (
                          <div
                            key={index}
                            onClick={() => {
                              if (comiteOnDay) {
                                setSelectedComiteId(comiteOnDay.id);
                                // Scroll vers la carte du comité
                                setTimeout(() => {
                                  const element = document.getElementById(`comite-${comiteOnDay.id}`);
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }, 100);
                              }
                            }}
                            className={`
                              aspect-square flex items-center justify-center text-sm rounded-md transition-all
                              ${!day ? 'invisible' : ''}
                              ${hasComite 
                                ? 'bg-gradient-to-br from-primary to-secondary text-white font-bold shadow-lg ring-2 ring-primary/30 cursor-pointer hover:scale-110' 
                                : 'hover:bg-muted'
                              }
                              ${day === new Date().getDate() && 
                                currentMonth.getMonth() === new Date().getMonth() && 
                                currentMonth.getFullYear() === new Date().getFullYear() && 
                                !hasComite
                                ? 'border-2 border-primary' 
                                : ''
                              }
                            `}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                    {/* Légende */}
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-secondary"></div>
                        <span className="text-muted-foreground">Jour de comité</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded border-2 border-primary"></div>
                        <span className="text-muted-foreground">Aujourd'hui</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
      {renderActivityModal()}
      <Footer />
    </div>
  );
};

export default HistoriqueComites;
