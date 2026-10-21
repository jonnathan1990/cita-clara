export function calculateAge(birthDateIso: string, now = new Date()): number | null {
  const d = new Date(birthDateIso);
  if (Number.isNaN(d.getTime())) return null;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function validateSignup(input: {
  email: string;
  password: string;
  birthDate: string;
  country: string;
}): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.push('Email inválido.');
  if (input.password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres.');

  const age = calculateAge(input.birthDate);
  if (age === null) errors.push('Fecha de nacimiento inválida.');
  else if (age < 18) errors.push('Debes tener 18 años o más.');

  if (!['MX', 'US', 'ES'].includes(input.country)) errors.push('País no soportado.');

  return { ok: errors.length === 0, errors };
}
