import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Services = () => {
  return (
    <div className="min-h-screen bg-gradient-hero hero-glow text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-36 pb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Nos services</h1>
        <p className="text-gray-300 max-w-3xl mb-8">Soins courants et actes spécialisés pour toute la famille.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <ul className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-6">
            <li>Consultation, prévention et détartrage</li>
            <li>Soins conservateurs (caries, inlays/onlays)</li>
            <li>Endodontie (traitement des racines)</li>
            <li>Parodontologie (gencives)</li>
          </ul>
          <ul className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-6">
            <li>Prothèses fixes et amovibles</li>
            <li>Esthétique (facettes, blanchiment)</li>
            <li>Implantologie (en partenariat spécialisé)</li>
            <li>Urgences dentaires</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
