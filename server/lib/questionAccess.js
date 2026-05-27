const FREE_PREVIEW_COUNT = Math.max(
  1,
  parseInt(process.env.FREE_PREVIEW_COUNT, 10) || 10,
);

/**
 * Unpaid users: only the first N free questions (by id). Paid users: full list.
 */
function applyAccessTier(questions, user, query = {}) {
  if (user?.hasPaid) {
    return questions;
  }

  if (query.isPremium === 'true') {
    return [];
  }

  const free = questions
    .filter((q) => !q.isPremium)
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

  return free.slice(0, FREE_PREVIEW_COUNT);
}

module.exports = {
  FREE_PREVIEW_COUNT,
  applyAccessTier,
};
