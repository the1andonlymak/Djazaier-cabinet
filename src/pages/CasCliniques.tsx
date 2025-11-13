import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CaseStory {
  id: string;
  title: string;
  patient: string;
  story: string;
  imageCombined?: string;
  before?: string;
  after?: string;
}

interface CasesStoriesData {
  cases: CaseStory[];
}

const base = import.meta.env.BASE_URL || '/';

export default function CasCliniques() {
  const [data, setData] = useState<CasesStoriesData | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(true);

  useEffect(() => {
    document.title = 'Cas cliniques | Djazair cabinet dentaire';
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const desc = "Cas cliniques: 5 cas présentés individuellement avec une courte histoire et photo avant/après (images d’illustration).";
    if (meta) meta.content = desc; else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
  const loadGallery = async () => {
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' }); // prevent 304
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Some 304 responses have no body → handle safely
      const text = await res.text();
      if (!text) throw new Error('Empty body');

      const json = JSON.parse(text);
      console.log('📸 /api/gallery response:', json);

      if (!json?.items?.length) throw new Error('No items found');

      const cases: CaseStory[] = json.items.map((it: any) => ({
        id: it.public_id,
        title: it.title_fr || it.caption_fr || 'Cas clinique',
        patient: '',
        story: it.caption_fr || '',
        imageCombined: it.secure_url || it.url || it.path || '',
      }));

      setData({ cases });
    } catch (err) {
      console.error('❌ Gallery fetch failed:', err);
      setData({
        cases: [
          {
            id: 'fallback-1',
            title: 'Exemple',
            patient: 'Patient anonyme',
            story: 'Description du traitement.',
            imageCombined: `${base}assets/cases/combined/case-01.svg`,
          },
        ],
      });
    }
  };

  loadGallery();
}, []);


  const cases = (data?.cases || []).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-hero hero-glow text-foreground overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto px-4 pt-36 pb-20">
        <header className="mb-6">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Cas cliniques</h1>
          <p className="text-gray-300 mt-2 max-w-3xl">Chaque cas est présenté individuellement, avec une courte histoire et une photo avant/après.</p>
        </header>

        

        <div className="flex flex-col gap-8">
          {cases.map((item) => (
            <article key={item.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden w-full max-w-[640px] mx-auto">
              <figure>
<AspectRatio ratio={16 / 9}>
  <div className="relative w-full h-full">
    {item.imageCombined ? (
      <img
        src={item.imageCombined}
        alt={`${item.title} (image d’illustration) – avant à gauche, après à droite`}
        loading="lazy"
        decoding="async"
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full object-cover"
      />
    ) : (
      <div className="absolute inset-0 grid place-items-center text-gray-400 text-sm">
        Image manquante
      </div>
    )}
  </div>
</AspectRatio>

                <figcaption className="sr-only">{item.title}</figcaption>
              </figure>

              <div className="p-4 md:p-6">
                <h2 className="font-display text-2xl font-semibold text-gray-100">{item.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{item.patient}</p>
                <p className="text-gray-200 mt-3 leading-relaxed">{item.story}</p>
              </div>
              <pre className="text-xs text-gray-500 p-2">{JSON.stringify(item, null, 2)}</pre>

            </article>
          ))}
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
