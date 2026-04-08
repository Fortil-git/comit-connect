import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Pencil, Trash2, Star, Layers } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useThemeData } from "@/contexts/ThemeDataContext";

const ICONS = [
  { value: 'info', label: 'Info' },
  { value: 'settings', label: 'Settings' },
  { value: 'trending-up', label: 'Trending Up' },
  { value: 'users', label: 'Users' },
  { value: 'shield', label: 'Shield' },
  { value: 'heart', label: 'Heart' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'star', label: 'Star' },
  { value: 'zap', label: 'Zap' },
  { value: 'globe', label: 'Globe' },
];

const COLORS = [
  { value: 'from-blue-500 to-cyan-500', label: 'Bleu' },
  { value: 'from-indigo-500 to-blue-500', label: 'Indigo' },
  { value: 'from-emerald-500 to-teal-500', label: 'Émeraude' },
  { value: 'from-violet-500 to-purple-500', label: 'Violet' },
  { value: 'from-orange-500 to-amber-500', label: 'Orange' },
  { value: 'from-rose-500 to-pink-500', label: 'Rose' },
  { value: 'from-cyan-500 to-blue-500', label: 'Cyan' },
  { value: 'from-green-500 to-emerald-500', label: 'Vert' },
  { value: 'from-red-500 to-orange-500', label: 'Rouge' },
  { value: 'from-gray-500 to-gray-600', label: 'Gris' },
];

const SUB_THEME_TYPES = [
  { value: 'text', label: 'Texte' },
  { value: 'checkbox', label: 'Cases à cocher' },
  { value: 'select', label: 'Liste déroulante' },
  { value: 'number', label: 'Nombre' },
  { value: 'date', label: 'Date' },
  { value: 'counter', label: 'Compteur' },
  { value: 'radio', label: 'Boutons radio' },
];

const emptyForm = {
  id: '', title: '', description: '', icon: 'info', color: 'from-blue-500 to-cyan-500', important: false,
};

const emptySubThemeForm = {
  id: '', title: '', type: 'text', options: '', placeholder: '', max: '', order: '0',
};

const AdminThemes = () => {
  const { refetch } = useThemeData();
  const [themes, setThemes] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  const [deletingTheme, setDeletingTheme] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Sub-theme state
  const [stDialogOpen, setStDialogOpen] = useState(false);
  const [stDeleteDialogOpen, setStDeleteDialogOpen] = useState(false);
  const [editingSubTheme, setEditingSubTheme] = useState<any>(null);
  const [deletingSubTheme, setDeletingSubTheme] = useState<{ themeId: string; subTheme: any } | null>(null);
  const [stParentThemeId, setStParentThemeId] = useState<string>('');
  const [stForm, setStForm] = useState(emptySubThemeForm);
  const [stSaving, setStSaving] = useState(false);

  const loadThemes = async () => {
    const data = await api.adminGetThemes();
    setThemes(data);
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // === Theme handlers ===

  const openCreate = () => {
    setEditingTheme(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (theme: any) => {
    setEditingTheme(theme);
    setForm({
      id: theme.id,
      title: theme.title,
      description: theme.description,
      icon: theme.icon,
      color: theme.color,
      important: theme.important,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) {
      toast.error("Le titre est requis");
      return;
    }
    setSaving(true);
    try {
      if (editingTheme) {
        await api.adminUpdateTheme(editingTheme.id, {
          title: form.title,
          description: form.description,
          icon: form.icon,
          color: form.color,
          important: form.important,
        });
        toast.success("Thème modifié", { position: 'top-center' });
      } else {
        const id = form.id || generateSlug(form.title);
        await api.adminCreateTheme({
          id,
          title: form.title,
          description: form.description,
          icon: form.icon,
          color: form.color,
          important: form.important,
        });
        toast.success("Thème créé", { position: 'top-center' });
      }
      setDialogOpen(false);
      loadThemes();
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTheme) return;
    try {
      await api.adminDeleteTheme(deletingTheme.id);
      toast.success("Thème supprimé", { position: 'top-center' });
      setDeleteDialogOpen(false);
      setDeletingTheme(null);
      loadThemes();
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  // === Sub-theme handlers ===

  const openCreateSubTheme = (themeId: string) => {
    setEditingSubTheme(null);
    setStParentThemeId(themeId);
    setStForm(emptySubThemeForm);
    setStDialogOpen(true);
  };

  const openEditSubTheme = (themeId: string, st: any) => {
    setEditingSubTheme(st);
    setStParentThemeId(themeId);
    setStForm({
      id: st.id,
      title: st.title,
      type: st.type,
      options: (st.options || []).join(', '),
      placeholder: st.placeholder || '',
      max: st.max != null ? String(st.max) : '',
      order: String(st.order ?? 0),
    });
    setStDialogOpen(true);
  };

  const handleSaveSubTheme = async () => {
    if (!stForm.title || !stForm.type) {
      toast.error("Titre et type requis");
      return;
    }
    setStSaving(true);
    try {
      const payload: any = {
        title: stForm.title,
        type: stForm.type,
        order: parseInt(stForm.order) || 0,
      };

      // Options for select, checkbox, radio types
      if (['select', 'checkbox', 'radio'].includes(stForm.type) && stForm.options.trim()) {
        payload.options = stForm.options.split(',').map((o: string) => o.trim()).filter(Boolean);
      } else {
        payload.options = [];
      }

      // Placeholder for text type
      if (stForm.type === 'text' && stForm.placeholder.trim()) {
        payload.placeholder = stForm.placeholder;
      } else {
        payload.placeholder = null;
      }

      // Max for counter/number types
      if (['counter', 'number'].includes(stForm.type) && stForm.max.trim()) {
        payload.max = parseInt(stForm.max);
      } else {
        payload.max = null;
      }

      if (editingSubTheme) {
        await api.adminUpdateSubTheme(stParentThemeId, editingSubTheme.id, payload);
        toast.success("Sous-thème modifié", { position: 'top-center' });
      } else {
        const id = stForm.id || generateSlug(stForm.title);
        await api.adminCreateSubTheme(stParentThemeId, { ...payload, id });
        toast.success("Sous-thème créé", { position: 'top-center' });
      }
      setStDialogOpen(false);
      loadThemes();
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setStSaving(false);
    }
  };

  const handleDeleteSubTheme = async () => {
    if (!deletingSubTheme) return;
    try {
      await api.adminDeleteSubTheme(deletingSubTheme.themeId, deletingSubTheme.subTheme.id);
      toast.success("Sous-thème supprimé", { position: 'top-center' });
      setStDeleteDialogOpen(false);
      setDeletingSubTheme(null);
      loadThemes();
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {themes.length} thème{themes.length > 1 ? 's' : ''} configuré{themes.length > 1 ? 's' : ''}
        </p>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter un thème
        </Button>
      </div>

      {/* Theme List */}
      <Accordion type="multiple" className="space-y-2">
        {themes.map((theme) => (
          <AccordionItem key={theme.id} value={theme.id} className="border rounded-lg overflow-hidden">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 p-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.color}`}>
                    <Layers className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{theme.title}</h3>
                      {theme.important && (
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{theme.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {theme.subThemes?.length || 0} sous-thèmes
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEdit(theme); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setDeletingTheme(theme); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                  <AccordionTrigger className="p-0 hover:no-underline [&>svg]:h-4 [&>svg]:w-4" />
                </div>
                <AccordionContent className="px-4 pb-4 pt-0">
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">Sous-thèmes</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => openCreateSubTheme(theme.id)}
                      >
                        <Plus className="h-3 w-3" /> Ajouter
                      </Button>
                    </div>
                    {theme.subThemes?.length > 0 ? (
                      <div className="space-y-1">
                        {theme.subThemes.map((st: any) => (
                          <div key={st.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm">{st.title}</span>
                              <Badge variant="outline" className="text-[10px]">{st.type}</Badge>
                              {st.options?.length > 0 && (
                                <span className="text-[10px] text-muted-foreground">
                                  ({st.options.length} options)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditSubTheme(theme.id, st)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setDeletingSubTheme({ themeId: theme.id, subTheme: st });
                                  setStDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun sous-thème</p>
                    )}
                  </div>
                </AccordionContent>
              </CardContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      {themes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun thème configuré
        </div>
      )}

      {/* Theme Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTheme ? 'Modifier le thème' : 'Nouveau thème'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingTheme && (
              <div className="space-y-1">
                <Label>Identifiant (slug)</Label>
                <Input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="Auto-généré depuis le titre"
                />
                <p className="text-[10px] text-muted-foreground">Laissez vide pour auto-générer</p>
              </div>
            )}
            <div className="space-y-1">
              <Label>Titre</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Performance Économique"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Courte description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Icône</Label>
                <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICONS.map(i => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Couleur</Label>
                <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLORS.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${c.value}`} />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.important}
                onCheckedChange={(checked) => setForm({ ...form, important: checked })}
              />
              <Label>Thème important (affiché en priorité)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : editingTheme ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Theme Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le thème ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deletingTheme?.title}</strong> et tous ses sous-thèmes ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sub-theme Create/Edit Dialog */}
      <Dialog open={stDialogOpen} onOpenChange={setStDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubTheme ? 'Modifier le sous-thème' : 'Nouveau sous-thème'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingSubTheme && (
              <div className="space-y-1">
                <Label>Identifiant (slug)</Label>
                <Input
                  value={stForm.id}
                  onChange={(e) => setStForm({ ...stForm, id: e.target.value })}
                  placeholder="Auto-généré depuis le titre"
                />
                <p className="text-[10px] text-muted-foreground">Laissez vide pour auto-générer</p>
              </div>
            )}
            <div className="space-y-1">
              <Label>Titre</Label>
              <Input
                value={stForm.title}
                onChange={(e) => setStForm({ ...stForm, title: e.target.value })}
                placeholder="Ex: Chiffre d'affaires"
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={stForm.type} onValueChange={(v) => setStForm({ ...stForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUB_THEME_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {['select', 'checkbox', 'radio'].includes(stForm.type) && (
              <div className="space-y-1">
                <Label>Options</Label>
                <Input
                  value={stForm.options}
                  onChange={(e) => setStForm({ ...stForm, options: e.target.value })}
                  placeholder="Option 1, Option 2, Option 3"
                />
                <p className="text-[10px] text-muted-foreground">Séparez les options par des virgules</p>
              </div>
            )}
            {stForm.type === 'text' && (
              <div className="space-y-1">
                <Label>Placeholder</Label>
                <Input
                  value={stForm.placeholder}
                  onChange={(e) => setStForm({ ...stForm, placeholder: e.target.value })}
                  placeholder="Texte d'indication"
                />
              </div>
            )}
            {['counter', 'number'].includes(stForm.type) && (
              <div className="space-y-1">
                <Label>Valeur maximale</Label>
                <Input
                  type="number"
                  value={stForm.max}
                  onChange={(e) => setStForm({ ...stForm, max: e.target.value })}
                  placeholder="Ex: 100"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>Ordre d'affichage</Label>
              <Input
                type="number"
                value={stForm.order}
                onChange={(e) => setStForm({ ...stForm, order: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveSubTheme} disabled={stSaving}>
              {stSaving ? 'Enregistrement...' : editingSubTheme ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sub-theme Delete Confirmation */}
      <AlertDialog open={stDeleteDialogOpen} onOpenChange={setStDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le sous-thème ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deletingSubTheme?.subTheme?.title}</strong> ? Les notes, votes et actions associés ne seront plus liés à ce sous-thème.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubTheme} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminThemes;
