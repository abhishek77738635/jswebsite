const FREE_PREVIEW_COUNT = Math.max(
  1,
  parseInt(process.env.FREE_PREVIEW_COUNT, 10) || 10,
);

/** First N free questions (lowest id) that unpaid users can open fully. */
function getFreePreviewIds(questions) {
  return new Set(
    questions
      .filter((q) => !q.isPremium)
      .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
      .slice(0, FREE_PREVIEW_COUNT)
      .map((q) => q.id),
  );
}

function isQuestionUnlocked(question, user, freePreviewIds) {
  if (user?.hasPaid) return true;
  return freePreviewIds.has(question.id);
}

/**
 * Unpaid: first 10 free questions, then everything else (still listed, mostly locked).
 * Paid: normal sort by id.
 */
function sortCatalogForUser(questions, user, freePreviewIds) {
  const sorted = [...questions].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

  if (user?.hasPaid) {
    return sorted;
  }

  const preview = [];
  const rest = [];

  for (const q of sorted) {
    if (freePreviewIds.has(q.id)) {
      preview.push(q);
    } else {
      rest.push(q);
    }
  }

  return [...preview, ...rest];
}

module.exports = {
  FREE_PREVIEW_COUNT,
  getFreePreviewIds,
  isQuestionUnlocked,
  sortCatalogForUser,
};
