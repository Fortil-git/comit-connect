import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Download, Calendar, Trash2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { api } from "@/lib/api";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoFortil from "@/img/cropped-Logo-Picto_Degrade.png";

interface ExportHistory {
  id: string;
  comiteId: string;
  comiteDate: string;
  comiteEntite: string;
  exportedAt: string;
  fileName: string;
}

const ExportPDF = () => {
  const navigate = useNavigate();
  const [comites, setComites] = useState<any[]>([]);
  const [selectedComiteId, setSelectedComiteId] = useState<string>("");
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Charger l'historique des comités
    api.getComites().then(data => setComites(data || [])).catch(() => {});

    // Charger l'historique des exports
    api.getExports().then(data => setExportHistory(data || [])).catch(() => {});
  }, []);

  const generatePDF = (comite: any) => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // En-tête avec logo FORTIL et dégradé
      doc.setFillColor(0, 150, 200);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Ajouter le logo FORTIL
      const img = new Image();
      img.src = logoFortil;
      doc.addImage(img, 'PNG', 15, 8, 25, 25);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('FORTIL', 45, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Comités Locaux', 45, 28);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Compte Rendu de Comité', pageWidth - 15, 25, { align: 'right' });

      yPos = 50;

      // Informations du comité avec encadré
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(0, 150, 200);
      doc.rect(15, yPos, pageWidth - 30, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('INFORMATIONS DU COMITE', 18, yPos + 5.5);
      yPos += 12;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const comiteDate = new Date(comite.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const formData = comite.formData || {};
      const infoData = [
        ['Date', comiteDate],
        ['Entite FORTIL', formData.entite || comite.entite || 'Non renseigne'],
        ['Participants', formData.participants || comite.participants || 'Non renseigne'],
        ['Nombre de participants', formData['nombre-participants'] || 'Non renseigne'],
        ['Invites', formData.invites || 'Non renseigne'],
        ['Agence invites', formData['agence-invites'] || 'N/A'],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: infoData,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.1 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 60, textColor: [0, 100, 150] },
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
        ['Notes sauvegardees', notes.length.toString()],
        ['Actions creees', actions.length.toString()],
        ['Votes organises', votes.length.toString()],
        ['Autres sujets', sujets.length.toString()],
        ['Total activites', comite.activites?.length.toString() || '0']
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

      // Actions créées avec détails complets
      if (actions.length > 0) {
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(255, 152, 0);
        doc.rect(15, yPos, pageWidth - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`ACTIONS A MENER (${actions.length})`, 18, yPos + 5.5);
        yPos += 12;

        doc.setTextColor(0, 0, 0);

        // Actions are already in comite.activites, no need to fetch from localStorage
        const allActions: any[] = [];
        
        actions.forEach((action: any, index: number) => {
          if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = 20;
          }

          const actionDetail = allActions.find((a: any) => a.title === action.details?.title);
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 152, 0);
          doc.text(`Action ${index + 1}:`, 15, yPos);
          doc.setTextColor(0, 0, 0);
          doc.text(action.details?.title || 'Sans titre', 40, yPos);
          yPos += 6;

          const actionData = [
            ['Thème', action.details?.themeName || 'Non renseigné'],
            ['Sous-thème', action.details?.subThemeName || 'N/A'],
            ['Description', action.details?.description || 'Aucune description'],
            ['Responsables', action.details?.responsables || 'Non assigné'],
            ['Échéance', action.details?.echeance ? new Date(action.details.echeance).toLocaleDateString('fr-FR') : 'Non définie'],
            ['Statut', actionDetail?.statut === 'en-cours' ? 'En cours' : actionDetail?.statut === 'terminee' ? 'Terminee' : actionDetail?.statut === 'abandonnee' ? 'Abandonnee' : 'En cours'],
            ['Creee le', new Date(action.timestamp).toLocaleDateString('fr-FR') + ' a ' + new Date(action.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })]
          ];

          autoTable(doc, {
            startY: yPos,
            head: [],
            body: actionData,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2, lineColor: [230, 230, 230], lineWidth: 0.1 },
            columnStyles: {
              0: { fontStyle: 'bold', cellWidth: 35, textColor: [100, 100, 100] },
              1: { cellWidth: 'auto' }
            },
            margin: { left: 20, right: 15 }
          });

          yPos = (doc as any).lastAutoTable.finalY + 5;
        });

        yPos += 5;
      }

      // Votes et sondages avec résultats détaillés
      if (votes.length > 0) {
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(138, 43, 226);
        doc.rect(15, yPos, pageWidth - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`VOTES ET SONDAGES (${votes.length})`, 18, yPos + 5.5);
        yPos += 12;

        doc.setTextColor(0, 0, 0);

        votes.forEach((vote: any, index: number) => {
          if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(138, 43, 226);
          doc.text(`Vote ${index + 1}:`, 15, yPos);
          doc.setTextColor(0, 0, 0);
          doc.text(vote.details?.question || 'Sans question', 35, yPos);
          yPos += 6;

          const voteInfo = [
            ['Thème', vote.details?.themeName || 'Non renseigné'],
            ['Sous-thème', vote.details?.subThemeName || 'N/A'],
            ['Participants', vote.details?.totalParticipants?.toString() || 'Non renseigné'],
            ['Cree le', new Date(vote.timestamp).toLocaleDateString('fr-FR') + ' a ' + new Date(vote.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })]
          ];

          autoTable(doc, {
            startY: yPos,
            head: [],
            body: voteInfo,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: {
              0: { fontStyle: 'bold', cellWidth: 35, textColor: [100, 100, 100] },
              1: { cellWidth: 'auto' }
            },
            margin: { left: 20, right: 15 }
          });

          yPos = (doc as any).lastAutoTable.finalY + 4;

          // Résultats du vote
          if (vote.details?.options && vote.details.options.length > 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Resultats:', 20, yPos);
            yPos += 5;

            const resultsData = vote.details.options.map((option: any) => {
              const percentage = vote.details.totalParticipants > 0 
                ? Math.round((option.votes / vote.details.totalParticipants) * 100) 
                : 0;
              return [
                option.text,
                option.votes.toString(),
                `${percentage}%`
              ];
            });

            autoTable(doc, {
              startY: yPos,
              head: [['Option', 'Votes', '%']],
              body: resultsData,
              theme: 'striped',
              styles: { fontSize: 8, cellPadding: 2 },
              headStyles: { fillColor: [138, 43, 226], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
              columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
                2: { cellWidth: 20, halign: 'center', textColor: [138, 43, 226], fontStyle: 'bold' }
              },
              margin: { left: 25, right: 15 }
            });

            yPos = (doc as any).lastAutoTable.finalY + 5;
          }
        });

        yPos += 5;
      }

      // Notes sauvegardées avec détails enrichis (HTML + images + fichiers)
      if (notes.length > 0) {
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(52, 168, 83);
        doc.rect(15, yPos, pageWidth - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`NOTES SAUVEGARDEES (${notes.length})`, 18, yPos + 5.5);
        yPos += 12;

        doc.setTextColor(0, 0, 0);

        // Notes are already captured in comite.activites with type 'note-saved'
        // Use the activity details directly for the PDF
        const allNotes = notes.map((note: any) => ({
          themeId: note.details?.themeId,
          subThemeId: note.details?.subThemeId,
          content: note.details?.note || '',
          attachments: []
        }));

        allNotes.forEach((note: any, index: number) => {
          if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(52, 168, 83);
          doc.text(`Note ${index + 1}:`, 15, yPos);
          yPos += 6;

          // Convertir le HTML en texte simple pour le PDF
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = note.content;
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          
          if (textContent.trim()) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            
            // Découper le texte en lignes
            const lines = doc.splitTextToSize(textContent, pageWidth - 40);
            lines.forEach((line: string) => {
              if (yPos > pageHeight - 20) {
                doc.addPage();
                yPos = 20;
              }
              doc.text(line, 20, yPos);
              yPos += 5;
            });
          }

          // Extraire et ajouter les images du contenu HTML
          const imgTags = tempDiv.getElementsByTagName('img');
          for (let i = 0; i < imgTags.length; i++) {
            const imgSrc = imgTags[i].src;
            if (imgSrc && imgSrc.startsWith('data:image')) {
              if (yPos > pageHeight - 80) {
                doc.addPage();
                yPos = 20;
              }
              
              try {
                // Ajouter l'image au PDF
                const imgWidth = 160;
                const imgHeight = 100;
                doc.addImage(imgSrc, 'JPEG', 25, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 10;
              } catch (error) {
                console.error('Erreur ajout image:', error);
              }
            }
          }

          // Ajouter les fichiers joints
          if (note.attachments && note.attachments.length > 0) {
            if (yPos > pageHeight - 40) {
              doc.addPage();
              yPos = 20;
            }

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 100, 100);
            doc.text(`Fichiers joints (${note.attachments.length}):`, 20, yPos);
            yPos += 5;

            note.attachments.forEach((attachment: any) => {
              if (yPos > pageHeight - 20) {
                doc.addPage();
                yPos = 20;
              }
              
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8);
              const fileSize = attachment.size < 1024 
                ? `${attachment.size} B` 
                : attachment.size < 1024 * 1024 
                  ? `${(attachment.size / 1024).toFixed(1)} KB`
                  : `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`;
              
              doc.text(`- ${attachment.name} (${fileSize})`, 25, yPos);
              yPos += 4;
            });
          }

          yPos += 8;
        });

        yPos += 5;
      }

      // Autres sujets abordés
      if (sujets.length > 0) {
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(156, 39, 176);
        doc.rect(15, yPos, pageWidth - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`AUTRES SUJETS ABORDES (${sujets.length})`, 18, yPos + 5.5);
        yPos += 12;

        doc.setTextColor(0, 0, 0);

        sujets.forEach((sujet: any, index: number) => {
          if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(156, 39, 176);
          doc.text(`Sujet ${index + 1}:`, 15, yPos);
          doc.setTextColor(0, 0, 0);
          doc.text(sujet.details?.titre || 'Sans titre', 38, yPos);
          yPos += 6;

          const sujetData = [
            ['Description', sujet.details?.description || 'Aucune description'],
            ['Cree le', new Date(sujet.timestamp).toLocaleDateString('fr-FR') + ' a ' + new Date(sujet.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })]
          ];

          autoTable(doc, {
            startY: yPos,
            head: [],
            body: sujetData,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2, lineColor: [230, 230, 230], lineWidth: 0.1 },
            columnStyles: {
              0: { fontStyle: 'bold', cellWidth: 35, textColor: [100, 100, 100] },
              1: { cellWidth: 'auto' }
            },
            margin: { left: 20, right: 15 }
          });

          yPos = (doc as any).lastAutoTable.finalY + 5;
        });

        yPos += 5;
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
          `Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`,
          pageWidth - 15,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      // Sauvegarder le PDF
      const fileName = `Comite_${comite.entite.replace(/\s+/g, '_')}_${new Date(comite.date).toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

      // Enregistrer dans l'historique des exports via API
      const exportData = {
        comiteId: comite.id,
        comiteDate: comite.date,
        comiteEntite: comite.entite,
        fileName: fileName,
      };
      api.createExport(exportData).then(newExport => {
        setExportHistory(prev => [newExport, ...prev]);
      }).catch(() => {});

      toast.success("PDF généré avec succès !", { position: 'top-center' });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error("Erreur lors de la génération du PDF", { position: 'top-center' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (!selectedComiteId) {
      toast.error("Veuillez sélectionner un comité", { position: 'top-center' });
      return;
    }

    const comite = comites.find(c => c.id === selectedComiteId);
    if (comite) {
      generatePDF(comite);
    }
  };

  const handleReExport = (exportItem: ExportHistory) => {
    const comite = comites.find(c => c.id === exportItem.comiteId);
    if (comite) {
      generatePDF(comite);
    }
  };

  const handleDeleteExport = async (id: string) => {
    try {
      await api.deleteExport(id);
      setExportHistory(prev => prev.filter(e => e.id !== id));
      toast.success("Export supprimé de l'historique", { position: 'top-center' });
    } catch {
      toast.error("Erreur", { position: 'top-center' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <img src={logoFortil} alt="" className="logoBG" />

      <div className="pb-20">
        {/* Header */}
        <header className="gradientBg sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Export PDF
                </h1>
                <p className="text-xs text-muted-foreground">
                  Générer des comptes rendus de comités
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Section de génération */}
          <Card className="mb-8 shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Générer un nouveau compte rendu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sélectionner un comité</Label>
                <Select value={selectedComiteId} onValueChange={setSelectedComiteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez un comité..." />
                  </SelectTrigger>
                  <SelectContent>
                    {comites.map((comite) => (
                      <SelectItem key={comite.id} value={comite.id}>
                        {new Date(comite.date).toLocaleDateString('fr-FR')} - {comite.entite} ({comite.activites?.length || 0} activités)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleExport}
                disabled={!selectedComiteId || isGenerating}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Génération en cours...' : 'Générer le PDF'}
              </Button>
            </CardContent>
          </Card>

          {/* Historique des exports */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Historique des exports ({exportHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exportHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Aucun export réalisé pour le moment.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Générez votre premier compte rendu ci-dessus.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exportHistory.map((exportItem) => (
                    <Card key={exportItem.id} className="border-border/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-primary" />
                              <span className="font-medium">{exportItem.fileName}</span>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>
                                📅 Comité du {new Date(exportItem.comiteDate).toLocaleDateString('fr-FR')} - {exportItem.comiteEntite}
                              </p>
                              <p>
                                🕒 Exporté le {new Date(exportItem.exportedAt).toLocaleDateString('fr-FR')} à{' '}
                                {new Date(exportItem.exportedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReExport(exportItem)}
                              disabled={isGenerating}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Régénérer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteExport(exportItem.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ExportPDF;
