const FREE_PERCENT = Math.min(
  1,
  Math.max(0, parseFloat(process.env.FREE_PERCENT) || 0.25),
);

const FREE_ASSIGNMENT_SEED =
  process.env.FREE_ASSIGNMENT_SEED || 'upchallenges-v1';

function stableHash(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

/** ~25% of questions (stable seeded shuffle) that unpaid users can open fully. */
function getFreeQuestionIds(questions) {
  if (!questions.length) return new Set();

  const target = Math.max(1, Math.ceil(questions.length * FREE_PERCENT));

  return new Set(
    questions
      .map((q) => ({
        id: q.id,
        score: stableHash(`${FREE_ASSIGNMENT_SEED}:${q.id}`),
      }))
      .sort((a, b) => a.score - b.score || (a.id ?? 0) - (b.id ?? 0))
      .slice(0, target)
      .map((x) => x.id),
  );
}

function isQuestionUnlocked(question, user, freeQuestionIds) {
  if (user?.hasPaid) return true;
  return freeQuestionIds.has(question.id);
}

/** Default catalog order by id (free questions stay scattered in the list). */
function sortCatalogForUser(questions) {
  return [...questions].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
}

module.exports = {
  FREE_PERCENT,
  FREE_ASSIGNMENT_SEED,
  stableHash,
  getFreeQuestionIds,
  isQuestionUnlocked,
  sortCatalogForUser,
};
