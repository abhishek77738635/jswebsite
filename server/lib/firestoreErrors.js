/** True when Firestore should be skipped and static JSON used instead. */
function shouldUseStaticFallback(error) {
  if (!error) return false;
  if (process.env.USE_STATIC_DATA_ONLY === 'true') return true;

  const code = error.code;
  const message = String(error.message || '').toLowerCase();

  if (code === 8 || code === 'RESOURCE_EXHAUSTED') return true;
  if (message.includes('quota exceeded')) return true;
  if (message.includes('resource_exhausted')) return true;
  if (message.includes('unavailable')) return true;

  return false;
}

module.exports = { shouldUseStaticFallback };
