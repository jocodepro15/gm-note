import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/new', label: 'Mes séances' },
  { path: '/programmes', label: 'Programmes' },
  { path: '/history', label: 'Historique' },
  { path: '/progression', label: 'Progression' },
  { path: '/timer', label: 'Chrono' },
  { path: '/calc', label: 'Calcul' },
  { path: '/infos', label: 'Infos' },
];

export default function Header() {
  const location = useLocation();
  const { displayName, signOut } = useAuth();

  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      {/* Titre + utilisateur */}
      <div className="px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary-400">
          GM NOTE
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{displayName}</span>
          <button
            onClick={signOut}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Navigation scrollable */}
      <nav className="overflow-x-auto scrollbar-hide border-t border-gray-700">
        <div className="flex px-2 py-2 gap-1 min-w-max">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                location.pathname === item.path
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
