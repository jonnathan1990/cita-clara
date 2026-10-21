import { cancelMySubscription } from '../lib/subscription';

jest.mock('../lib/supabase', () => ({
  supabase: {
    rpc: jest.fn().mockResolvedValue({ error: null }),
  },
}));

describe('subscription', () => {
  it('rechaza más de 2 pantallas', async () => {
    const r = await cancelMySubscription(3);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/2 pantallas/);
  });

  it('acepta cancelación en 2 pantallas', async () => {
    const r = await cancelMySubscription(2);
    expect(r.ok).toBe(true);
  });
});
