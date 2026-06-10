function normalizeIndianPhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 10) {
    return digits;
  }
  return null;
}

function isValidIndianPhone(input) {
  const normalized = normalizeIndianPhone(input);
  if (!normalized) return false;
  return /^[6-9]\d{9}$/.test(normalized);
}

module.exports = {
  normalizeIndianPhone,
  isValidIndianPhone,
};
