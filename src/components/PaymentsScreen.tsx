import {
  ArrowRightLeft,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Droplets,
  Landmark,
  Phone,
  Repeat,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Wifi,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { SandboxPrefill, Transaction } from '../lib/types';
import { TransactionRow } from './TransactionRow';

interface Service {
  label: string;
  description: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
  prefill: SandboxPrefill;
}

const SERVICES: Service[] = [
  {
    label: 'Мобильная связь',
    description: 'Оплата мобильной связи',
    icon: Smartphone,
    bg: '#fff4cc',
    fg: '#8a6400',
    prefill: {
      type: 'outgoing',
      recipient: 'МТС',
      description: 'Оплата мобильной связи',
      category: 'payment',
    },
  },
  {
    label: 'ЖКХ',
    description: 'Коммунальные услуги',
    icon: Droplets,
    bg: '#eaf3ff',
    fg: '#2f80ed',
    prefill: {
      type: 'outgoing',
      recipient: 'ЖКХ',
      description: 'ЖКХ, коммунальные услуги',
      category: 'payment',
    },
  },
  {
    label: 'Интернет',
    description: 'Домашний интернет',
    icon: Wifi,
    bg: '#e8f7ef',
    fg: '#12a150',
    prefill: {
      type: 'outgoing',
      recipient: 'Ростелеком',
      description: 'Домашний интернет',
      category: 'payment',
    },
  },
  {
    label: 'Штрафы',
    description: 'Штрафы ГИБДД',
    icon: CircleAlert,
    bg: '#feecec',
    fg: '#eb5757',
    prefill: {
      type: 'outgoing',
      recipient: 'ГИБДД',
      description: 'Штраф ГИБДД',
      category: 'payment',
    },
  },
  {
    label: 'Налоги',
    description: 'Налоговые платежи',
    icon: Landmark,
    bg: '#f4ecff',
    fg: '#8b5cf6',
    prefill: {
      type: 'outgoing',
      recipient: 'ФНС России',
      description: 'Налоговый платёж',
      category: 'payment',
    },
  },
  {
    label: 'Переводы',
    description: 'Перевод по номеру телефона',
    icon: ArrowRightLeft,
    bg: '#edf2ff',
    fg: '#4b7bf5',
    prefill: { type: 'outgoing', description: 'Перевод по номеру телефона', category: 'transfer' },
  },
  {
    label: 'Страхование',
    description: 'Страховые полисы',
    icon: ShieldCheck,
    bg: '#e8f7ef',
    fg: '#12a150',
    prefill: {
      type: 'outgoing',
      recipient: 'Т-Страхование',
      description: 'Страховой полис',
      category: 'payment',
    },
  },
  {
    label: 'Подписки',
    description: 'Подписки и сервисы',
    icon: Repeat,
    bg: '#f2f2f4',
    fg: '#5c5c63',
    prefill: {
      type: 'outgoing',
      recipient: 'Яндекс Плюс',
      description: 'Оплата подписки',
      category: 'subscription',
    },
  },
];

interface PaymentsScreenProps {
  transactions: Transaction[];
  onOpenTx: (tx: Transaction) => void;
  onOpenSandbox: (prefill?: SandboxPrefill) => void;
  onOpenHistory: () => void;
}

export function PaymentsScreen({
  transactions,
  onOpenTx,
  onOpenSandbox,
  onOpenHistory,
}: PaymentsScreenProps) {
  const [query, setQuery] = useState('');

  const services = useMemo(() => {
    const needle = query.toLowerCase().replace(/ё/g, 'е').trim();
    if (!needle) return SERVICES;
    return SERVICES.filter((service) =>
      `${service.label} ${service.description}`.toLowerCase().replace(/ё/g, 'е').includes(needle),
    );
  }, [query]);

  const payments = transactions
    .filter((tx) => tx.category === 'payment' || tx.category === 'subscription')
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 3);

  return (
    <div className="pb-6">
      <header className="rounded-b-[28px] bg-white px-4 pb-4 pt-4 shadow-[0_12px_30px_rgba(16,24,40,0.05)]">
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-bold leading-none tracking-[-0.03em] text-ink">Платежи</h1>
          <button
            type="button"
            onClick={() => onOpenSandbox()}
            aria-label="Конструктор операций"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink transition active:scale-95"
          >
            <Settings2 size={17} strokeWidth={2.1} />
          </button>
        </div>

        <div className="mt-3 flex h-11 items-center gap-2 rounded-2xl bg-surface px-3.5">
          <Search size={16} strokeWidth={2.2} className="shrink-0 text-[#9a9aa0]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Услуга, перевод или телефон"
            aria-label="Поиск по платежам"
            className="h-full min-w-0 flex-1 select-text bg-transparent text-[12.5px] text-ink outline-none placeholder:text-[#a5a5ab]"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Очистить поиск"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dcdce0] text-white"
            >
              <X size={12} strokeWidth={3} />
            </button>
          )}
        </div>
      </header>

      <div className="px-4 pt-3">
        <section className="overflow-hidden rounded-[24px] bg-white px-1.5 py-1">
          <button
            type="button"
            onClick={() =>
              onOpenSandbox({
                type: 'outgoing',
                description: 'Перевод по номеру телефона',
                category: 'transfer',
              })
            }
            className="flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition active:bg-surface"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Phone size={18} strokeWidth={2.1} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold leading-tight text-ink">
                По номеру телефона
              </span>
              <span className="mt-0.5 block text-[11px] text-muted">Без комиссии · СБП</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-[#c6c6cb]" />
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenSandbox({
                type: 'outgoing',
                description: 'Перевод на карту',
                category: 'transfer',
              })
            }
            className="flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition active:bg-surface"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff4cc] text-[#8a6400]">
              <CreditCard size={18} strokeWidth={2.1} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold leading-tight text-ink">
                По номеру карты
              </span>
              <span className="mt-0.5 block text-[11px] text-muted">В другой банк</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-[#c6c6cb]" />
          </button>
        </section>

        <div className="mb-2 mt-5 flex items-center justify-between px-1">
          <h2 className="text-[15px] font-bold tracking-[-0.01em] text-ink">Услуги</h2>
          <span className="text-[11px] text-muted">{services.length}</span>
        </div>

        <section className="rounded-[24px] bg-white p-2">
          <div className="grid grid-cols-4 gap-y-1">
            {services.map(({ label, icon: Icon, bg, fg, prefill }) => (
              <button
                key={label}
                type="button"
                onClick={() => onOpenSandbox(prefill)}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-2 transition active:bg-surface"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: bg, color: fg }}
                >
                  <Icon size={19} strokeWidth={2.1} />
                </span>
                <span className="px-0.5 text-center text-[10px] font-medium leading-[1.15] text-ink-soft">
                  {label}
                </span>
              </button>
            ))}
            {services.length === 0 && (
              <p className="col-span-4 px-2 py-8 text-center text-[12px] text-muted">
                Ничего не найдено
              </p>
            )}
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-[15px] font-bold tracking-[-0.01em] text-ink">
              Последние платежи
            </h2>
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-[11.5px] font-semibold text-brand transition active:opacity-60"
            >
              Все
            </button>
          </div>

          <div className="divide-y divide-hairline overflow-hidden rounded-[24px] bg-white">
            {payments.length > 0 ? (
              payments.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} onClick={() => onOpenTx(tx)} />
              ))
            ) : (
              <p className="px-4 py-8 text-center text-[12.5px] text-muted">Платежей пока нет</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
