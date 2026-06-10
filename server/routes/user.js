const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');
const { getAllQuestions, maskPremiumForUser } = require('../data/questionsCache');
const { getFreeQuestionIds } = require('../lib/questionAccess');
const { normalizeIndianPhone, isValidIndianPhone } = require('../lib/phone');

function buildProfilePayload(user, docData = {}) {
  return {
    uid: user.uid,
    email: user.email || docData.email || '',
    displayName: docData.displayName || user.name || user.email?.split('@')[0] || 'User',
    photoURL: user.picture || docData.photoURL || '',
    phone: docData.phone || user.phone || '',
    hasPaid: Boolean(docData.hasPaid ?? user.hasPaid),
    createdAt: docData.createdAt || null,
    updatedAt: docData.updatedAt || null,
  };
}

// GET /api/user/access — payment tier for the signed-in user
router.get('/access', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      hasPaid: Boolean(req.user.hasPaid),
      phone: req.user.phone || '',
    },
  });
});

// GET /api/user/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const docData = userDoc.exists ? userDoc.data() : {};
    res.json({
      success: true,
      data: buildProfilePayload(req.user, docData),
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    res.status(500).json({ success: false, message: 'Failed to load profile', error: error.message });
  }
});

// PUT /api/user/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (phone == null || String(phone).trim() === '') {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 10-digit Indian mobile number (starts with 6–9).',
      });
    }

    const normalizedPhone = normalizeIndianPhone(phone);
    const nowIso = new Date().toISOString();
    const userRef = db.collection('users').doc(req.user.uid);

    await userRef.set(
      {
        email: req.user.email,
        displayName: req.user.name || req.user.email?.split('@')[0] || 'User',
        phone: normalizedPhone,
        updatedAt: nowIso,
      },
      { merge: true },
    );

    const updatedDoc = await userRef.get();
    const docData = updatedDoc.exists ? updatedDoc.data() : {};

    res.json({
      success: true,
      message: 'Profile updated',
      data: buildProfilePayload({ ...req.user, phone: normalizedPhone }, docData),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
});

const USER_STATES_COLLECTION = 'user_question_states';
const DAILY_SUBMISSIONS_COLLECTION = 'daily_challenge_submissions';
const DIFFICULTY_ORDER = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

function toDateKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseQuestionId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) ? id : null;
}

function getUserQuestionStateDocId(uid, questionId) {
  return `${uid}_${questionId}`;
}

function stableHash(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function getDailyChallengeQuestion(questions, dateKey, hasPaid = false, freeQuestionIds = null) {
  const pool = [...questions]
    .filter((q) => {
      if (!q) return false;
      if (hasPaid) return true;
      return freeQuestionIds && freeQuestionIds.has(q.id);
    })
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

  if (!pool.length) return null;
  const index = stableHash(dateKey) % pool.length;
  return pool[index];
}

function formatDailyChallengeForUser(challengeRaw, maskedList, hasPaid, freeQuestionIds) {
  if (!challengeRaw) return null;
  if (hasPaid) {
    return maskedList.find((q) => q.id === challengeRaw.id) || challengeRaw;
  }
  if (!freeQuestionIds || !freeQuestionIds.has(challengeRaw.id)) {
    return null;
  }
  return (
    maskedList.find((q) => q.id === challengeRaw.id) || {
      ...challengeRaw,
      accessUnlocked: true,
      isPremium: false,
    }
  );
}

function buildUtcDayRange(dateKey) {
  const start = new Date(`${dateKey}T00:00:00.000Z`);
  const end = new Date(`${dateKey}T23:59:59.999Z`);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function normalizeDisplayName(user) {
  if (user?.name && String(user.name).trim()) return String(user.name).trim();
  if (user?.email) return String(user.email).split('@')[0];
  return 'Anonymous';
}

function sortByDifficulty(a, b) {
  const ia = DIFFICULTY_ORDER.indexOf(a);
  const ib = DIFFICULTY_ORDER.indexOf(b);
  const va = ia === -1 ? 999 : ia;
  const vb = ib === -1 ? 999 : ib;
  return va - vb;
}

function computeStreaks(states) {
  const solvedDateSet = new Set();
  for (const state of states) {
    if (!state.solved || !state.firstSolvedAt) continue;
    const dateKey = String(state.firstSolvedAt).slice(0, 10);
    solvedDateSet.add(dateKey);
  }

  const solvedDates = [...solvedDateSet].sort();
  if (!solvedDates.length) {
    return { current: 0, best: 0, solvedDates: [] };
  }

  let best = 1;
  let currentRun = 1;
  for (let i = 1; i < solvedDates.length; i += 1) {
    const prev = new Date(`${solvedDates[i - 1]}T00:00:00.000Z`);
    const curr = new Date(`${solvedDates[i]}T00:00:00.000Z`);
    const diffDays = Math.round((curr - prev) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) {
      currentRun += 1;
      if (currentRun > best) best = currentRun;
    } else {
      currentRun = 1;
    }
  }

  let current = 0;
  const todayKey = toDateKey(new Date());
  let cursor = new Date(`${todayKey}T00:00:00.000Z`);
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!solvedDateSet.has(key)) break;
    current += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }

  return { current, best, solvedDates };
}

async function loadQuestionCatalogForUser(user) {
  const { value: raw } = await getAllQuestions();
  const freeQuestionIds = getFreeQuestionIds(raw);
  const masked = maskPremiumForUser(raw, user, freeQuestionIds);
  return { raw, masked, freeQuestionIds };
}

async function loadUserStates(uid) {
  const snapshot = await db.collection(USER_STATES_COLLECTION).where('uid', '==', uid).get();
  const states = [];
  snapshot.forEach((doc) => {
    states.push({ firestoreId: doc.id, ...doc.data() });
  });
  return states;
}

function mapQuestionStates(states, ids = null) {
  const byId = {};
  const idFilter = ids ? new Set(ids) : null;

  for (const state of states) {
    const qid = parseQuestionId(state.questionId);
    if (qid == null) continue;
    if (idFilter && !idFilter.has(qid)) continue;
    byId[qid] = {
      bookmarked: Boolean(state.bookmarked),
      solved: Boolean(state.solved),
      note: typeof state.note === 'string' ? state.note : '',
      updatedAt: state.updatedAt || null,
      firstSolvedAt: state.firstSolvedAt || null,
    };
  }

  return byId;
}

// GET /api/user/states?ids=1,2,3
router.get('/states', requireAuth, async (req, res) => {
  try {
    const idsParam = String(req.query.ids || '').trim();
    const ids = idsParam
      ? idsParam
          .split(',')
          .map((part) => parseQuestionId(part))
          .filter((id) => id != null)
      : null;

    const states = await loadUserStates(req.user.uid);
    const mapped = mapQuestionStates(states, ids);
    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error loading user states:', error);
    res.status(500).json({ success: false, message: 'Failed to load question states', error: error.message });
  }
});

// PUT /api/user/questions/:id/state
router.put('/questions/:id/state', requireAuth, async (req, res) => {
  try {
    const questionId = parseQuestionId(req.params.id);
    if (questionId == null) {
      return res.status(400).json({ success: false, message: 'Invalid question id' });
    }

    const { value: questions } = await getAllQuestions();
    const exists = questions.some((q) => q.id === questionId);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const nowIso = new Date().toISOString();
    const docId = getUserQuestionStateDocId(req.user.uid, questionId);
    const ref = db.collection(USER_STATES_COLLECTION).doc(docId);
    const currentDoc = await ref.get();
    const current = currentDoc.exists ? currentDoc.data() : {};

    const payload = {
      uid: req.user.uid,
      questionId,
      updatedAt: nowIso,
      createdAt: current.createdAt || nowIso,
    };

    if (typeof req.body.bookmarked === 'boolean') {
      payload.bookmarked = req.body.bookmarked;
    } else if (!currentDoc.exists) {
      payload.bookmarked = false;
    }

    if (typeof req.body.note === 'string') {
      payload.note = req.body.note.slice(0, 2000);
    } else if (!currentDoc.exists) {
      payload.note = '';
    }

    if (typeof req.body.solved === 'boolean') {
      payload.solved = req.body.solved;
      if (req.body.solved === true) {
        payload.lastSolvedAt = nowIso;
        payload.firstSolvedAt = current.firstSolvedAt || nowIso;
      }
    } else if (!currentDoc.exists) {
      payload.solved = false;
    }

    await ref.set(payload, { merge: true });
    const saved = await ref.get();
    res.json({ success: true, data: saved.data() });
  } catch (error) {
    console.error('Error updating question state:', error);
    res.status(500).json({ success: false, message: 'Failed to update question state', error: error.message });
  }
});

// GET /api/user/bookmarks
router.get('/bookmarks', requireAuth, async (req, res) => {
  try {
    const [states, catalog] = await Promise.all([
      loadUserStates(req.user.uid),
      loadQuestionCatalogForUser(req.user),
    ]);

    const questionById = new Map(catalog.masked.map((q) => [q.id, q]));
    const rows = states
      .filter((state) => state.bookmarked === true)
      .map((state) => {
        const question = questionById.get(parseQuestionId(state.questionId));
        if (!question) return null;
        return {
          question,
          bookmarked: true,
          solved: Boolean(state.solved),
          note: typeof state.note === 'string' ? state.note : '',
          updatedAt: state.updatedAt || state.createdAt || null,
        };
      })
      .filter(Boolean)
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));

    res.json({
      success: true,
      data: rows,
      meta: {
        count: rows.length,
      },
    });
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    res.status(500).json({ success: false, message: 'Failed to load bookmarks', error: error.message });
  }
});

// GET /api/user/dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const [states, catalog] = await Promise.all([
      loadUserStates(req.user.uid),
      loadQuestionCatalogForUser(req.user),
    ]);

    const solvedStates = states.filter((state) => state.solved === true);
    const solvedIdSet = new Set(solvedStates.map((state) => parseQuestionId(state.questionId)).filter((id) => id != null));
    const questionById = new Map(catalog.raw.map((q) => [q.id, q]));
    const solvedQuestions = [...solvedIdSet].map((id) => questionById.get(id)).filter(Boolean);

    const solvedByCategoryMap = {};
    const solvedByDifficultyMap = {};
    const totalsByCategory = {};
    const totalsByDifficulty = {};
    const totalsByCell = {};
    const solvedByCell = {};

    for (const question of catalog.raw) {
      const category = question.category || 'Unknown';
      const difficulty = question.difficulty || 'Unknown';

      totalsByCategory[category] = (totalsByCategory[category] || 0) + 1;
      totalsByDifficulty[difficulty] = (totalsByDifficulty[difficulty] || 0) + 1;

      const key = `${category}::${difficulty}`;
      totalsByCell[key] = (totalsByCell[key] || 0) + 1;
    }

    for (const question of solvedQuestions) {
      const category = question.category || 'Unknown';
      const difficulty = question.difficulty || 'Unknown';

      solvedByCategoryMap[category] = (solvedByCategoryMap[category] || 0) + 1;
      solvedByDifficultyMap[difficulty] = (solvedByDifficultyMap[difficulty] || 0) + 1;

      const key = `${category}::${difficulty}`;
      solvedByCell[key] = (solvedByCell[key] || 0) + 1;
    }

    const solvedByCategory = Object.entries(solvedByCategoryMap)
      .map(([name, solved]) => ({
        name,
        solved,
        total: totalsByCategory[name] || 0,
      }))
      .sort((a, b) => b.solved - a.solved);

    const solvedByDifficulty = Object.entries(solvedByDifficultyMap)
      .map(([name, solved]) => ({
        name,
        solved,
        total: totalsByDifficulty[name] || 0,
      }))
      .sort((a, b) => sortByDifficulty(a.name, b.name));

    const weakAreas = Object.entries(totalsByCategory)
      .map(([name, total]) => {
        const solved = solvedByCategoryMap[name] || 0;
        const solveRate = total > 0 ? solved / total : 0;
        return { name, solved, total, solveRate };
      })
      .sort((a, b) => a.solveRate - b.solveRate)
      .slice(0, 6);

    const heatmap = Object.entries(totalsByCell)
      .map(([key, total]) => {
        const [category, difficulty] = key.split('::');
        const solved = solvedByCell[key] || 0;
        const solveRate = total > 0 ? solved / total : 0;
        return { category, difficulty, solved, total, solveRate };
      })
      .sort((a, b) => {
        const catCompare = a.category.localeCompare(b.category);
        if (catCompare !== 0) return catCompare;
        return sortByDifficulty(a.difficulty, b.difficulty);
      });

    const streak = computeStreaks(solvedStates);
    const notesCount = states.filter((state) => typeof state.note === 'string' && state.note.trim()).length;
    const bookmarksCount = states.filter((state) => state.bookmarked === true).length;

    res.json({
      success: true,
      data: {
        solvedCount: solvedQuestions.length,
        bookmarkedCount: bookmarksCount,
        notesCount,
        streakCurrent: streak.current,
        streakBest: streak.best,
        solvedByCategory,
        solvedByDifficulty,
        weakAreas,
        heatmap,
        timeline: streak.solvedDates,
      },
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard', error: error.message });
  }
});

function buildLeaderboardRows(submissions, currentUid) {
  const sorted = [...submissions].sort((a, b) => String(a.solvedAt).localeCompare(String(b.solvedAt)));
  const rows = sorted.map((item, index) => ({
    rank: index + 1,
    uid: item.uid,
    displayName: item.displayName || 'Anonymous',
    solvedAt: item.solvedAt,
  }));
  const current = currentUid ? rows.find((row) => row.uid === currentUid) || null : null;
  return { rows, current };
}

// GET /api/user/daily-challenge
router.get('/daily-challenge', async (req, res) => {
  try {
    const { raw, masked, freeQuestionIds } = await loadQuestionCatalogForUser(req.user);
    const challengeKey = toDateKey(new Date());
    const hasPaid = Boolean(req.user?.hasPaid);
    const challengeRaw = getDailyChallengeQuestion(raw, challengeKey, hasPaid, freeQuestionIds);
    if (!challengeRaw) {
      return res.status(404).json({ success: false, message: 'No daily challenge available' });
    }

    const challenge = formatDailyChallengeForUser(challengeRaw, masked, hasPaid, freeQuestionIds);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'No free daily challenge available. Upgrade to access premium daily challenges.',
      });
    }
    const { startIso, endIso } = buildUtcDayRange(challengeKey);

    const submissionsSnapshot = await db
      .collection(DAILY_SUBMISSIONS_COLLECTION)
      .where('challengeKey', '==', challengeKey)
      .get();

    const submissions = [];
    submissionsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.solvedAt >= startIso && data.solvedAt <= endIso) {
        submissions.push(data);
      }
    });

    const { rows, current } = buildLeaderboardRows(submissions, req.user?.uid || null);

    let userState = null;
    if (req.user) {
      const stateDocId = getUserQuestionStateDocId(req.user.uid, challenge.id);
      const stateDoc = await db.collection(USER_STATES_COLLECTION).doc(stateDocId).get();
      userState = stateDoc.exists ? stateDoc.data() : null;
    }

    res.json({
      success: true,
      data: {
        challengeKey,
        question: challenge,
        leaderboard: rows.slice(0, 25),
        yourRank: current ? current.rank : null,
        yourEntry: current,
        solvedTodayCount: rows.length,
        hasPaid,
        userState: userState
          ? {
              solved: Boolean(userState.solved),
              firstSolvedAt: userState.firstSolvedAt || null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error loading daily challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to load daily challenge', error: error.message });
  }
});

// POST /api/user/daily-challenge/submit
router.post('/daily-challenge/submit', requireAuth, async (req, res) => {
  try {
    const submittedQuestionId = parseQuestionId(req.body.questionId);
    if (submittedQuestionId == null) {
      return res.status(400).json({ success: false, message: 'questionId is required' });
    }

    const { value: questions } = await getAllQuestions();
    const freeQuestionIds = getFreeQuestionIds(questions);
    const challengeKey = toDateKey(new Date());
    const hasPaid = Boolean(req.user?.hasPaid);
    const challengeQuestion = getDailyChallengeQuestion(questions, challengeKey, hasPaid, freeQuestionIds);

    if (!challengeQuestion || challengeQuestion.id !== submittedQuestionId) {
      return res.status(400).json({ success: false, message: 'Submission does not match today\'s challenge' });
    }

    const nowIso = new Date().toISOString();
    const stateRef = db
      .collection(USER_STATES_COLLECTION)
      .doc(getUserQuestionStateDocId(req.user.uid, submittedQuestionId));
    const stateDoc = await stateRef.get();
    const stateData = stateDoc.exists ? stateDoc.data() : {};

    await stateRef.set(
      {
        uid: req.user.uid,
        questionId: submittedQuestionId,
        solved: true,
        firstSolvedAt: stateData.firstSolvedAt || nowIso,
        lastSolvedAt: nowIso,
        bookmarked: stateData.bookmarked || false,
        note: typeof stateData.note === 'string' ? stateData.note : '',
        createdAt: stateData.createdAt || nowIso,
        updatedAt: nowIso,
      },
      { merge: true },
    );

    const submissionId = `${challengeKey}_${req.user.uid}`;
    const submissionRef = db.collection(DAILY_SUBMISSIONS_COLLECTION).doc(submissionId);
    const existingSubmission = await submissionRef.get();
    if (!existingSubmission.exists) {
      await submissionRef.set({
        uid: req.user.uid,
        challengeKey,
        questionId: submittedQuestionId,
        solvedAt: nowIso,
        displayName: normalizeDisplayName(req.user),
      });
    }

    const leaderboardSnapshot = await db
      .collection(DAILY_SUBMISSIONS_COLLECTION)
      .where('challengeKey', '==', challengeKey)
      .get();
    const submissions = [];
    leaderboardSnapshot.forEach((doc) => submissions.push(doc.data()));
    const { rows, current } = buildLeaderboardRows(submissions, req.user.uid);

    res.json({
      success: true,
      message: 'Challenge submitted successfully',
      data: {
        challengeKey,
        yourRank: current ? current.rank : null,
        solvedTodayCount: rows.length,
      },
    });
  } catch (error) {
    console.error('Error submitting daily challenge:', error);
    res.status(500).json({ success: false, message: 'Failed to submit challenge', error: error.message });
  }
});

module.exports = router;
