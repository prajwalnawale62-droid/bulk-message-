import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num);
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}
