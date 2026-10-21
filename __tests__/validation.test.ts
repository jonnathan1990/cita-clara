import { calculateAge, validateSignup } from '../lib/validation';

describe('validation', () => {
  it('calcula edad correctamente', () => {
    const age = calculateAge('2000-01-01', new Date('2026-01-01'));
    expect(age).toBe(26);
  });

  it('rechaza menores de 18', () => {
    const r = validateSignup({
      email: 'a@b.com',
      password: 'password1',
      birthDate: '2015-01-01',
      country: 'MX',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('18'))).toBe(true);
  });

  it('acepta signup válido', () => {
    const r = validateSignup({
      email: 'user@example.com',
      password: 'password1',
      birthDate: '1995-06-15',
      country: 'MX',
    });
    expect(r.ok).toBe(true);
  });
});
