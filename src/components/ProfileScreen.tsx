import {
  Bell,
  ChevronRight,
  Clock,
  CreditCard,
  Info,
  LayoutGrid,
  LifeBuoy,
  RotateCcw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { formatBalance } from '../lib/format';
import { HOME_VIEW_LABEL, type HomeViewMode } from '../lib/types';

interface ProfileScreenProps {
  balance: number;
  viewMode: HomeViewMode;
  onOpenViewMode: () => void;
  onOpenSandbox: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
  onNotify: (message: string) => void;
}

interface MenuItem {
  label: string;
  value?: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function ProfileScreen({
  balance,
  viewMode,
  onOpenViewMode,
  onOpenSandbox,
  onOpenHistory,
  onReset,
  onNotify,
}: ProfileScreenProps) {
  const menu: MenuItem[] = [
    {
      label: 'Конструктор операций',
      icon: SlidersHorizontal,
      onClick: onOpenSandbox,
    },
    {
      label: 'История операций',
      icon: Clock,
      onClick: onOpenHistory,
    },
    {
      label: 'Вид главной',
      value: HOME_VIEW_LABEL[viewMode],
      icon: LayoutGrid,
      onClick: onOpenViewMode,
    },
    {
      label: 'Уведомления',
      icon: Bell,
      onClick: () => onNotify('Новых уведомлений нет'),
    },
    {
      label: 'Безопасность',
      icon: ShieldCheck,
      onClick: () => onNotify('Раздел безопасности доступен в реальном приложении'),
    },
    {
      label: 'Помощь и поддержка',
      icon: LifeBuoy,
      onClick: () => onNotify('Поддержка недоступна в демо-версии'),
    },
    {
      label: 'О приложении',
      value: '1.0',
      icon: Info,
      onClick: () => onNotify('Т-Банк · демо-прототип 1.0'),
    },
  ];

  return (
    <div className="pb-6">
      <header className="rounded-b-[28px] bg-white px-4 pb-4 pt-4 shadow-[0_12px_30px_rgba(16,24,40,0.05)]">
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-bold leading-none tracking-[-0.03em] text-ink">Профиль</h1>
          <button
            type="button"
            onClick={onOpenSandbox}
            aria-label="Конструктор операций"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink transition active:scale-95"
          >
            <Settings2 size={17} strokeWidth={2.1} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-[19px] font-bold text-white">
            А
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold leading-tight text-ink">Алексей Соколов</p>
            <p className="mt-0.5 text-[11.5px] text-muted">+7 (999) •••-••-42</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-2 py-1 text-[8.5px] font-bold tracking-[0.1em] text-ink">
            ДЕМО
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenHistory}
          className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left transition active:opacity-70"
        >
          <span className="flex min-w-0 items-center gap-2 text-[11.5px] font-medium text-muted">
            <CreditCard size={14} strokeWidth={2.1} className="shrink-0" />
            Дебетовая карта ·· 4829
          </span>
          <span className="shrink-0 text-[14px] font-bold tabular-nums text-ink">
            {formatBalance(balance)}
          </span>
        </button>
      </header>

      <div className="px-4 pt-3">
        <section className="rounded-[24px] bg-accent p-4 text-ink">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">Подписка</p>
              <p className="mt-1 text-[18px] font-extrabold leading-none tracking-[-0.03em]">
                Т-Банк Pro
              </p>
              <p className="mt-1 text-[10.5px] leading-snug text-ink/60">
                Кэшбэк до 30% и бесплатные переводы
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNotify('Подписка недоступна в демо-версии')}
              className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-[11px] font-semibold text-white transition active:scale-95"
            >
              Попробовать
            </button>
          </div>
        </section>

        <div className="mt-3 overflow-hidden rounded-[24px] bg-white">
          {menu.map(({ label, value, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex w-full items-center gap-3 border-b border-hairline px-4 py-3 text-left transition last:border-0 active:bg-surface/70"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-ink-soft">
                <Icon size={16} strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{label}</span>
              {value && <span className="shrink-0 text-[11.5px] text-muted">{value}</span>}
              <ChevronRight size={15} className="shrink-0 text-[#c6c6cb]" strokeWidth={2.2} />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[24px] bg-white py-3.5 text-[12px] font-semibold text-[#eb5757] transition active:opacity-70"
        >
          <RotateCcw size={15} strokeWidth={2.1} />
          Сбросить демо-данные
        </button>

        <p className="mt-4 px-2 text-center text-[10px] leading-relaxed text-[#b0b0b5]">
          Демо-прототип. Не является официальным приложением Т-Банка и не подключён к банковским
          системам.
        </p>
      </div>
    </div>
  );
}
