import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Download } from "lucide-react";
import { themes } from "@/data/themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SubThemeDetail = () => {
  const { themeId, subThemeId } = useParams();
  const navigate = useNavigate();
  const [noteValue, setNoteValue] = useState<any>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
    }

    // Load saved note
    const savedNotes = localStorage.getItem(`notes-${themeId}`);
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);
      setNoteValue(notes[subThemeId!] || (subTheme?.type === 'checkbox' ? [] : ''));
    } else {
      setNoteValue(subTheme?.type === 'checkbox' ? [] : '');
    }
  }, [navigate, themeId, subThemeId]);

  const theme = themes.find((t) => t.id === themeId);
  const subTheme = theme?.subThemes.find((st) => st.id === subThemeId);

  if (!theme || !subTheme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Sous-thème non trouvé</p>
      </div>
    );
  }

  const handleSave = () => {
    const savedNotes = localStorage.getItem(`notes-${themeId}`);
    const notes = savedNotes ? JSON.parse(savedNotes) : {};
    notes[subThemeId!] = noteValue;
    localStorage.setItem(`notes-${themeId}`, JSON.stringify(notes));
    toast.success("Note sauvegardée avec succès !");
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
    toast.success("Export réussi !");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/theme/${themeId}`)}
            className="hover:bg-muted mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux sous-thèmes
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{subTheme.title}</h1>
              <p className="text-sm text-muted-foreground">{theme.title}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-secondary">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="animate-fade-in shadow-elevated">
          <CardHeader>
            <CardTitle>Prise de notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subTheme.type === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="note">Vos notes</Label>
                <Textarea
                  id="note"
                  placeholder="Saisissez vos notes ici..."
                  value={noteValue || ''}
                  onChange={(e) => setNoteValue(e.target.value)}
                  className="min-h-[300px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {subTheme.type === 'number' && (
              <div className="space-y-2">
                <Label htmlFor="note">Valeur</Label>
                <Input
                  id="note"
                  type="number"
                  placeholder="0"
                  value={noteValue || ''}
                  onChange={(e) => setNoteValue(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {subTheme.type === 'select' && subTheme.options && (
              <div className="space-y-2">
                <Label>Sélection</Label>
                <Select
                  value={noteValue || ''}
                  onValueChange={(value) => setNoteValue(value)}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
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

            <div className="pt-4 flex gap-2">
              <Button 
                onClick={handleSave} 
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder la note
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SubThemeDetail;
