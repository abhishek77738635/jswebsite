/** Display + must match server PREMIUM_PRICE_INR */
export const PREMIUM_PRICE_INR = Number(process.env.REACT_APP_PREMIUM_PRICE_INR || 199);

export function formatPremiumPrice() {
  const amount = Number.isFinite(PREMIUM_PRICE_INR) ? PREMIUM_PRICE_INR : 199;
  return `₹${amount}`;
}
