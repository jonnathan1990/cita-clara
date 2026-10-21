import es from './es';
import en from './en';

const dict: Record<string, Record<string, string>> = { es, en };

export function t(key: string, locale = 'es') {
  return dict[locale]?.[key] ?? dict.es[key] ?? key;
}
