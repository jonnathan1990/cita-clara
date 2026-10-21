export type Country = 'MX' | 'US' | 'ES';
export type Plan = 'monthly' | 'quarterly';

export const PRICES: Record<Country, Record<Plan, { amount: number; currency: string }>> = {
  MX: { monthly: { amount: 199, currency: 'MXN' }, quarterly: { amount: 499, currency: 'MXN' } },
  US: { monthly: { amount: 19.99, currency: 'USD' }, quarterly: { amount: 49.99, currency: 'USD' } },
  ES: { monthly: { amount: 17.99, currency: 'EUR' }, quarterly: { amount: 44.99, currency: 'EUR' } },
};

export function getPrice(country: Country, plan: Plan) {
  return { ...PRICES[country][plan], plan, country };
}
