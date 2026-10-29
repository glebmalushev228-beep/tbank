import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  CreditCard,
  Gift,
  Plus,
  Receipt,
  ScanLine,
  Wifi,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { getMonthStats } from '../lib/analytics';
import { formatMoney, splitBalance } from '../lib/format';
import type { HomeViewMode, Transaction } from '../lib/types';
import { TBankLogo, TBankMark } from './BrandMark';
import { TransactionRow } from './TransactionRow';

export type QuickAction = 'transfer' | 'pay' | 'topup' | 'scan';

interface DashboardProps {
  balance: number;
  transactions: Transaction[];
  viewMode: HomeViewMode;
  onOpenTx: (tx: Transaction) => void;
  onQuickAction: (action: QuickAction) => void;
  onSeeAll: () => void;
  onNotifications: () => void;
  onOpenProfile: () => void;
}

const QUICK_ACTIONS: Array<{
  action: QuickAction;
  label: string;
  icon: typeof ArrowUpRight;
  tone: 'brand' | 'neutral' | 'accent';
}> = [
  { action: 'transfer', label: 'Перевести', icon: ArrowUpRight, tone: 'brand' },
  { action: 'pay', label: 'Оплатить', icon: Receipt, tone: 'neutral' },
  { action: 'topup', label: 'Пополнить', icon: Plus, tone: 'neutral' },
  { action: 'scan', label: 'Сканировать', icon: ScanLine, tone: 'accent' },
];

const CASHBACK_CATEGORIES = ['Супермаркеты 5%', 'Такси 3%', 'Аптеки 1%'];

function actionTone(tone: 'brand' | 'neutral' | 'accent') {
  return cn(
    tone === 'brand' && 'bg-brand-soft text-brand',
    tone === 'neutral' && 'bg-surface text-ink',
    tone === 'accent' && 'bg-accent text-ink',
  );
}

function HeaderActions({
  dense,
  onNotifications,
  onOpenProfile,
}: {
  dense: boolean;
  onNotifications: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onNotifications}
        aria-label="Уведомления"
        className={cn(
          'relative flex items-center justify-center rounded-full bg-surface text-ink transition active:scale-95',
          dense ? 'h-8 w-8' : 'h-9 w-9',
        )}
      >
        <Bell size={dense ? 17 : 18} strokeWidth={2.1} />
        <span
          className={cn(
            'absolute rounded-full bg-[#eb5757] ring-2 ring-white',
            dense ? 'right-[7px] top-[6px] h-[5px] w-[5px]' : 'right-[9px] top-[8px] h-[6px] w-[6px]',
          )}
        />
      </button>
      <button
        type="button"
        onClick={onOpenProfile}
        aria-label="Профиль"
        className={cn(
          'flex items-center justify-center rounded-full bg-brand font-bold text-white transition active:scale-95',
          dense ? 'h-8 w-8 text-[11px]' : 'h-9 w-9 text-[12px]',
        )}
      >
        А
      </button>
    </div>
  );
}

function FocusHeader({
  balance,
  onQuickAction,
  onNotifications,
  onOpenProfile,
}: {
  balance: number;
  onQuickAction: (action: QuickAction) => void;
  onNotifications: () => void;
  onOpenProfile: () => void;
}) {
  const parts = splitBalance(balance);

  return (
    <section className="rounded-b-[28px] bg-white px-5 pb-5 pt-3 shadow-[0_12px_30px_rgba(16,24,40,0.05)]">
      <header className="flex items-center justify-between">
        <TBankLogo />
        <HeaderActions
          dense={false}
          onNotifications={onNotifications}
          onOpenProfile={onOpenProfile}
        />
      </header>

      <div className="mt-6 flex flex-col items-center">
        <p className="text-[12px] font-medium text-muted">Добрый день, Алексей</p>

        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[11px] font-medium text-[#6e6e73]">
          <CreditCard size={12} strokeWidth={2.2} className="text-[#8a8a90]" />
          Дебетовая карта ·· 4829
        </div>

        <div className="mt-3 flex items-baseline justify-center">
          <span className="text-[clamp(32px,10.5vw,46px)] font-extrabold leading-none tracking-[-0.045em] tabular-nums text-ink">
            {parts.negative ? '−' : ''}
            {parts.whole}
          </span>
          <span className="ml-1 text-[20px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-[#a0a0a5]">
            ,{parts.cents} ₽
          </span>
        </div>
        <p className="mt-2 text-[11.5px] text-muted">Доступно</p>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-1.5">
        {QUICK_ACTIONS.map(({ action, label, icon: Icon, tone }) => (
          <button
            key={action}
            type="button"
            onClick={() => onQuickAction(action)}
            className="flex flex-col items-center gap-1.5 rounded-2xl py-1 transition active:opacity-60"
          >
            <span
              className={cn(
                'flex h-[52px] w-[52px] items-center justify-center rounded-full',
                actionTone(tone),
              )}
            >
              <Icon size={21} strokeWidth={2.1} />
            </span>
            <span className="text-[10px] font-medium leading-none text-ink-soft">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CompactHeader({
  balance,
  onQuickAction,
  onNotifications,
  onOpenProfile,
}: {
  balance: number;
  onQuickAction: (action: QuickAction) => void;
  onNotifications: () => void;
  onOpenProfile: () => void;
}) {
  const parts = splitBalance(balance);

  return (
    <section className="rounded-b-[24px] bg-white px-4 pb-4 pt-3 shadow-[0_12px_30px_rgba(16,24,40,0.05)]">
      <header className="flex items-center justify-between">
        <TBankLogo size={26} />
        <HeaderActions
          dense
          onNotifications={onNotifications}
          onOpenProfile={onOpenProfile}
        />
      </header>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium leading-none text-muted">Добрый день, Алексей</p>
          <div className="mt-1.5 flex items-baseline">
            <span className="text-[clamp(27px,8.6vw,34px)] font-extrabold leading-none tracking-[-0.045em] tabular-nums text-ink">
              {parts.negative ? '−' : ''}
              {parts.whole}
            </span>
            <span className="ml-1 text-[13.5px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-[#a0a0a5]">
              ,{parts.cents} ₽
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-[8.5px] font-semibold uppercase tracking-[0.07em] text-[#a5a5ab]">
            Дебетовая карта
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[10.5px] font-semibold text-ink-soft">
            <CreditCard size={11} strokeWidth={2.2} className="text-muted" />
            ·· 4829
          </span>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-4 gap-1">
        {QUICK_ACTIONS.map(({ action, label, icon: Icon, tone }) => (
          <button
            key={action}
            type="button"
            onClick={() => onQuickAction(action)}
            className="flex flex-col items-center gap-1 rounded-xl py-0.5 transition active:opacity-60"
          >
            <span
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full',
                actionTone(tone),
              )}
            >
              <Icon size={19} strokeWidth={2.1} />
            </span>
            <span className="text-[9.5px] font-medium leading-none text-ink-soft">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FocusCard() {
  return (
    <section
      aria-label="Дебетовая карта Black"
      className="relative mx-4 mt-3 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#262628] via-[#18181a] to-[#0c0c0e] p-5 text-white shadow-[0_24px_44px_-30px_rgba(0,0,0,0.85)]"
    >
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TBankMark size={26} />
            <div>
              <p className="text-[12px] font-bold leading-none">Т-Банк</p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-white/40">
                Black
              </p>
            </div>
          </div>
          <Wifi size={18} className="rotate-90 text-white/40" strokeWidth={2} />
        </div>

        <div className="mt-7 flex items-end justify-between">
          <div>
            <span className="block h-5 w-7 rounded-[4px] bg-gradient-to-br from-[#f0de9b] to-[#b99545]" />
            <p className="mt-3 text-[16px] font-semibold tracking-[0.18em] text-white/90">•• 4829</p>
          </div>
          <span className="text-[13px] font-extrabold tracking-[0.08em] text-white/75">МИР</span>
        </div>

        <div className="mt-4 flex items-center justify-between text-[9.5px] text-white/40">
          <span className="uppercase tracking-[0.06em]">Алексей Соколов</span>
          <span>09/29</span>
        </div>
      </div>
    </section>
  );
}

function CompactCard() {
  return (
    <section
      aria-label="Дебетовая карта Black"
      className="relative mx-4 mt-2.5 flex items-center justify-between gap-3 overflow-hidden rounded-[20px] bg-gradient-to-r from-[#262628] via-[#18181a] to-[#0c0c0e] px-4 py-3.5 text-white shadow-[0_18px_34px_-24px_rgba(0,0,0,0.8)]"
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-accent/15 blur-2xl" />
      <div className="relative flex items-center gap-2.5">
        <TBankMark size={22} />
        <div>
          <p className="text-[11px] font-bold leading-none">Т-Банк Black</p>
          <p className="mt-1 text-[10px] font-medium tracking-[0.14em] text-white/45">•• 4829</p>
        </div>
      </div>
      <div className="relative flex items-center gap-2.5 text-white/55">
        <span className="h-4 w-6 rounded-[3px] bg-gradient-to-br from-[#f0de9b] to-[#b99545]" />
        <Wifi size={14} className="rotate-90" strokeWidth={2} />
        <span className="text-[11px] font-extrabold tracking-[0.08em]">МИР</span>
      </div>
    </section>
  );
}

export function Dashboard({
  balance,
  transactions,
  viewMode,
  onOpenTx,
  onQuickAction,
  onSeeAll,
  onNotifications,
  onOpenProfile,
}: DashboardProps) {
  const compact = viewMode === 'compact';
  const recent = transactions.slice(0, compact ? 5 : 4);
  const stats = getMonthStats(transactions);
  const maxCategory = stats.categories[0]?.amount ?? 1;

  return (
    <div key={viewMode} className="view-swap pb-6">
      {compact ? (
        <CompactHeader
          balance={balance}
          onQuickAction={onQuickAction}
          onNotifications={onNotifications}
          onOpenProfile={onOpenProfile}
        />
      ) : (
        <FocusHeader
          balance={balance}
          onQuickAction={onQuickAction}
          onNotifications={onNotifications}
          onOpenProfile={onOpenProfile}
        />
      )}

      {compact ? <CompactCard /> : <FocusCard />}

      {compact ? (
        <section className="mx-4 mt-2.5 flex items-center justify-between gap-3 rounded-[20px] bg-accent px-4 py-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-ink/55">
              Кэшбэк за месяц
            </p>
            <p className="mt-1 text-[18px] font-extrabold leading-none tracking-[-0.03em]">
              {formatMoney(stats.cashback)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/60 py-1 pl-2.5 pr-2">
            <span className="text-[9.5px] font-semibold text-ink/75">
              {CASHBACK_CATEGORIES.length} категории
            </span>
            <Gift size={14} strokeWidth={2.2} className="text-ink/70" />
          </div>
        </section>
      ) : (
        <section className="mx-4 mt-3 rounded-[24px] bg-accent p-4 text-ink">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">
                Кэшбэк за месяц
              </p>
              <p className="mt-1 text-[26px] font-extrabold leading-none tracking-[-0.035em]">
                {formatMoney(stats.cashback)}
              </p>
              <p className="mt-1.5 text-[10.5px] text-ink/55">
                Начислим в начале следующего месяца
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/55">
              <Gift size={19} strokeWidth={2} />
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {CASHBACK_CATEGORIES.map((label, index) => (
              <span
                key={label}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[10px] font-semibold',
                  index === 0 ? 'bg-ink text-white' : 'bg-white/60 text-ink',
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </section>
      )}

      {stats.categories.length > 0 &&
        (compact ? (
          <section className="mx-4 mt-2.5 rounded-[20px] bg-white px-4 py-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13.5px] font-bold tracking-[-0.01em]">Аналитика финансов</h2>
              <button
                type="button"
                onClick={onSeeAll}
                className="text-[11px] font-semibold text-brand transition active:opacity-60"
              >
                Подробнее
              </button>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[10.5px] text-muted">Потрачено за месяц</span>
              <span className="text-[14px] font-bold tabular-nums">{formatMoney(stats.spent)}</span>
            </div>

            <div className="mt-2.5 space-y-[7px]">
              {stats.categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.label} className="flex items-center gap-2">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: category.bg, color: category.color }}
                    >
                      <Icon size={11} strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-ink-soft">
                      {category.label}
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold tabular-nums">
                      {formatMoney(category.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mx-4 mt-3 rounded-[24px] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold tracking-[-0.01em]">Аналитика финансов</h2>
              <button
                type="button"
                onClick={onSeeAll}
                className="text-[11.5px] font-semibold text-brand transition active:opacity-60"
              >
                Подробнее
              </button>
            </div>

            <p className="mt-3 text-[10.5px] font-medium text-muted">Потрачено за месяц</p>
            <p className="mt-0.5 text-[22px] font-bold tracking-[-0.03em] tabular-nums">
              {formatMoney(stats.spent)}
            </p>

            <div className="mt-3 space-y-2.5">
              {stats.categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.label} className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: category.bg, color: category.color }}
                    >
                      <Icon size={15} strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-[11.5px] font-medium text-ink-soft">
                          {category.label}
                        </span>
                        <span className="shrink-0 text-[11.5px] font-semibold tabular-nums">
                          {formatMoney(category.amount)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f2f2f4]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(10, Math.round((category.amount / maxCategory) * 100))}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

      <section className={compact ? 'mt-4 px-4' : 'mt-5 px-4'}>
        <div
          className={cn('flex items-center justify-between px-1', compact ? 'mb-1.5' : 'mb-2')}
        >
          <h2
            className={cn(
              'font-bold tracking-[-0.01em]',
              compact ? 'text-[13.5px]' : 'text-[15px]',
            )}
          >
            Последние операции
          </h2>
          <button
            type="button"
            onClick={onSeeAll}
            className="flex items-center gap-0.5 text-[11.5px] font-semibold text-brand transition active:opacity-60"
          >
            Все
            <ChevronRight size={13} strokeWidth={2.4} />
          </button>
        </div>

        <div className="divide-y divide-hairline overflow-hidden rounded-[24px] bg-white">
          {recent.length > 0 ? (
            recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onClick={() => onOpenTx(tx)} compact />
            ))
          ) : (
            <p className="px-4 py-8 text-center text-[12.5px] text-muted">Операций пока нет</p>
          )}
        </div>

        <p className="mt-4 text-center text-[10px] font-medium text-[#b0b0b5]">
          Демо-прототип Т-Банка · данные хранятся на устройстве
        </p>
      </section>
    </div>
  );
}
