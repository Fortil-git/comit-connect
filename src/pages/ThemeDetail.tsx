import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Save, Download } from "lucide-react";
import { themes } from "@/data/themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ThemeDetail = () => {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Record<string, any>>({});

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
    }

    // Load saved notes
    const savedNotes = localStorage.getItem(`notes-${themeId}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, [navigate, themeId]);

  const theme = themes.find((t) => t.id === themeId);

  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Thème non trouvé</p>
      </div>
    );
  }

  const handleSave = () => {
    localStorage.setItem(`notes-${themeId}`, JSON.stringify(notes));
    toast.success("Notes sauvegardées avec succès !");
  };

  const handleExport = () => {
    const data = {
      theme: theme.title,
      date: new Date().toLocaleDateString('fr-FR'),
      notes: notes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comite-${theme.id}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Export réussi !");
  };

  const updateNote = (subThemeId: string, value: any) => {
    setNotes((prev) => ({
      ...prev,
      [subThemeId]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{theme.title}</h1>
              <p className="text-sm text-muted-foreground">{theme.description}</p>
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

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {theme.subThemes.map((subTheme, index) => (
            <Card
              key={subTheme.id}
              className="animate-fade-in shadow-card hover:shadow-elevated transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {subTheme.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subTheme.type === 'text' && (
                  <Textarea
                    placeholder="Saisissez vos notes ici..."
                    value={notes[subTheme.id] || ''}
                    onChange={(e) => updateNote(subTheme.id, e.target.value)}
                    className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                )}

                {subTheme.type === 'number' && (
                  <Input
                    type="number"
                    placeholder="0"
                    value={notes[subTheme.id] || ''}
                    onChange={(e) => updateNote(subTheme.id, e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                )}

                {subTheme.type === 'select' && subTheme.options && (
                  <Select
                    value={notes[subTheme.id] || ''}
                    onValueChange={(value) => updateNote(subTheme.id, value)}
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
                )}

                {subTheme.type === 'checkbox' && subTheme.options && (
                  <div className="space-y-3">
                    {subTheme.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${subTheme.id}-${option}`}
                          checked={(notes[subTheme.id] || []).includes(option)}
                          onCheckedChange={(checked) => {
                            const currentValues = notes[subTheme.id] || [];
                            const newValues = checked
                              ? [...currentValues, option]
                              : currentValues.filter((v: string) => v !== option);
                            updateNote(subTheme.id, newValues);
                          }}
                          className="transition-all duration-200"
                        />
                        <Label
                          htmlFor={`${subTheme.id}-${option}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ThemeDetail;
