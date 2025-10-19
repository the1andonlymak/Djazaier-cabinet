import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FaqPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero hero-glow text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-36 pb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">FAQ</h1>
        <div className="space-y-6 max-w-3xl">
          <details className="bg-white/5 border border-white/10 rounded-xl p-6">
            <summary className="font-semibold">Comment prendre rendez-vous ?</summary>
            <p className="mt-3 text-gray-300">Appelez le +213 542 608 623. Nous vous proposerons le prochain créneau disponible.</p>
          </details>
          <details className="bg-white/5 border border-white/10 rounded-xl p-6">
            <summary className="font-semibold">Proposez-vous des urgences ?</summary>
            <p className="mt-3 text-gray-300">Oui, dans la mesure du possible sur nos horaires d’ouverture.</p>
          </details>
          <details className="bg-white/5 border border-white/10 rounded-xl p-6">
            <summary className="font-semibold">Quels moyens de paiement ?</summary>
            <p className="mt-3 text-gray-300">Espèces et moyens usuels. Détails sur place.</p>
          </details>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FaqPage;
