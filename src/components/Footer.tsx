import { Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">
              Djazair <span className="text-primary">cabinet dentaire</span>
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Cabinet à la pointe, accueil humain et résultats esthétiques naturels.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/djazair.cabinet.dentaire/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Coordonnées</h3>
            <ul className="space-y-2 text-gray-400">
              <li>27 Cité 130 logement</li>
              <li>Berrahal, Annaba</li>
              <li>
                <a href="tel:+213542608623" className="hover:text-primary transition-colors">
                  +213 542 608 623
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Horaires</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Lun – Ven : 09h – 17h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Djazair cabinet dentaire. Tous droits réservés.
            </p>
            <div className="flex space-x-6">
              <a href="#!" className="text-gray-400 hover:text-primary text-sm transition-colors">Mentions légales</a>
              <a href="#!" className="text-gray-400 hover:text-primary text-sm transition-colors">Politique de confidentialité</a>
              <a href="#!" className="text-gray-400 hover:text-primary text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
