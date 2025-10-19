import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/logo2.png';

const navItems = [
  { label: 'Accueil', to: '/cryptoflow' },
  { label: 'À propos', to: '/cryptoflow/a-propos' },
  { label: 'Services', to: '/cryptoflow/services' },
  { label: 'Cas cliniques', to: '/cryptoflow/cas-cliniques' },
  { label: 'Contact', to: '/cryptoflow/contact' },
  { label: 'FAQ', to: '/cryptoflow/faq' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4 bg-black/5 backdrop-blur-lg ">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/cryptoflow" className="flex items-center p-2">
          <img src={logo} alt="Djazair cabinet dentaire" className="h-11 lg:h-14 w-auto object-contain" />
        </Link>

        <ul className="hidden lg:flex items-center gap-8 font-display  ">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`transition-colors ${pathname === item.to ? 'text-primary' : 'text-gray-200 hover:text-primary'}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link to="/cryptoflow/rendez-vous" aria-label="Prendre rendez-vous en ligne">
            <Button size="sm" className="font-semibold">Prendre rendez-vous</Button>
          </Link>
          <button className="lg:hidden text-white p-2" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setOpen((v) => !v)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && createPortal(
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-md">
          <div className="flex h-full flex-col">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link to="/cryptoflow" className="flex items-center p-2">
                <img src={logo} alt="Djazair cabinet dentaire" className="h-11 w-auto object-contain" />
              </Link>
              <button className="text-white p-2" aria-label="Fermer le menu" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            <div className="container mx-auto px-4 py-4 overflow-y-auto">
              <ul className="flex flex-col gap-4 font-display text-3xl ">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`block py-2 transition-colors ${pathname === item.to ? 'text-primary' : 'text-gray-200 hover:text-primary'}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;
