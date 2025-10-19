import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { deleteImage, listGallery, me, updateCaption, uploadImage, type GalleryItem, login, logout, listAppointments, updateAppointmentStatus, type Appointment } from '@/lib/api';

export default function Admin() {
  const qc = useQueryClient();

  const { data: auth, isLoading: meLoading } = useQuery({
    queryKey: ['me'],
    queryFn: me,
  });

  if (meLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;
  }

  if (!auth?.authenticated) {
    return <LoginView onLoggedIn={() => { toast.success('Connexion réussie'); qc.invalidateQueries({ queryKey: ['me'] }); }} />;
  }

  return <Dashboard onLoggedOut={async () => { await logout(); qc.invalidateQueries({ queryKey: ['me'] }); toast.success('Déconnecté'); }} />;
}

function LoginView({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      onLoggedIn();
    } catch {
      toast.error('Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero hero-glow p-4">
      <Card className="max-h-screen max-w-sm w-full">
        <CardHeader>
          <CardTitle>Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Dashboard({ onLoggedOut }: { onLoggedOut: () => void }) {
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['gallery'],
    queryFn: listGallery,
  });

  const uploadMut = useMutation({
    mutationFn: async (payload: { file: File; caption_fr: string; title_fr?: string }) => {
      if (payload.file.size > 10 * 1024 * 1024) throw new Error('Fichier trop volumineux (>10MB)');
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(payload.file.type)) throw new Error('Types autorisés: JPG/PNG/WebP');
      return uploadImage(payload.file, payload.caption_fr, payload.title_fr);
    },
    onSuccess: () => {
      toast.success('Image téléchargée');
      qc.invalidateQueries({ queryKey: ['gallery'] });
      setFile(null);
      setCaptionFr('');
      setTitleFr('');
    },
    onError: (e: Error) => toast.error(e?.message || 'Échec du téléchargement'),
  });

  const updateMut = useMutation({
    mutationFn: ({ public_id, caption_fr, title_fr }: { public_id: string; caption_fr: string; title_fr?: string }) => updateCaption(public_id, caption_fr, title_fr),
    onSuccess: () => {
      toast.success('Légende mise à jour');
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
    onError: () => toast.error('Échec de mise à jour'),
  });

  const deleteMut = useMutation({
    mutationFn: ({ public_id }: { public_id: string }) => deleteImage(public_id),
    onSuccess: () => {
      toast.success('Image supprimée');
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
    onError: () => toast.error('Échec de suppression'),
  });

  const [file, setFile] = useState<File | null>(null);
  const [titleFr, setTitleFr] = useState('');
  const [captionFr, setCaptionFr] = useState('');

  return (
    <div className="min-h-screen bg-gradient-hero hero-glow p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Tableau de bord — Galerie</h1>
          <div className="space-x-2">
            <Button variant="default" onClick={() => qc.invalidateQueries({ queryKey: ['gallery'] })}>Rafraîchir</Button>
            <Button variant="destructive" onClick={onLoggedOut}>Se déconnecter</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ajouter une image</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-4 items-end" onSubmit={(e) => { e.preventDefault(); if (file) uploadMut.mutate({ file, caption_fr: captionFr, title_fr: titleFr }); }}>
              <div className="space-y-2 md:col-span-2">
                <Label>Fichier (JPG/PNG/WebP, max 10MB)</Label>
                <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-2">
                <Label>Titre (FR)</Label>
                <Input value={titleFr} onChange={(e) => setTitleFr(e.target.value)} placeholder="Ex: Blanchiment dentaire" />
              </div>
              <div className="space-y-2">
                <Label>Légende (FR)</Label>
                <Input value={captionFr} onChange={(e) => setCaptionFr(e.target.value)} placeholder="Ex: Cas clinique blanchiment" />
              </div>
              <div>
                <Button type="submit" disabled={!file || uploadMut.isPending}>{uploadMut.isPending ? 'Téléchargement…' : 'Téléverser'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            {listQuery.isLoading ? (
              <p>Chargement…</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {listQuery.data?.items?.map((item) => (
                  <GalleryCard key={item.public_id} item={item} onSave={(title, caption) => updateMut.mutate({ public_id: item.public_id, title_fr: title, caption_fr: caption })} onDelete={() => deleteMut.mutate({ public_id: item.public_id })} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AppointmentsCard />
      </div>
    </div>
  );
}

function GalleryCard({ item, onSave, onDelete }: { item: GalleryItem; onSave: (title: string, caption: string) => void; onDelete: () => void; }) {
  const [title, setTitle] = useState(item.title_fr || '');
  const [caption, setCaption] = useState(item.caption_fr || '');
  const dirty = title !== (item.title_fr || '') || caption !== (item.caption_fr || '');

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <img src={item.secure_url} alt={title || caption || item.public_id} className="w-full aspect-video object-cover" />
      <div className="p-3 space-y-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre (FR)" />
        <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Légende (FR)" />
        <div className="text-xs text-gray-500">Référence: {item.public_id}</div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(title, caption)} disabled={!dirty}>Sauvegarder</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>Supprimer</Button>
        </div>
      </div>
    </div>
  );
}

function AppointmentsCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['appointments'], queryFn: listAppointments });
  const mut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'PENDING' | 'DONE' }) => updateAppointmentStatus(id, status),
    onSuccess: () => { toast.success('Statut mis à jour'); qc.invalidateQueries({ queryKey: ['appointments'] }); },
    onError: () => toast.error('Échec de mise à jour'),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rendez-vous</CardTitle>
          <Button variant="default" onClick={() => { window.open('/api/appointments/export', '_blank'); }}>Télécharger Excel</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Chargement…</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="p-2">Date</th>
                  <th className="p-2">Nom</th>
                  <th className="p-2">Naissance</th>
                  <th className="p-2">RDV</th>
                  <th className="p-2">1ère fois</th>
                  <th className="p-2">Téléphone</th>
                  <th className="p-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.map((a: Appointment) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2 whitespace-nowrap">{new Date(a.createdAt).toLocaleString('fr-FR')}</td>
                    <td className="p-2 whitespace-nowrap">{a.lastName} {a.firstName}</td>
                    <td className="p-2 whitespace-nowrap">{a.birthDate?.slice(0,10)}</td>
                    <td className="p-2 whitespace-nowrap">{a.appointmentDate?.slice(0,10)}</td>
                    <td className="p-2 whitespace-nowrap">{a.firstTime ? 'Oui' : 'Non'}</td>
                    <td className="p-2 whitespace-nowrap">{a.phone}</td>
                    <td className="p-2 whitespace-nowrap">
                      <select
                        className="border rounded p-1 bg-secondary text-white"
                        value={a.status}
                        onChange={(e) => mut.mutate({ id: a.id, status: e.target.value as 'PENDING' | 'DONE' })}
                      >
                        <option value="PENDING">En attente</option>
                        <option value="DONE">Fait</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
