import { CircleCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BottomNav, type Tab } from './components/BottomNav';
import { Dashboard, type QuickAction } from './components/Dashboard';
import { HistoryScreen } from './components/HistoryScreen';
import { PaymentsScreen } from './components/PaymentsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SandboxModal } from './components/SandboxModal';
import { TransactionSheet } from './components/TransactionSheet';
import { ViewModeSheet } from './components/ViewModeSheet';
import { createSeedState } from './lib/data';
import {
  createTransaction,
  loadState,
  loadViewMode,
  saveState,
  saveViewMode,
} from './lib/storage';
import type {
  AppState,
  HomeViewMode,
  NewTxInput,
  SandboxPrefill,
  Transaction,
} from './lib/types';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [tab, setTab] = useState<Tab>('home');
  const [historyQuery, setHistoryQuery] = useState('');
  const [activeTxId, setActiveTxId] = useState<string | null>(null);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxPrefill, setSandboxPrefill] = useState<SandboxPrefill | undefined>(undefined);
  const [viewMode, setViewMode] = useState<HomeViewMode>(() => loadViewMode());
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    saveViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const locked = Boolean(activeTxId) || sandboxOpen || viewSheetOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeTxId, sandboxOpen, viewSheetOpen]);

  const transactions = useMemo(
    () => [...state.transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [state.transactions],
  );

  const activeTx = activeTxId
    ? state.transactions.find((tx) => tx.id === activeTxId) ?? null
    : null;

  const showToast = (message: string) => setToast(message);

  const openSandbox = (prefill?: SandboxPrefill) => {
    setSandboxPrefill(prefill);
    setSandboxOpen(true);
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action === 'pay') {
      setTab('payments');
      return;
    }
    if (action === 'topup') {
      openSandbox({
        type: 'incoming',
        description: 'Пополнение счёта',
        category: 'topup',
      });
      return;
    }
    if (action === 'scan') {
      showToast('Сканер QR-кодов недоступен в демо');
      return;
    }
    openSandbox({
      type: 'outgoing',
      description: 'Перевод по номеру телефона',
      category: 'transfer',
    });
  };

  const handleAddTransaction = (input: NewTxInput, autoBalance: boolean) => {
    const signedAmount = autoBalance
      ? input.type === 'incoming'
        ? input.amount
        : -input.amount
      : 0;

    setState((previous) => ({
      balance: previous.balance + signedAmount,
      transactions: [createTransaction(input), ...previous.transactions],
    }));
    setSandboxOpen(false);
    setSandboxPrefill(undefined);
    showToast('Операция добавлена');
  };

  const handleUpdateBalance = (value: number) => {
    setState((previous) => ({ ...previous, balance: value }));
    showToast('Баланс обновлён');
  };

  const handleReset = () => {
    setState(createSeedState());
    setSandboxOpen(false);
    setSandboxPrefill(undefined);
    setActiveTxId(null);
    setHistoryQuery('');
    showToast('Демо-данные сброшены');
  };

  const handleDelete = (tx: Transaction) => {
    setState((previous) => ({
      ...previous,
      transactions: previous.transactions.filter((item) => item.id !== tx.id),
    }));
    setActiveTxId(null);
    showToast('Запись удалена');
  };

  const handleRepeat = (tx: Transaction) => {
    setActiveTxId(null);
    openSandbox({
      type: tx.type,
      sender: tx.sender,
      recipient: tx.recipient,
      detail: tx.detail,
      amount: tx.amount,
      description: tx.description,
      message: tx.message,
      category: tx.category,
      date: new Date().toISOString(),
    });
  };

  const handleSeeAll = () => {
    setHistoryQuery('');
    setTab('history');
  };

  return (
    <div className="relative mx-auto flex min-h-[100dvh] min-h-[var(--tg-viewport-stable-height,100dvh)] w-full max-w-[430px] select-none flex-col overflow-x-hidden bg-surface pt-[max(env(safe-area-inset-top),var(--tg-content-safe-area-inset-top,0px))]">
      <main key={tab} className="screen-rise flex-1 pb-[104px]">
        {tab === 'home' && (
          <Dashboard
            balance={state.balance}
            transactions={transactions}
            viewMode={viewMode}
            onOpenTx={(tx) => setActiveTxId(tx.id)}
            onQuickAction={handleQuickAction}
            onSeeAll={handleSeeAll}
            onNotifications={() => showToast('Новых уведомлений нет')}
            onOpenProfile={() => setTab('profile')}
          />
        )}

        {tab === 'payments' && (
          <PaymentsScreen
            transactions={transactions}
            onOpenTx={(tx) => setActiveTxId(tx.id)}
            onOpenSandbox={openSandbox}
            onOpenHistory={() => {
              setHistoryQuery('');
              setTab('history');
            }}
          />
        )}

        {tab === 'history' && (
          <HistoryScreen
            transactions={transactions}
            query={historyQuery}
            onQueryChange={setHistoryQuery}
            onOpenTx={(tx) => setActiveTxId(tx.id)}
            onOpenSandbox={() => openSandbox()}
          />
        )}

        {tab === 'profile' && (
          <ProfileScreen
            balance={state.balance}
            viewMode={viewMode}
            onOpenViewMode={() => setViewSheetOpen(true)}
            onOpenSandbox={() => openSandbox()}
            onOpenHistory={() => {
              setHistoryQuery('');
              setTab('history');
            }}
            onReset={handleReset}
            onNotify={showToast}
          />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      <TransactionSheet
        tx={activeTx}
        onClose={() => setActiveTxId(null)}
        onRepeat={handleRepeat}
        onDelete={handleDelete}
      />

      <ViewModeSheet
        open={viewSheetOpen}
        value={viewMode}
        onChange={setViewMode}
        onClose={() => setViewSheetOpen(false)}
      />

      <SandboxModal
        open={sandboxOpen}
        prefill={sandboxPrefill}
        balance={state.balance}
        onClose={() => {
          setSandboxOpen(false);
          setSandboxPrefill(undefined);
        }}
        onAdd={handleAddTransaction}
        onUpdateBalance={handleUpdateBalance}
        onReset={handleReset}
      />

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[104px] z-[60] flex justify-center px-6">
          <div className="toast-rise flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[12px] font-medium text-white shadow-[0_14px_30px_-12px_rgba(16,24,40,0.6)]">
            <CircleCheck size={15} strokeWidth={2.4} className="text-accent" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
