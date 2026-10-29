import { Search, SlidersHorizontal, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../lib/cn';
import { formatDayLabel, formatMoney, isSameMonth, monthTitle } from '../lib/format';
import type { Transaction } from '../lib/types';
import { TransactionRow } from './TransactionRow';

type FilterId = 'all' | 'incoming' | 'transfer' | 'outgoing';

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'incoming', label: 'Пополнения' },
  { id: 'transfer', label: 'Переводы' },
  { id: 'outgoing', label: 'Расходы' },
];

interface HistoryScreenProps {
  transactions: Transaction[];
  query: string;
  onQueryChange: (value: string) => void;
  onOpenTx: (tx: Transaction) => void;
  onOpenSandbox: () => void;
}

const normalize = (value: string) => value.toLowerCase().replace(/ё/g, 'е').trim();

const matchesFilter = (tx: Transaction, filter: FilterId) => {
  if (filter === 'incoming') return tx.type === 'incoming';
  if (filter === 'outgoing') return tx.type === 'outgoing';
  if (filter === 'transfer') return tx.category === 'transfer';
  return true;
};

function groupByDay(transactions: Transaction[]) {
  const groups: Array<{ label: string; items: Transaction[] }> = [];
  for (const tx of transactions) {
    const label = formatDayLabel(tx.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(tx);
    } else {
      groups.push({ label, items: [tx] });
    }
  }
  return groups;
}

export function HistoryScreen({
  transactions,
  query,
  onQueryChange,
  onOpenTx,
  onOpenSandbox,
}: HistoryScreenProps) {
  const [filter, setFilter] = useState<FilterId>('all');

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [transactions],
  );

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return sorted.filter((tx) => {
      if (!matchesFilter(tx, filter)) return false;
      if (!needle) return true;
      const haystack = normalize(
        [tx.sender, tx.recipient, tx.description, tx.message ?? '', tx.detail ?? ''].join(' '),
      );
      return haystack.includes(needle);
    });
  }, [sorted, filter, query]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  const monthTotals = useMemo(() => {
    let spent = 0;
    let received = 0;
    for (const tx of transactions) {
      if (!isSameMonth(tx.date)) continue;
      if (tx.type === 'outgoing') spent += tx.amount;
      else received += tx.amount;
    }
    return { spent, received };
  }, [transactions]);

  const hasActiveFilters = filter !== 'all' || query.trim().length > 0;

  return (
    <div className="pb-6">
      <header className="rounded-b-[28px] bg-white px-4 pb-4 pt-4 shadow-[0_12px_30px_rgba(16,24,40,0.05)]">
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-bold leading-none tracking-[-0.03em] text-ink">История</h1>
          <button
            type="button"
            onClick={onOpenSandbox}
            aria-label="Конструктор операций"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink transition active:scale-95"
          >
            <SlidersHorizontal size={17} strokeWidth={2.1} />
          </button>
        </div>

        <div className="mt-3 flex h-11 items-center gap-2 rounded-2xl bg-surface px-3.5">
          <Search size={16} strokeWidth={2.2} className="shrink-0 text-[#9a9aa0]" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск по операциям"
            aria-label="Поиск по операциям"
            className="h-full min-w-0 flex-1 select-text bg-transparent text-[12.5px] text-ink outline-none placeholder:text-[#a5a5ab]"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Очистить поиск"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dcdce0] text-white"
            >
              <X size={12} strokeWidth={3} />
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map(({ id, label }) => {
            const isActive = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                aria-pressed={isActive}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-2 text-[11.5px] font-medium leading-none transition',
                  isActive ? 'bg-brand text-white' : 'bg-surface text-[#6e6e73]',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-4 pt-3">
        <section className="rounded-[24px] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-ink">{monthTitle()}</span>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[9.5px] font-semibold text-brand">
              Итоги месяца
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 divide-x divide-hairline">
            <div className="pr-3">
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-muted">
                <TrendingDown size={13} strokeWidth={2.2} className="text-[#eb5757]" />
                Потрачено
              </div>
              <div className="mt-1 text-[18px] font-bold leading-tight tracking-[-0.02em] tabular-nums text-ink">
                {formatMoney(monthTotals.spent)}
              </div>
            </div>
            <div className="pl-4">
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-muted">
                <TrendingUp size={13} strokeWidth={2.2} className="text-positive" />
                Получено
              </div>
              <div className="mt-1 text-[18px] font-bold leading-tight tracking-[-0.02em] tabular-nums text-positive">
                {formatMoney(monthTotals.received)}
              </div>
            </div>
          </div>
        </section>

        {groups.length === 0 ? (
          <div className="mt-8 flex flex-col items-center px-6 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Search size={22} strokeWidth={2.1} />
            </span>
            <p className="mt-4 text-[14px] font-semibold text-ink">Операции не найдены</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
              Попробуйте изменить запрос или выбрать другой фильтр
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setFilter('all');
                  onQueryChange('');
                }}
                className="mt-4 rounded-full bg-brand px-4 py-2 text-[12px] font-semibold text-white"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {groups.map((group) => (
              <div key={group.label}>
                <h2 className="mb-2 px-1 text-[11.5px] font-semibold text-muted">{group.label}</h2>
                <div className="divide-y divide-hairline overflow-hidden rounded-[24px] bg-white">
                  {group.items.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} onClick={() => onOpenTx(tx)} />
                  ))}
                </div>
              </div>
            ))}
            <p className="pt-1 text-center text-[10px] font-medium text-[#b0b0b5]">
              Показано операций: {filtered.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
