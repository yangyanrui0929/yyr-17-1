import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Film, ScrollText, History, Coins, ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface NavBarProps {
  showBack?: boolean;
  onBack?: () => void;
}

export default function NavBar({ showBack, onBack }: NavBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const coins = useGameStore((state) => state.coins);

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/commissions', icon: ScrollText, label: '委托' },
    { path: '/workshop', icon: Film, label: '工作台' },
    { path: '/records', icon: History, label: '记录' },
  ];

  return (
    <nav className="glass-card mx-4 mt-4 px-4 py-3 flex items-center justify-between sticky top-4 z-50">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack || (() => navigate(-1))}
            className="p-2 rounded-lg hover:bg-night-700/50 transition-colors text-night-300 hover:text-amber-neon"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all font-body text-sm ${
                  isActive
                    ? 'bg-amber-neon/20 text-amber-neon'
                    : 'text-night-300 hover:text-amber-glow hover:bg-night-700/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-amber-neon">
        <Coins className="w-4 h-4" />
        <span className="font-body text-sm neon-text-soft">{coins}</span>
      </div>
    </nav>
  );
}
