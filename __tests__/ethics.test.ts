import { ETHICS, assertPricingInput } from '../lib/ethics';

describe('ethics', () => {
  it('rechaza variables prohibidas', () => {
    expect(() => assertPricingInput({ country: 'MX', age: 35 })).toThrow(/age/);
    expect(() => assertPricingInput({ country: 'MX', gender: 'F' })).toThrow(/gender/);
  });

  it('acepta solo variables permitidas', () => {
    expect(() => assertPricingInput({ country: 'MX', plan: 'monthly' })).not.toThrow();
  });

  it('declara los ocho patrones oscuros', () => {
    expect(ETHICS.noDarkPatterns).toHaveLength(8);
    expect(ETHICS.cancelMaxScreens).toBeLessThanOrEqual(2);
    expect(ETHICS.refundWindowDays).toBeGreaterThanOrEqual(14);
  });
});
