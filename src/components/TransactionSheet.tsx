import { CircleCheck, CircleQuestionMark, Repeat, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';
import { isExpenseCategory } from '../lib/expenses';
import { formatDateTime, formatSignedAmount } from '../lib/format';
import type { Transaction } from '../lib/types';
import { CARD_LAST4 } from '../lib/types';
import { usePresence } from '../lib/usePresence';

interface TransactionSheetProps {
  tx: Transaction | null;
  onClose: () => void;
  onRepeat: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

function operationLabel(tx: Transaction): string {
  if (isExpenseCategory(tx.category)) {
    if (tx.category === 'subscription') return 'Оплата подписки';
    if (tx.category === 'cash') return 'Снятие наличных';
    return 'Оплата картой';
  }
  if (tx.type === 'incoming') {
    if (tx.category === 'topup') return 'Пополнение счёта';
    if (tx.category === 'income') return 'Зачисление на счёт';
    return 'Входящий перевод';
  }
  if (tx.category === 'payment') return 'Оплата услуг';
  if (tx.category === 'subscription') return 'Оплата подписки';
  return 'Перевод клиенту банка';
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#E8E8EE] px-4 py-3 last:border-0">
      <span className="shrink-0 text-[11.5px] font-medium text-muted">{label}</span>
      <span
        className={cn(
          'text-right text-[12.5px] font-semibold leading-snug text-ink',
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function TransactionSheet({ tx, onClose, onRepeat, onDelete }: TransactionSheetProps) {
  const open = Boolean(tx);
  const { mounted, closing } = usePresence(open);
  const [helpOpen, setHelpOpen] = useState(false);
  const [shown, setShown] = useState<Transaction | null>(tx);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (!tx) return;
    setShown(tx);
    setHelpOpen(false);
  }, [tx]);

  useEffect(() => {
    if (!open) {
      setIntroDone(false);
      return;
    }
    const timer = window.setTimeout(() => setIntroDone(true), 420);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!mounted || !shown) return null;

  const expense = isExpenseCategory(shown.category);

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
        aria-label="Детали операции"
        className={cn(
          'absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_-20px_60px_rgba(16,24,40,0.18)]',
          closing ? 'sheet-down' : introDone ? '' : 'sheet-up',
        )}
      >
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-[#E1E1E7]" />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-[#6E6E75] transition active:scale-90"
        >
          <X size={17} strokeWidth={2.4} />
        </button>

        <div className="no-scrollbar overflow-y-auto overscroll-contain px-5 pb-6">
          <div className="flex flex-col items-center pt-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E9F8F0]">
              <CircleCheck size={30} strokeWidth={2} className="text-positive" />
            </span>
            <span className="mt-2 text-[12px] font-semibold text-positive">Выполнено</span>

            <div
              className={cn(
                'mt-3 text-[32px] font-bold leading-none tracking-[-0.035em] tabular-nums',
                shown.type === 'incoming' ? 'text-positive' : 'text-ink',
              )}
            >
              {formatSignedAmount(shown.amount, shown.type)}
            </div>
            <div className="mt-2 text-[12.5px] text-muted">{operationLabel(shown)}</div>
            <div className="mt-1.5 text-[12px] text-[#A0A0A6]">{formatDateTime(shown.date)}</div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl bg-surface">
            {expense ? (
              <>
                <DetailRow label="Магазин" value={shown.recipient} />
                <DetailRow label="Категория" value={shown.description} />
                <DetailRow label="Счёт списания" value={`Дебетовая карта *${CARD_LAST4}`} />
                <DetailRow label="Комиссия" value="Без комиссии" valueClassName="text-positive" />
              </>
            ) : (
              <>
                <DetailRow label="Отправитель" value={shown.sender} />
                <DetailRow
                  label={shown.type === 'incoming' ? 'Счёт зачисления' : 'Счёт списания'}
                  value={`Дебетовая карта *${CARD_LAST4}`}
                />
                <DetailRow
                  label="Получатель"
                  value={`${shown.recipient}${shown.detail ? ` • ${shown.detail}` : ''}`}
                />
                <DetailRow label="Назначение" value={shown.description} />
                {shown.message && <DetailRow label="Сообщение" value={`«${shown.message}»`} />}
                <DetailRow label="Комиссия" value="Без комиссии" valueClassName="text-positive" />
              </>
            )}
          </div>

          {helpOpen && (
            <p className="mt-3 rounded-2xl bg-brand-soft px-4 py-3 text-[11.5px] leading-relaxed text-[#33549e]">
              {expense
                ? 'Оплата выполнена. Если списание ошибочное или сумма не совпадает с чеком, напишите в поддержку: мы проверим операцию и при необходимости вернём средства на карту в течение 3 рабочих дней.'
                : 'Операция выполнена и не может быть отменена. Если получатель не увидел зачисление, напишите в поддержку: мы проверим статус перевода и вернём средства на счёт списания в течение 3 рабочих дней.'}
            </p>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={() => onRepeat(shown)}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[14px] font-semibold text-white transition active:scale-[0.99]"
            >
              <Repeat size={17} strokeWidth={2.2} />
              Повторить
            </button>
            <button
              type="button"
              onClick={() => setHelpOpen((value) => !value)}
              className="mt-2 flex h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-surface text-[13px] font-medium text-ink-soft transition active:scale-[0.99]"
            >
              <CircleQuestionMark size={16} strokeWidth={2.1} />
              Справка по операции
            </button>
          </div>

          <button
            type="button"
            onClick={() => onDelete(shown)}
            className="mx-auto mt-2 flex items-center justify-center gap-1.5 px-4 py-3 text-[11.5px] font-medium text-[#B4B4BA] transition active:text-[#E5484D]"
          >
            <Trash size={13} strokeWidth={2} />
            Удалить запись
          </button>
        </div>
      </div>
    </div>
  );
}
