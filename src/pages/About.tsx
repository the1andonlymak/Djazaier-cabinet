import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-hero hero-glow text-foreground">
    
      <Navbar />
      <main className="container mx-auto px-4 pt-36 pb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">À propos</h1>
        <p className="text-gray-300 max-w-3xl leading-relaxed">
          Djazair cabinet dentaire est un cabinet de groupe situé à Annaba (Berrahal). Nous allions expertise clinique, technologie moderne et une approche humaine pour offrir des soins fiables et esthétiques.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold mb-2">Confiance</h2>
            <p className="text-gray-300">Écoute, transparence et accompagnement à chaque étape de votre traitement.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold mb-2">Qualité</h2>
            <p className="text-gray-300">Protocoles rigoureux, matériaux de référence et gestes maîtrisés.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold mb-2">Hygiène</h2>
            <p className="text-gray-300">Stérilisation et traçabilité conformes aux meilleures pratiques.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
