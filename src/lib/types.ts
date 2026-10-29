export type TxType = 'incoming' | 'outgoing';

/** Фокусный — крупные блоки, компактный — плотная раскладка главного экрана. */
export type HomeViewMode = 'focus' | 'compact';

export type TxCategory = 'transfer' | 'payment' | 'income' | 'topup' | 'subscription' | 'cash';

export interface Transaction {
  id: string;
  type: TxType;
  /** Positive amount in rubles, the sign comes from `type`. */
  amount: number;
  sender: string;
  recipient: string;
  /** Masked phone number or last 4 digits of a card. */
  detail?: string;
  description: string;
  message?: string;
  /** ISO date string. */
  date: string;
  category: TxCategory;
  status: 'done';
}

export interface AppState {
  balance: number;
  transactions: Transaction[];
}

export interface NewTxInput {
  type: TxType;
  amount: number;
  sender: string;
  recipient: string;
  detail?: string;
  description: string;
  message?: string;
  date: string;
  category: TxCategory;
}

export type SandboxPrefill = Partial<
  Pick<
    Transaction,
    'type' | 'sender' | 'recipient' | 'detail' | 'amount' | 'description' | 'message' | 'category' | 'date'
  >
>;

export const CARD_LAST4 = '4829';

export const USER_NAME = 'Алексей';
export const USER_FULL_SHORT = 'Алексей С.';
export const USER_FULL_NAME = 'Алексей Соколов';

export const STORAGE_KEY = 'orbita.bank.state.v1';
export const VIEW_STORAGE_KEY = 'orbita.bank.homeView.v1';

export const HOME_VIEW_LABEL: Record<HomeViewMode, string> = {
  focus: 'Фокусный',
  compact: 'Компактный',
};
