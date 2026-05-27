const { requireAuth } = require('./auth');

/** Comma-separated list in ADMIN_EMAILS, or fallback to the app's default admin account. */
function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || 'abhishek.samari1211@gmail.com';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** After requireAuth-style flow: verifies Firebase user is in admin list. */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    const email = (req.user.email || '').toLowerCase();
    if (!getAdminEmails().includes(email)) {
      return res.status(403).json({ success: false, message: 'Forbidden: admin only' });
    }
    next();
  });
}

module.exports = { requireAdmin, getAdminEmails };
