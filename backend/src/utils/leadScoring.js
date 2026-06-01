const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'rediffmail.com',
  'proton.me',
]);

export function quantityInMetricTons(quantity, unit) {
  const numericQuantity = Number(quantity);
  if (!Number.isFinite(numericQuantity)) return 0;
  if (unit === 'Kg') return numericQuantity / 1000;
  return numericQuantity;
}

export function isCorporateEmail(email) {
  const domain = String(email || '').toLowerCase().split('@')[1];
  return Boolean(domain && !PERSONAL_EMAIL_DOMAINS.has(domain));
}

export function calculateLeadScore({ quantity, unit, email, purchaseTimeline }) {
  const metricTons = quantityInMetricTons(quantity, unit);
  let score = metricTons > 5 ? 60 : metricTons >= 1 ? 35 : 10;

  if (isCorporateEmail(email)) score += 20;
  if (purchaseTimeline === 'Immediate') score += 25;
  if (purchaseTimeline === 'Within 7 Days') score += 15;
  if (purchaseTimeline === 'Within 30 Days') score += 5;

  const priority = score >= 60 ? 'High' : score >= 35 ? 'Medium' : 'Low';
  return { score, priority, metricTons, corporateEmail: isCorporateEmail(email) };
}
