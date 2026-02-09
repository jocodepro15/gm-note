import { Link, useLocation } from 'react-router-dom';

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

  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary-400">
            Sport Tracker
          </Link>

          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
