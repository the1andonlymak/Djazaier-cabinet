export type GalleryItem = {
  public_id: string;
  secure_url: string;
  title_fr?: string;
  caption_fr: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  created_at?: string;
};

const base = process.env.NEXT_PUBLIC_API_BASE || '';

export async function login(email: string, password: string) {
  const res = await fetch(base + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function logout() {
  const res = await fetch(base + '/api/logout', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

export async function me() {
  const res = await fetch(base + '/api/me', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to check auth');
  return res.json() as Promise<{ authenticated: boolean }>;
}

export async function listGallery() {
  const res = await fetch(base + '/api/gallery', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to list images');
  return res.json() as Promise<{ items: GalleryItem[] }>;
}

export async function uploadImage(file: File, caption_fr: string, title_fr?: string) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('caption_fr', caption_fr);
  if (title_fr) fd.append('title_fr', title_fr);
  const res = await fetch(base + '/api/gallery', {
    method: 'POST',
    credentials: 'include',
    body: fd,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function updateCaption(public_id: string, caption_fr: string, title_fr?: string) {
  const body: any = { public_id, caption_fr };
  if (typeof title_fr === 'string') body.title_fr = title_fr;
  const res = await fetch(base + '/api/gallery', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
}

export async function deleteImage(public_id: string) {
  const res = await fetch(base + '/api/gallery', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ public_id }),
  });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export type Appointment = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  appointmentDate: string;
  firstTime: boolean;
  phone: string;
  status: 'PENDING' | 'DONE';
  createdAt: string;
};

export async function createAppointment(payload: {
  firstName: string;
  lastName: string;
  birthDate: string; // yyyy-mm-dd
  appointmentDate: string; // yyyy-mm-dd
  firstTime: 'oui' | 'non' | boolean;
  phone: string;
}) {
  const res = await fetch(base + '/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create appointment');
  return res.json();
}

export async function listAppointments() {
  const res = await fetch(base + '/api/appointments', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to list appointments');
  return res.json() as Promise<{ items: Appointment[] }>;
}

export async function updateAppointmentStatus(id: number, status: 'PENDING' | 'DONE') {
  const res = await fetch(base + `/api/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update appointment');
  return res.json();
}
