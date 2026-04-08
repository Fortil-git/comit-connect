import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-red-500' },
  { value: 'ADMIN', label: 'Admin', color: 'bg-orange-500' },
  { value: 'MEMBRE_PERMANENT', label: 'Membre Permanent', color: 'bg-blue-500' },
  { value: 'UTILISATEUR', label: 'Utilisateur', color: 'bg-gray-500' },
];

const emptyForm = {
  firstName: '', lastName: '', email: '', jobTitle: '', userRole: 'UTILISATEUR', agencyId: '', password: '',
};

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    const filters: any = {};
    if (search) filters.search = search;
    if (roleFilter !== 'all') filters.role = roleFilter;
    if (agencyFilter !== 'all') filters.agencyId = agencyFilter;
    const data = await api.adminGetUsers(filters);
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
    api.getAgencies().then(setAgencies).catch(() => {});
  }, []);

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, agencyFilter]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || '',
      jobTitle: user.jobTitle || '',
      userRole: user.userRole,
      agencyId: user.agencyId || '',
      password: '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("Prénom, nom et email requis");
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const data: any = { ...form };
        if (!data.password) delete data.password;
        await api.adminUpdateUser(editingUser.id, data);
        toast.success("Utilisateur modifié", { position: 'top-center' });
      } else {
        await api.adminCreateUser({ ...form, password: form.password || 'password' });
        toast.success("Utilisateur créé", { position: 'top-center' });
      }
      setDialogOpen(false);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      await api.adminToggleUserActive(user.id);
      toast.success(user.isActive ? "Utilisateur désactivé" : "Utilisateur activé", { position: 'top-center' });
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await api.adminDeleteUser(deletingUser.id);
      toast.success("Utilisateur supprimé", { position: 'top-center' });
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  const getRoleBadge = (role: string) => {
    const r = ROLES.find(r => r.value === role);
    return <Badge className={`${r?.color || 'bg-gray-500'} text-white text-[10px]`}>{r?.label || role}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {ROLES.map(r => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={agencyFilter} onValueChange={setAgencyFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Agence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les agences</SelectItem>
            {agencies.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{users.length} utilisateur{users.length > 1 ? 's' : ''}</span>
        <span>{users.filter(u => u.isActive).length} actif{users.filter(u => u.isActive).length > 1 ? 's' : ''}</span>
        <span>{users.filter(u => !u.isActive).length} désactivé{users.filter(u => !u.isActive).length > 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Agence</TableHead>
              <TableHead className="text-center">Actif</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id} className={!user.isActive ? 'opacity-50' : ''}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-sm">{user.jobTitle || '-'}</TableCell>
                <TableCell>{getRoleBadge(user.userRole)}</TableCell>
                <TableCell className="text-sm">{user.agency?.city || '-'}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {user.isActive ? (
                      <UserCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <UserX className="h-4 w-4 text-red-500" />
                    )}
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => handleToggleActive(user)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setDeletingUser(user); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Prénom</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Nom</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Poste</Label>
              <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="Ex: Développeur, Manager..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Rôle</Label>
                <Select value={form.userRole} onValueChange={(v) => setForm({ ...form, userRole: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Agence</Label>
                <Select value={form.agencyId} onValueChange={(v) => setForm({ ...form, agencyId: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {agencies.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>{editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingUser ? '••••••••' : 'password'} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : editingUser ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deletingUser?.fullName}</strong> ? Cette action est irréversible.
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
    </div>
  );
};

export default AdminUsers;
