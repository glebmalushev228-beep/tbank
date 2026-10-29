import { Check, CircleAlert, Plus, RotateCcw, X } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import {
  EXPENSE_CATEGORIES,
  MERCHANT_PRESETS,
  cardDetail,
  expenseCategoryByLabel,
  inferExpenseCategoryLabel,
  isExpenseCategory,
  type ExpenseCategoryLabel,
} from '../lib/expenses';
import { formatAmountInput, formatBalance, parseAmount, toDateTimeInput } from '../lib/format';
import type { NewTxInput, SandboxPrefill, TxCategory, TxType } from '../lib/types';
import { USER_FULL_SHORT } from '../lib/types';
import { usePresence } from '../lib/usePresence';
import { TBankMark } from './BrandMark';

type OpMode = 'expense' | 'outgoing' | 'incoming';

const DEFAULT_DESCRIPTION: Record<Exclude<OpMode, 'expense'>, string> = {
  outgoing: 'Перевод по номеру телефона',
  incoming: 'Входящий перевод',
};

const inputClass =
  'h-12 w-full select-text rounded-2xl bg-surface px-4 text-[14px] text-ink outline-none ring-brand/60 transition focus:ring-2 placeholder:text-[#b3b3b9]';

function deriveTransferCategory(description: string, type: TxType, fallback?: TxCategory): TxCategory {
  const text = description.toLowerCase();
  if (/пополн/.test(text)) return 'topup';
  if (/зарплат|зачислен|доход|кэшбэк|процент/.test(text)) return 'income';
  if (/подписк/.test(text)) return 'subscription';
  if (/снят|наличн/.test(text)) return 'cash';
  if (/такси|продукт|оплат|связ|жкх|интернет|штраф|налог|покупк|страхов|полис/.test(text))
    return 'payment';
  if (/перевод/.test(text)) return 'transfer';
  return fallback ?? (type === 'incoming' ? 'topup' : 'transfer');
}

function modeFromPrefill(prefill?: SandboxPrefill): OpMode {
  if (isExpenseCategory(prefill?.category)) return 'expense';
  if (prefill?.type === 'incoming') return 'incoming';
  if (prefill?.type === 'outgoing') return 'outgoing';
  return 'expense';
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11.5px] font-semibold text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10.5px] text-[#ACACB2]">{hint}</span>}
    </label>
  );
}

interface SandboxModalProps {
  open: boolean;
  prefill?: SandboxPrefill;
  balance: number;
  onClose: () => void;
  onAdd: (input: NewTxInput, autoBalance: boolean) => void;
  onUpdateBalance: (value: number) => void;
  onReset: () => void;
}

export function SandboxModal({
  open,
  prefill,
  balance,
  onClose,
  onAdd,
  onUpdateBalance,
  onReset,
}: SandboxModalProps) {
  const { mounted, closing } = usePresence(open);
  const [introDone, setIntroDone] = useState(false);

  const [mode, setMode] = useState<OpMode>('expense');
  const [sender, setSender] = useState(USER_FULL_SHORT);
  const [recipient, setRecipient] = useState('');
  const [detail, setDetail] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toDateTimeInput(new Date()));
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION.outgoing);
  const [message, setMessage] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategoryLabel>('Продукты');
  const [autoBalance, setAutoBalance] = useState(true);
  const [balanceInput, setBalanceInput] = useState(String(Math.round(balance)));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setIntroDone(false);
      return;
    }
    const timer = window.setTimeout(() => setIntroDone(true), 420);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const nextMode = modeFromPrefill(prefill);
    setMode(nextMode);

    if (nextMode === 'expense') {
      const label = inferExpenseCategoryLabel(
        prefill?.description ?? prefill?.recipient ?? '',
        prefill?.category,
      );
      setExpenseCategory(label);
      setRecipient(prefill?.recipient ?? '');
      setSender(USER_FULL_SHORT);
      setDetail('');
      setDescription(expenseCategoryByLabel(label).description);
      setMessage('');
    } else {
      setSender(prefill?.sender ?? (nextMode === 'outgoing' ? USER_FULL_SHORT : ''));
      setRecipient(prefill?.recipient ?? (nextMode === 'incoming' ? USER_FULL_SHORT : ''));
      setDetail(prefill?.detail ?? '');
      setDescription(prefill?.description ?? DEFAULT_DESCRIPTION[nextMode]);
      setMessage(prefill?.message ?? '');
    }

    setAmount(prefill?.amount ? formatAmountInput(prefill.amount) : '');
    setDate(toDateTimeInput(prefill?.date ?? new Date()));
    setAutoBalance(true);
    setBalanceInput(String(Math.round(balance)));
    setError(null);
    // `balance` is intentionally excluded: typing in the field must not be overwritten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefill]);

  const changeMode = (next: OpMode) => {
    if (next === mode) return;
    setMode(next);
    setError(null);

    if (next === 'expense') {
      setSender(USER_FULL_SHORT);
      setRecipient('');
      setDetail('');
      setMessage('');
      setExpenseCategory('Продукты');
      setDescription(expenseCategoryByLabel('Продукты').description);
      return;
    }

    setDescription((current) => {
      const isDefaultExpense = EXPENSE_CATEGORIES.some((item) => item.description === current);
      const isDefaultTransfer =
        current === DEFAULT_DESCRIPTION.outgoing || current === DEFAULT_DESCRIPTION.incoming;
      if (isDefaultExpense || isDefaultTransfer) return DEFAULT_DESCRIPTION[next];
      return current;
    });

    if (next === 'incoming') {
      setRecipient(USER_FULL_SHORT);
      setSender((current) => (current === USER_FULL_SHORT ? '' : current));
    } else {
      setSender(USER_FULL_SHORT);
      setRecipient((current) => (current === USER_FULL_SHORT ? '' : current));
    }
  };

  const applyMerchantPreset = (preset: (typeof MERCHANT_PRESETS)[number]) => {
    setRecipient(preset.recipient);
    setExpenseCategory(preset.category);
    setDescription(expenseCategoryByLabel(preset.category).description);
  };

  const selectExpenseCategory = (label: ExpenseCategoryLabel) => {
    setExpenseCategory(label);
    setDescription(expenseCategoryByLabel(label).description);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = parseAmount(amount);
    if (value <= 0) {
      setError('Укажите сумму больше нуля');
      return;
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      setError('Укажите корректную дату и время');
      return;
    }

    if (mode === 'expense') {
      if (!recipient.trim()) {
        setError('Укажите магазин или сервис');
        return;
      }
      const option = expenseCategoryByLabel(expenseCategory);
      onAdd(
        {
          type: 'outgoing',
          amount: value,
          sender: USER_FULL_SHORT,
          recipient: recipient.trim(),
          detail: cardDetail(),
          description: option.description,
          date: parsedDate.toISOString(),
          category: option.txCategory,
        },
        autoBalance,
      );
      setError(null);
      return;
    }

    if (mode === 'outgoing' && !recipient.trim()) {
      setError('Укажите получателя');
      return;
    }
    if (mode === 'incoming' && !sender.trim()) {
      setError('Укажите отправителя');
      return;
    }

    const type: TxType = mode;
    const finalDescription = description.trim() || DEFAULT_DESCRIPTION[mode];
    onAdd(
      {
        type,
        amount: value,
        sender: sender.trim() || USER_FULL_SHORT,
        recipient: recipient.trim() || USER_FULL_SHORT,
        detail: detail.trim() || undefined,
        description: finalDescription,
        message: message.trim() || undefined,
        date: parsedDate.toISOString(),
        category: deriveTransferCategory(finalDescription, type, prefill?.category),
      },
      autoBalance,
    );
    setError(null);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-[2px]',
          closing
            ? 'opacity-0 transition-opacity duration-200'
            : introDone
              ? ''
              : 'backdrop-in',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Конструктор операций"
        className={cn(
          'absolute inset-x-0 bottom-0 mx-auto flex max-h-[94dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_-20px_60px_rgba(16,24,40,0.18)]',
          closing ? 'sheet-down' : introDone ? '' : 'sheet-up',
        )}
      >
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-[#E1E1E7]" />
        </div>

        <div className="flex items-start justify-between px-5 pb-3 pt-1">
          <div>
            <div className="flex items-center gap-1.5">
              <TBankMark size={22} />
              <span className="text-[11.5px] font-extrabold tracking-[-0.03em] text-ink">Т-Банк</span>
              <span className="rounded-full bg-accent px-1.5 py-[2px] text-[7.5px] font-bold tracking-[0.1em] text-ink">
                ДЕМО
              </span>
            </div>
            <h2 className="mt-2 text-[18px] font-bold leading-none tracking-[-0.02em] text-ink">
              Конструктор операций
            </h2>
            <p className="mt-1 text-[11px] text-muted">Демо-режим · изменения сохраняются локально</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-[#6E6E75] transition active:scale-90"
          >
            <X size={17} strokeWidth={2.4} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(env(safe-area-inset-bottom),20px)]"
        >
          <div className="rounded-2xl bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-muted">Баланс на главной</span>
              <span className="text-[10.5px] tabular-nums text-[#A5A5AB]">
                {formatBalance(balance)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={balanceInput}
                  onChange={(event) =>
                    setBalanceInput(event.target.value.replace(/[^\d]/g, '').slice(0, 9))
                  }
                  inputMode="numeric"
                  aria-label="Текущий баланс"
                  className="h-11 w-full select-text rounded-xl bg-white pl-3 pr-8 text-[17px] font-bold tabular-nums text-ink outline-none ring-brand/60 focus:ring-2"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-muted">
                  ₽
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateBalance(parseAmount(balanceInput))}
                className="h-11 shrink-0 rounded-xl bg-brand px-4 text-[12px] font-semibold text-white transition active:scale-95"
              >
                Обновить
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h3 className="text-[13.5px] font-bold text-ink">Новая операция</h3>
            <span className="text-[10.5px] text-[#ACACB2]">Заполните поля</span>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1">
            {(
              [
                { id: 'expense', label: 'Трата' },
                { id: 'outgoing', label: 'Перевод −' },
                { id: 'incoming', label: 'Пополнение +' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeMode(item.id)}
                className={cn(
                  'h-10 rounded-xl text-[11.5px] font-semibold transition',
                  mode === item.id ? 'bg-brand text-white' : 'text-muted',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {mode === 'expense' ? (
              <>
                <div>
                  <span className="mb-1.5 block text-[11.5px] font-semibold text-muted">
                    Быстрый выбор
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {MERCHANT_PRESETS.map((preset) => {
                      const active = recipient === preset.recipient;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyMerchantPreset(preset)}
                          className={cn(
                            'rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition active:scale-95',
                            active
                              ? 'bg-brand text-white'
                              : 'bg-surface text-ink-soft',
                          )}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Field label="Магазин / сервис">
                  <input
                    value={recipient}
                    onChange={(event) => setRecipient(event.target.value)}
                    placeholder="Пятёрочка"
                    className={inputClass}
                  />
                </Field>

                <div>
                  <span className="mb-1.5 block text-[11.5px] font-semibold text-muted">
                    Категория
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPENSE_CATEGORIES.map((item) => {
                      const active = expenseCategory === item.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => selectExpenseCategory(item.label)}
                          className={cn(
                            'rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition active:scale-95',
                            active
                              ? 'bg-brand text-white'
                              : 'bg-surface text-ink-soft',
                          )}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Field label="Сумма">
                  <div className="relative">
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      inputMode="decimal"
                      placeholder="1 240"
                      className="h-14 w-full select-text rounded-2xl bg-surface pl-4 pr-10 text-[19px] font-bold tabular-nums text-ink outline-none ring-brand/60 transition focus:ring-2 placeholder:font-semibold placeholder:text-[#c0c0c6]"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-muted">
                      ₽
                    </span>
                  </div>
                </Field>

                <Field label="Дата и время">
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className={inputClass}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Имя отправителя">
                  <input
                    value={sender}
                    onChange={(event) => setSender(event.target.value)}
                    placeholder="Алексей С."
                    className={inputClass}
                  />
                </Field>

                <Field label="Имя получателя">
                  <input
                    value={recipient}
                    onChange={(event) => setRecipient(event.target.value)}
                    placeholder="Мария К."
                    className={inputClass}
                  />
                </Field>

                <Field label="Телефон или последние 4 цифры карты">
                  <input
                    value={detail}
                    onChange={(event) => setDetail(event.target.value)}
                    placeholder="+7 (999) ***-**-42 или 4829"
                    className={inputClass}
                  />
                </Field>

                <Field label="Сумма перевода">
                  <div className="relative">
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      inputMode="decimal"
                      placeholder="12 400"
                      className="h-14 w-full select-text rounded-2xl bg-surface pl-4 pr-10 text-[19px] font-bold tabular-nums text-ink outline-none ring-brand/60 transition focus:ring-2 placeholder:font-semibold placeholder:text-[#c0c0c6]"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-muted">
                      ₽
                    </span>
                  </div>
                </Field>

                <Field label="Дата и время">
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Описание / Тип операции">
                  <input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Перевод по номеру телефона"
                    className={inputClass}
                  />
                </Field>

                <Field label="Сообщение получателю" hint="Необязательно">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Комментарий к переводу"
                    className={inputClass}
                  />
                </Field>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setAutoBalance((value) => !value)}
            role="checkbox"
            aria-checked={autoBalance}
            className="mt-4 flex w-full items-start gap-3 text-left"
          >
            <span
              className={cn(
                'mt-[1px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border transition',
                autoBalance ? 'border-brand bg-brand' : 'border-[#d8d8de] bg-white',
              )}
            >
              {autoBalance && <Check size={14} strokeWidth={3.2} className="text-white" />}
            </span>
            <span className="text-[12px] leading-snug text-ink-soft">
              Автоматически изменить общий баланс на сумму{' '}
              {mode === 'expense' ? 'траты' : 'перевода'}
            </span>
          </button>

          {error && (
            <p className="mt-3 flex items-center gap-1.5 text-[11.5px] font-medium text-[#E5484D]">
              <CircleAlert size={14} />
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[14px] font-bold text-white transition active:scale-[0.99]"
          >
            <Plus size={18} strokeWidth={2.6} />
            {mode === 'expense' ? 'Добавить трату' : 'Добавить операцию'}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="mt-2 flex h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-[#E8E8EC] text-[12.5px] font-semibold text-[#8C8C91] transition active:scale-[0.99]"
          >
            <RotateCcw size={15} strokeWidth={2.1} />
            Сбросить демо-данные
          </button>
        </form>
      </div>
    </div>
  );
}
