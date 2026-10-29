import {
  Car,
  Coffee,
  Droplets,
  HeartPulse,
  Plane,
  Receipt,
  Repeat,
  Send,
  ShoppingBag,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { isSameMonth } from './format';
import type { Transaction } from './types';

export interface CategoryStat {
  label: string;
  amount: number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface CategoryRule {
  test: RegExp;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    test: /такси|поездк|каршер|метро/i,
    label: 'Такси',
    icon: Car,
    color: '#4b7bf5',
    bg: '#edf2ff',
  },
  {
    test: /продукт|пятёрочк|пятерочк|магнит|перекрёст|перекрест|супермаркет|лента/i,
    label: 'Продукты',
    icon: ShoppingBag,
    color: '#b98900',
    bg: '#fff6d6',
  },
  {
    test: /жкх|коммунал|энерго|водоканал/i,
    label: 'ЖКХ',
    icon: Droplets,
    color: '#2f80ed',
    bg: '#eaf3ff',
  },
  {
    test: /связ|мтс|билайн|мегафон|теле2|интернет/i,
    label: 'Связь',
    icon: Smartphone,
    color: '#8b5cf6',
    bg: '#f4ecff',
  },
  {
    test: /подписк|плюс|кинопоиск|музык/i,
    label: 'Подписки',
    icon: Repeat,
    color: '#12a150',
    bg: '#e8f7ef',
  },
  {
    test: /кафе|ресторан|обед|кофе|фастфуд|доставк/i,
    label: 'Кафе',
    icon: Coffee,
    color: '#eb5757',
    bg: '#feecec',
  },
  {
    test: /аптек|медиц|клиник|здоров/i,
    label: 'Здоровье',
    icon: HeartPulse,
    color: '#eb5757',
    bg: '#feecec',
  },
  {
    test: /авиа|билет|отел|путешеств|самолёт|самолет/i,
    label: 'Путешествия',
    icon: Plane,
    color: '#2f80ed',
    bg: '#eaf3ff',
  },
  {
    test: /перевод|сбп/i,
    label: 'Переводы',
    icon: Send,
    color: '#4b7bf5',
    bg: '#edf2ff',
  },
];

const FALLBACK: Omit<CategoryRule, 'test'> = {
  label: 'Другое',
  icon: Receipt,
  color: '#6b6b70',
  bg: '#f1f1f3',
};

function ruleFor(description: string): Omit<CategoryRule, 'test'> {
  const text = description.toLowerCase().replace(/ё/g, 'е');
  return CATEGORY_RULES.find((rule) => rule.test.test(text)) ?? FALLBACK;
}

export interface MonthStats {
  spent: number;
  received: number;
  cashback: number;
  categories: CategoryStat[];
}

export function getMonthStats(transactions: Transaction[], now = new Date()): MonthStats {
  const monthTransactions = transactions.filter((tx) => isSameMonth(tx.date, now));
  const outgoing = monthTransactions.filter((tx) => tx.type === 'outgoing');
  const incoming = monthTransactions.filter((tx) => tx.type === 'incoming');

  const spent = outgoing.reduce((sum, tx) => sum + tx.amount, 0);
  const received = incoming.reduce((sum, tx) => sum + tx.amount, 0);

  // Кэшбэк начисляем только с покупок, без переводов и пополнений.
  const purchases = outgoing
    .filter((tx) => tx.category === 'payment' || tx.category === 'subscription')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totals = new Map<string, CategoryStat>();
  for (const tx of outgoing) {
    const rule = ruleFor(tx.description);
    const existing = totals.get(rule.label);
    if (existing) {
      existing.amount += tx.amount;
    } else {
      totals.set(rule.label, { ...rule, amount: tx.amount });
    }
  }

  const categories = [...totals.values()].sort((a, b) => b.amount - a.amount).slice(0, 3);

  return {
    spent,
    received,
    cashback: Math.round(purchases * 0.05),
    categories,
  };
}
