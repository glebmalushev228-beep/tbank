import { Clock, House, UserRound, Wallet } from 'lucide-react';
import { cn } from '../lib/cn';

export type Tab = 'home' | 'payments' | 'history' | 'profile';

const TABS: Array<{ id: Tab; label: string; icon: typeof House }> = [
  { id: 'home', label: 'Главная', icon: House },
  { id: 'payments', label: 'Платежи', icon: Wallet },
  { id: 'history', label: 'История', icon: Clock },
  { id: 'profile', label: 'Профиль', icon: UserRound },
];

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Основная навигация"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 backdrop-blur-xl"
    >
      <div className="mx-auto grid w-full max-w-[430px] grid-cols-4 px-2 pb-[max(env(safe-area-inset-bottom),var(--tg-safe-area-inset-bottom,0px),10px)] pt-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center gap-1 py-0.5"
            >
              <span
                className={cn(
                  'flex h-8 w-12 items-center justify-center rounded-full',
                  isActive ? 'bg-brand-soft text-brand' : 'bg-transparent text-[#9b9ba1]',
                )}
              >
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <span
                className={cn(
                  'text-[10px] leading-none',
                  isActive ? 'font-semibold text-brand' : 'font-medium text-[#9b9ba1]',
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
