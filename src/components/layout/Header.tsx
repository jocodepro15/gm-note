import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', label: 'Accueil' },
  { path: '/new', label: 'Mes séances' },
  { path: '/programmes', label: 'Programmes' },
  { path: '/history', label: 'Historique' },
  { path: '/progression', label: 'Progression' },
  { path: '/suivi', label: 'Suivi' },
  { path: '/timer', label: 'Chrono' },
  { path: '/calc', label: 'Calcul' },
  { path: '/infos', label: 'Infos' },
  { path: '/profile', label: 'Profil' },
];

export default function Header() {
  const location = useLocation();
  const { displayName, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Fermer le menu quand on change de page
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Bouton hamburger flottant */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-4 left-4 z-40 flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
        aria-label="Menu"
      >
        <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Menu via portail */}
      {menuOpen && createPortal(
        <div className="fixed inset-0" style={{ zIndex: 9999 }}>
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu latéral */}
          <nav
            className="absolute top-0 left-0 bottom-0 w-64 flex flex-col"
            style={{ background: '#0d1525', borderRight: '1px solid rgba(16, 185, 129, 0.15)' }}
          >
            {/* En-tête du menu */}
            <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-xl font-bold text-primary-400">GM NOTE</div>
              <div className="text-sm text-gray-400 mt-1">{displayName}</div>
            </div>

            {/* Liens */}
            <div className="flex flex-col py-2 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Déconnexion en bas */}
            <div className="border-t px-5 py-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </nav>
        </div>,
        document.body
      )}
    </>
  );
}
