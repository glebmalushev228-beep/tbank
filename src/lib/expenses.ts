import type { TxCategory } from './types';
import { CARD_LAST4 } from './types';

/** Labels that match CATEGORY_RULES in analytics.ts so spend charts stay consistent. */
export type ExpenseCategoryLabel =
  | 'Продукты'
  | 'Такси'
  | 'Кафе'
  | 'Связь'
  | 'ЖКХ'
  | 'Подписки'
  | 'Здоровье'
  | 'Путешествия'
  | 'Наличные'
  | 'Другое';

export interface ExpenseCategoryOption {
  label: ExpenseCategoryLabel;
  /** Description stored on the transaction — must match analytics regexes. */
  description: string;
  txCategory: TxCategory;
}

export interface MerchantPreset {
  label: string;
  recipient: string;
  category: ExpenseCategoryLabel;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryOption[] = [
  { label: 'Продукты', description: 'Продукты', txCategory: 'payment' },
  { label: 'Такси', description: 'Поездки и такси', txCategory: 'payment' },
  { label: 'Кафе', description: 'Кафе и рестораны', txCategory: 'payment' },
  { label: 'Связь', description: 'Оплата мобильной связи', txCategory: 'payment' },
  { label: 'ЖКХ', description: 'ЖКХ, коммунальные услуги', txCategory: 'payment' },
  { label: 'Подписки', description: 'Оплата подписки', txCategory: 'subscription' },
  { label: 'Здоровье', description: 'Аптека и здоровье', txCategory: 'payment' },
  { label: 'Путешествия', description: 'Авиабилеты и отели', txCategory: 'payment' },
  { label: 'Наличные', description: 'Снятие наличных', txCategory: 'cash' },
  { label: 'Другое', description: 'Оплата услуг', txCategory: 'payment' },
];

export const MERCHANT_PRESETS: MerchantPreset[] = [
  { label: 'Пятёрочка', recipient: 'Пятёрочка', category: 'Продукты' },
  { label: 'Магнит', recipient: 'Магнит', category: 'Продукты' },
  { label: 'Яндекс Go', recipient: 'Яндекс Go', category: 'Такси' },
  { label: 'МТС', recipient: 'МТС', category: 'Связь' },
  { label: 'Яндекс Плюс', recipient: 'Яндекс Плюс', category: 'Подписки' },
  { label: 'Банкомат', recipient: 'Банкомат Т-Банк', category: 'Наличные' },
];

export const EXPENSE_TX_CATEGORIES: TxCategory[] = ['payment', 'subscription', 'cash'];

export function isExpenseCategory(category: TxCategory | undefined): boolean {
  return category !== undefined && EXPENSE_TX_CATEGORIES.includes(category);
}

export function expenseCategoryByLabel(label: ExpenseCategoryLabel): ExpenseCategoryOption {
  return EXPENSE_CATEGORIES.find((item) => item.label === label) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

export function inferExpenseCategoryLabel(
  description: string,
  category?: TxCategory,
): ExpenseCategoryLabel {
  if (category === 'subscription') return 'Подписки';
  if (category === 'cash') return 'Наличные';

  const text = description.toLowerCase().replace(/ё/g, 'е');
  if (/такси|поездк|каршер|метро/.test(text)) return 'Такси';
  if (/продукт|пятерочк|магнит|перекрест|супермаркет|лента/.test(text)) return 'Продукты';
  if (/жкх|коммунал|энерго|водоканал/.test(text)) return 'ЖКХ';
  if (/связ|мтс|билайн|мегафон|теле2|интернет/.test(text)) return 'Связь';
  if (/подписк|плюс|кинопоиск|музык/.test(text)) return 'Подписки';
  if (/кафе|ресторан|обед|кофе|фастфуд|доставк/.test(text)) return 'Кафе';
  if (/аптек|медиц|клиник|здоров/.test(text)) return 'Здоровье';
  if (/авиа|билет|отел|путешеств|самолет/.test(text)) return 'Путешествия';
  if (/снят|наличн|банкомат/.test(text)) return 'Наличные';
  return 'Другое';
}

export function cardDetail(): string {
  return `Карта *${CARD_LAST4}`;
}
