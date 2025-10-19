import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-hero hero-glow text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-36 pb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Contact</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Coordonnées</h2>
            <p className="text-gray-300">27 Cité 130 logement, Berrahal, Annaba</p>
            <p className="text-gray-300 mt-2">Lun – Ven : 09h – 17h</p>
            <a href="tel:+213542608623" className="inline-block mt-6">
              <Button size="lg" className="font-semibold">Appeler le cabinet</Button>
            </a>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Prendre rendez-vous</h2>
            <p className="text-gray-300 mb-4">Nous vous répondons rapidement.</p>
            <a href="tel:+213542608623" className="inline-block mt-10">
              <Button size="lg" className="font-semibold">Par téléphone</Button>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
