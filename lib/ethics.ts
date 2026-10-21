export const ETHICS = {
  allowedPricingVars: ['country', 'plan'] as const,
  forbiddenPricingVars: ['age', 'gender', 'orientation', 'health'] as const,
  cancelMaxScreens: 2,
  refundWindowDays: 14,
  notifyBeforeRenewal: true,
  freeSafety: true,
  separateEngines: true,
  noDarkPatterns: [
    'personalized_opaque_price',
    'harder_cancel_than_signup',
    'delete_without_cancel',
    'invisible_consumables',
    'feature_paywalling_relabel',
    'sensitive_data_ads',
    'artificial_urgency',
    'weekly_plan_default',
  ],
};

export function assertPricingInput(input: Record<string, unknown>) {
  for (const k of ETHICS.forbiddenPricingVars) {
    if (k in input) throw new Error(`Pricing var prohibida: ${k}`);
  }
}
